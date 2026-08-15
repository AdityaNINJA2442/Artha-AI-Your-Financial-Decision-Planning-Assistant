import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlmodel import select
from app.db.session import SessionLocal, init_db
from app.models.entities import Transaction, Category, MerchantMapping

def recategorize_existing_transactions():
    init_db()
    db = SessionLocal()
    print("==========================================================")
    print("  RECATEGORIZING DEMO TRANSACTIONS FROM 'OTHER EXPENSES'")
    print("==========================================================")

    categories = db.exec(select(Category)).all()
    cat_map = {c.name.lower(): c.id for c in categories}

    txs = db.exec(select(Transaction)).all()
    recategorized_count = 0

    for t in txs:
        m_lower = t.merchant.lower()
        new_cat_id = None

        if "salary" in m_lower or "employer" in m_lower or "paycheck" in m_lower:
            new_cat_id = cat_map.get("salary & income", 10)
            t.type = "Income"
        elif "swiggy" in m_lower or "zomato" in m_lower or "restaurant" in m_lower or "coffee" in m_lower or "starbucks" in m_lower or "dining" in m_lower:
            new_cat_id = cat_map.get("food & dining", 1)
        elif "blinkit" in m_lower or "zepto" in m_lower or "grocery" in m_lower or "supermarket" in m_lower or "nature basket" in m_lower:
            new_cat_id = cat_map.get("groceries", 2)
        elif "rent" in m_lower or "housing" in m_lower or "landlord" in m_lower or "maintenance" in m_lower:
            new_cat_id = cat_map.get("rent & housing", 3)
        elif "electricity" in m_lower or "bescom" in m_lower or "fiber" in m_lower or "broadband" in m_lower or "bill" in m_lower or "utility" in m_lower:
            new_cat_id = cat_map.get("utilities & bills", 4)
        elif "netflix" in m_lower or "spotify" in m_lower or "chatgpt" in m_lower or "subscription" in m_lower:
            new_cat_id = cat_map.get("subscriptions", 5)
        elif "amazon" in m_lower or "myntra" in m_lower or "zara" in m_lower or "electronics" in m_lower or "shopping" in m_lower or "fashion" in m_lower:
            new_cat_id = cat_map.get("shopping & lifestyle", 6)
        elif "uber" in m_lower or "fastag" in m_lower or "petrol" in m_lower or "fuel" in m_lower or "commute" in m_lower or "irctc" in m_lower:
            new_cat_id = cat_map.get("travel & transport", 7)
        elif "pharmacy" in m_lower or "apollo" in m_lower or "meds" in m_lower or "cult.fit" in m_lower or "health" in m_lower or "gym" in m_lower:
            new_cat_id = cat_map.get("medical & health", 8)
        elif "zerodha" in m_lower or "groww" in m_lower or "sip" in m_lower or "mutual fund" in m_lower or "index" in m_lower or "flexi cap" in m_lower:
            new_cat_id = cat_map.get("investments & sip", 9)

        if new_cat_id and t.category_id != new_cat_id:
            t.category_id = new_cat_id
            db.add(t)
            recategorized_count += 1

    db.commit()
    db.close()
    print(f"  [PASS] Recategorized {recategorized_count} transactions into realistic categories!")
    print("==========================================================")

if __name__ == "__main__":
    recategorize_existing_transactions()
