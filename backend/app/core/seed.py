import datetime
from sqlmodel import Session, select
from app.models.entities import User, UserProfile, Category, MerchantMapping, Transaction, FinancialGoal, FinancialScore, PortfolioAsset, BudgetPlan, BudgetCategory
from app.core.security import get_password_hash

def seed_database(db: Session):
    """Seed default categories, merchant mappings, and demo user data into PostgreSQL."""
    
    # 1. Seed Default Categories
    default_categories = [
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

    cat_map = {}
    for cat_info in default_categories:
        existing = db.exec(select(Category).where(Category.name == cat_info["name"])).first()
        if not existing:
            cat = Category(**cat_info)
            db.add(cat)
            db.commit()
            db.refresh(cat)
            cat_map[cat.name] = cat.id
        else:
            cat_map[existing.name] = existing.id

    # 2. Seed Default Merchant Mappings
    merchant_rules = [
        ("SWIGGY", "Food & Dining"),
        ("ZOMATO", "Food & Dining"),
        ("AMAZON", "Shopping & Lifestyle"),
        ("BLINKIT", "Groceries"),
        ("ZEPTO", "Groceries"),
        ("APOLLO PHARMACY", "Medical & Health"),
        ("UBER", "Travel & Transport"),
        ("IRCTC", "Travel & Transport"),
        ("NETFLIX", "Subscriptions"),
        ("SPOTIFY", "Subscriptions"),
        ("CHATGPT", "Subscriptions"),
        ("ZERODHA", "Investments & SIP")
    ]

    for raw_m, cat_name in merchant_rules:
        if cat_name in cat_map:
            existing = db.exec(select(MerchantMapping).where(MerchantMapping.raw_merchant == raw_m)).first()
            if not existing:
                db.add(MerchantMapping(
                    raw_merchant=raw_m,
                    mapped_category_id=cat_map[cat_name],
                    confidence=1.0,
                    is_user_verified=True
                ))
    db.commit()

    # 3. Seed All 10 Synthetic Demo User Accounts
    demo_accounts = [
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

    for d_name, d_email in demo_accounts:
        user = db.exec(select(User).where(User.email == d_email)).first()
        if not user:
            user = User(
                email=d_email,
                password_hash=get_password_hash("Demo@123"),
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)

            # Profile
            profile = UserProfile(
                user_id=user.id,
                name=d_name,
                monthly_income=120000.0,
                annual_income=1440000.0,
                monthly_fixed_expenses=45000.0,
                current_savings=300000.0,
                emergency_fund=100000.0
            )
            db.add(profile)

            # Default Goal
            goal = FinancialGoal(
                user_id=user.id,
                goal_name="Emergency Fund Pool",
                target_amount=500000.0,
                current_amount=100000.0,
                target_date=datetime.date(2028, 12, 31),
                priority="High",
                monthly_contribution=15000.0,
                status="In Progress"
            )
            db.add(goal)

            # Default Score
            score = FinancialScore(
                user_id=user.id,
                overall_score=80,
                savings_ratio_score=16,
                emergency_fund_score=15,
                debt_burden_score=16,
                investment_ratio_score=15,
                spending_discipline_score=10,
                subscription_burden_score=8,
                computed_at=datetime.datetime.utcnow()
            )
            db.add(score)
            db.commit()

        # Check and populate sample transactions if user has 0 transactions
        existing_txs = db.exec(select(Transaction).where(Transaction.user_id == user.id)).all()
        if len(existing_txs) == 0:
            tx1 = Transaction(user_id=user.id, merchant="Salary Credit - TechCorp", amount=120000.0, category_id=cat_map.get("Salary & Income", 10), type="Income", payment_method="NetBanking")
            tx2 = Transaction(user_id=user.id, merchant="Swiggy Gourmet", amount=1450.0, category_id=cat_map.get("Food & Dining", 1), type="Expense", payment_method="UPI")
            tx3 = Transaction(user_id=user.id, merchant="Amazon India", amount=4200.0, category_id=cat_map.get("Shopping & Lifestyle", 6), type="Expense", payment_method="CreditCard")
            tx4 = Transaction(user_id=user.id, merchant="Blinkit Quick Grocery", amount=2800.0, category_id=cat_map.get("Groceries", 2), type="Expense", payment_method="UPI")
            tx5 = Transaction(user_id=user.id, merchant="BESCOM Electricity Bill", amount=1850.0, category_id=cat_map.get("Utilities & Bills", 4), type="Expense", payment_method="AutoDebit")
            db.add_all([tx1, tx2, tx3, tx4, tx5])
            db.commit()
