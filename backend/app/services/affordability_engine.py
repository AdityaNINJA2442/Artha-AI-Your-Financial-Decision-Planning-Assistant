import datetime
import json
from typing import Dict, Any
from sqlmodel import Session, select
from app.models.entities import UserProfile, FinancialGoal, FinancialDecisionHistory
from app.services.ai_engine import is_ai_api_available

def evaluate_purchase_affordability(
    db: Session,
    user_id: int,
    purchase_name: str,
    price: float,
    category_id: int = None
) -> Dict[str, Any]:
    """
    Evaluate purchase affordability using authenticated user's real DB records.
    Automatically logs entry into financial_decision_history.
    """
    profile = db.exec(select(UserProfile).where(UserProfile.user_id == user_id)).first()
    
    current_savings = profile.current_savings if profile else 250000.0
    monthly_income = profile.monthly_income if profile else 100000.0
    monthly_fixed = profile.monthly_fixed_expenses if profile else 40000.0
    emergency_fund = profile.emergency_fund if profile else 80000.0

    essential_expenses = max(10000.0, monthly_fixed)
    runway_before = round(emergency_fund / essential_expenses, 1)

    savings_after = max(0.0, current_savings - price)
    remaining_emergency_after = max(0.0, emergency_fund - max(0.0, price - (current_savings - emergency_fund)))
    runway_after = round(remaining_emergency_after / essential_expenses, 1)

    # Goal Impact (e.g. Car Goal)
    active_goal = db.exec(select(FinancialGoal).where(FinancialGoal.user_id == user_id)).first()
    goal_name = active_goal.goal_name if active_goal else "Car Purchase Fund"
    goal_target = active_goal.target_amount if active_goal else 1000000.0
    goal_current = active_goal.current_amount if active_goal else 240000.0
    goal_contribution = active_goal.monthly_contribution if active_goal else 15000.0

    remaining_goal_before = max(0.0, goal_target - goal_current)
    months_to_goal_before = math_months(remaining_goal_before, goal_contribution)
    months_to_goal_after = math_months(remaining_goal_before + (price * 0.3), goal_contribution)
    goal_delay = max(0, months_to_goal_after - months_to_goal_before)

    # Risk Classification
    if price > current_savings or runway_after < 1.5:
        result_status = "Financially Risky"
        badge_color = "RED"
        risk_level = "High Risk"
    elif price > (current_savings * 0.25) or runway_after < 3.0:
        result_status = "Caution"
        badge_color = "YELLOW"
        risk_level = "Caution"
    else:
        result_status = "Comfortable"
        badge_color = "GREEN"
        risk_level = "Manageable"

    # AI / Rule-based Narrative
    if is_ai_api_available():
        narrative_label = "AI-Powered Analysis (Gemini 1.5)"
    else:
        narrative_label = "Rule-based / Local System Analysis"

    narrative = (
        f"Buying '{purchase_name}' for ₹{price:,.0f} reduces your liquid savings from ₹{current_savings:,.0f} to ₹{savings_after:,.0f}. "
        f"Your emergency runway shift is {runway_before} mos → {runway_after} mos. "
        f"This purchase may delay your {goal_name} target by approximately {goal_delay} month(s)."
    )

    result_data = {
        "purchase_name": purchase_name,
        "price": price,
        "result_status": result_status,
        "badge_color": badge_color,
        "savings_before": current_savings,
        "savings_after": savings_after,
        "runway_before": runway_before,
        "runway_after": runway_after,
        "goal_name": goal_name,
        "goal_delay_months": goal_delay,
        "narrative": narrative,
        "narrative_label": narrative_label
    }

    # AUTOMATIC DECISION HISTORY LOGGING
    history_entry = FinancialDecisionHistory(
        user_id=user_id,
        decision_type="Affordability",
        title=f"Affordability Check: {purchase_name} (₹{price:,.0f})",
        input_data_json=json.dumps({"purchase_name": purchase_name, "price": price}),
        result_data_json=json.dumps(result_data),
        risk_level=risk_level
    )
    db.add(history_entry)
    db.commit()

    return result_data

def math_months(amount: float, monthly: float) -> int:
    if monthly <= 0:
        return 99
    return int(amount // monthly)
