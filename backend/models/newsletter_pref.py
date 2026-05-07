from sqlalchemy import Text, TIMESTAMP, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import text
from sqlalchemy.dialects.postgresql import UUID
from database import Base
import uuid


class NewsletterPref(Base):
    __tablename__ = "newsletter_prefs"
    __table_args__ = (UniqueConstraint("user_id", "kb_id"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    kb_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("knowledge_bases.id", ondelete="CASCADE"), nullable=False)
    frequency: Mapped[str] = mapped_column(Text, default="daily")
    last_sent_at = mapped_column(TIMESTAMP(timezone=True))

    user = relationship("User", back_populates="newsletter_prefs")
    kb = relationship("KnowledgeBase", back_populates="newsletter_prefs")
