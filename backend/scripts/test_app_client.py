import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.main import app

DEMO_USERS = [
    ("Arjun Mehta", "arjun.demo@artha.ai"),
    ("Riya Sharma", "riya.demo@artha.ai"),
    ("Rahul Verma", "rahul.demo@artha.ai"),
    ("Neha Kapoor", "neha.demo@artha.ai"),
    ("Vikram Singh", "vikram.demo@artha.ai"),
    ("Ananya Das", "ananya.demo@artha.ai"),
    ("Karan Joshi", "karan.demo@artha.ai"),
    ("Priya Nair", "priya.demo@artha.ai"),
    ("Aman Gupta", "aman.demo@artha.ai"),
    ("Sneha Iyer", "sneha.demo@artha.ai"),
]

PASSWORD = "Demo@123"

def verify_all_users():
    client = TestClient(app)
    print("==================================================")
    print("  FASTAPI TESTCLIENT ENDPOINT AUDIT (IN-MEMORY API)")
    print("==================================================")

    all_passed = True

    for name, email in DEMO_USERS:
        print(f"\n--- TESTING USER: {name} ({email}) ---")

        # 1. Login
        login_res = client.post("/api/v1/auth/login", json={"email": email, "password": PASSWORD})
        print(f"  POST /api/v1/auth/login     -> HTTP {login_res.status_code}")
        if login_res.status_code != 200:
            print(f"    FAIL BODY: {login_res.text}")
            all_passed = False
            continue

        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. GET /me
        me_res = client.get("/api/v1/auth/me", headers=headers)
        print(f"  GET /api/v1/auth/me         -> HTTP {me_res.status_code}")
        if me_res.status_code == 200:
            me_data = me_res.json()
            print(f"    Authenticated User ID: {me_data.get('id')} | Profile Name: {me_data.get('profile', {}).get('name')}")
        else:
            all_passed = False

        # 3. GET /users/profile
        prof_res = client.get("/api/v1/users/profile", headers=headers)
        print(f"  GET /api/v1/users/profile   -> HTTP {prof_res.status_code}")
        if prof_res.status_code == 200:
            p = prof_res.json()
            print(f"    Name: {p.get('name')} | Income: Rs.{p.get('monthly_income', 0):,.0f} | Savings: Rs.{p.get('current_savings', 0):,.0f}")
        else:
            all_passed = False

        # 4. GET /financial-health/
        health_res = client.get("/api/v1/financial-health/", headers=headers)
        print(f"  GET /api/v1/financial-health/ -> HTTP {health_res.status_code}")
        if health_res.status_code == 200:
            h = health_res.json()
            print(f"    Score: {h.get('overall_score')} / 100")
        else:
            all_passed = False

        # 5. GET /transactions/
        tx_res = client.get("/api/v1/transactions/", headers=headers)
        print(f"  GET /api/v1/transactions/   -> HTTP {tx_res.status_code}")
        if tx_res.status_code == 200:
            print(f"    Transactions Count: {len(tx_res.json())}")
        else:
            all_passed = False

        # 6. GET /goals/
        goals_res = client.get("/api/v1/goals/", headers=headers)
        print(f"  GET /api/v1/goals/          -> HTTP {goals_res.status_code}")
        if goals_res.status_code == 200:
            print(f"    Goals Count: {len(goals_res.json())}")
        else:
            all_passed = False

        # 7. GET /loans/
        loans_res = client.get("/api/v1/loans/", headers=headers)
        print(f"  GET /api/v1/loans/          -> HTTP {loans_res.status_code}")
        if loans_res.status_code == 200:
            print(f"    Loans Count: {len(loans_res.json())}")
        else:
            all_passed = False

    print("\n==================================================")
    if all_passed:
        print("  RESULT: 100% PASS ACROSS ALL 10 USERS & ALL 7 ENDPOINTS! (HTTP 200 OK)")
    else:
        print("  RESULT: SOME ENDPOINTS FAILED")
    print("==================================================")

if __name__ == "__main__":
    verify_all_users()
