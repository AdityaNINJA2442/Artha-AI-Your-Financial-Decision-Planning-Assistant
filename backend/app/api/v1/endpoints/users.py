from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from pydantic import BaseModel, Field
import datetime

from app.db.session import get_db
from app.models.entities import User, UserProfile, FinancialGoal, FinancialScore
from app.api.v1.endpoints.auth import get_current_user
from app.services.financial_math import compute_financial_fitness_score, calculate_monthly_income

router = APIRouter()

class OnboardingRequest(BaseModel):
    name: str
    age: int = 28
    occupation: str = "Salaried"
    country: str = "India"
    city: Optional[str] = "Bengaluru"
    annual_income: float = 1200000.0
    monthly_income: float = 100000.0
    family_status: str = "Single"
    monthly_fixed_expenses: float = 40000.0
    current_savings: float = 250000.0
    current_investments: float = 120000.0
    emergency_fund: float = 80000.0
    goal_name: str = "Buy a Car"
    goal_amount: float = 1000000.0
    goal_target_date: str = "2028-12-31"
    risk_preference: str = "Moderate"

@router.post("/onboarding")
def complete_onboarding(
    req: OnboardingRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.exec(select(UserProfile).where(UserProfile.user_id == current_user.id)).first()
    if not profile:
        profile = UserProfile(user_id=current_user.id, name=req.name)
        db.add(profile)

    computed_monthly = calculate_monthly_income(req.annual_income, req.monthly_income)

    profile.name = req.name
    profile.age = req.age
    profile.occupation = req.occupation
    profile.country = req.country
    profile.city = req.city
    profile.annual_income = req.annual_income if req.annual_income > 0 else computed_monthly * 12.0
    profile.monthly_income = computed_monthly
    profile.family_status = req.family_status
    profile.monthly_fixed_expenses = req.monthly_fixed_expenses
    profile.current_savings = req.current_savings
    profile.current_investments = req.current_investments
    profile.emergency_fund = req.emergency_fund
    profile.risk_preference = req.risk_preference
    profile.updated_at = datetime.datetime.utcnow()

    db.commit()
    db.refresh(profile)

    # Goal Creation
    try:
        t_date = datetime.datetime.strptime(req.goal_target_date, "%Y-%m-%d").date()
    except Exception:
        t_date = datetime.date(2028, 12, 31)

    existing_goal = db.exec(select(FinancialGoal).where(FinancialGoal.user_id == current_user.id)).first()
    if not existing_goal:
        new_goal = FinancialGoal(
            user_id=current_user.id,
            goal_name=req.goal_name,
            target_amount=req.goal_amount,
            current_amount=0.0,
            target_date=t_date,
            priority="High",
            monthly_contribution=15000.0,
            status="In Progress"
        )
        db.add(new_goal)
        db.commit()

    # Calculate Initial Score
    score_res = compute_financial_fitness_score(profile.dict(), [])
    existing_score = db.exec(select(FinancialScore).where(FinancialScore.user_id == current_user.id)).first()
    if not existing_score:
        existing_score = FinancialScore(user_id=current_user.id, overall_score=score_res["overall_score"])
        db.add(existing_score)
    else:
        existing_score.overall_score = score_res["overall_score"]
        existing_score.savings_ratio_score = score_res["savings_ratio_score"]
        existing_score.emergency_fund_score = score_res["emergency_fund_score"]
    
    db.commit()

    return {
        "status": "success",
        "message": "Financial profile ready.",
        "profile": profile,
        "fitness_score": score_res["overall_score"]
    }

@router.get("/profile")
def get_user_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.exec(select(UserProfile).where(UserProfile.user_id == current_user.id)).first()
    return profile
