from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from uuid import UUID
from database import get_db
from models.kb import KnowledgeBase
from services.chat_service import rag_query
from middleware.auth_middleware import get_current_user_id

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatRequest(BaseModel):
    query: str
    kb_ids: list[UUID]


@router.post("")
async def chat(
    body: ChatRequest,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    if not body.kb_ids:
        raise HTTPException(status_code=400, detail="Select at least one knowledge base")

    result = await db.execute(
        select(KnowledgeBase).where(
            KnowledgeBase.id.in_(body.kb_ids),
            KnowledgeBase.user_id == user_id,
            KnowledgeBase.is_active == True,
        )
    )
    valid_kbs = result.scalars().all()
    if len(valid_kbs) != len(body.kb_ids):
        raise HTTPException(status_code=403, detail="One or more knowledge bases are invalid or inactive")

    async def event_stream():
        async for token in rag_query(body.query, body.kb_ids, db):
            yield f"data: {token}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
