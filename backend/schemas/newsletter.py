from pydantic import BaseModel
from datetime import datetime
from uuid import UUID


class NewsletterPrefOut(BaseModel):
    id: UUID
    user_id: UUID
    kb_id: UUID
    frequency: str
    last_sent_at: datetime | None

    model_config = {"from_attributes": True}


class NewsletterPrefUpdate(BaseModel):
    frequency: str  # daily | weekly | off
