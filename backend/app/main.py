import logging
import bcrypt

# Compatibility patch for passlib with newer bcrypt library
if not hasattr(bcrypt, "__about__"):
    class BcryptAbout:
        __version__ = getattr(bcrypt, "__version__", "4.0.0")
    bcrypt.__about__ = BcryptAbout()

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import init_db, SessionLocal
from app.core.seed import seed_database
from app.services.market_service import fetch_market_summary
from app.services.financial_math import compute_financial_fitness_score

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("artha.main")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api.v1.api import api_router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def startup_event():
    """Initialize PostgreSQL database tables and seed default metadata on server start."""
    logger.info("Initializing PostgreSQL Database Engine...")
    try:
        init_db()
        db = SessionLocal()
        seed_database(db)
        db.close()
        logger.info("PostgreSQL Database Initialization & Seeding Complete.")
    except Exception as e:
        logger.warning(f"PostgreSQL connection pending Docker daemon startup: {e}")

@app.get("/")
def root():
    return {
        "message": "Welcome to Artha AI API",
        "tagline": "Understand Your Money. Build Your Future.",
        "docs": "/docs",
        "version": "1.0.0"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "PostgreSQL 16",
        "ai_engine": "Configured with Labeled Fallbacks",
        "market_service": "Data Integrity Enforced"
    }

@app.get(f"{settings.API_V1_STR}/market/summary")
async def get_market_summary(demo: bool = False):
    """Market API endpoint returning live feed or explicit unavailable label."""
    return await fetch_market_summary(is_demo_mode=demo)
