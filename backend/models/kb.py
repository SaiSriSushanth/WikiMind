from sqlalchemy import Text, Boolean, TIMESTAMP, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import text
from sqlalchemy.dialects.postgresql import UUID
from database import Base
import uuid


class KnowledgeBase(Base):
    __tablename__ = "knowledge_bases"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at = mapped_column(TIMESTAMP(timezone=True), server_default=text("now()"))

    user = relationship("User", back_populates="knowledge_bases")
    documents = relationship("Document", back_populates="kb", cascade="all, delete-orphan")
    wiki_pages = relationship("WikiPage", back_populates="kb", cascade="all, delete-orphan")
    newsletter_prefs = relationship("NewsletterPref", back_populates="kb", cascade="all, delete-orphan")
