from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from pydantic import BaseModel
import datetime

from app.db.session import get_db
from app.models.entities import User, FinancialGoal
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()

class GoalCreate(BaseModel):
    goal_name: str
    target_amount: float
    current_amount: float = 0.0
    target_date: str
    priority: str = "Medium"
    monthly_contribution: float = 10000.0

@router.get("/")
def get_user_goals(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    goals = db.exec(select(FinancialGoal).where(FinancialGoal.user_id == current_user.id)).all()
    return goals

@router.post("/")
def create_goal(req: GoalCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        t_date = datetime.datetime.strptime(req.target_date, "%Y-%m-%d").date()
    except Exception:
        t_date = datetime.date(2028, 12, 31)

    new_goal = FinancialGoal(
        user_id=current_user.id,
        goal_name=req.goal_name,
        target_amount=req.target_amount,
        current_amount=req.current_amount,
        target_date=t_date,
        priority=req.priority,
        monthly_contribution=req.monthly_contribution,
        status="In Progress"
    )
    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)
    return new_goal
