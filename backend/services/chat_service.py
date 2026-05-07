from typing import AsyncIterator
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from openai import OpenAI
from config import settings
from utils.embedder import embed_texts

_client = OpenAI(api_key=settings.openai_api_key)
MODEL = "gpt-4o-mini"

SYSTEM_PROMPT = """\
You are a helpful knowledge base assistant. Answer the user's question using only the context provided below. \
If the answer is not in the context, say so honestly. Be concise and cite which KB the information came from.

Context:
{context}"""


async def rag_query(query: str, kb_ids: list[UUID], db: AsyncSession) -> AsyncIterator[str]:
    embeddings = embed_texts([query])
    query_embedding = embeddings[0]

    rows = await db.execute(
        text(
            "SELECT c.content, kb.name FROM chunks c "
            "JOIN knowledge_bases kb ON kb.id = c.kb_id "
            "WHERE c.kb_id = ANY(:kb_ids) "
            "ORDER BY c.embedding <=> CAST(:embedding AS vector) "
            "LIMIT 8"
        ),
        {"kb_ids": [str(k) for k in kb_ids], "embedding": str(query_embedding)},
    )
    chunks = rows.fetchall()

    if not chunks:
        yield "I couldn't find relevant information in your selected knowledge bases."
        return

    context = "\n\n".join(f"[{row.name}] {row.content}" for row in chunks)
    system = SYSTEM_PROMPT.format(context=context)

    stream = _client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": query},
        ],
        max_tokens=2048,
        stream=True,
    )

    for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta
