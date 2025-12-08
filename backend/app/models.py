from datetime import date
from typing import Optional

from sqlmodel import Field, SQLModel


class TransactionBase(SQLModel):
    date: str
    time: Optional[str] = Field(default=None)
    type: str = Field(default="expense")  # "income" or "expense"
    category: str
    amount: float
    notes: Optional[str] = Field(default=None)


class Transaction(TransactionBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)


class TransactionCreate(TransactionBase):
    pass


class TransactionRead(TransactionBase):
    id: int


class TransactionUpdate(SQLModel):
    date: Optional[str] = Field(default=None)
    time: Optional[str] = Field(default=None)
    type: Optional[str] = Field(default=None)
    category: Optional[str] = Field(default=None)
    amount: Optional[float] = Field(default=None)
    notes: Optional[str] = Field(default=None)


class Summary(SQLModel):
    total: float
    count: int
