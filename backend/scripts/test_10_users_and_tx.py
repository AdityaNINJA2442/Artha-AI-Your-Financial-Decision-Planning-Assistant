import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.main import app

DEMO_USERS = [
    ("Arjun", "arjun.demo@artha.ai"),
    ("Riya", "riya.demo@artha.ai"),
    ("Rahul", "rahul.demo@artha.ai"),
    ("Neha", "neha.demo@artha.ai"),
    ("Vikram", "vikram.demo@artha.ai"),
    ("Ananya", "ananya.demo@artha.ai"),
    ("Karan", "karan.demo@artha.ai"),
    ("Priya", "priya.demo@artha.ai"),
    ("Aman", "aman.demo@artha.ai"),
    ("Sneha", "sneha.demo@artha.ai"),
]

from app.db.session import init_db, SessionLocal
from app.core.seed import seed_database

def verify_10_users_and_transactions():
    init_db()
    db = SessionLocal()
    seed_database(db)
    db.close()

    client = TestClient(app)
    print("==========================================================")
    print("  VERIFYING ALL 10 DEMO ACCOUNTS LOGIN & TRANSACTIONS")
    print("==========================================================")

    for name, email in DEMO_USERS:
        l_res = client.post("/api/v1/auth/login", json={"email": email, "password": "Demo@123"})
        print(f"\nUser: {name} ({email}) -> HTTP {l_res.status_code}")
        assert l_res.status_code == 200
        token = l_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        tx_res = client.get("/api/v1/transactions/", headers=headers)
        assert tx_res.status_code == 200
        data = tx_res.json()
        items = data.get("items", []) if isinstance(data, dict) else data
        print(f"  [PASS] Logged in cleanly | Returned {len(items)} Transactions from PostgreSQL")
        assert len(items) >= 5

    print("\n==========================================================")
    print("  ALL 10 DEMO USERS LOGIN & TRANSACTIONS: 100% PASSED!")
    print("==========================================================")

if __name__ == "__main__":
    verify_10_users_and_transactions()
