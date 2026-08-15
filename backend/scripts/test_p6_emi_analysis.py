import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.main import app

def test_p6_emi_analysis():
    client = TestClient(app)
    print("==================================================")
    print("  P6 SAVED EMI ANALYSIS PIPELINE VERIFICATION")
    print("==================================================")

    # Login Arjun
    login_res = client.post("/api/v1/auth/login", json={"email": "arjun.demo@artha.ai", "password": "Demo@123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Save EMI Analysis
    payload = {
        "decision_type": "EMI Analysis",
        "title": "Home Loan P6 Scenario",
        "input_data": {"loanType": "Home Loan", "principal": 4000000, "rate": 8.5, "tenure": 240},
        "result_data": {"emi": 34713, "totalInterest": 4331120},
        "risk_level": "Manageable"
    }

    save_res = client.post("/api/v1/decisions/", headers=headers, json=payload)
    print(f"1. POST /api/v1/decisions/ -> HTTP {save_res.status_code}")
    assert save_res.status_code == 200
    saved = save_res.json()
    print(f"   Saved EMI Analysis ID: {saved['id']} | Title: {saved['title']}")

    # 2. Fetch Decisions
    dec_res = client.get("/api/v1/decisions/", headers=headers)
    assert dec_res.status_code == 200
    items = dec_res.json()
    emi_items = [d for d in items if d.get("decision_type") == "EMI Analysis"]
    print(f"2. EMI Analyses Count: {len(emi_items)}")
    assert any(d["id"] == saved["id"] for d in emi_items)

    # 3. Delete EMI Analysis
    del_res = client.delete(f"/api/v1/decisions/{saved['id']}", headers=headers)
    print(f"3. DELETE /api/v1/decisions/{saved['id']} -> HTTP {del_res.status_code}")
    assert del_res.status_code == 200

    print("\n==================================================")
    print("  P6 SAVED EMI ANALYSIS VERIFICATION: 100% PASSED!")
    print("==================================================")

if __name__ == "__main__":
    test_p6_emi_analysis()
