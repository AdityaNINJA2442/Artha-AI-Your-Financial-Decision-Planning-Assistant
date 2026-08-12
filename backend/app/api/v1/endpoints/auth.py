from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlmodel import Session, select
from pydantic import BaseModel, EmailStr

from app.db.session import get_db
from app.models.entities import User, UserProfile, UserSession
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token, decode_token

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: int
    email: str
    name: Optional[str] = "User"

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """Dependency to retrieve current authenticated user from JWT token."""
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = payload.get("sub")
    user = db.get(User, int(user_id))
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User account inactive or not found")
    return user

import logging
logger = logging.getLogger("artha.auth")

@router.post("/register", response_model=TokenResponse)
def register_user(req: RegisterRequest, db: Session = Depends(get_db)):
    try:
        existing = db.exec(select(User).where(User.email == req.email)).first()
        if existing:
            raise HTTPException(status_code=400, detail="An account with this email already exists. Please click 'Log in' below.")

        new_user = User(
            email=req.email,
            password_hash=get_password_hash(req.password),
            is_active=True
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # Initial Profile
        new_profile = UserProfile(
            user_id=new_user.id,
            name=req.name,
            monthly_income=100000.0,
            annual_income=1200000.0
        )
        db.add(new_profile)
        db.commit()

        access_token = create_access_token(subject=new_user.id)
        refresh_token = create_refresh_token(subject=new_user.id)

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user_id": new_user.id,
            "email": new_user.email,
            "name": req.name or new_user.email.split("@")[0].title()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error registering user {req.email}: {e}")
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login", response_model=TokenResponse)
def login_user(req: LoginRequest, db: Session = Depends(get_db)):
    try:
        user = db.exec(select(User).where(User.email == req.email)).first()
        if not user or not verify_password(req.password, user.password_hash):
            raise HTTPException(status_code=400, detail="Incorrect email or password")

        profile = db.exec(select(UserProfile).where(UserProfile.user_id == user.id)).first()
        user_name = profile.name if (profile and profile.name) else user.email.split("@")[0].title()

        access_token = create_access_token(subject=user.id)
        refresh_token = create_refresh_token(subject=user.id)

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user_id": user.id,
            "email": user.email,
            "name": user_name
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error logging in user {req.email}: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.exec(select(UserProfile).where(UserProfile.user_id == current_user.id)).first()
    return {
        "id": current_user.id,
        "email": current_user.email,
        "is_admin": current_user.is_admin,
        "profile": profile
    }

@router.post("/logout")
def logout_user():
    return {"message": "Logged out successfully"}
