from pydantic import BaseModel
from datetime import datetime
from uuid import UUID


class WikiPageSummary(BaseModel):
    id: UUID
    kb_id: UUID
    title: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class WikiPageOut(WikiPageSummary):
    content_md: str
    source_doc_ids: list[UUID] | None
