from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, col
from pydantic import BaseModel
import datetime

from app.db.session import get_db
from app.models.entities import User, Transaction, Category, MerchantMapping
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()

class TransactionCreate(BaseModel):
    merchant: str
    amount: float
    date: Optional[str] = None
    category_id: Optional[int] = None
    category_name: Optional[str] = None
    type: str = "Expense"
    payment_method: str = "UPI"
    notes: Optional[str] = None

@router.get("/")
def get_transactions(
    category_id: Optional[int] = None,
    type: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = select(Transaction).where(Transaction.user_id == current_user.id)
    if category_id:
        query = query.where(Transaction.category_id == category_id)
    if type:
        query = query.where(Transaction.type == type)
    if search:
        query = query.where(col(Transaction.merchant).ilike(f"%{search}%"))
    
    query = query.order_by(col(Transaction.date).desc()).offset(offset).limit(limit)
    transactions = db.exec(query).all()
    
    categories = db.exec(select(Category)).all()
    cat_map = {c.id: c.name for c in categories}
    
    items = []
    for t in transactions:
        t_dict = t.dict()
        t_dict["category_name"] = cat_map.get(t.category_id, "Other Expenses")
        items.append(t_dict)
    
    total = len(db.exec(select(Transaction).where(Transaction.user_id == current_user.id)).all())
    
    return {
        "items": items,
        "total": total,
        "limit": limit,
        "offset": offset
    }

@router.post("/")
def create_transaction(
    req: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        tx_date = datetime.datetime.strptime(req.date, "%Y-%m-%d").date() if req.date else datetime.date.today()
    except Exception:
        tx_date = datetime.date.today()

    category_id = req.category_id
    if not category_id and req.category_name:
        cat = db.exec(select(Category).where(Category.name == req.category_name)).first()
        if cat:
            category_id = cat.id

    if not category_id:
        # Check Merchant Mapping DB
        mapping = db.exec(select(MerchantMapping).where(MerchantMapping.raw_merchant.ilike(f"%{req.merchant}%"))).first()
        if mapping:
            category_id = mapping.mapped_category_id
        else:
            m_lower = req.merchant.lower()
            cat_name = None
            if any(k in m_lower for k in ["salary", "office", "payroll", "stipend"]):
                cat_name = "Salary & Income"
            elif any(k in m_lower for k in ["swiggy", "zomato", "restaurant", "cafe", "food", "dining"]):
                cat_name = "Food & Dining"
            elif any(k in m_lower for k in ["blinkit", "zepto", "grocery", "groceries", "supermarket"]):
                cat_name = "Groceries"
            elif any(k in m_lower for k in ["rent", "housing", "maintenance", "landlord"]):
                cat_name = "Rent & Housing"
            elif any(k in m_lower for k in ["utility", "utilities", "electricity", "bescom", "water", "bill"]):
                cat_name = "Utilities & Bills"
            elif any(k in m_lower for k in ["amazon", "flipkart", "myntra", "shopping", "store"]):
                cat_name = "Shopping & Lifestyle"
            elif any(k in m_lower for k in ["uber", "ola", "irctc", "fuel", "petrol", "transport", "travel"]):
                cat_name = "Travel & Transport"
            elif any(k in m_lower for k in ["apollo", "pharmacy", "health", "hospital", "doctor"]):
                cat_name = "Medical & Health"
            elif any(k in m_lower for k in ["zerodha", "groww", "sip", "investment", "mutual fund"]):
                cat_name = "Investments & SIP"
            elif any(k in m_lower for k in ["netflix", "spotify", "chatgpt", "subscription"]):
                cat_name = "Subscriptions"

            if cat_name:
                cat = db.exec(select(Category).where(Category.name == cat_name)).first()
                if cat:
                    category_id = cat.id

    if not category_id:
        other_cat = db.exec(select(Category).where(Category.name == "Other Expenses")).first()
        category_id = other_cat.id if other_cat else 11

    new_tx = Transaction(
        user_id=current_user.id,
        merchant=req.merchant,
        amount=req.amount,
        date=tx_date,
        category_id=category_id,
        type=req.type,
        payment_method=req.payment_method,
        notes=req.notes,
        source="Manual"
    )
    db.add(new_tx)
    db.commit()
    db.refresh(new_tx)

    cat_obj = db.get(Category, new_tx.category_id)
    tx_res = new_tx.dict()
    tx_res["category_name"] = cat_obj.name if cat_obj else "Other Expenses"
    return tx_res

@router.delete("/{tx_id}")
def delete_transaction(
    tx_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tx = db.get(Transaction, tx_id)
    if not tx or tx.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Transaction not found")
    db.delete(tx)
    db.commit()
    return {"message": "Transaction deleted successfully"}
