import json
from typing import Dict, Any
from sqlmodel import Session, select
from app.models.entities import UserProfile, FinancialDecisionHistory

def simulate_financial_shock(
    db: Session,
    user_id: int,
    scenario_type: str = "3_months_no_income",
    custom_shock_amount: float = 0.0
) -> Dict[str, Any]:
    """
    Simulate financial shock scenario (income loss, medical emergency, rent spike)
    and compute exact surviving runway months. Automatically logs to financial_decision_history.
    """
    profile = db.exec(select(UserProfile).where(UserProfile.user_id == user_id)).first()

    savings = profile.current_savings if profile else 250000.0
    emergency_fund = profile.emergency_fund if profile else 80000.0
    monthly_income = profile.monthly_income if profile else 100000.0
    fixed_exp = profile.monthly_fixed_expenses if profile else 40000.0

    essential_expenses = max(10000.0, fixed_exp)
    liquid_pool = savings + emergency_fund

    # Scenario Adjustments
    if scenario_type == "1_month_no_income":
        shock_title = "1 Month Without Income"
        effective_pool = liquid_pool
        effective_expenses = essential_expenses
    elif scenario_type == "3_months_no_income":
        shock_title = "3 Months Without Income"
        effective_pool = liquid_pool
        effective_expenses = essential_expenses
    elif scenario_type == "6_months_no_income":
        shock_title = "6 Months Without Income"
        effective_pool = liquid_pool
        effective_expenses = essential_expenses
    elif scenario_type == "medical_emergency_100k":
        shock_title = "₹1,00,000 Medical Emergency"
        effective_pool = max(0.0, liquid_pool - 100000.0)
        effective_expenses = essential_expenses
    elif scenario_type == "50_percent_income_drop":
        shock_title = "50% Sudden Income Drop"
        effective_pool = liquid_pool
        effective_expenses = max(1000.0, essential_expenses - (monthly_income * 0.5))
    else:
        shock_title = f"Custom Shock (₹{custom_shock_amount:,.0f})"
        effective_pool = max(0.0, liquid_pool - custom_shock_amount)
        effective_expenses = essential_expenses

    runway_months = round(effective_pool / effective_expenses, 1) if effective_expenses > 0 else 99.0

    if runway_months >= 6.0:
        risk_level = "SAFE"
        status_label = "🟢 High Resilience (Safe)"
    elif runway_months >= 3.0:
        risk_level = "CAUTION"
        status_label = "🟡 Moderate Resilience (Caution)"
    else:
        risk_level = "HIGH RISK"
        status_label = "🔴 Low Resilience (High Risk)"

    target_6_months = essential_expenses * 6.0
    coverage_gap = max(0.0, target_6_months - liquid_pool)

    result_data = {
        "scenario_type": scenario_type,
        "shock_title": shock_title,
        "runway_months": runway_months,
        "risk_level": risk_level,
        "status_label": status_label,
        "essential_expenses": essential_expenses,
        "liquid_pool": liquid_pool,
        "target_6_month_fund": target_6_months,
        "coverage_gap": coverage_gap,
        "disclaimer": "Educational estimate based on your essential monthly fixed expenses."
    }

    # AUTOMATIC DECISION HISTORY LOGGING
    history_entry = FinancialDecisionHistory(
        user_id=user_id,
        decision_type="Shock Test",
        title=f"Shock Test: {shock_title}",
        input_data_json=json.dumps({"scenario_type": scenario_type, "custom_shock_amount": custom_shock_amount}),
        result_data_json=json.dumps(result_data),
        risk_level=risk_level
    )
    db.add(history_entry)
    db.commit()

    return result_data
