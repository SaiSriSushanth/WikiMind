from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from database import get_db
from models.kb import KnowledgeBase
from models.newsletter_pref import NewsletterPref
from schemas.newsletter import NewsletterPrefOut, NewsletterPrefUpdate
from middleware.auth_middleware import get_current_user_id
from services.newsletter_service import run_digest_for_due_prefs

router = APIRouter(prefix="/newsletter", tags=["newsletter"])

VALID_FREQUENCIES = {"daily", "weekly", "off"}


@router.post("/test-send")
async def test_send(user_id: UUID = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    await run_digest_for_due_prefs(db)
    return {"detail": "Digest run complete"}


@router.get("", response_model=list[NewsletterPrefOut])
async def get_prefs(user_id: UUID = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(NewsletterPref).where(NewsletterPref.user_id == user_id))
    return result.scalars().all()


@router.put("/{kb_id}", response_model=NewsletterPrefOut)
async def set_pref(
    kb_id: UUID,
    body: NewsletterPrefUpdate,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    if body.frequency not in VALID_FREQUENCIES:
        raise HTTPException(status_code=400, detail="frequency must be daily, weekly, or off")

    kb = await db.execute(select(KnowledgeBase).where(KnowledgeBase.id == kb_id, KnowledgeBase.user_id == user_id))
    if not kb.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Knowledge base not found")

    result = await db.execute(
        select(NewsletterPref).where(NewsletterPref.user_id == user_id, NewsletterPref.kb_id == kb_id)
    )
    pref = result.scalar_one_or_none()

    if pref:
        pref.frequency = body.frequency
    else:
        pref = NewsletterPref(user_id=user_id, kb_id=kb_id, frequency=body.frequency)
        db.add(pref)

    await db.commit()
    await db.refresh(pref)
    return pref
