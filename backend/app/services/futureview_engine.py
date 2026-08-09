import json
from typing import Dict, Any
from sqlmodel import Session, select
from app.models.entities import UserProfile, FinancialDecisionHistory

def simulate_futureview(
    db: Session,
    user_id: int,
    scenario: str = "Current Path",
    extra_monthly_savings: float = 0.0,
    expected_return_rate: float = 10.0
) -> Dict[str, Any]:
    """
    FutureView Digital Twin: Projects 1yr, 3yr, 5yr, 10yr net worth trajectories.
    Automatically logs to financial_decision_history.
    """
    profile = db.exec(select(UserProfile).where(UserProfile.user_id == user_id)).first()

    income = profile.monthly_income if profile else 100000.0
    fixed_exp = profile.monthly_fixed_expenses if profile else 40000.0
    savings = profile.current_savings if profile else 250000.0
    investments = profile.current_investments if profile else 120000.0

    base_monthly_savings = max(0.0, income - (fixed_exp + 28400.0)) + extra_monthly_savings
    monthly_r = (expected_return_rate / (12.0 * 100.0)) if expected_return_rate > 0 else 0.0

    def compute_future_val(months: int) -> float:
        # Initial principal compounding + Monthly contribution SIP compounding
        fv_principal = (savings + investments) * ((1 + monthly_r) ** months)
        if monthly_r > 0:
            fv_sip = base_monthly_savings * (((1 + monthly_r) ** months - 1) / monthly_r) * (1 + monthly_r)
        else:
            fv_sip = base_monthly_savings * months
        return round(fv_principal + fv_sip, 2)

    val_1yr = compute_future_val(12)
    val_3yr = compute_future_val(36)
    val_5yr = compute_future_val(60)
    val_10yr = compute_future_val(120)

    result_data = {
        "scenario_name": scenario,
        "base_monthly_savings": base_monthly_savings,
        "assumed_return_rate": expected_return_rate,
        "projected_1yr": val_1yr,
        "projected_3yr": val_3yr,
        "projected_5yr": val_5yr,
        "projected_10yr": val_10yr,
        "assumptions": f"Assumed annual growth rate of {expected_return_rate}% with ₹{base_monthly_savings:,.0f}/mo contribution.",
        "disclaimer": "Illustrative projection — not guaranteed returns. Actual market returns may vary."
    }

    # AUTOMATIC DECISION HISTORY LOGGING
    history_entry = FinancialDecisionHistory(
        user_id=user_id,
        decision_type="FutureView",
        title=f"FutureView Projection: {scenario}",
        input_data_json=json.dumps({"scenario": scenario, "extra_monthly_savings": extra_monthly_savings, "rate": expected_return_rate}),
        result_data_json=json.dumps(result_data),
        risk_level="Manageable"
    )
    db.add(history_entry)
    db.commit()

    return result_data
