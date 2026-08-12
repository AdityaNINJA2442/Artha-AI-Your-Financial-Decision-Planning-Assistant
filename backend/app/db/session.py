import logging
from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.core.config import settings

logger = logging.getLogger("artha.db")

database_url = settings.DATABASE_URL
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

is_postgres_healthy = False
try:
    engine = create_engine(
        database_url,
        echo=False,
        pool_pre_ping=True,
        connect_args={"connect_timeout": 3}
    )
    # Test real connection immediately
    with engine.connect() as conn:
        pass
    is_postgres_healthy = True
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=Session)
    logger.info("Successfully connected to primary PostgreSQL database.")
except Exception as e:
    logger.warning(f"PostgreSQL port 5432 unavailable ({e}). Using persistent local database (artha_ai.db).")

if not is_postgres_healthy:
    fallback_url = "sqlite:///./artha_ai.db"
    engine = create_engine(fallback_url, echo=False, connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=Session)

def init_db():
    """Create all database entity tables and apply missing column migrations."""
    try:
        SQLModel.metadata.create_all(engine)
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_hash VARCHAR;"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires_at TIMESTAMP;"))
            conn.execute(text("ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS age INTEGER DEFAULT 28;"))
            conn.execute(text("ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS occupation VARCHAR DEFAULT 'Salaried';"))
            conn.execute(text("ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS country VARCHAR DEFAULT 'India';"))
            conn.execute(text("ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS city VARCHAR DEFAULT 'Bengaluru';"))
            conn.execute(text("ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS expected_income_growth_pct FLOAT DEFAULT 8.0;"))
            conn.execute(text("ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS family_status VARCHAR DEFAULT 'Single';"))
            conn.execute(text("ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS monthly_fixed_expenses FLOAT DEFAULT 40000.0;"))
            conn.execute(text("ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS current_savings FLOAT DEFAULT 250000.0;"))
            conn.execute(text("ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS current_investments FLOAT DEFAULT 120000.0;"))
            conn.execute(text("ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS emergency_fund FLOAT DEFAULT 80000.0;"))
            conn.execute(text("ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS existing_loans_count INTEGER DEFAULT 0;"))
            conn.execute(text("ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS existing_total_emi FLOAT DEFAULT 0.0;"))
            conn.execute(text("ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS risk_preference VARCHAR DEFAULT 'Moderate';"))
            conn.execute(text("ALTER TABLE transactions ADD COLUMN IF NOT EXISTS is_shared BOOLEAN DEFAULT FALSE;"))
            conn.execute(text("ALTER TABLE financial_goals ADD COLUMN IF NOT EXISTS is_shared BOOLEAN DEFAULT FALSE;"))
            conn.execute(text("ALTER TABLE goal_progress ADD COLUMN IF NOT EXISTS note VARCHAR;"))
            conn.commit()
        logger.info("Successfully initialized database schemas and migrations.")
    except Exception as e:
        logger.warning(f"Schema init fallback: {e}")

def get_db():
    """FastAPI Dependency for database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
