from datetime import date
from decimal import Decimal
from typing import Annotated, List, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.category import CategoryOut


class TransactionBase(BaseModel):
    amount: Annotated[Decimal, Field(gt=0, max_digits=12, decimal_places=2)]
    type: Literal["income", "expense"]
    description: Optional[str] = Field(default=None, max_length=255)
    date: date
    category_id: Optional[int] = None


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    amount: Optional[Annotated[Decimal, Field(gt=0, max_digits=12, decimal_places=2)]] = None
    type: Optional[Literal["income", "expense"]] = None
    description: Optional[str] = Field(default=None, max_length=255)
    date: Optional[date] = None
    category_id: Optional[int] = None


class TransactionOut(TransactionBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    category: Optional[CategoryOut] = None


class SummaryOut(BaseModel):
    month: int
    year: int
    total_income: Decimal
    total_expense: Decimal
    balance: Decimal


class MonthlyChartItem(BaseModel):
    month: str  # e.g. "2026-04"
    income: Decimal
    expense: Decimal


class MonthlyChartOut(BaseModel):
    data: List[MonthlyChartItem]
