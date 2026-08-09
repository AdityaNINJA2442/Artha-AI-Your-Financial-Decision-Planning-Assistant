from typing import List
from fastapi import APIRouter, Depends
from sqlmodel import Session, select, col
from app.db.session import get_db
from app.models.entities import User, FinancialDecisionHistory
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()

@router.get("/")
def get_user_decision_history(
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve authenticated user's logged financial decisions (Affordability, Loans, Shock Tests, FutureView)."""
    decisions = db.exec(
        select(FinancialDecisionHistory)
        .where(FinancialDecisionHistory.user_id == current_user.id)
        .order_by(col(FinancialDecisionHistory.created_at).desc())
        .limit(limit)
    ).all()

    return decisions
