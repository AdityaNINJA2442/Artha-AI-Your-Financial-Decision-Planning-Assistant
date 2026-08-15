import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlmodel import select
from app.db.session import SessionLocal
from app.models.entities import User, UserProfile, Transaction, FinancialGoal, FinancialScore, Category
from app.core.security import verify_password, get_password_hash

DEMO_ACCOUNTS = [
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

DEMO_PASSWORD = "Demo@123"

def inspect_and_repair():
    db = SessionLocal()
    print("==================================================")
    print("  STEP 1: INSPECTING & REPAIRING 10 DEMO ACCOUNTS")
    print("==================================================")

    categories = db.exec(select(Category)).all()
    food_cat = next((c for c in categories if "Food" in c.name), None)
    food_cat_id = food_cat.id if food_cat else 1

    for name, email in DEMO_ACCOUNTS:
        user = db.exec(select(User).where(User.email == email)).first()
        if not user:
            print(f"  [CREATING MISSING USER] {name} ({email})")
            user = User(
                email=email,
                password_hash=get_password_hash(DEMO_PASSWORD),
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)

            # Profile
            profile = UserProfile(
                user_id=user.id,
                name=name,
                monthly_income=120000.0,
                annual_income=1440000.0,
                monthly_fixed_expenses=45000.0,
                current_savings=300000.0,
                emergency_fund=100000.0
            )
            db.add(profile)

            # Default Sample Transactions so ledger is populated
            tx1 = Transaction(user_id=user.id, merchant="Salary Credit - TechCorp", amount=120000.0, category_id=10, type="Income", payment_method="NetBanking")
            tx2 = Transaction(user_id=user.id, merchant="Swiggy Gourmet", amount=1450.0, category_id=food_cat_id, type="Expense", payment_method="UPI")
            tx3 = Transaction(user_id=user.id, merchant="Amazon India", amount=4200.0, category_id=6, type="Expense", payment_method="CreditCard")
            tx4 = Transaction(user_id=user.id, merchant="Blinkit Quick Grocery", amount=2800.0, category_id=2, type="Expense", payment_method="UPI")
            tx5 = Transaction(user_id=user.id, merchant="BESCOM Electricity Bill", amount=1850.0, category_id=4, type="Expense", payment_method="AutoDebit")
            db.add_all([tx1, tx2, tx3, tx4, tx5])
            db.commit()
        else:
            # Check password verification
            pw_valid = verify_password(DEMO_PASSWORD, user.password_hash)
            if not pw_valid:
                print(f"  [REPAIRING PASSWORD HASH] {name} ({email})")
                user.password_hash = get_password_hash(DEMO_PASSWORD)
                db.add(user)
                db.commit()

        # Check transaction count in DB
        tx_count = len(db.exec(select(Transaction).where(Transaction.user_id == user.id)).all())
        print(f"  [PASS] User ID: {user.id} | Email: {email} | Password Valid: True | DB Transactions: {tx_count}")

    # Inspect personal account
    personal_email = "adityaprakash2442@gmail.com"
    personal_user = db.exec(select(User).where(User.email == personal_email)).first()
    if personal_user:
        tx_c = len(db.exec(select(Transaction).where(Transaction.user_id == personal_user.id)).all())
        print(f"\n  [PERSONAL ACCOUNT] Email: {personal_email} | ID: {personal_user.id} | Active: {personal_user.is_active} | DB Transactions: {tx_c}")
    
    db.close()
    print("\n==================================================")
    print("  ALL 10 DEMO ACCOUNTS & DATA INSPECTION COMPLETE")
    print("==================================================")

if __name__ == "__main__":
    inspect_and_repair()
