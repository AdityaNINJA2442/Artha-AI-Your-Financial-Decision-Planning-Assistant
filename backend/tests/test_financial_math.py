import pytest
from app.services.financial_math import (
    calculate_monthly_income,
    calculate_emergency_fund_runway,
    compute_financial_fitness_score,
    calculate_what_if_simulation
)

def test_calculate_monthly_income():
    assert calculate_monthly_income(1200000.0, 0.0) == 100000.0
    assert calculate_monthly_income(0.0, 85000.0) == 85000.0

def test_emergency_fund_runway():
    res = calculate_emergency_fund_runway(80000.0, 40000.0)
    assert res["coverage_months"] == 2.0
    assert res["recommended_6_month_target"] == 240000.0

def test_financial_fitness_score():
    profile = {
        "monthly_income": 100000.0,
        "monthly_fixed_expenses": 40000.0,
        "emergency_fund": 80000.0,
        "current_investments": 120000.0
    }
    txs = [
        {"amount": 12400.0, "type": "Expense", "merchant": "Swiggy"},
        {"amount": 8500.0, "type": "Expense", "merchant": "Blinkit"}
    ]
    res = compute_financial_fitness_score(profile, txs)
    assert 0 <= res["overall_score"] <= 100
    assert res["total_income"] == 100000.0

def test_what_if_simulation():
    res = calculate_what_if_simulation(100000.0, 68400.0, 5000.0, 1000000.0, 240000.0)
    assert res["new_monthly_savings"] == 36600.0
    assert res["annual_savings_boost"] == 60000.0
    assert "disclaimer" in res
