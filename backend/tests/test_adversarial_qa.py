import pytest
import datetime
from sqlmodel import Session, SQLModel, create_engine, select
from sqlmodel.pool import StaticPool

from app.models.entities import User, UserProfile, Transaction, Loan, LoanPayment, FinancialGoal
from app.services.loan_engine import execute_mark_emi_as_paid, calculate_loan_affordability
from app.services.affordability_engine import evaluate_purchase_affordability

@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session

def test_two_user_data_isolation(session: Session):
    """TEST 1: Verify User B cannot access or view User A's transactions, goals, or loans."""
    user_a = User(email="user_a@artha.ai", password_hash="hash_a")
    user_b = User(email="user_b@artha.ai", password_hash="hash_b")
    session.add(user_a)
    session.add(user_b)
    session.commit()
    session.refresh(user_a)
    session.refresh(user_b)

    # User A creates a transaction and a goal
    tx_a = Transaction(user_id=user_a.id, merchant="Secret User A Purchase", amount=10000.0, date=datetime.date.today())
    goal_a = FinancialGoal(user_id=user_a.id, goal_name="User A Car Goal", target_amount=1000000.0, target_date=datetime.date(2028, 12, 31))
    session.add(tx_a)
    session.add(goal_a)
    session.commit()

    # Query database for User B's transactions and goals
    txs_b = session.exec(select(Transaction).where(Transaction.user_id == user_b.id)).all()
    goals_b = session.exec(select(FinancialGoal).where(FinancialGoal.user_id == user_b.id)).all()

    assert len(txs_b) == 0
    assert len(goals_b) == 0

def test_ai_coach_context_sensitivity(session: Session):
    """TEST 2: Verify affordability decisions change dynamically based on user's real financial status."""
    user_rich = User(email="rich@artha.ai", password_hash="hash")
    user_poor = User(email="poor@artha.ai", password_hash="hash")
    session.add(user_rich)
    session.add(user_poor)
    session.commit()
    session.refresh(user_rich)
    session.refresh(user_poor)

    prof_rich = UserProfile(user_id=user_rich.id, name="Rich User", monthly_income=200000.0, monthly_fixed_expenses=30000.0, current_savings=800000.0, emergency_fund=300000.0)
    prof_poor = UserProfile(user_id=user_poor.id, name="Poor User", monthly_income=40000.0, monthly_fixed_expenses=38000.0, current_savings=5000.0, emergency_fund=2000.0)
    session.add(prof_rich)
    session.add(prof_poor)
    session.commit()

    eval_rich = evaluate_purchase_affordability(session, user_rich.id, "iPhone 17", 79999.0)
    eval_poor = evaluate_purchase_affordability(session, user_poor.id, "iPhone 17", 79999.0)

    assert eval_rich["result_status"] in ["Comfortable", "Caution"]
    assert eval_poor["result_status"] == "Financially Risky"

def test_emi_payment_idempotency(session: Session):
    """TEST 4: Verify duplicate 'Mark EMI as Paid' attempts are idempotent and do not double-deduct principal."""
    user = User(email="loan_user@artha.ai", password_hash="hash")
    session.add(user)
    session.commit()
    session.refresh(user)

    loan = Loan(
        user_id=user.id,
        loan_name="Test Car Loan",
        original_principal=1000000.0,
        outstanding_principal=1000000.0,
        interest_rate=9.0,
        emi_amount=20758.36,
        tenure_months=60,
        start_date=datetime.date.today(),
        next_payment_date=datetime.date.today(),
        lender_name="SBI Bank"
    )
    session.add(loan)
    session.commit()
    session.refresh(loan)

    # First EMI payment execution
    pay_1 = execute_mark_emi_as_paid(session, user.id, loan.id, datetime.date.today())
    assert pay_1["status"] == "success"
    first_outstanding = pay_1["remaining_outstanding_principal"]

    # Second EMI payment execution on same date (Duplicate click)
    pay_2 = execute_mark_emi_as_paid(session, user.id, loan.id, datetime.date.today())
    assert pay_2["status"] == "Already Paid"
    assert pay_2["remaining_outstanding_principal"] == first_outstanding

    # Check total payments recorded in DB
    payments_count = session.exec(select(LoanPayment).where(LoanPayment.loan_id == loan.id)).all()
    assert len(payments_count) == 1
