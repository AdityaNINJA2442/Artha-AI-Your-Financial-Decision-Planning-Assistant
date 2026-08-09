from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from pydantic import BaseModel

from app.db.session import get_db
from app.models.entities import User
from app.api.v1.endpoints.auth import get_current_user
from app.services.ai_coach_pipeline import execute_ai_coach_pipeline

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

@router.post("/")
async def chat_with_coach(req: ChatRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Multi-stage AI Financial Coach pipeline endpoint:
    Runs real backend tools (EMI calc, Affordability, Shock, FutureView), builds structured context, and generates transparent answer.
    """
    res = await execute_ai_coach_pipeline(db, current_user.id, req.message)
    return res
