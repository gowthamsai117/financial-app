from typing import List, Optional

from sqlmodel import Session, select

from .models import Transaction, TransactionCreate, TransactionUpdate, Summary


def list_transactions(session: Session) -> List[Transaction]:
    return session.exec(select(Transaction).order_by(Transaction.date.desc())).all()


def get_transaction(session: Session, transaction_id: int) -> Optional[Transaction]:
    return session.get(Transaction, transaction_id)


def create_transaction(session: Session, payload: TransactionCreate) -> Transaction:
    tx = Transaction.from_orm(payload)
    session.add(tx)
    session.commit()
    session.refresh(tx)
    return tx


def update_transaction(session: Session, transaction_id: int, payload: TransactionUpdate) -> Optional[Transaction]:
    tx = session.get(Transaction, transaction_id)
    if not tx:
        return None
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(tx, key, value)
    session.add(tx)
    session.commit()
    session.refresh(tx)
    return tx


def delete_transaction(session: Session, transaction_id: int) -> bool:
    tx = session.get(Transaction, transaction_id)
    if not tx:
        return False
    session.delete(tx)
    session.commit()
    return True


def summary(session: Session) -> Summary:
    txs = session.exec(select(Transaction)).all()
    total = sum(tx.amount for tx in txs)
    count = len(txs)
    return Summary(total=total, count=count)
