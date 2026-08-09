import logging
from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

logger = logging.getLogger("artha.db")

database_url = settings.DATABASE_URL
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

try:
    # Primary PostgreSQL Engine
    engine = create_engine(
        database_url,
        echo=False,
        pool_pre_ping=True
    )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=Session)
except Exception as e:
    logger.warning(f"Could not connect to PostgreSQL ({e}). Using persistent local fallback database.")
    fallback_url = "sqlite:///./artha_ai.db"
    engine = create_engine(fallback_url, echo=False, connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=Session)

def init_db():
    """Create all 25 database entity tables."""
    try:
        SQLModel.metadata.create_all(engine)
        logger.info("Successfully initialized database schemas.")
    except Exception as e:
        logger.warning(f"PostgreSQL connection attempt failed: {e}. Switching to persistent local fallback DB.")
        fallback_url = "sqlite:///./artha_ai.db"
        fallback_engine = create_engine(fallback_url, echo=False, connect_args={"check_same_thread": False})
        SQLModel.metadata.create_all(fallback_engine)

def get_db():
    """FastAPI Dependency for database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
