from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text, update
from datetime import datetime, timezone, timedelta
from openai import OpenAI
import resend
from config import settings
from models.newsletter_pref import NewsletterPref
from models.kb import KnowledgeBase
from models.user import User

_client = OpenAI(api_key=settings.openai_api_key)
resend.api_key = settings.resend_api_key
MODEL = "gpt-4o-mini"

DIGEST_PROMPT = """\
You are a study assistant helping a user recall key knowledge. Given the following excerpts from their knowledge base "{kb_name}", generate a digest of 5 memorable facts or insights written as short, clear bullet points. Make them easy to recall and understand out of context.

Excerpts:
{excerpts}

Return only the bullet points. No preamble."""


async def generate_digest(kb_id, kb_name: str, db: AsyncSession) -> str:
    rows = await db.execute(
        text("SELECT content FROM chunks WHERE kb_id = :kb_id ORDER BY random() LIMIT 10"),
        {"kb_id": str(kb_id)},
    )
    chunks = [r.content for r in rows.fetchall()]
    if not chunks:
        return ""

    prompt = DIGEST_PROMPT.format(kb_name=kb_name, excerpts="\n\n".join(chunks))
    response = _client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1024,
    )
    return response.choices[0].message.content


def send_digest_email(user_email: str, kb_name: str, digest_content: str) -> None:
    html = f"<h2>Your WikiMind Daily: {kb_name}</h2><ul>"
    for line in digest_content.strip().splitlines():
        clean = line.lstrip("•-* ").strip()
        if clean:
            html += f"<li>{clean}</li>"
    html += "</ul><p><small>Manage preferences in WikiMind settings.</small></p>"

    resend.Emails.send({
        "from": "WikiMind <onboarding@resend.dev>",
        "to": [user_email],
        "subject": f"Your WikiMind Daily: {kb_name}",
        "html": html,
    })


async def run_digest_for_due_prefs(db: AsyncSession) -> None:
    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(NewsletterPref).where(NewsletterPref.frequency != "off")
    )
    prefs = result.scalars().all()

    for pref in prefs:
        if pref.frequency == "daily":
            due = pref.last_sent_at is None or (now - pref.last_sent_at) >= timedelta(hours=24)
        elif pref.frequency == "weekly":
            due = pref.last_sent_at is None or (now - pref.last_sent_at) >= timedelta(days=7)
        else:
            continue

        if not due:
            continue

        kb_row = await db.execute(select(KnowledgeBase).where(KnowledgeBase.id == pref.kb_id))
        kb = kb_row.scalar_one_or_none()
        user_row = await db.execute(select(User).where(User.id == pref.user_id))
        user = user_row.scalar_one_or_none()

        if not kb or not user:
            continue

        digest = await generate_digest(pref.kb_id, kb.name, db)
        if not digest:
            continue

        try:
            send_digest_email(user.email, kb.name, digest)
            await db.execute(
                update(NewsletterPref).where(NewsletterPref.id == pref.id).values(last_sent_at=now)
            )
            await db.commit()
        except Exception:
            pass
