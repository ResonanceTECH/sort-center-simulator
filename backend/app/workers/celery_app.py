from __future__ import annotations

from celery import Celery

from app.core.config import get_settings

settings = get_settings()
redis_url = getattr(settings, "redis_url", "redis://localhost:6379/0")

celery_app = Celery("scm", broker=redis_url, backend=redis_url)
celery_app.conf.task_serializer = "json"
celery_app.conf.result_serializer = "json"
celery_app.conf.accept_content = ["json"]
celery_app.conf.task_track_started = True

celery_app.autodiscover_tasks(["app.workers"])
