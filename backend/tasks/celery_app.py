from celery import Celery
from celery.schedules import crontab
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import settings

import ssl

_redis_url = settings.redis_url
if _redis_url.startswith("rediss://") and "ssl_cert_reqs" not in _redis_url:
    _redis_url = _redis_url + "?ssl_cert_reqs=CERT_NONE"

app = Celery(
    "wikimind",
    broker=_redis_url,
    backend=_redis_url,
    include=["tasks.ingestion_task", "tasks.newsletter_task"],
)

app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

app.conf.beat_schedule = {
    "send-digests-hourly": {
        "task": "tasks.newsletter_task.send_daily_digests",
        "schedule": crontab(minute=0),
    },
}
