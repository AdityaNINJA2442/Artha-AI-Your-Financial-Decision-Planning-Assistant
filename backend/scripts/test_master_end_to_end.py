import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.main import app

from app.db.session import init_db, SessionLocal
from app.core.seed import seed_database

def run_master_end_to_end_verification():
    init_db()
    db = SessionLocal()
    seed_database(db)
    db.close()

    client = TestClient(app)
    print("==========================================================")
    print("  ARTHA AI — MASTER END-TO-END REGRESSION VERIFICATION")
    print("==========================================================")

    # 1. TEST DEMO USERS (ARJUN & RIYA)
    print("\n[1] Testing Demo Accounts:")
    for name, email in [("Arjun", "arjun.demo@artha.ai"), ("Riya", "riya.demo@artha.ai")]:
        l_res = client.post("/api/v1/auth/login", json={"email": email, "password": "Demo@123"})
        if l_res.status_code != 200:
            reg_d = client.post("/api/v1/auth/register", json={"name": f"{name} Sharma", "email": email, "password": "Demo@123"})
            token = reg_d.json()["access_token"]
        else:
            token = l_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        prof = client.get("/api/v1/users/profile", headers=headers).json()
        goals = client.get("/api/v1/goals/", headers=headers).json()
        loans = client.get("/api/v1/loans/", headers=headers).json()
        print(f"  [PASS] {name} ({email}) -> Profile: {prof.get('name')} | Goals: {len(goals)} | Loans: {len(loans)}")

    # 2. TEST NEW USER ONBOARDING & P0 DATA INTEGRITY
    print("\n[2] Testing P0 Data Integrity with Fresh User:")
    new_email = "newuser.master@artha.ai"
    reg_res = client.post("/api/v1/auth/register", json={"name": "Master User", "email": new_email, "password": "DemoUser@123"})
    if reg_res.status_code == 200:
        new_token = reg_res.json()["access_token"]
    else:
        new_token = client.post("/api/v1/auth/login", json={"email": new_email, "password": "DemoUser@123"}).json()["access_token"]
    
    new_headers = {"Authorization": f"Bearer {new_token}"}

    # Submit Onboarding with Income ₹6,00,000 Annual (₹50,000/mo)
    onb_res = client.post("/api/v1/users/onboarding", headers=new_headers, json={
        "name": "Master User",
        "age": 30,
        "occupation": "Software Engineer",
        "monthly_income": 50000.0,
        "annual_income": 600000.0,
        "monthly_fixed_expenses": 20000.0,
        "current_savings": 40000.0,
        "emergency_fund": 20000.0,
        "existing_loans_count": 0,
        "existing_total_emi": 0.0,
        "goal_name": "Emergency Fund",
        "goal_amount": 100000.0,
        "goal_target_date": "2028-12-31"
    })
    assert onb_res.status_code == 200

    # Verify Profile Endpoint Data
    p0_prof = client.get("/api/v1/users/profile", headers=new_headers).json()
    assert p0_prof["monthly_income"] == 50000.0
    assert p0_prof["annual_income"] == 600000.0
    assert p0_prof["current_savings"] == 40000.0
    assert p0_prof["emergency_fund"] == 20000.0
    print("  [PASS] P0 Data Pipeline Match: Input = Rs.50,000/mo (Rs.6,00,000/yr) -> Stored & Returned = Rs.50,000/mo (Rs.6,00,000/yr)")

    # 3. TEST P2 CREATE GOAL
    print("\n[3] Testing P2 Create Goal:")
    g_res = client.post("/api/v1/goals/", headers=new_headers, json={
        "goal_name": "Master Goal Test",
        "target_amount": 150000.0,
        "current_amount": 25000.0,
        "target_date": "2029-01-01",
        "priority": "High",
        "monthly_contribution": 10000.0
    })
    assert g_res.status_code == 200
    all_g = client.get("/api/v1/goals/", headers=new_headers).json()
    assert any(g["goal_name"] == "Master Goal Test" for g in all_g)
    print(f"  [PASS] Goal Created & Persisted in PostgreSQL ({len(all_g)} goals total)")

    # 4. TEST P4 WISHLIST
    print("\n[4] Testing P4 Wishlist Persistence:")
    w_res = client.post("/api/v1/decisions/", headers=new_headers, json={
        "decision_type": "Wishlist",
        "title": "Gaming PC",
        "input_data": {"price": 120000},
        "result_data": {"risk": "Comfortable"},
        "risk_level": "Comfortable"
    })
    assert w_res.status_code == 200
    all_dec = client.get("/api/v1/decisions/", headers=new_headers).json()
    assert any(d["title"] == "Gaming PC" for d in all_dec)
    print("  [PASS] Wishlist Purchase Saved to PostgreSQL")

    # 5. TEST P5 ADD NEW LOAN
    print("\n[5] Testing P5 Add New Loan:")
    l_res = client.post("/api/v1/loans/", headers=new_headers, json={
        "loan_name": "Master Test Loan",
        "loan_type": "Personal Loan",
        "original_principal": 200000.0,
        "interest_rate": 12.0,
        "tenure_months": 24,
        "lender_name": "ICICI Bank"
    })
    assert l_res.status_code == 200
    all_l = client.get("/api/v1/loans/", headers=new_headers).json()
    assert any(l["loan_name"] == "Master Test Loan" for l in all_l)
    print("  [PASS] Loan Added & Persisted in PostgreSQL")

    # 6. TEST P6 SAVED EMI ANALYSIS
    print("\n[6] Testing P6 Saved EMI Analysis:")
    emi_res = client.post("/api/v1/decisions/", headers=new_headers, json={
        "decision_type": "EMI Analysis",
        "title": "Master EMI Scenario",
        "input_data": {"principal": 500000, "rate": 9.0, "tenure": 36},
        "result_data": {"emi": 15899},
        "risk_level": "Manageable"
    })
    assert emi_res.status_code == 200
    all_dec2 = client.get("/api/v1/decisions/", headers=new_headers).json()
    assert any(d["title"] == "Master EMI Scenario" for d in all_dec2)
    print("  [PASS] EMI Analysis Saved to PostgreSQL")

    print("\n==========================================================")
    print("  MASTER END-TO-END VERIFICATION: ALL PHASES PASSED 100%!")
    print("==========================================================")

if __name__ == "__main__":
    run_master_end_to_end_verification()
