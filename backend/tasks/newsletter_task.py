import asyncio
from tasks.celery_app import app


def _make_session():
    from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
    from config import settings
    engine = create_async_engine(settings.database_url, echo=False)
    return async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False), engine


@app.task(name="tasks.newsletter_task.send_daily_digests")
def send_daily_digests():
    async def _run():
        from services.newsletter_service import run_digest_for_due_prefs
        SessionLocal, engine = _make_session()
        try:
            async with SessionLocal() as db:
                await run_digest_for_due_prefs(db)
        finally:
            await engine.dispose()

    asyncio.run(_run())
