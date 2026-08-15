import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.main import app

def test_p0_data_integrity():
    client = TestClient(app)
    print("==================================================")
    print("  P0 DATA INTEGRITY PIPELINE TRACE")
    print("==================================================")

    # 1. Register fresh user
    email = "newuser.p0@artha.ai"
    password = "DemoUser@123"
    name = "Test User P0"

    print(f"\n1. Registering Fresh User: {email}")
    reg_res = client.post("/api/v1/auth/register", json={"name": name, "email": email, "password": password})
    if reg_res.status_code != 200:
        # If user exists, login
        print("  User exists, logging in...")
        login_res = client.post("/api/v1/auth/login", json={"email": email, "password": password})
        token = login_res.json()["access_token"]
    else:
        token = reg_res.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}

    # 2. Complete Onboarding with Known Input:
    # Monthly Income = ₹50,000 (Annual = ₹6,00,000)
    # Liquid Savings = ₹40,000
    # Emergency Fund = ₹20,000
    # Monthly Fixed Expenses = ₹15,000
    input_monthly_income = 50000.0
    input_annual_income = 600000.0
    input_savings = 40000.0
    input_emergency = 20000.0
    input_expenses = 15000.0

    print(f"\n2. Submitting Onboarding Payload:")
    print(f"   Monthly Income: Rs.{input_monthly_income:,.2f}")
    print(f"   Annual Income: Rs.{input_annual_income:,.2f}")
    print(f"   Liquid Savings: Rs.{input_savings:,.2f}")
    print(f"   Emergency Fund: Rs.{input_emergency:,.2f}")

    onboarding_payload = {
        "name": name,
        "age": 28,
        "occupation": "Salaried Professional",
        "country": "India",
        "city": "Bengaluru",
        "monthly_income": input_monthly_income,
        "annual_income": input_annual_income,
        "monthly_fixed_expenses": input_expenses,
        "current_savings": input_savings,
        "emergency_fund": input_emergency,
        "existing_loans_count": 0,
        "existing_total_emi": 0.0,
        "goal_name": "Emergency Cushion",
        "goal_amount": 100000.0,
        "goal_target_date": "2028-12-31"
    }

    onb_res = client.post("/api/v1/users/onboarding", headers=headers, json=onboarding_payload)
    print(f"   POST /api/v1/users/onboarding -> HTTP {onb_res.status_code}")
    assert onb_res.status_code == 200

    # 3. GET /api/v1/users/profile
    prof_res = client.get("/api/v1/users/profile", headers=headers)
    print(f"\n3. GET /api/v1/users/profile -> HTTP {prof_res.status_code}")
    p = prof_res.json()
    print(f"   Profile Monthly Income: Rs.{p.get('monthly_income'):,.2f}")
    print(f"   Profile Annual Income:  Rs.{p.get('annual_income'):,.2f}")
    print(f"   Profile Current Savings: Rs.{p.get('current_savings'):,.2f}")
    print(f"   Profile Emergency Fund: Rs.{p.get('emergency_fund'):,.2f}")

    assert p.get('monthly_income') == input_monthly_income
    assert p.get('annual_income') == input_annual_income
    assert p.get('current_savings') == input_savings
    assert p.get('emergency_fund') == input_emergency

    # 4. GET /api/v1/financial-health/
    health_res = client.get("/api/v1/financial-health/", headers=headers)
    print(f"\n4. GET /api/v1/financial-health/ -> HTTP {health_res.status_code}")
    h = health_res.json()
    print(f"   Calculated Financial Score: {h.get('overall_score')} / 100")

    # 5. GET /api/v1/transactions/
    tx_res = client.get("/api/v1/transactions/", headers=headers)
    print(f"\n5. GET /api/v1/transactions/ -> HTTP {tx_res.status_code}")
    tx_data = tx_res.json()
    tx_items = tx_data.get("items", []) if isinstance(tx_data, dict) else tx_data
    tx_count = len(tx_items)
    print(f"   Transactions Count: {tx_count} (New user has 0 mock transactions)")
    assert tx_count == 0

    print("\n==================================================")
    print("  P0 DATA INTEGRITY VERIFICATION: 100% PASSED!")
    print("==================================================")

if __name__ == "__main__":
    test_p0_data_integrity()
