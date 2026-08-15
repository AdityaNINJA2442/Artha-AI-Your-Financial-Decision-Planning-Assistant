import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlmodel import select
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import SessionLocal
from app.models.entities import User, UserProfile
from app.core.security import verify_password

def run_login_diagnostic():
    print("==================================================")
    print("  LOGIN REGRESSION EVIDENCE-BASED DIAGNOSTIC")
    print("==================================================")

    db = SessionLocal()
    client = TestClient(app)

    personal_email = "adityaprakash2442@gmail.com"
    demo_email = "arjun.demo@artha.ai"
    demo_password = "Demo@123"

    # 1. Check Demo Account in DB & API
    print(f"\n[1] Checking Demo Account: {demo_email}")
    demo_user = db.exec(select(User).where(User.email == demo_email)).first()
    if demo_user:
        print(f"  [PASS] DB Record Exists: User ID = {demo_user.id}, Active = {demo_user.is_active}")
        pw_check = verify_password(demo_password, demo_user.password_hash)
        print(f"  [PASS] Password Verify ('{demo_password}'): {pw_check}")
    else:
        print("  ❌ DB Record: NOT FOUND in current database")

    demo_login_res = client.post("/api/v1/auth/login", json={"email": demo_email, "password": demo_password})
    print(f"  [PASS] HTTP POST /login -> Status Code: {demo_login_res.status_code}")
    print(f"  [PASS] Response Body: {demo_login_res.json()}")

    # 2. Check Personal Account in DB
    print(f"\n[2] Checking Personal Account: {personal_email}")
    personal_user = db.exec(select(User).where(User.email == personal_email)).first()
    
    if personal_user:
        print(f"  [PASS] DB Record Exists: User ID = {personal_user.id}, Active = {personal_user.is_active}")
        print(f"  [PASS] Password Hash Exists: {bool(personal_user.password_hash)}")
        prof = db.exec(select(UserProfile).where(UserProfile.user_id == personal_user.id)).first()
        print(f"  [PASS] Profile Name: {prof.name if prof else 'No Profile'}")
    else:
        print(f"  ❌ DB Record: User '{personal_email}' DOES NOT EXIST in the current database!")

    # 3. Test HTTP Login for Personal Account with candidate passwords
    print(f"\n[3] Testing HTTP Login POST /login for Personal Account ({personal_email}):")
    for test_pass in ["password123", "Demo@123", "Aditya@123", "Aditya123"]:
        res = client.post("/api/v1/auth/login", json={"email": personal_email, "password": test_pass})
        print(f"  - Password Attempt ('{test_pass}'): HTTP {res.status_code} -> {res.json()}")

    # 4. Check All Registered Users in DB
    print("\n[4] All Registered User Accounts in Current Database:")
    all_users = db.exec(select(User)).all()
    for u in all_users:
        print(f"  - ID: {u.id} | Email: {u.email} | Active: {u.is_active}")

    db.close()
    print("\n==================================================")
    print("  DIAGNOSTIC COMPLETED")
    print("==================================================")

if __name__ == "__main__":
    run_login_diagnostic()
