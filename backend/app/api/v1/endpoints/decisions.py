from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, col
from pydantic import BaseModel
import json
import datetime

from app.db.session import get_db
from app.models.entities import User, FinancialDecisionHistory
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()

class DecisionCreateRequest(BaseModel):
    decision_type: str
    title: str
    input_data: Optional[dict] = {}
    result_data: Optional[dict] = {}
    risk_level: Optional[str] = "Manageable"

@router.get("/")
def get_user_decision_history(
    limit: int = 50,
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

@router.post("/")
def create_decision(
    req: DecisionCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save a new financial decision / wishlist item / EMI analysis for the authenticated user."""
    decision = FinancialDecisionHistory(
        user_id=current_user.id,
        decision_type=req.decision_type,
        title=req.title,
        input_data_json=json.dumps(req.input_data or {}),
        result_data_json=json.dumps(req.result_data or {}),
        risk_level=req.risk_level or "Manageable",
        created_at=datetime.datetime.utcnow()
    )
    db.add(decision)
    db.commit()
    db.refresh(decision)
    return decision

@router.delete("/{decision_id}")
def delete_decision(
    decision_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a saved financial decision / wishlist item / EMI analysis with PostgreSQL user isolation."""
    decision = db.get(FinancialDecisionHistory, decision_id)
    if not decision or decision.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Decision record not found or access denied")
    
    db.delete(decision)
    db.commit()
    return {"status": "success", "message": "Decision deleted successfully"}
