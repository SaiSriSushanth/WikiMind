from pydantic import BaseModel
from datetime import datetime
from uuid import UUID


class DocumentOut(BaseModel):
    id: UUID
    kb_id: UUID
    filename: str
    file_type: str
    storage_path: str
    status: str
    uploaded_at: datetime

    model_config = {"from_attributes": True}
