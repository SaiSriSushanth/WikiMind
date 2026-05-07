from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from openai import OpenAI
from config import settings
from models.chunk import Chunk
from models.wiki_page import WikiPage

_client = OpenAI(api_key=settings.openai_api_key)
MODEL = "gpt-4o-mini"

WIKI_PROMPT = """\
You are a knowledge base assistant. Given the following document content, generate a structured wiki page in Markdown.

The wiki page must include:
- A clear title (# heading)
- A one-paragraph summary
- Key concepts as ## sections
- A "Quick Reference" section at the end with bullet points of the most important facts

Content:
{content}

Return only the Markdown. No preamble."""


async def generate_wiki_page(kb_id: UUID, doc_id: UUID, db: AsyncSession) -> WikiPage:
    result = await db.execute(
        select(Chunk).where(Chunk.doc_id == doc_id).order_by(Chunk.chunk_index)
    )
    chunks = result.scalars().all()
    if not chunks:
        return None

    content = "\n\n".join(c.content for c in chunks)
    prompt = WIKI_PROMPT.format(content=content)

    response = _client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=4096,
    )
    markdown = response.choices[0].message.content

    title_line = next((l for l in markdown.splitlines() if l.startswith("# ")), "# Untitled")
    title = title_line.lstrip("# ").strip()

    existing = await db.execute(
        select(WikiPage).where(WikiPage.kb_id == kb_id, WikiPage.source_doc_ids.any(doc_id))
    )
    wiki = existing.scalar_one_or_none()

    if wiki:
        wiki.title = title
        wiki.content_md = markdown
        from sqlalchemy.sql import func
        wiki.updated_at = func.now()
    else:
        wiki = WikiPage(kb_id=kb_id, title=title, content_md=markdown, source_doc_ids=[doc_id])
        db.add(wiki)

    await db.commit()
    await db.refresh(wiki)
    return wiki
