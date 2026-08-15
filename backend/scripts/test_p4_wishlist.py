import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.main import app

def test_p4_wishlist():
    client = TestClient(app)
    print("==================================================")
    print("  P4 WISHLIST / SAVED PURCHASES PIPELINE VERIFICATION")
    print("==================================================")

    # Login Arjun
    login_res = client.post("/api/v1/auth/login", json={"email": "arjun.demo@artha.ai", "password": "Demo@123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Save Wishlist Purchase
    payload = {
        "decision_type": "Wishlist",
        "title": "MacBook Pro M3",
        "input_data": {"price": 199900, "savings": 320000},
        "result_data": {"remaining": 120100, "risk": "Comfortable"},
        "risk_level": "Comfortable"
    }

    save_res = client.post("/api/v1/decisions/", headers=headers, json=payload)
    print(f"1. POST /api/v1/decisions/ -> HTTP {save_res.status_code}")
    assert save_res.status_code == 200
    saved = save_res.json()
    print(f"   Saved Wishlist ID: {saved['id']} | Title: {saved['title']}")

    # 2. Fetch Decisions
    dec_res = client.get("/api/v1/decisions/", headers=headers)
    assert dec_res.status_code == 200
    items = dec_res.json()
    wishlist_items = [d for d in items if d.get("decision_type") == "Wishlist"]
    print(f"2. Wishlist Items Count: {len(wishlist_items)}")
    assert any(d["id"] == saved["id"] for d in wishlist_items)

    # 3. Delete Wishlist Item
    del_res = client.delete(f"/api/v1/decisions/{saved['id']}", headers=headers)
    print(f"3. DELETE /api/v1/decisions/{saved['id']} -> HTTP {del_res.status_code}")
    assert del_res.status_code == 200

    print("\n==================================================")
    print("  P4 WISHLIST VERIFICATION: 100% PASSED!")
    print("==================================================")

if __name__ == "__main__":
    test_p4_wishlist()
