from fastapi import APIRouter
from pydantic import BaseModel
from app.services.financial_math import calculate_what_if_simulation

router = APIRouter()

class SimulatorRequest(BaseModel):
    current_income: float = 100000.0
    current_expenses: float = 68400.0
    expense_reduction_amount: float = 5000.0
    goal_target_amount: float = 1000000.0
    goal_current_amount: float = 240000.0

@router.post("/")
def run_simulation(req: SimulatorRequest):
    return calculate_what_if_simulation(
        req.current_income,
        req.current_expenses,
        req.expense_reduction_amount,
        req.goal_target_amount,
        req.goal_current_amount
    )
