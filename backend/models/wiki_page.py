from sqlalchemy import Text, TIMESTAMP, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import text
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from database import Base
import uuid


class WikiPage(Base):
    __tablename__ = "wiki_pages"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    kb_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("knowledge_bases.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    content_md: Mapped[str] = mapped_column(Text, nullable=False)
    source_doc_ids = mapped_column(ARRAY(UUID(as_uuid=True)))
    created_at = mapped_column(TIMESTAMP(timezone=True), server_default=text("now()"))
    updated_at = mapped_column(TIMESTAMP(timezone=True), server_default=text("now()"))

    kb = relationship("KnowledgeBase", back_populates="wiki_pages")
