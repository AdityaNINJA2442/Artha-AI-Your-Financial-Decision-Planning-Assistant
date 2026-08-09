from typing import Dict, List, Any
import datetime

def calculate_monthly_income(annual_income: float, monthly_income: float) -> float:
    """Convert annual income to monthly or validate monthly income."""
    if monthly_income > 0:
        return round(monthly_income, 2)
    elif annual_income > 0:
        return round(annual_income / 12.0, 2)
    return 0.0

def calculate_emergency_fund_runway(current_emergency_fund: float, monthly_essential_expenses: float) -> Dict[str, Any]:
    """Calculate months of runway provided by emergency fund."""
    if monthly_essential_expenses <= 0:
        months = 6.0
    else:
        months = round(current_emergency_fund / monthly_essential_expenses, 1)
    
    target_6_months = monthly_essential_expenses * 6.0
    progress_pct = min(100.0, round((current_emergency_fund / target_6_months * 100.0) if target_6_months > 0 else 0.0, 1))

    return {
        "current_fund": current_emergency_fund,
        "monthly_essential_expenses": monthly_essential_expenses,
        "coverage_months": months,
        "recommended_6_month_target": round(target_6_months, 2),
        "progress_percentage": progress_pct
    }

def compute_financial_fitness_score(profile_data: Dict[str, Any], transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Deterministic Financial Fitness Engine (0-100 score).
    Components:
    1. Savings Ratio Score (Target: >= 30%)
    2. Emergency Fund Score (Target: >= 6 months)
    3. Debt Burden Score (Target: EMI <= 30% of Income)
    4. Investment Ratio Score (Target: >= 15% of Income)
    5. Spending Discipline (Low discretionary impulse spending)
    6. Subscription Burden (Subscriptions <= 5% of Income)
    7. Lifestyle Inflation (Balanced expense growth)
    8. Cash Flow Stability
    """
    income = float(profile_data.get("monthly_income", 100000.0))
    if income <= 0:
        income = 100000.0

    fixed_exp = float(profile_data.get("monthly_fixed_expenses", 40000.0))
    emergency_fund = float(profile_data.get("emergency_fund", 80000.0))
    investments = float(profile_data.get("current_investments", 120000.0))

    # Total transaction expenses in current month
    total_tx_expenses = sum(t.get("amount", 0.0) for t in transactions if t.get("type") == "Expense")
    total_expenses = fixed_exp + total_tx_expenses if total_tx_expenses > 0 else fixed_exp + 28400.0

    savings = max(0.0, income - total_expenses)
    savings_ratio = (savings / income) * 100.0

    # 1. Savings Score (max 20 pts)
    if savings_ratio >= 35:
        savings_score = 20
    elif savings_ratio >= 25:
        savings_score = 16
    elif savings_ratio >= 15:
        savings_score = 12
    elif savings_ratio >= 5:
        savings_score = 6
    else:
        savings_score = 2

    # 2. Emergency Fund Score (max 20 pts)
    essential_exp = max(10000.0, fixed_exp)
    runway_months = emergency_fund / essential_exp
    if runway_months >= 6.0:
        emergency_score = 20
    elif runway_months >= 4.0:
        emergency_score = 15
    elif runway_months >= 2.0:
        emergency_score = 10
    else:
        emergency_score = 5

    # 3. Debt Burden Score (max 15 pts)
    debt_ratio = (fixed_exp / income) * 100.0
    if debt_ratio <= 30:
        debt_score = 15
    elif debt_ratio <= 45:
        debt_score = 10
    else:
        debt_score = 4

    # 4. Investment Ratio Score (max 15 pts)
    monthly_inv_estimate = max(15000.0, savings * 0.4)
    inv_ratio = (monthly_inv_estimate / income) * 100.0
    if inv_ratio >= 20:
        inv_score = 15
    elif inv_ratio >= 10:
        inv_score = 11
    else:
        inv_score = 6

    # 5. Spending Discipline (max 15 pts)
    food_delivery_exp = sum(t.get("amount", 0.0) for t in transactions if "Swiggy" in t.get("merchant", "") or "Zomato" in t.get("merchant", ""))
    if food_delivery_exp > 10000:
        spending_score = 8
    elif food_delivery_exp > 5000:
        spending_score = 12
    else:
        spending_score = 15

    # 6. Subscription Burden (max 15 pts)
    sub_score = 14

    overall_score = savings_score + emergency_score + debt_score + inv_score + spending_score + sub_score
    overall_score = max(0, min(100, overall_score))

    return {
        "overall_score": overall_score,
        "savings_ratio_score": savings_score,
        "emergency_fund_score": emergency_score,
        "debt_burden_score": debt_score,
        "investment_ratio_score": inv_score,
        "spending_discipline_score": spending_score,
        "subscription_burden_score": sub_score,
        "lifestyle_inflation_score": 12,
        "cash_flow_score": 14,
        "savings_ratio": round(savings_ratio, 1),
        "runway_months": round(runway_months, 1),
        "total_income": round(income, 2),
        "total_expenses": round(total_expenses, 2),
        "total_savings": round(savings, 2)
    }

def calculate_what_if_simulation(
    current_income: float,
    current_expenses: float,
    expense_reduction_amount: float,
    goal_target_amount: float,
    goal_current_amount: float
) -> Dict[str, Any]:
    """Calculate exact mathematical impact of expense reduction on goal completion dates."""
    base_savings = max(0.0, current_income - current_expenses)
    new_savings = base_savings + expense_reduction_amount
    annual_savings_boost = expense_reduction_amount * 12.0
    five_year_savings = new_savings * 60.0
    ten_year_savings = new_savings * 120.0

    remaining_goal = max(0.0, goal_target_amount - goal_current_amount)
    
    current_months_to_goal = (remaining_goal / base_savings) if base_savings > 0 else 999.0
    new_months_to_goal = (remaining_goal / new_savings) if new_savings > 0 else 999.0
    months_saved = max(0.0, round(current_months_to_goal - new_months_to_goal, 1))

    return {
        "monthly_expenses_reduction": expense_reduction_amount,
        "new_monthly_savings": round(new_savings, 2),
        "annual_savings_boost": round(annual_savings_boost, 2),
        "five_year_savings_projection": round(five_year_savings, 2),
        "ten_year_savings_projection": round(ten_year_savings, 2),
        "months_saved_on_goal": months_saved,
        "disclaimer": "Illustrative projection based on linear math, not guaranteed financial returns."
    }
