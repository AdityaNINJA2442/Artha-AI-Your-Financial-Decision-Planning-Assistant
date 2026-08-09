import json
import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from pydantic import BaseModel

from app.db.session import get_db
from app.models.entities import User, Loan, FinancialDecisionHistory
from app.api.v1.endpoints.auth import get_current_user
from app.services.loan_engine import (
    calculate_emi,
    generate_amortization_schedule,
    calculate_loan_affordability,
    compare_loans,
    stress_test_interest_rates,
    simulate_prepayment,
    execute_mark_emi_as_paid
)

router = APIRouter()

class CalculateLoanRequest(BaseModel):
    principal: float
    annual_rate: float
    tenure_months: int
    processing_fee: float = 0.0

class CreateLoanRequest(BaseModel):
    loan_name: str
    loan_type: str = "Car Loan"
    original_principal: float
    interest_rate: float
    tenure_months: int
    lender_name: Optional[str] = "SBI Bank"
    processing_fee: float = 0.0

class CompareLoansRequest(BaseModel):
    offers: List[Dict[str, Any]]

class PrepaymentRequest(BaseModel):
    extra_monthly: float = 0.0
    lump_sum: float = 0.0

@router.post("/calculate")
def calculate_loan(req: CalculateLoanRequest):
    return calculate_emi(req.principal, req.annual_rate, req.tenure_months)

@router.get("/")
def list_user_loans(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    loans = db.exec(select(Loan).where(Loan.user_id == current_user.id)).all()
    return loans

@router.post("/")
def create_loan(req: CreateLoanRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    calc = calculate_emi(req.original_principal, req.interest_rate, req.tenure_months)
    start_d = datetime.date.today()
    
    # Calculate end date
    m_end = (start_d.month + req.tenure_months - 1) % 12 + 1
    y_end = start_d.year + ((start_d.month + req.tenure_months - 1) // 12)
    end_d = datetime.date(y_end, m_end, min(start_d.day, 28))

    new_loan = Loan(
        user_id=current_user.id,
        loan_name=req.loan_name,
        loan_type=req.loan_type,
        original_principal=req.original_principal,
        outstanding_principal=req.original_principal,
        interest_rate=req.interest_rate,
        emi_amount=calc["emi"],
        tenure_months=req.tenure_months,
        start_date=start_d,
        end_date=end_d,
        next_payment_date=start_d,
        lender_name=req.lender_name,
        processing_fee=req.processing_fee,
        status="Active"
    )
    db.add(new_loan)
    db.commit()
    db.refresh(new_loan)
    return new_loan

@router.post("/{loan_id}/pay")
def pay_loan_emi(loan_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    ATOMIC WORKFLOW: Mark EMI as Paid.
    Decrements outstanding_principal ONLY by principal_component, creates linked transaction, advances next payment date.
    """
    try:
        res = execute_mark_emi_as_paid(db, current_user.id, loan_id)
        return res
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{loan_id}/schedule")
def get_loan_amortization_schedule(loan_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    loan = db.get(Loan, loan_id)
    if not loan or loan.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Loan not found")

    return generate_amortization_schedule(loan.outstanding_principal, loan.interest_rate, loan.tenure_months, loan.next_payment_date)

@router.post("/compare")
def compare_loan_offers(req: CompareLoansRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Compare up to 3 loan offers and automatically log to financial_decision_history."""
    res = compare_loans(req.offers)
    
    # AUTOMATIC DECISION HISTORY LOGGING
    history_entry = FinancialDecisionHistory(
        user_id=current_user.id,
        decision_type="Loan Comparison",
        title=f"Loan Comparison ({len(req.offers)} Offers)",
        input_data_json=json.dumps(req.offers),
        result_data_json=json.dumps(res),
        risk_level="Manageable"
    )
    db.add(history_entry)
    db.commit()

    return res

@router.post("/{loan_id}/prepayment")
def prepayment_simulation(loan_id: int, req: PrepaymentRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Simulate prepayment acceleration and automatically log to financial_decision_history."""
    loan = db.get(Loan, loan_id)
    if not loan or loan.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Loan not found")

    res = simulate_prepayment(loan.outstanding_principal, loan.interest_rate, loan.tenure_months, req.extra_monthly, req.lump_sum)
    
    # AUTOMATIC DECISION HISTORY LOGGING
    history_entry = FinancialDecisionHistory(
        user_id=current_user.id,
        decision_type="Prepayment",
        title=f"Prepayment Simulation for {loan.loan_name}",
        input_data_json=json.dumps({"extra_monthly": req.extra_monthly, "lump_sum": req.lump_sum}),
        result_data_json=json.dumps(res),
        risk_level="Manageable"
    )
    db.add(history_entry)
    db.commit()

    return res

@router.post("/stress-test")
def stress_test_rate(req: CalculateLoanRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Interest rate stress test (+1%, +2%, +3%) and automatically log to financial_decision_history."""
    res = stress_test_interest_rates(req.principal, req.annual_rate, req.tenure_months)

    history_entry = FinancialDecisionHistory(
        user_id=current_user.id,
        decision_type="Rate Stress Test",
        title=f"Rate Stress Test: ₹{req.principal:,.0f} @ {req.annual_rate}%",
        input_data_json=json.dumps({"principal": req.principal, "rate": req.annual_rate, "tenure": req.tenure_months}),
        result_data_json=json.dumps(res),
        risk_level="Manageable"
    )
    db.add(history_entry)
    db.commit()

    return res
