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

from app.models.entities import User, FinancialGoal, GoalProgress

class ContributionCreate(BaseModel):
    amount: float
    date: Optional[str] = None
    note: Optional[str] = None

@router.get("/")
def get_user_goals(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    goals = db.exec(select(FinancialGoal).where(FinancialGoal.user_id == current_user.id)).all()
    return goals

@router.post("/")
def create_goal(req: GoalCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if req.target_amount <= 0:
        raise HTTPException(status_code=400, detail="Target amount must be greater than 0")

    try:
        t_date = datetime.datetime.strptime(req.target_date, "%Y-%m-%d").date()
    except Exception:
        t_date = datetime.date(2028, 12, 31)

    new_goal = FinancialGoal(
        user_id=current_user.id,
        goal_name=req.goal_name,
        target_amount=req.target_amount,
        current_amount=max(0.0, req.current_amount),
        target_date=t_date,
        priority=req.priority,
        monthly_contribution=req.monthly_contribution,
        status="In Progress"
    )
    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)

    if req.current_amount > 0:
        prog = GoalProgress(
            goal_id=new_goal.id,
            date=datetime.date.today(),
            amount_added=req.current_amount,
            source="Initial Savings",
            note="Initial deposit on goal creation"
        )
        db.add(prog)
        db.commit()

    return new_goal

@router.post("/{goal_id}/contributions")
def add_goal_contribution(
    goal_id: int,
    req: ContributionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    goal = db.get(FinancialGoal, goal_id)
    if not goal or goal.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Goal not found or unauthorized")

    if req.amount <= 0:
        raise HTTPException(status_code=400, detail="Contribution amount must be greater than 0")

    try:
        c_date = datetime.datetime.strptime(req.date, "%Y-%m-%d").date() if req.date else datetime.date.today()
    except Exception:
        c_date = datetime.date.today()

    new_progress = GoalProgress(
        goal_id=goal.id,
        date=c_date,
        amount_added=req.amount,
        source="Manual Contribution",
        note=req.note
    )
    db.add(new_progress)
    db.commit()

    # Recalculate Goal current_amount = SUM(GoalProgress.amount_added)
    all_contributions = db.exec(select(GoalProgress).where(GoalProgress.goal_id == goal.id)).all()
    total_saved = sum(c.amount_added for c in all_contributions)
    
    goal.current_amount = total_saved
    if goal.current_amount >= goal.target_amount:
        goal.status = "Completed"

    db.commit()
    db.refresh(goal)

    return {
        "status": "success",
        "message": f"Successfully added ₹{req.amount:,.2f} to {goal.goal_name}",
        "goal": goal,
        "contribution": new_progress
    }
