from pydantic import BaseModel
from datetime import datetime
from uuid import UUID


class KBCreate(BaseModel):
    name: str
    description: str | None = None


class KBUpdate(BaseModel):
    name: str | None = None
    description: str | None = None


class KBOut(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    description: str | None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
