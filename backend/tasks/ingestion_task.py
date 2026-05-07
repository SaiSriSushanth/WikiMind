import asyncio
from uuid import UUID
from tasks.celery_app import app


def _make_session():
    from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
    from config import settings
    engine = create_async_engine(settings.database_url, echo=False)
    return async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False), engine


@app.task(name="tasks.ingestion_task.ingest_document_task", bind=True, max_retries=3)
def ingest_document_task(self, doc_id: str):
    async def _run():
        from sqlalchemy import select
        from services.ingestion_service import ingest_document
        from services.wiki_service import generate_wiki_page
        from models.document import Document

        SessionLocal, engine = _make_session()
        try:
            async with SessionLocal() as db:
                await ingest_document(UUID(doc_id), db)
                result = await db.execute(select(Document).where(Document.id == UUID(doc_id)))
                doc = result.scalar_one_or_none()
                if doc and doc.status == "done":
                    await generate_wiki_page(doc.kb_id, UUID(doc_id), db)
        finally:
            await engine.dispose()

    try:
        asyncio.run(_run())
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)
