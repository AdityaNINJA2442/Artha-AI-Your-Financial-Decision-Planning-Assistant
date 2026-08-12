from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from pydantic import BaseModel

from app.db.session import get_db
from app.models.entities import User
from app.api.v1.endpoints.auth import get_current_user
from app.services.ai_coach_pipeline import execute_ai_coach_pipeline

router = APIRouter()

from typing import Optional

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[int] = None

@router.post("/")
async def chat_with_coach(req: ChatRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Multi-stage AI Financial Coach pipeline endpoint:
    Runs structured parameter extraction, intent detection, deterministic financial tools, conversation DB persistence, and contextual answers.
    """
    res = await execute_ai_coach_pipeline(db, current_user.id, req.message, req.conversation_id)
    return res
