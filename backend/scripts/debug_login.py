import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import traceback
from sqlmodel import Session, select
from app.db.session import engine
from app.models.entities import User, UserProfile
from app.core.security import verify_password, create_access_token, create_refresh_token

def test_login_directly():
    print("Testing Login Directly via SQLModel Session...")
    try:
        with Session(engine) as db:
            user = db.exec(select(User).where(User.email == "arjun.demo@artha.ai")).first()
            print(f"User found: {user}")
            if user:
                is_valid = verify_password("Demo@123", user.password_hash)
                print(f"Password Valid: {is_valid}")
                profile = db.exec(select(UserProfile).where(UserProfile.user_id == user.id)).first()
                print(f"Profile found: {profile}")
                access_token = create_access_token(subject=user.id)
                refresh_token = create_refresh_token(subject=user.id)
                print(f"Tokens created successfully: {access_token[:20]}...")
    except Exception as e:
        print("EXCEPTION CAUGHT:")
        traceback.print_exc()

if __name__ == "__main__":
    test_login_directly()
