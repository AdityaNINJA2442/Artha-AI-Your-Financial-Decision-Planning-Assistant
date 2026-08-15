import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.main import app

def test_p2_create_goal():
    client = TestClient(app)
    print("==================================================")
    print("  P2 CREATE GOAL PIPELINE VERIFICATION")
    print("==================================================")

    # Login Arjun
    login_res = client.post("/api/v1/auth/login", json={"email": "arjun.demo@artha.ai", "password": "Demo@123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Fetch Existing Goals
    init_goals = client.get("/api/v1/goals/", headers=headers).json()
    init_count = len(init_goals)
    print(f"1. Initial Goals Count: {init_count}")

    # 2. Create Goal
    goal_payload = {
        "goal_name": "P2 Test Goal",
        "target_amount": 250000.0,
        "current_amount": 50000.0,
        "target_date": "2029-06-30",
        "priority": "High",
        "monthly_contribution": 12000.0
    }

    create_res = client.post("/api/v1/goals/", headers=headers, json=goal_payload)
    print(f"2. POST /api/v1/goals/ -> HTTP {create_res.status_code}")
    assert create_res.status_code == 200

    created = create_res.json()
    target_val = float(created.get('target_amount') or 0.0)
    print(f"   Created Goal ID: {created.get('id')} | Name: {created.get('goal_name')} | Target: Rs.{target_val:,.2f}")

    # 3. Verify Goals List Updated & Persisted in PostgreSQL
    after_goals = client.get("/api/v1/goals/", headers=headers).json()
    print(f"3. Updated Goals Count: {len(after_goals)}")
    assert len(after_goals) == init_count + 1

    created_ids = [g["id"] for g in after_goals]
    assert created["id"] in created_ids

    print("\n==================================================")
    print("  P2 CREATE GOAL VERIFICATION: 100% PASSED!")
    print("==================================================")

if __name__ == "__main__":
    test_p2_create_goal()
