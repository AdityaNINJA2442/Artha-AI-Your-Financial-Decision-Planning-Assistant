import sys
import os
import datetime
import random

# Add parent directory to path so imports work seamlessly
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlmodel import Session, select
from app.db.session import engine, init_db
from app.models.entities import (
    User, UserProfile, Category, Transaction, FinancialGoal, GoalProgress,
    Loan, LoanPayment, PortfolioAsset, FinancialDecisionHistory, ChatConversation, ChatMessage
)
from app.core.security import get_password_hash

DEMO_PASSWORD = "Demo@123"

DEMO_USERS = [
    {
        "name": "Arjun Mehta",
        "email": "arjun.demo@artha.ai",
        "age": 29,
        "city": "Bengaluru",
        "occupation": "Software Engineer",
        "annual_income": 1200000.0,
        "monthly_income": 100000.0,
        "savings": 320000.0,
        "investments": 450000.0,
        "emergency_fund": 180000.0,
        "fixed_expenses": 62000.0,
        "profile_type": "Balanced",
        "spending_pattern": "balanced"
    },
    {
        "name": "Riya Sharma",
        "email": "riya.demo@artha.ai",
        "age": 27,
        "city": "Pune",
        "occupation": "Marketing Executive",
        "annual_income": 960000.0,
        "monthly_income": 80000.0,
        "savings": 210000.0,
        "investments": 180000.0,
        "emergency_fund": 120000.0,
        "fixed_expenses": 51000.0,
        "profile_type": "Moderate Saver",
        "spending_pattern": "high_food_delivery"
    },
    {
        "name": "Rahul Verma",
        "email": "rahul.demo@artha.ai",
        "age": 32,
        "city": "Hyderabad",
        "occupation": "Senior Software Engineer",
        "annual_income": 1800000.0,
        "monthly_income": 150000.0,
        "savings": 650000.0,
        "investments": 1200000.0,
        "emergency_fund": 350000.0,
        "fixed_expenses": 85000.0,
        "profile_type": "High Income / High Investment",
        "spending_pattern": "high_investment"
    },
    {
        "name": "Neha Kapoor",
        "email": "neha.demo@artha.ai",
        "age": 25,
        "city": "Bhubaneswar",
        "occupation": "Business Analyst",
        "annual_income": 720000.0,
        "monthly_income": 60000.0,
        "savings": 140000.0,
        "investments": 90000.0,
        "emergency_fund": 70000.0,
        "fixed_expenses": 45000.0,
        "profile_type": "Budget Conscious",
        "spending_pattern": "budget_focused"
    },
    {
        "name": "Vikram Singh",
        "email": "vikram.demo@artha.ai",
        "age": 35,
        "city": "Mumbai",
        "occupation": "Product Manager",
        "annual_income": 2400000.0,
        "monthly_income": 200000.0,
        "savings": 800000.0,
        "investments": 1800000.0,
        "emergency_fund": 400000.0,
        "fixed_expenses": 140000.0,
        "profile_type": "High Income / High Expenses",
        "spending_pattern": "high_lifestyle"
    },
    {
        "name": "Ananya Das",
        "email": "ananya.demo@artha.ai",
        "age": 24,
        "city": "Kolkata",
        "occupation": "Junior Developer",
        "annual_income": 600000.0,
        "monthly_income": 50000.0,
        "savings": 80000.0,
        "investments": 40000.0,
        "emergency_fund": 50000.0,
        "fixed_expenses": 39000.0,
        "profile_type": "Early Career",
        "spending_pattern": "early_career"
    },
    {
        "name": "Karan Joshi",
        "email": "karan.demo@artha.ai",
        "age": 31,
        "city": "Delhi",
        "occupation": "Consultant",
        "annual_income": 1500000.0,
        "monthly_income": 125000.0,
        "savings": 350000.0,
        "investments": 300000.0,
        "emergency_fund": 150000.0,
        "fixed_expenses": 95000.0,
        "profile_type": "Loan Heavy",
        "spending_pattern": "loan_heavy"
    },
    {
        "name": "Priya Nair",
        "email": "priya.demo@artha.ai",
        "age": 28,
        "city": "Chennai",
        "occupation": "UI/UX Designer",
        "annual_income": 1080000.0,
        "monthly_income": 90000.0,
        "savings": 300000.0,
        "investments": 550000.0,
        "emergency_fund": 200000.0,
        "fixed_expenses": 58000.0,
        "profile_type": "Goal Focused",
        "spending_pattern": "goal_focused"
    },
    {
        "name": "Aman Gupta",
        "email": "aman.demo@artha.ai",
        "age": 26,
        "city": "Jaipur",
        "occupation": "Sales Executive",
        "annual_income": 840000.0,
        "monthly_income": 70000.0,
        "savings": 160000.0,
        "investments": 100000.0,
        "emergency_fund": 80000.0,
        "fixed_expenses": 61000.0,
        "profile_type": "High Discretionary Spending",
        "spending_pattern": "high_discretionary"
    },
    {
        "name": "Sneha Iyer",
        "email": "sneha.demo@artha.ai",
        "age": 38,
        "city": "Mumbai",
        "occupation": "Technology Director",
        "annual_income": 3000000.0,
        "monthly_income": 250000.0,
        "savings": 1200000.0,
        "investments": 3500000.0,
        "emergency_fund": 600000.0,
        "fixed_expenses": 150000.0,
        "profile_type": "Wealth Builder",
        "spending_pattern": "wealth_builder"
    }
]

DEFAULT_CATEGORIES = [
    {"name": "Food & Dining", "icon": "utensils", "type": "Expense", "is_essential": True},
    {"name": "Shopping", "icon": "shopping-bag", "type": "Expense", "is_essential": False},
    {"name": "Bills & Utilities", "icon": "zap", "type": "Expense", "is_essential": True},
    {"name": "Entertainment", "icon": "film", "type": "Expense", "is_essential": False},
    {"name": "Travel & Fuel", "icon": "car", "type": "Expense", "is_essential": False},
    {"name": "Salary", "icon": "dollar-sign", "type": "Income", "is_essential": True},
    {"name": "Investment", "icon": "trending-up", "type": "Expense", "is_essential": False},
    {"name": "EMI / Loan", "icon": "credit-card", "type": "Expense", "is_essential": True},
]

def seed_categories(db: Session):
    for cat in DEFAULT_CATEGORIES:
        existing = db.exec(select(Category).where(Category.name == cat["name"])).first()
        if not existing:
            new_cat = Category(**cat)
            db.add(new_cat)
    db.commit()

def seed_transactions_for_user(db: Session, user: User, udata: dict):
    # Check if transactions already exist
    existing_txs = db.exec(select(Transaction).where(Transaction.user_id == user.id)).all()
    if len(existing_txs) >= 10:
        return

    today = datetime.date.today()
    income = udata["monthly_income"]

    # 1. Add monthly salary transactions for past 3 months
    for month_offset in range(3):
        sal_date = datetime.date(today.year, today.month, 1) - datetime.timedelta(days=month_offset * 30)
        sal_tx = Transaction(
            user_id=user.id,
            merchant="Employer Salary Credit",
            amount=income,
            type="Income",
            date=sal_date,
            payment_method="Bank Transfer",
            notes="Monthly Salary Credit",
            source="Automated Seed"
        )
        db.add(sal_tx)

    # 2. Add realistic expense transactions for past 60 days
    pattern = udata["spending_pattern"]

    merchants_by_type = {
        "rent": [("Landlord Rent Transfer", udata["fixed_expenses"] * 0.45, "UPI")],
        "food": [("Swiggy", 450, "UPI"), ("Zomato", 680, "UPI"), ("Local Supermarket", 2400, "Card"), ("Starbucks Coffee", 350, "UPI")],
        "shopping": [("Amazon.in", 3499, "Card"), ("Myntra", 1899, "UPI"), ("Zudio", 1200, "UPI")],
        "utilities": [("Airtel Broadband", 999, "UPI"), ("BESCOM Electricity", 1850, "UPI")],
        "entertainment": [("Netflix Subscription", 649, "Card"), ("BookMyShow", 800, "UPI"), ("Steam Games", 1499, "Card")],
        "investment": [("Zerodha SIP Mutual Fund", udata["monthly_income"] * 0.15, "Bank Transfer"), ("NPS Pension Contribution", 5000, "Bank Transfer")]
    }

    for day in range(1, 60):
        tx_date = today - datetime.timedelta(days=day)

        # Rent on 5th of month
        if tx_date.day == 5:
            rent_info = merchants_by_type["rent"][0]
            db.add(Transaction(
                user_id=user.id,
                merchant=rent_info[0],
                amount=rent_info[1],
                type="Expense",
                date=tx_date,
                payment_method=rent_info[2],
                notes="Monthly House Rent",
                source="Automated Seed"
            ))

        # Utilities on 10th of month
        if tx_date.day == 10:
            for u in merchants_by_type["utilities"]:
                db.add(Transaction(
                    user_id=user.id,
                    merchant=u[0],
                    amount=u[1],
                    type="Expense",
                    date=tx_date,
                    payment_method=u[2],
                    notes="Utility Bill",
                    source="Automated Seed"
                ))

        # Random daily food & shopping based on pattern
        if day % 2 == 0:
            m = random.choice(merchants_by_type["food"])
            multiplier = 1.8 if pattern == "high_food_delivery" else 1.0
            db.add(Transaction(
                user_id=user.id,
                merchant=m[0],
                amount=round(m[1] * multiplier, 2),
                type="Expense",
                date=tx_date,
                payment_method=m[2],
                source="Automated Seed"
            ))

        if day % 5 == 0:
            m = random.choice(merchants_by_type["shopping"])
            multiplier = 2.0 if pattern in ["high_lifestyle", "high_discretionary"] else 1.0
            db.add(Transaction(
                user_id=user.id,
                merchant=m[0],
                amount=round(m[1] * multiplier, 2),
                type="Expense",
                date=tx_date,
                payment_method=m[2],
                source="Automated Seed"
            ))

    db.commit()

def seed_goals_for_user(db: Session, user: User, udata: dict):
    existing = db.exec(select(FinancialGoal).where(FinancialGoal.user_id == user.id)).all()
    if len(existing) > 0:
        return

    today = datetime.date.today()
    target_next_yr = datetime.date(today.year + 2, 12, 31)

    goals_config = [
        {
            "name": "Emergency Fund Buffer",
            "target": udata["fixed_expenses"] * 6,
            "current": udata["emergency_fund"],
            "monthly": 15000.0,
            "priority": "High"
        },
        {
            "name": "Vehicle Upgrade / Car Fund",
            "target": 1200000.0,
            "current": udata["savings"] * 0.4,
            "monthly": 20000.0,
            "priority": "Medium"
        }
    ]

    for gc in goals_config:
        goal = FinancialGoal(
            user_id=user.id,
            goal_name=gc["name"],
            target_amount=gc["target"],
            current_amount=gc["current"],
            target_date=target_next_yr,
            monthly_contribution=gc["monthly"],
            priority=gc["priority"],
            status="In Progress"
        )
        db.add(goal)
        db.commit()
        db.refresh(goal)

        # Add contribution history
        if gc["current"] > 0:
            prog = GoalProgress(
                goal_id=goal.id,
                date=today - datetime.timedelta(days=30),
                amount_added=gc["current"],
                source="Initial Deposit",
                note="Seed Goal Deposit"
            )
            db.add(prog)
            db.commit()

def seed_loans_for_user(db: Session, user: User, udata: dict):
    existing = db.exec(select(Loan).where(Loan.user_id == user.id)).all()
    if len(existing) > 0:
        return

    pattern = udata["spending_pattern"]
    today = datetime.date.today()

    if pattern in ["loan_heavy", "balanced", "high_lifestyle", "wealth_builder"]:
        loan_type = "Car Loan" if pattern != "loan_heavy" else "Home Loan"
        principal = 1000000.0 if loan_type == "Car Loan" else 4000000.0
        outstanding = 750000.0 if loan_type == "Car Loan" else 3400000.0
        rate = 9.0 if loan_type == "Car Loan" else 8.5
        tenure = 60 if loan_type == "Car Loan" else 240
        emi = 20758.0 if loan_type == "Car Loan" else 34713.0

        loan = Loan(
            user_id=user.id,
            loan_name=f"{udata['city']} {loan_type}",
            loan_type=loan_type,
            original_principal=principal,
            outstanding_principal=outstanding,
            interest_rate=rate,
            emi_amount=emi,
            tenure_months=tenure,
            start_date=today - datetime.timedelta(days=365),
            end_date=today + datetime.timedelta(days=365 * 4),
            next_payment_date=today + datetime.timedelta(days=15),
            lender_name="HDFC / SBI Bank",
            status="Active"
        )
        db.add(loan)
        db.commit()
        db.refresh(loan)

        # Add EMI Payment History
        payment = LoanPayment(
            loan_id=loan.id,
            user_id=user.id,
            payment_date=today - datetime.timedelta(days=15),
            amount_paid=emi,
            principal_component=emi * 0.7,
            interest_component=emi * 0.3,
            notes="Monthly EMI Paid"
        )
        db.add(payment)
        db.commit()

def seed_assets_for_user(db: Session, user: User, udata: dict):
    existing = db.exec(select(PortfolioAsset).where(PortfolioAsset.user_id == user.id)).all()
    if len(existing) > 0:
        return

    if udata["investments"] > 0:
        asset = PortfolioAsset(
            user_id=user.id,
            asset_type="Property" if udata["investments"] > 1000000 else "Mutual Fund Portfolio",
            asset_name=f"{udata['city']} Prime Asset",
            invested_amount=udata["investments"] * 0.8,
            current_value=udata["investments"],
            quantity=1.0
        )
        db.add(asset)
        db.commit()

def seed_ai_conversation_for_user(db: Session, user: User, udata: dict):
    existing = db.exec(select(ChatConversation).where(ChatConversation.user_id == user.id)).all()
    if len(existing) > 0:
        return

    conv = ChatConversation(user_id=user.id, title=f"Financial Planning for {udata['name']}")
    db.add(conv)
    db.commit()
    db.refresh(conv)

    msg1 = ChatMessage(
        conversation_id=conv.id,
        sender="user",
        message=f"Can I afford a ₹70,000 laptop on my ₹{udata['monthly_income']:,.0f} monthly salary?",
        is_llm_generated=False
    )
    db.add(msg1)

    msg2 = ChatMessage(
        conversation_id=conv.id,
        sender="coach",
        message=f"Hello {udata['name']}! Based on your PostgreSQL financial profile (Monthly Income: ₹{udata['monthly_income']:,.0f}, Fixed Expenses: ₹{udata['fixed_expenses']:,.0f}, Savings: ₹{udata['savings']:,.0f}), purchasing a ₹70,000 laptop is rated **Comfortable**. Your emergency runway will adjust safely from {(udata['savings']/udata['fixed_expenses']):.1f} to {((udata['savings']-70000)/udata['fixed_expenses']):.1f} months.",
        is_llm_generated=True
    )
    db.add(msg2)
    db.commit()

def run_seed_process():
    print("==================================================")
    print("  ARTHA AI -- 10 SYNTHETIC USER SEED SYSTEM")
    print("==================================================")

    init_db()

    created_count = 0
    existing_count = 0

    with Session(engine) as db:
        seed_categories(db)

        for udata in DEMO_USERS:
            user = db.exec(select(User).where(User.email == udata["email"])).first()
            if not user:
                hashed = get_password_hash(DEMO_PASSWORD)
                user = User(
                    email=udata["email"],
                    password_hash=hashed,
                    is_active=True
                )
                db.add(user)
                db.commit()
                db.refresh(user)

                profile = UserProfile(
                    user_id=user.id,
                    name=udata["name"],
                    age=udata["age"],
                    city=udata["city"],
                    occupation=udata["occupation"],
                    annual_income=udata["annual_income"],
                    monthly_income=udata["monthly_income"],
                    monthly_fixed_expenses=udata["fixed_expenses"],
                    current_savings=udata["savings"],
                    current_investments=udata["investments"],
                    emergency_fund=udata["emergency_fund"]
                )
                db.add(profile)
                db.commit()
                created_count += 1
                print(f"[CREATED DEMO USER] {udata['name']} <{udata['email']}>")
            else:
                existing_count += 1
                print(f"[EXISTING DEMO USER] {udata['name']} <{udata['email']}>")

            # Populate user child records idempotently
            seed_transactions_for_user(db, user, udata)
            seed_goals_for_user(db, user, udata)
            seed_loans_for_user(db, user, udata)
            seed_assets_for_user(db, user, udata)
            seed_ai_conversation_for_user(db, user, udata)

    print("\n==================================================")
    print(f"  SEED COMPLETE: {created_count} Users Created, {existing_count} Users Skipped (Idempotent)")
    print("==================================================")
    print("  DEMO ACCOUNTS READY (Password for all: Demo@123):")
    for idx, u in enumerate(DEMO_USERS, 1):
        print(f"  {idx:2d}. {u['name']:18s} | {u['email']:25s} | Income: Rs.{u['monthly_income']:,.0f}/mo | City: {u['city']}")
    print("==================================================")

if __name__ == "__main__":
    run_seed_process()
