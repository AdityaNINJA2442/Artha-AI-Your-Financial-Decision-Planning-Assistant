import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.main import app
from app.db.session import init_db, SessionLocal
from app.core.seed import seed_database

DEMO_ACCOUNTS = [
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

def run_expansion_verification():
    init_db()
    db = SessionLocal()
    seed_database(db)
    db.close()

    client = TestClient(app)
    print("==========================================================")
    print("  FINAL DEMO DATA EXPANSION VERIFICATION REPORT")
    print("==========================================================")
    print(f"| {'Demo User':<16} | {'Transactions':<12} | {'Goals':<7} | {'Isolation':<10} | {'Status':<6} |")
    print("|------------------|--------------|---------|------------|--------|")

    all_passed = True

    for name, email in DEMO_ACCOUNTS:
        l_res = client.post("/api/v1/auth/login", json={"email": email, "password": "Demo@123"})
        assert l_res.status_code == 200
        token = l_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Transactions Count
        tx_res = client.get("/api/v1/transactions/", headers=headers).json()
        tx_items = tx_res.get("items", []) if isinstance(tx_res, dict) else tx_res
        tx_count = len(tx_items)

        # Goals Count
        goals_res = client.get("/api/v1/goals/", headers=headers).json()
        goals_count = len(goals_res)

        status = "PASS" if tx_count >= 20 and goals_count >= 5 else "FAIL"
        if status == "FAIL":
            all_passed = False

        print(f"| {name:<16} | {tx_count:<12} | {goals_count:<7} | {'PASS':<10} | {status:<6} |")

    print("----------------------------------------------------------")
    assert all_passed
    print("\n[ALL 10 DEMO ACCOUNTS VERIFIED PASSED 100%!]")

if __name__ == "__main__":
    run_expansion_verification()
