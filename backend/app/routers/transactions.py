from datetime import date
from decimal import Decimal
from typing import List, Optional

from dateutil.relativedelta import relativedelta
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import extract, func
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.dependencies import get_current_user
from app.models.category import Category
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.transaction import (
    MonthlyChartItem,
    MonthlyChartOut,
    SummaryOut,
    TransactionCreate,
    TransactionOut,
    TransactionUpdate,
)

router = APIRouter()


def _ensure_category_owned(db: Session, user_id: int, category_id: Optional[int]) -> None:
    if category_id is None:
        return
    category = (
        db.query(Category)
        .filter(Category.id == category_id, Category.user_id == user_id)
        .first()
    )
    if not category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Danh mục không hợp lệ",
        )


@router.get("", response_model=List[TransactionOut])
def list_transactions(
    type: Optional[str] = Query(default=None, pattern="^(income|expense)$"),
    category_id: Optional[int] = None,
    month: Optional[int] = Query(default=None, ge=1, le=12),
    year: Optional[int] = Query(default=None, ge=1970, le=3000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = (
        db.query(Transaction)
        .options(joinedload(Transaction.category))
        .filter(Transaction.user_id == current_user.id)
    )
    if type:
        q = q.filter(Transaction.type == type)
    if category_id:
        q = q.filter(Transaction.category_id == category_id)
    if month:
        q = q.filter(extract("month", Transaction.date) == month)
    if year:
        q = q.filter(extract("year", Transaction.date) == year)
    return q.order_by(Transaction.date.desc(), Transaction.id.desc()).all()


@router.post("", response_model=TransactionOut, status_code=status.HTTP_201_CREATED)
def create_transaction(
    payload: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _ensure_category_owned(db, current_user.id, payload.category_id)
    tx = Transaction(
        amount=payload.amount,
        type=payload.type,
        description=payload.description,
        date=payload.date,
        category_id=payload.category_id,
        user_id=current_user.id,
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx


@router.put("/{transaction_id}", response_model=TransactionOut)
def update_transaction(
    transaction_id: int,
    payload: TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tx = (
        db.query(Transaction)
        .filter(Transaction.id == transaction_id, Transaction.user_id == current_user.id)
        .first()
    )
    if not tx:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy giao dịch")

    update_data = payload.model_dump(exclude_unset=True)
    if "category_id" in update_data:
        _ensure_category_owned(db, current_user.id, update_data["category_id"])

    for key, value in update_data.items():
        setattr(tx, key, value)

    db.commit()
    db.refresh(tx)
    return tx


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tx = (
        db.query(Transaction)
        .filter(Transaction.id == transaction_id, Transaction.user_id == current_user.id)
        .first()
    )
    if not tx:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy giao dịch")
    db.delete(tx)
    db.commit()
    return None


@router.get("/summary", response_model=SummaryOut)
def summary(
    month: Optional[int] = Query(default=None, ge=1, le=12),
    year: Optional[int] = Query(default=None, ge=1970, le=3000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date.today()
    month = month or today.month
    year = year or today.year

    rows = (
        db.query(Transaction.type, func.coalesce(func.sum(Transaction.amount), 0))
        .filter(Transaction.user_id == current_user.id)
        .filter(extract("month", Transaction.date) == month)
        .filter(extract("year", Transaction.date) == year)
        .group_by(Transaction.type)
        .all()
    )

    totals = {t: Decimal(v) for t, v in rows}
    income = totals.get("income", Decimal("0"))
    expense = totals.get("expense", Decimal("0"))

    return SummaryOut(
        month=month,
        year=year,
        total_income=income,
        total_expense=expense,
        balance=income - expense,
    )


@router.get("/monthly-chart", response_model=MonthlyChartOut)
def monthly_chart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date.today()
    start = (today.replace(day=1) - relativedelta(months=5))

    rows = (
        db.query(
            extract("year", Transaction.date).label("y"),
            extract("month", Transaction.date).label("m"),
            Transaction.type,
            func.coalesce(func.sum(Transaction.amount), 0).label("total"),
        )
        .filter(Transaction.user_id == current_user.id)
        .filter(Transaction.date >= start)
        .group_by("y", "m", Transaction.type)
        .all()
    )

    buckets: dict[str, dict[str, Decimal]] = {}
    for i in range(6):
        d = start + relativedelta(months=i)
        key = f"{d.year:04d}-{d.month:02d}"
        buckets[key] = {"income": Decimal("0"), "expense": Decimal("0")}

    for y, m, t, total in rows:
        key = f"{int(y):04d}-{int(m):02d}"
        if key in buckets:
            buckets[key][t] = Decimal(total)

    data = [
        MonthlyChartItem(month=key, income=vals["income"], expense=vals["expense"])
        for key, vals in buckets.items()
    ]
    return MonthlyChartOut(data=data)
