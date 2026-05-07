from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from database import get_db
from models.kb import KnowledgeBase
from models.wiki_page import WikiPage
from schemas.wiki_page import WikiPageSummary, WikiPageOut
from middleware.auth_middleware import get_current_user_id

router = APIRouter(prefix="/kb", tags=["wiki"])


@router.get("/{kb_id}/wiki", response_model=list[WikiPageSummary])
async def list_wiki_pages(kb_id: UUID, user_id: UUID = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    kb = await db.execute(select(KnowledgeBase).where(KnowledgeBase.id == kb_id, KnowledgeBase.user_id == user_id))
    if not kb.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Knowledge base not found")

    result = await db.execute(select(WikiPage).where(WikiPage.kb_id == kb_id))
    return result.scalars().all()


@router.get("/{kb_id}/wiki/{page_id}", response_model=WikiPageOut)
async def get_wiki_page(kb_id: UUID, page_id: UUID, user_id: UUID = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    kb = await db.execute(select(KnowledgeBase).where(KnowledgeBase.id == kb_id, KnowledgeBase.user_id == user_id))
    if not kb.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Knowledge base not found")

    result = await db.execute(select(WikiPage).where(WikiPage.id == page_id, WikiPage.kb_id == kb_id))
    page = result.scalar_one_or_none()
    if not page:
        raise HTTPException(status_code=404, detail="Wiki page not found")
    return page
