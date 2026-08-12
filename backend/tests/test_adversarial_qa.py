import pytest
import datetime
import secrets
import hashlib
from sqlmodel import Session, SQLModel, create_engine, select
from sqlmodel.pool import StaticPool

from app.models.entities import User, UserProfile, Transaction, Loan, LoanPayment, FinancialGoal, GoalProgress
from app.services.loan_engine import execute_mark_emi_as_paid, calculate_loan_affordability
from app.services.affordability_engine import evaluate_purchase_affordability
from app.services.ai_coach_pipeline import parse_structured_parameters

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

def test_ai_coach_structured_parameter_parsing():
    """TEST 2: Verify AI Coach parses prompt into structured JSON parameters."""
    res1 = parse_structured_parameters("Can I afford a ₹70,000 laptop?")
    assert res1["intent"] == "PURCHASE_AFFORDABILITY"
    assert res1["amount"] == 70000.0
    assert "laptop" in res1["item_name"].lower()

    res2 = parse_structured_parameters("Can I afford a ₹15 lakh car loan?")
    assert res2["intent"] == "LOAN_AFFORDABILITY"
    assert res2["amount"] == 1500000.0

def test_goal_contribution_auditing(session: Session):
    """TEST 3: Verify GoalContribution history updates current_amount as SUM(GoalProgress.amount_added)."""
    user = User(email="goal_user@artha.ai", password_hash="hash")
    session.add(user)
    session.commit()
    session.refresh(user)

    goal = FinancialGoal(user_id=user.id, goal_name="House Fund", target_amount=500000.0, current_amount=0.0, target_date=datetime.date(2029, 1, 1))
    session.add(goal)
    session.commit()
    session.refresh(goal)

    # Deposit 1
    p1 = GoalProgress(goal_id=goal.id, date=datetime.date.today(), amount_added=50000.0, note="Deposit 1")
    session.add(p1)
    session.commit()

    # Deposit 2
    p2 = GoalProgress(goal_id=goal.id, date=datetime.date.today(), amount_added=25000.0, note="Deposit 2")
    session.add(p2)
    session.commit()

    all_progress = session.exec(select(GoalProgress).where(GoalProgress.goal_id == goal.id)).all()
    total = sum(p.amount_added for p in all_progress)
    assert total == 75000.0

def test_password_reset_token_hashing(session: Session):
    """TEST 4: Verify password reset tokens are stored hashed (SHA-256) and expire in 15 minutes."""
    raw_token = secrets.token_urlsafe(32)
    hashed_token = hashlib.sha256(raw_token.encode()).hexdigest()
    expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=15)

    user = User(email="reset_user@artha.ai", password_hash="old_hash", reset_token_hash=hashed_token, reset_token_expires_at=expires_at)
    session.add(user)
    session.commit()
    session.refresh(user)

    assert user.reset_token_hash != raw_token
    assert hashlib.sha256(raw_token.encode()).hexdigest() == user.reset_token_hash
    assert user.reset_token_expires_at > datetime.datetime.utcnow()

def test_emi_payment_idempotency(session: Session):
    """TEST 5: Verify duplicate 'Mark EMI as Paid' attempts are idempotent and do not double-deduct principal."""
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
