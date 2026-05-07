from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from database import get_db
from models.kb import KnowledgeBase
from schemas.kb import KBCreate, KBUpdate, KBOut
from middleware.auth_middleware import get_current_user_id

router = APIRouter(prefix="/kb", tags=["knowledge-bases"])


async def _get_kb_or_404(kb_id: UUID, user_id: UUID, db: AsyncSession) -> KnowledgeBase:
    result = await db.execute(select(KnowledgeBase).where(KnowledgeBase.id == kb_id, KnowledgeBase.user_id == user_id))
    kb = result.scalar_one_or_none()
    if not kb:
        raise HTTPException(status_code=404, detail="Knowledge base not found")
    return kb


@router.get("", response_model=list[KBOut])
async def list_kbs(user_id: UUID = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(KnowledgeBase).where(KnowledgeBase.user_id == user_id))
    return result.scalars().all()


@router.post("", response_model=KBOut, status_code=201)
async def create_kb(body: KBCreate, user_id: UUID = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    kb = KnowledgeBase(user_id=user_id, name=body.name, description=body.description)
    db.add(kb)
    await db.commit()
    await db.refresh(kb)
    return kb


@router.patch("/{kb_id}", response_model=KBOut)
async def update_kb(kb_id: UUID, body: KBUpdate, user_id: UUID = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    kb = await _get_kb_or_404(kb_id, user_id, db)
    if body.name is not None:
        kb.name = body.name
    if body.description is not None:
        kb.description = body.description
    await db.commit()
    await db.refresh(kb)
    return kb


@router.delete("/{kb_id}", status_code=204)
async def delete_kb(kb_id: UUID, user_id: UUID = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    kb = await _get_kb_or_404(kb_id, user_id, db)
    await db.delete(kb)
    await db.commit()


@router.patch("/{kb_id}/toggle", response_model=KBOut)
async def toggle_kb(kb_id: UUID, user_id: UUID = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    kb = await _get_kb_or_404(kb_id, user_id, db)
    kb.is_active = not kb.is_active
    await db.commit()
    await db.refresh(kb)
    return kb
