from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.db.session import get_db
from app.models.entities import User, UserProfile, Transaction
from app.api.v1.endpoints.auth import get_current_user
from app.services.financial_math import compute_financial_fitness_score

router = APIRouter()

@router.get("/")
def get_financial_health(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.exec(select(UserProfile).where(UserProfile.user_id == current_user.id)).first()
    transactions = db.exec(select(Transaction).where(Transaction.user_id == current_user.id)).all()
    
    prof_dict = profile.dict() if profile else {}
    tx_dicts = [t.dict() for t in transactions]

    fitness = compute_financial_fitness_score(prof_dict, tx_dicts)
    return fitness
