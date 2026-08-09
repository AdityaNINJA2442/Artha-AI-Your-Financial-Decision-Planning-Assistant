import datetime
import math
from typing import Dict, Any, List
from sqlmodel import Session, select
from app.models.entities import Loan, LoanPayment, Transaction, Category, FinancialDecisionHistory

def calculate_emi(principal: float, annual_rate: float, tenure_months: int) -> Dict[str, Any]:
    """Calculate monthly EMI, total interest, and total cost using standard financial math."""
    if principal <= 0 or tenure_months <= 0:
        return {"emi": 0.0, "total_interest": 0.0, "total_repayment": 0.0, "principal": principal}

    if annual_rate <= 0:
        emi = principal / tenure_months
        return {
            "emi": round(emi, 2),
            "total_interest": 0.0,
            "total_repayment": round(principal, 2),
            "principal": round(principal, 2)
        }

    monthly_rate = annual_rate / (12.0 * 100.0)
    factor = math.pow(1 + monthly_rate, tenure_months)
    raw_emi = principal * monthly_rate * factor / (factor - 1.0)
    emi = round(raw_emi, 2)
    
    total_repayment = round(emi * tenure_months, 2)
    total_interest = round(total_repayment - principal, 2)

    return {
        "emi": round(emi, 2),
        "total_interest": round(total_interest, 2),
        "total_repayment": round(total_repayment, 2),
        "principal": round(principal, 2),
        "tenure_months": tenure_months,
        "annual_rate": annual_rate
    }

def generate_amortization_schedule(principal: float, annual_rate: float, tenure_months: int, start_date: datetime.date = None) -> List[Dict[str, Any]]:
    """Generate exact month-by-month amortization schedule."""
    if not start_date:
        start_date = datetime.date.today()

    res = calculate_emi(principal, annual_rate, tenure_months)
    emi = res["emi"]
    monthly_rate = (annual_rate / (12.0 * 100.0)) if annual_rate > 0 else 0.0

    schedule = []
    balance = principal
    curr_date = start_date

    for month in range(1, tenure_months + 1):
        interest_comp = balance * monthly_rate
        principal_comp = emi - interest_comp
        if month == tenure_months:
            principal_comp = balance
            emi = principal_comp + interest_comp
            balance = 0.0
        else:
            balance = max(0.0, balance - principal_comp)

        schedule.append({
            "month_number": month,
            "payment_date": curr_date.strftime("%Y-%m-%d"),
            "emi": round(emi, 2),
            "principal": round(principal_comp, 2),
            "interest": round(interest_comp, 2),
            "remaining_balance": round(balance, 2)
        })

        # Advance 1 month
        month_inc = curr_date.month % 12 + 1
        year_inc = curr_date.year + (curr_date.month // 12)
        day_inc = min(curr_date.day, 28)
        curr_date = datetime.date(year_inc, month_inc, day_inc)

    return schedule

def calculate_loan_affordability(monthly_income: float, current_expenses: float, existing_emi: float, new_emi: float) -> Dict[str, Any]:
    """Evaluate debt burden and impact of adding new EMI."""
    total_new_emi = existing_emi + new_emi
    surplus_before = max(0.0, monthly_income - (current_expenses + existing_emi))
    surplus_after = surplus_before - new_emi

    debt_ratio_before = ((existing_emi) / monthly_income * 100.0) if monthly_income > 0 else 0.0
    debt_ratio_after = ((total_new_emi) / monthly_income * 100.0) if monthly_income > 0 else 0.0

    if debt_ratio_after > 50 or surplus_after < (monthly_income * 0.1):
        status = "Financially Risky"
        risk_level = "High Risk"
    elif debt_ratio_after > 35 or surplus_after < (monthly_income * 0.2):
        status = "Caution"
        risk_level = "Caution"
    else:
        status = "Comfortable"
        risk_level = "Comfortable"

    return {
        "status": status,
        "risk_level": risk_level,
        "monthly_income": monthly_income,
        "existing_emi": existing_emi,
        "new_emi": round(new_emi, 2),
        "total_emi_after": round(total_new_emi, 2),
        "surplus_before": round(surplus_before, 2),
        "surplus_after": round(surplus_after, 2),
        "debt_ratio_before": round(debt_ratio_before, 1),
        "debt_ratio_after": round(debt_ratio_after, 1)
    }

def compare_loans(loan_offers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Compare up to 3 loan offers side-by-side."""
    compared = []
    for offer in loan_offers:
        name = offer.get("name", "Offer")
        principal = float(offer.get("principal", 1000000.0))
        rate = float(offer.get("rate", 9.0))
        tenure = int(offer.get("tenure_months", 60))
        proc_fee = float(offer.get("processing_fee", 0.0))

        calc = calculate_emi(principal, rate, tenure)
        total_cost = calc["total_repayment"] + proc_fee

        compared.append({
            "name": name,
            "principal": principal,
            "rate": rate,
            "tenure_months": tenure,
            "emi": calc["emi"],
            "total_interest": calc["total_interest"],
            "processing_fee": proc_fee,
            "total_cost": round(total_cost, 2)
        })
    return compared

def stress_test_interest_rates(principal: float, current_rate: float, tenure_months: int) -> Dict[str, Any]:
    """Stress test floating rate loan for current rate, +1%, +2%, +3%."""
    base = calculate_emi(principal, current_rate, tenure_months)
    plus1 = calculate_emi(principal, current_rate + 1.0, tenure_months)
    plus2 = calculate_emi(principal, current_rate + 2.0, tenure_months)
    plus3 = calculate_emi(principal, current_rate + 3.0, tenure_months)

    return {
        "current_rate": current_rate,
        "base_emi": base["emi"],
        "base_interest": base["total_interest"],
        "scenarios": [
            {"rate_label": f"Current ({current_rate}%)", "rate": current_rate, "emi": base["emi"], "emi_delta": 0.0, "total_interest": base["total_interest"]},
            {"rate_label": f"+1.0% ({current_rate + 1}%)", "rate": current_rate + 1.0, "emi": plus1["emi"], "emi_delta": round(plus1["emi"] - base["emi"], 2), "total_interest": plus1["total_interest"]},
            {"rate_label": f"+2.0% ({current_rate + 2}%)", "rate": current_rate + 2.0, "emi": plus2["emi"], "emi_delta": round(plus2["emi"] - base["emi"], 2), "total_interest": plus2["total_interest"]},
            {"rate_label": f"+3.0% ({current_rate + 3}%)", "rate": current_rate + 3.0, "emi": plus3["emi"], "emi_delta": round(plus3["emi"] - base["emi"], 2), "total_interest": plus3["total_interest"]}
        ]
    }

def simulate_prepayment(principal: float, annual_rate: float, tenure_months: int, extra_monthly: float = 0.0, lump_sum: float = 0.0) -> Dict[str, Any]:
    """Simulate prepayment acceleration and calculate months & interest saved."""
    base = calculate_emi(principal, annual_rate, tenure_months)
    base_emi = base["emi"]
    monthly_rate = (annual_rate / (12.0 * 100.0)) if annual_rate > 0 else 0.0

    curr_balance = max(0.0, principal - lump_sum)
    new_emi = base_emi + extra_monthly
    
    months_count = 0
    total_interest_paid = 0.0

    while curr_balance > 0 and months_count < 600:
        months_count += 1
        interest_comp = curr_balance * monthly_rate
        principal_comp = new_emi - interest_comp
        if principal_comp >= curr_balance:
            principal_comp = curr_balance
            curr_balance = 0.0
        else:
            curr_balance -= principal_comp
        total_interest_paid += interest_comp

    months_saved = max(0, tenure_months - months_count)
    interest_saved = max(0.0, base["total_interest"] - total_interest_paid)

    return {
        "original_tenure": tenure_months,
        "new_tenure": months_count,
        "months_saved": months_saved,
        "original_interest": base["total_interest"],
        "new_interest": round(total_interest_paid, 2),
        "interest_saved": round(interest_saved, 2)
    }

def execute_mark_emi_as_paid(db: Session, user_id: int, loan_id: int, payment_date: datetime.date = None) -> Dict[str, Any]:
    """
    ATOMIC LOAN PAYMENT WORKFLOW (PRINCIPAL VS INTEREST RULE ENFORCED).
    1. Looks up current payment step from loan schedule to get principal_component and interest_component.
    2. Decrements outstanding_principal ONLY by principal_component.
    3. Creates LoanPayment record.
    4. Creates linked Transaction expense record.
    5. Advances next_payment_date by 1 billing cycle.
    6. All changes commit atomically in a single DB transaction.
    """
    if not payment_date:
        payment_date = datetime.date.today()

    loan = db.get(Loan, loan_id)
    if not loan or loan.user_id != user_id:
        raise Exception("Loan record not found or unauthorized")

    if loan.status == "Paid Off" or loan.outstanding_principal <= 0:
        return {"status": "Already Paid Off", "outstanding_principal": 0.0}

    # IDEMPOTENCY CHECK: Check if EMI for this date/period has already been paid
    existing_payment = db.exec(
        select(LoanPayment)
        .where(LoanPayment.loan_id == loan_id)
        .where(LoanPayment.payment_date == payment_date)
    ).first()

    if existing_payment:
        return {
            "status": "Already Paid",
            "message": "EMI for this date has already been recorded.",
            "loan_id": loan.id,
            "amount_paid": existing_payment.amount_paid,
            "principal_reduced": existing_payment.principal_component,
            "remaining_outstanding_principal": loan.outstanding_principal,
            "next_payment_date": loan.next_payment_date.strftime("%Y-%m-%d")
        }

    # Generate schedule to get exact principal and interest split
    schedule = generate_amortization_schedule(loan.outstanding_principal, loan.interest_rate, loan.tenure_months, loan.next_payment_date)
    current_step = schedule[0] if len(schedule) > 0 else {"principal": loan.emi_amount, "interest": 0.0}

    principal_comp = float(current_step["principal"])
    interest_comp = float(current_step["interest"])
    full_emi = float(loan.emi_amount)

    # 1. Create linked Transaction
    bills_cat = db.exec(select(Category).where(Category.name == "Utilities & Bills")).first()
    cat_id = bills_cat.id if bills_cat else 1

    linked_tx = Transaction(
        user_id=user_id,
        merchant=f"{loan.lender_name or loan.loan_name} EMI Payment",
        amount=full_emi,
        date=payment_date,
        category_id=cat_id,
        type="Expense",
        payment_method="NetBanking",
        notes=f"EMI Payment for {loan.loan_name}. Principal: ₹{principal_comp:,.2f}, Interest: ₹{interest_comp:,.2f}"
    )
    db.add(linked_tx)
    db.flush()

    # 2. Create LoanPayment
    payment_rec = LoanPayment(
        loan_id=loan.id,
        user_id=user_id,
        payment_date=payment_date,
        amount_paid=full_emi,
        principal_component=principal_comp,
        interest_component=interest_comp,
        linked_transaction_id=linked_tx.id,
        notes=f"EMI payment completed"
    )
    db.add(payment_rec)

    # 3. CRITICAL RULE: Update outstanding_principal ONLY by principal_component
    new_outstanding = max(0.0, loan.outstanding_principal - principal_comp)
    loan.outstanding_principal = round(new_outstanding, 2)

    if loan.outstanding_principal <= 0:
        loan.status = "Paid Off"

    # 4. Advance next_payment_date by 1 month
    m_inc = loan.next_payment_date.month % 12 + 1
    y_inc = loan.next_payment_date.year + (loan.next_payment_date.month // 12)
    d_inc = min(loan.next_payment_date.day, 28)
    loan.next_payment_date = datetime.date(y_inc, m_inc, d_inc)

    # Atomic Commit
    db.commit()
    db.refresh(loan)

    return {
        "status": "success",
        "loan_id": loan.id,
        "loan_name": loan.loan_name,
        "amount_paid": full_emi,
        "principal_reduced": principal_comp,
        "interest_paid": interest_comp,
        "remaining_outstanding_principal": loan.outstanding_principal,
        "next_payment_date": loan.next_payment_date.strftime("%Y-%m-%d"),
        "linked_transaction_id": linked_tx.id
    }
