from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from uuid import UUID
from models.document import Document
from models.chunk import Chunk
from services.storage_service import download_file
from utils.parser import parse_file
from utils.chunker import chunk_text
from utils.embedder import embed_texts
import os


async def ingest_document(doc_id: UUID, db: AsyncSession) -> None:
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar_one_or_none()
    if not doc:
        return

    await db.execute(update(Document).where(Document.id == doc_id).values(status="processing"))
    await db.commit()

    try:
        tmp_path = download_file(doc.storage_path)
        text = parse_file(tmp_path, doc.file_type)
        os.unlink(tmp_path)

        chunks = chunk_text(text)
        embeddings = embed_texts(chunks)

        chunk_rows = [
            Chunk(
                doc_id=doc.id,
                kb_id=doc.kb_id,
                chunk_index=i,
                content=chunk,
                embedding=embedding,
            )
            for i, (chunk, embedding) in enumerate(zip(chunks, embeddings))
        ]
        db.add_all(chunk_rows)
        await db.execute(update(Document).where(Document.id == doc_id).values(status="done"))
        await db.commit()
    except Exception:
        await db.execute(update(Document).where(Document.id == doc_id).values(status="failed"))
        await db.commit()
        raise
