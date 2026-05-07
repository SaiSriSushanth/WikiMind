from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID, uuid4
from database import get_db
from models.kb import KnowledgeBase
from models.document import Document
from schemas.document import DocumentOut
from services.storage_service import upload_file
from middleware.auth_middleware import get_current_user_id

router = APIRouter(prefix="/kb", tags=["documents"])

ALLOWED_TYPES = {"application/pdf": "pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx", "text/plain": "txt"}
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20MB


@router.post("/{kb_id}/documents", response_model=DocumentOut, status_code=201)
async def upload_document(
    kb_id: UUID,
    file: UploadFile = File(...),
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(KnowledgeBase).where(KnowledgeBase.id == kb_id, KnowledgeBase.user_id == user_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Knowledge base not found")

    content_type = file.content_type or ""
    file_type = ALLOWED_TYPES.get(content_type)
    if not file_type:
        raise HTTPException(status_code=400, detail="Unsupported file type. Upload PDF, DOCX, or TXT.")

    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File exceeds 20MB limit")

    storage_path = f"{user_id}/{kb_id}/{uuid4()}_{file.filename}"
    upload_file(file_bytes, storage_path, content_type)

    doc = Document(kb_id=kb_id, filename=file.filename, file_type=file_type, storage_path=storage_path, status="pending")
    db.add(doc)
    await db.commit()
    await db.refresh(doc)

    from tasks.ingestion_task import ingest_document_task
    ingest_document_task.delay(str(doc.id))

    return doc


@router.get("/{kb_id}/documents", response_model=list[DocumentOut])
async def list_documents(kb_id: UUID, user_id: UUID = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(KnowledgeBase).where(KnowledgeBase.id == kb_id, KnowledgeBase.user_id == user_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Knowledge base not found")

    docs = await db.execute(select(Document).where(Document.kb_id == kb_id))
    return docs.scalars().all()
