from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, transactions, goals, chat, simulator, financial_health, loans, decisions

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users & Onboarding"])
api_router.include_router(transactions.router, prefix="/transactions", tags=["Transactions"])
api_router.include_router(goals.router, prefix="/goals", tags=["Goals Planner"])
api_router.include_router(chat.router, prefix="/chat", tags=["AI Financial Coach"])
api_router.include_router(simulator.router, prefix="/simulator", tags=["What-If Simulator"])
api_router.include_router(financial_health.router, prefix="/financial-health", tags=["Financial Health"])
api_router.include_router(loans.router, prefix="/loans", tags=["Loans & EMI Suite"])
api_router.include_router(decisions.router, prefix="/decisions", tags=["Financial Decision History"])
