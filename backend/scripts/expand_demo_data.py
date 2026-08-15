import sys
import os
import datetime
import random
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlmodel import select
from app.db.session import SessionLocal, init_db
from app.models.entities import User, Transaction, FinancialGoal, Category
from app.core.seed import seed_database

DEMO_EMAILS = [
    ("Arjun Mehta", "arjun.demo@artha.ai"),
    ("Riya Sharma", "riya.demo@artha.ai"),
    ("Rahul Verma", "rahul.demo@artha.ai"),
    ("Neha Kapoor", "neha.demo@artha.ai"),
    ("Vikram Singh", "vikram.demo@artha.ai"),
    ("Ananya Das", "ananya.demo@artha.ai"),
    ("Karan Joshi", "karan.demo@artha.ai"),
    ("Priya Nair", "priya.demo@artha.ai"),
    ("Aman Gupta", "aman.demo@artha.ai"),
    ("Sneha Iyer", "sneha.demo@artha.ai"),
]

SAMPLE_EXPENSES = [
    ("Swiggy Gourmet", 650.0, 1, "UPI"),
    ("Zomato Dining", 1250.0, 1, "CreditCard"),
    ("Starbucks Coffee", 480.0, 1, "UPI"),
    ("Blinkit Grocery", 1420.0, 2, "UPI"),
    ("Zepto Daily Needs", 890.0, 2, "UPI"),
    ("Nature Basket", 2300.0, 2, "CreditCard"),
    ("House Maintenance Fee", 3500.0, 3, "NetBanking"),
    ("Airtel Fiber Broadband", 1199.0, 4, "AutoDebit"),
    ("BESCOM Power Utility", 2450.0, 4, "AutoDebit"),
    ("Netflix Premium", 649.0, 5, "CreditCard"),
    ("Spotify Family Plan", 179.0, 5, "UPI"),
    ("ChatGPT Plus Subscription", 1999.0, 5, "CreditCard"),
    ("Amazon Electronics", 8450.0, 6, "CreditCard"),
    ("Myntra Fashion Shopping", 3200.0, 6, "UPI"),
    ("Zara Clothing Store", 5600.0, 6, "CreditCard"),
    ("Uber Premier Commute", 480.0, 7, "UPI"),
    ("Fastag Highway Toll", 350.0, 7, "AutoDebit"),
    ("Petrol HPCL Station", 3000.0, 7, "CreditCard"),
    ("Apollo Pharmacy Meds", 1250.0, 8, "UPI"),
    ("Cult.fit Gym Membership", 2500.0, 8, "CreditCard"),
    ("Zerodha Nifty 50 Index SIP", 10000.0, 9, "AutoDebit"),
    ("Groww Parag Parikh Flexi Cap SIP", 7500.0, 9, "AutoDebit"),
]

SAMPLE_GOAL_PRESETS = [
    ("Emergency Buffer Pool", 600000.0, 250000.0, "2027-12-31", "High", 20000.0),
    ("New M3 Macbook Pro", 220000.0, 90000.0, "2026-11-30", "Medium", 15000.0),
    ("Japan Cherry Blossom Trip", 350000.0, 140000.0, "2027-04-30", "Medium", 12000.0),
    ("Real Estate Downpayment", 2500000.0, 650000.0, "2029-12-31", "High", 40000.0),
    ("Executive MBA Fund", 800000.0, 320000.0, "2028-06-30", "High", 25000.0),
    ("EV Car Purchase Pool", 1400000.0, 480000.0, "2028-10-31", "Medium", 30000.0),
    ("Wedding & Celebration Fund", 1200000.0, 400000.0, "2028-02-28", "High", 25000.0),
]

def expand_demo_data():
    init_db()
    db = SessionLocal()
    seed_database(db)

    print("==========================================================")
    print("  EXPANDING DEMO DATA FOR ALL 10 DEMO ACCOUNTS")
    print("==========================================================")

    today = datetime.date.today()

    for name, email in DEMO_EMAILS:
        user = db.exec(select(User).where(User.email == email)).first()
        if not user:
            print(f"  [ERROR] User {email} not found!")
            continue

        # 1. Check & Expand Transactions to >= 22
        existing_txs = db.exec(select(Transaction).where(Transaction.user_id == user.id)).all()
        tx_count = len(existing_txs)
        
        if tx_count < 22:
            needed_tx = 22 - tx_count
            print(f"  [{name}] Current Transactions: {tx_count}. Adding {needed_tx} realistic transactions...")
            
            # Ensure at least 1 Salary Income if missing
            has_income = any(t.type == "Income" for t in existing_txs)
            if not has_income:
                inc_tx = Transaction(
                    user_id=user.id,
                    merchant="Monthly Salary - TechCorp Ltd",
                    amount=125000.0,
                    date=today - datetime.timedelta(days=1),
                    category_id=10,
                    type="Income",
                    payment_method="NetBanking",
                    notes="Monthly net salary credit"
                )
                db.add(inc_tx)
                needed_tx -= 1

            for i in range(needed_tx):
                merchant, base_amt, cat_id, method = SAMPLE_EXPENSES[i % len(SAMPLE_EXPENSES)]
                # Slight variation in date and amount
                date_offset = (i * 3) + random.randint(1, 2)
                tx_d = today - datetime.timedelta(days=date_offset)
                var_amt = round(base_amt * random.uniform(0.9, 1.15), 2)
                
                tx = Transaction(
                    user_id=user.id,
                    merchant=merchant,
                    amount=var_amt,
                    date=tx_d,
                    category_id=cat_id,
                    type="Expense",
                    payment_method=method,
                    notes=f"Automated demo transaction #{i+1}"
                )
                db.add(tx)
            db.commit()

        # 2. Check & Expand Goals to >= 5
        existing_goals = db.exec(select(FinancialGoal).where(FinancialGoal.user_id == user.id)).all()
        goal_count = len(existing_goals)

        if goal_count < 5:
            needed_goals = 5 - goal_count
            print(f"  [{name}] Current Goals: {goal_count}. Adding {needed_goals} realistic goals...")

            for j in range(needed_goals):
                g_name, target, curr, target_d_str, priority, contrib = SAMPLE_GOAL_PRESETS[j % len(SAMPLE_GOAL_PRESETS)]
                t_date = datetime.datetime.strptime(target_d_str, "%Y-%m-%d").date()
                
                # Prevent duplicate goal names
                existing_names = [g.goal_name for g in existing_goals]
                if g_name in existing_names:
                    g_name = f"{g_name} ({j+1})"

                goal = FinancialGoal(
                    user_id=user.id,
                    goal_name=g_name,
                    target_amount=target,
                    current_amount=curr,
                    target_date=t_date,
                    priority=priority,
                    monthly_contribution=contrib,
                    status="In Progress"
                )
                db.add(goal)
            db.commit()

        # Final Verification Per User
        final_txs = len(db.exec(select(Transaction).where(Transaction.user_id == user.id)).all())
        final_goals = len(db.exec(select(FinancialGoal).where(FinancialGoal.user_id == user.id)).all())
        print(f"  [PASS] {name} ({email}) -> Transactions: {final_txs} | Goals: {final_goals} | Status: PASS")

    db.close()
    print("\n==========================================================")
    print("  DEMO DATA EXPANSION COMPLETED SUCCESSFULLY 100%!")
    print("==========================================================")

if __name__ == "__main__":
    expand_demo_data()
