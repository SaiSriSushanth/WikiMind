from sqlalchemy import String, Text, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import text
from sqlalchemy.dialects.postgresql import UUID
from database import Base
import uuid


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    email: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(Text, nullable=False)
    full_name: Mapped[str | None] = mapped_column(Text)
    created_at = mapped_column(TIMESTAMP(timezone=True), server_default=text("now()"))

    knowledge_bases = relationship("KnowledgeBase", back_populates="user", cascade="all, delete-orphan")
    newsletter_prefs = relationship("NewsletterPref", back_populates="user", cascade="all, delete-orphan")
