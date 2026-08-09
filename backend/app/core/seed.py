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

    # 3. Seed Demo User Account (aditya@artha.ai)
    demo_user = db.exec(select(User).where(User.email == "aditya@artha.ai")).first()
    if not demo_user:
        demo_user = User(
            email="aditya@artha.ai",
            password_hash=get_password_hash("password123"),
            is_active=True,
            is_admin=True
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)

        # Profile
        profile = UserProfile(
            user_id=demo_user.id,
            name="Aditya Prakash",
            age=28,
            occupation="Salaried",
            country="India",
            city="Bengaluru",
            annual_income=1200000.0,
            monthly_income=100000.0,
            family_status="Single",
            monthly_fixed_expenses=40000.0,
            current_savings=250000.0,
            current_investments=120000.0,
            emergency_fund=80000.0,
            risk_preference="Moderate"
        )
        db.add(profile)

        # Transactions
        transactions = [
            Transaction(user_id=demo_user.id, merchant="Salary Credit - TechCorp", amount=100000.0, category_id=cat_map["Salary & Income"], type="Income", payment_method="NetBanking"),
            Transaction(user_id=demo_user.id, merchant="House Rent - Landlord", amount=20000.0, category_id=cat_map["Rent & Housing"], type="Expense", payment_method="NetBanking"),
            Transaction(user_id=demo_user.id, merchant="SWIGGY Gourmet", amount=12400.0, category_id=cat_map["Food & Dining"], type="Expense", payment_method="UPI"),
            Transaction(user_id=demo_user.id, merchant="Zerodha Nifty SIP", amount=15000.0, category_id=cat_map["Investments & SIP"], type="Expense", payment_method="UPI"),
            Transaction(user_id=demo_user.id, merchant="Blinkit Quick Grocery", amount=8500.0, category_id=cat_map["Groceries"], type="Expense", payment_method="UPI"),
            Transaction(user_id=demo_user.id, merchant="BESCOM Electricity Bill", amount=2300.0, category_id=cat_map["Utilities & Bills"], type="Expense", payment_method="UPI"),
            Transaction(user_id=demo_user.id, merchant="Amazon India Shopping", amount=4200.0, category_id=cat_map["Shopping & Lifestyle"], type="Expense", payment_method="Credit Card"),
            Transaction(user_id=demo_user.id, merchant="Netflix India", amount=649.0, category_id=cat_map["Subscriptions"], type="Expense", payment_method="Credit Card"),
            Transaction(user_id=demo_user.id, merchant="ChatGPT Plus", amount=1999.0, category_id=cat_map["Subscriptions"], type="Expense", payment_method="Credit Card")
        ]
        for tx in transactions:
            db.add(tx)

        # Goal
        car_goal = FinancialGoal(
            user_id=demo_user.id,
            goal_name="Car Purchase Fund",
            target_amount=1000000.0,
            current_amount=240000.0,
            target_date=datetime.date(2028, 12, 31),
            priority="High",
            monthly_contribution=15000.0,
            status="In Progress"
        )
        db.add(car_goal)

        # Financial Score
        score = FinancialScore(
            user_id=demo_user.id,
            overall_score=82,
            savings_ratio_score=18,
            emergency_fund_score=14,
            debt_burden_score=15,
            investment_ratio_score=15,
            spending_discipline_score=10,
            subscription_burden_score=10,
            computed_at=datetime.datetime.utcnow()
        )
        db.add(score)

        db.commit()
