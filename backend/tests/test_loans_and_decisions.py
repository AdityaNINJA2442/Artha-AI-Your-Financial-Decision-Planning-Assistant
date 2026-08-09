import pytest
import datetime
from app.services.loan_engine import (
    calculate_emi,
    generate_amortization_schedule,
    calculate_loan_affordability,
    stress_test_interest_rates,
    simulate_prepayment
)

def test_calculate_emi_math():
    res = calculate_emi(1000000.0, 9.0, 60)
    assert res["emi"] == 20758.36
    assert res["total_repayment"] == 1245501.6
    assert res["total_interest"] == 245501.6

def test_generate_amortization_schedule():
    sched = generate_amortization_schedule(1000000.0, 9.0, 60, datetime.date(2026, 8, 1))
    assert len(sched) == 60
    assert sched[0]["month_number"] == 1
    assert sched[0]["principal"] + sched[0]["interest"] == sched[0]["emi"]

def test_loan_affordability():
    aff = calculate_loan_affordability(100000.0, 40000.0, 0.0, 20758.0)
    assert aff["status"] in ["Comfortable", "Caution", "Financially Risky"]
    assert aff["total_emi_after"] == 20758.0

def test_stress_test_interest_rates():
    st = stress_test_interest_rates(1000000.0, 9.0, 60)
    assert len(st["scenarios"]) == 4
    assert st["scenarios"][1]["rate_label"] == "+1.0% (10.0%)"

def test_simulate_prepayment():
    prep = simulate_prepayment(1000000.0, 9.0, 60, extra_monthly=5000.0)
    assert prep["months_saved"] > 0
    assert prep["interest_saved"] > 0
