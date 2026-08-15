import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.main import app

def test_p5_create_loan():
    client = TestClient(app)
    print("==================================================")
    print("  P5 ADD NEW LOAN PIPELINE VERIFICATION")
    print("==================================================")

    # Login Arjun
    login_res = client.post("/api/v1/auth/login", json={"email": "arjun.demo@artha.ai", "password": "Demo@123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Fetch Existing Loans
    init_loans = client.get("/api/v1/loans/", headers=headers).json()
    init_count = len(init_loans)
    print(f"1. Initial Loans Count: {init_count}")

    # 2. Create Loan
    payload = {
        "loan_name": "Education Loan P5",
        "loan_type": "Education Loan",
        "original_principal": 500000.0,
        "interest_rate": 9.5,
        "tenure_months": 48,
        "lender_name": "HDFC Bank"
    }

    create_res = client.post("/api/v1/loans/", headers=headers, json=payload)
    print(f"2. POST /api/v1/loans/ -> HTTP {create_res.status_code}")
    assert create_res.status_code == 200

    created = create_res.json()
    print(f"   Created Loan ID: {created.get('id')} | Name: {created.get('loan_name')} | EMI: Rs.{created.get('emi_amount'):,.2f}")

    # 3. Verify Loans List Updated in PostgreSQL
    after_loans = client.get("/api/v1/loans/", headers=headers).json()
    print(f"3. Updated Loans Count: {len(after_loans)}")
    assert len(after_loans) == init_count + 1

    loan_ids = [l["id"] for l in after_loans]
    assert created["id"] in loan_ids

    print("\n==================================================")
    print("  P5 ADD NEW LOAN VERIFICATION: 100% PASSED!")
    print("==================================================")

if __name__ == "__main__":
    test_p5_create_loan()
