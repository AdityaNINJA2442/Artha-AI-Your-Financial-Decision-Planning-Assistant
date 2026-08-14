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
    if not category_id:
        # Check Merchant Mapping DB
        mapping = db.exec(select(MerchantMapping).where(MerchantMapping.raw_merchant.ilike(f"%{req.merchant}%"))).first()
        if mapping:
            category_id = mapping.mapped_category_id
        else:
            default_cat = db.exec(select(Category).where(Category.name == "Food & Dining")).first()
            category_id = default_cat.id if default_cat else 1

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
    return new_tx

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
