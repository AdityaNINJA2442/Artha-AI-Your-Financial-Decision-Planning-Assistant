import sys
import os
import datetime
import random
import json

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
    {"name": "Food & Dining", "icon": "utensils", "type": "Expense", "is_essential": False},
    {"name": "Groceries", "icon": "shopping-cart", "type": "Expense", "is_essential": True},
    {"name": "Rent & Housing", "icon": "home", "type": "Expense", "is_essential": True},
    {"name": "Utilities & Bills", "icon": "zap", "type": "Expense", "is_essential": True},
    {"name": "Subscriptions", "icon": "repeat", "type": "Expense", "is_essential": False},
    {"name": "Shopping & Lifestyle", "icon": "bag", "type": "Expense", "is_essential": False},
    {"name": "Travel & Transport", "icon": "car", "type": "Expense", "is_essential": False},
    {"name": "Medical & Health", "icon": "activity", "type": "Expense", "is_essential": True},
    {"name": "Investments & SIP", "icon": "trending-up", "type": "Expense", "is_essential": True},
    {"name": "Salary & Income", "icon": "dollar-sign", "type": "Income", "is_essential": False},
    {"name": "Other Expenses", "icon": "credit-card", "type": "Expense", "is_essential": False}
]

def seed_categories(db: Session) -> dict:
    cat_map = {}
    for cat in DEFAULT_CATEGORIES:
        existing = db.exec(select(Category).where(Category.name == cat["name"])).first()
        if not existing:
            new_cat = Category(**cat)
            db.add(new_cat)
            db.commit()
            db.refresh(new_cat)
            cat_map[new_cat.name] = new_cat.id
        else:
            cat_map[existing.name] = existing.id
    return cat_map

def seed_transactions_for_user(db: Session, user: User, udata: dict, cat_map: dict):
    existing_txs = db.exec(select(Transaction).where(Transaction.user_id == user.id)).all()
    if len(existing_txs) >= 22:
        return

    today = datetime.date.today()
    income = udata["monthly_income"]

    # 1. Salary Credits (Past 2 months)
    for m_off in range(2):
        sal_date = today - datetime.timedelta(days=m_off * 30 + 1)
        db.add(Transaction(
            user_id=user.id,
            merchant=f"Monthly Salary - {udata['occupation']}",
            amount=income,
            type="Income",
            date=sal_date,
            category_id=cat_map.get("Salary & Income", 10),
            payment_method="NetBanking",
            notes="Monthly salary credit",
            source="Automated Seed"
        ))

    # 2. Expenses across diverse categories (20+ items)
    sample_expenses = [
        ("Swiggy Gourmet", 680.0, cat_map.get("Food & Dining", 1), "UPI"),
        ("Zomato Dining", 1450.0, cat_map.get("Food & Dining", 1), "CreditCard"),
        ("Starbucks Coffee", 450.0, cat_map.get("Food & Dining", 1), "UPI"),
        ("Blinkit Quick Grocery", 1890.0, cat_map.get("Groceries", 2), "UPI"),
        ("Zepto Daily Needs", 950.0, cat_map.get("Groceries", 2), "UPI"),
        ("Landlord Rent Transfer", round(udata["fixed_expenses"] * 0.45, 2), cat_map.get("Rent & Housing", 3), "NetBanking"),
        ("Airtel Fiber Broadband", 1199.0, cat_map.get("Utilities & Bills", 4), "AutoDebit"),
        ("BESCOM Electricity Bill", 2450.0, cat_map.get("Utilities & Bills", 4), "AutoDebit"),
        ("Netflix Premium 4K", 649.0, cat_map.get("Subscriptions", 5), "CreditCard"),
        ("Spotify Family Plan", 179.0, cat_map.get("Subscriptions", 5), "UPI"),
        ("ChatGPT Plus AI", 1999.0, cat_map.get("Subscriptions", 5), "CreditCard"),
        ("Amazon India Shopping", 5400.0, cat_map.get("Shopping & Lifestyle", 6), "CreditCard"),
        ("Myntra Fashion Wear", 2800.0, cat_map.get("Shopping & Lifestyle", 6), "UPI"),
        ("Uber Premier Ride", 480.0, cat_map.get("Travel & Transport", 7), "UPI"),
        ("Petrol HPCL Station", 2500.0, cat_map.get("Travel & Transport", 7), "CreditCard"),
        ("Fastag Toll AutoDebit", 350.0, cat_map.get("Travel & Transport", 7), "AutoDebit"),
        ("Apollo Pharmacy Meds", 1250.0, cat_map.get("Medical & Health", 8), "UPI"),
        ("Cult.fit Gym Subscription", 2200.0, cat_map.get("Medical & Health", 8), "CreditCard"),
        ("Zerodha Nifty 50 SIP", round(income * 0.12, 2), cat_map.get("Investments & SIP", 9), "AutoDebit"),
        ("Groww Flexi Cap SIP", round(income * 0.08, 2), cat_map.get("Investments & SIP", 9), "AutoDebit"),
        ("Local Bakery & Snacks", 380.0, cat_map.get("Food & Dining", 1), "UPI"),
        ("Decathlon Sports Goods", 3400.0, cat_map.get("Shopping & Lifestyle", 6), "CreditCard"),
    ]

    for idx, (merchant, amt, cat_id, p_method) in enumerate(sample_expenses):
        d_offset = (idx * 2) + 2
        tx_date = today - datetime.timedelta(days=d_offset)
        db.add(Transaction(
            user_id=user.id,
            merchant=merchant,
            amount=amt,
            type="Expense",
            date=tx_date,
            category_id=cat_id,
            payment_method=p_method,
            notes=f"Automated seed transaction #{idx+1}",
            source="Automated Seed"
        ))

    db.commit()

def seed_goals_for_user(db: Session, user: User, udata: dict):
    existing = db.exec(select(FinancialGoal).where(FinancialGoal.user_id == user.id)).all()
    if len(existing) >= 5:
        return

    today = datetime.date.today()
    goals_config = [
        {
            "name": "Emergency Fund Buffer Pool",
            "target": udata["fixed_expenses"] * 6,
            "current": udata["emergency_fund"],
            "target_date": datetime.date(today.year + 1, 12, 31),
            "monthly": 15000.0,
            "priority": "High"
        },
        {
            "name": "M3 Macbook Pro Upgrade",
            "target": 220000.0,
            "current": 90000.0,
            "target_date": datetime.date(today.year + 1, 6, 30),
            "monthly": 12000.0,
            "priority": "Medium"
        },
        {
            "name": "Japan Cherry Blossom Vacation",
            "target": 350000.0,
            "current": 140000.0,
            "target_date": datetime.date(today.year + 2, 4, 30),
            "monthly": 10000.0,
            "priority": "Medium"
        },
        {
            "name": "Real Estate Downpayment Pool",
            "target": 2500000.0,
            "current": udata["savings"] * 0.6,
            "target_date": datetime.date(today.year + 4, 12, 31),
            "monthly": 30000.0,
            "priority": "High"
        },
        {
            "name": "EV Car Purchase Fund",
            "target": 1400000.0,
            "current": udata["savings"] * 0.3,
            "target_date": datetime.date(today.year + 3, 10, 31),
            "monthly": 20000.0,
            "priority": "Medium"
        }
    ]

    for gc in goals_config:
        dup = db.exec(select(FinancialGoal).where(
            (FinancialGoal.user_id == user.id) & (FinancialGoal.goal_name == gc["name"])
        )).first()
        if not dup:
            goal = FinancialGoal(
                user_id=user.id,
                goal_name=gc["name"],
                target_amount=gc["target"],
                current_amount=gc["current"],
                target_date=gc["target_date"],
                monthly_contribution=gc["monthly"],
                priority=gc["priority"],
                status="In Progress"
            )
            db.add(goal)
            db.commit()
            db.refresh(goal)

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

def seed_decisions_for_user(db: Session, user: User, udata: dict):
    existing = db.exec(select(FinancialDecisionHistory).where(FinancialDecisionHistory.user_id == user.id)).all()
    if len(existing) >= 4:
        return

    decisions = [
        {
            "type": "Wishlist",
            "title": "iPhone 15 Pro Purchase Affordability Check",
            "input": {"price": 79999, "userSavings": udata["savings"], "fixedExp": udata["fixed_expenses"]},
            "result": {"remainingSavings": max(0, udata["savings"] - 79999), "runwayMonths": round((udata["savings"] - 79999) / (udata["fixed_expenses"] or 1), 1)},
            "risk": "Comfortable" if 79999 <= udata["savings"] * 0.5 else "High Risk"
        },
        {
            "type": "Loan Comparison",
            "title": "Car Loan EMI vs Surplus Analysis",
            "input": {"loan_amount": 300000, "rate": 8.5, "tenure_months": 36},
            "result": {"emi": 6200.0, "surplus_after": udata["monthly_income"] - udata["fixed_expenses"] - 6200.0},
            "risk": "Manageable"
        },
        {
            "type": "Shock Test",
            "title": "3-Month Job Loss Emergency Resilience",
            "input": {"savings": udata["savings"], "fixed_exp": udata["fixed_expenses"]},
            "result": {"runway_months": round(udata["savings"] / (udata["fixed_expenses"] or 1), 1)},
            "risk": "Comfortable" if udata["savings"] >= udata["fixed_expenses"] * 3 else "Caution"
        },
        {
            "type": "FutureView",
            "title": "10-Year Net Worth Trajectory Simulation",
            "input": {"extra_sip": 10000, "base_sip": 30000},
            "result": {"projected_5yr": udata["savings"] + 3000000, "projected_10yr": udata["savings"] + 7500000},
            "risk": "Manageable"
        }
    ]

    for d in decisions:
        dup = db.exec(select(FinancialDecisionHistory).where(
            (FinancialDecisionHistory.user_id == user.id) & (FinancialDecisionHistory.title == d["title"])
        )).first()
        if not dup:
            dec = FinancialDecisionHistory(
                user_id=user.id,
                decision_type=d["type"],
                title=d["title"],
                input_data_json=json.dumps(d["input"]),
                result_data_json=json.dumps(d["result"]),
                risk_level=d["risk"]
            )
            db.add(dec)
    db.commit()

def seed_loans_for_user(db: Session, user: User, udata: dict):
    total_assets = udata["savings"] + udata["emergency_fund"]
    # Ensure healthy liability ratio (~35% of total liquid assets), guaranteeing POSITIVE Net Worth!
    target_outstanding = round(total_assets * 0.35, 2)
    target_principal = round(total_assets * 0.55, 2)
    target_emi = round(udata["monthly_income"] * 0.08, 2)

    existing_loans = db.exec(select(Loan).where(Loan.user_id == user.id)).all()
    if len(existing_loans) > 0:
        for loan in existing_loans:
            if loan.outstanding_principal >= total_assets:
                loan.original_principal = target_principal
                loan.outstanding_principal = target_outstanding
                loan.emi_amount = target_emi
                db.add(loan)
        db.commit()
        return

    today = datetime.date.today()
    loan_type = "Car Loan" if udata["spending_pattern"] != "loan_heavy" else "Personal Loan"

    loan = Loan(
        user_id=user.id,
        loan_name=f"{udata['city']} {loan_type}",
        loan_type=loan_type,
        original_principal=target_principal,
        outstanding_principal=target_outstanding,
        interest_rate=8.5,
        emi_amount=target_emi,
        tenure_months=36,
        start_date=today - datetime.timedelta(days=365),
        end_date=today + datetime.timedelta(days=365 * 2),
        next_payment_date=today + datetime.timedelta(days=15),
        lender_name="HDFC Bank",
        status="Active"
    )
    db.add(loan)
    db.commit()
    db.refresh(loan)

    payment = LoanPayment(
        loan_id=loan.id,
        user_id=user.id,
        payment_date=today - datetime.timedelta(days=15),
        amount_paid=target_emi,
        principal_component=round(target_emi * 0.7, 2),
        interest_component=round(target_emi * 0.3, 2),
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
    print("  ARTHA AI -- POSITIVE NET WORTH DEMO SEED FIX")
    print("==================================================")

    init_db()

    created_count = 0
    existing_count = 0

    with Session(engine) as db:
        cat_map = seed_categories(db)

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
                # Refresh existing UserProfile to ensure healthy savings & emergency fund values
                prof = db.exec(select(UserProfile).where(UserProfile.user_id == user.id)).first()
                if prof:
                    prof.monthly_income = udata["monthly_income"]
                    prof.monthly_fixed_expenses = udata["fixed_expenses"]
                    prof.current_savings = udata["savings"]
                    prof.emergency_fund = udata["emergency_fund"]
                    prof.current_investments = udata["investments"]
                    db.add(prof)
                    db.commit()
                print(f"[UPDATED DEMO PROFILE] {udata['name']} <{udata['email']}>")

            # Populate/restore all child records idempotently
            seed_transactions_for_user(db, user, udata, cat_map)
            seed_goals_for_user(db, user, udata)
            seed_decisions_for_user(db, user, udata)
            seed_loans_for_user(db, user, udata)
            seed_assets_for_user(db, user, udata)
            seed_ai_conversation_for_user(db, user, udata)

    print("\n==================================================")
    print(f"  SEED COMPLETE: {created_count} Users Created, {existing_count} Profiles Refreshed with Positive Net Worth")
    print("==================================================")
    print("  DEMO ACCOUNTS READY (Password for all: Demo@123):")
    for idx, u in enumerate(DEMO_USERS, 1):
        tot_assets = u["savings"] + u["emergency_fund"]
        tot_liab = round(tot_assets * 0.35, 2)
        nw = tot_assets - tot_liab
        print(f"  {idx:2d}. {u['name']:18s} | Assets: Rs.{tot_assets:,.0f} | Liab: Rs.{tot_liab:,.0f} | Net Worth: +Rs.{nw:,.0f}")
    print("==================================================")

if __name__ == "__main__":
    run_seed_process()
