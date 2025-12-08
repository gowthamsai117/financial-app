from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session

from .db import init_db, get_session
from .models import Transaction, TransactionCreate, TransactionRead, TransactionUpdate, Summary
from . import crud

app = FastAPI(title="Financial Tracker")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://*.netlify.app",
        "https://*.vercel.app",
        "*"  # For development - restrict in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/api/transactions", response_model=list[TransactionRead])
def list_transactions(session: Session = Depends(get_session)):
    return crud.list_transactions(session)


@app.post("/api/transactions", response_model=TransactionRead, status_code=201)
def create_transaction(payload: TransactionCreate, session: Session = Depends(get_session)):
    return crud.create_transaction(session, payload)


@app.get("/api/transactions/{transaction_id}", response_model=TransactionRead)
def get_transaction(transaction_id: int, session: Session = Depends(get_session)):
    tx = crud.get_transaction(session, transaction_id)
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return tx


@app.put("/api/transactions/{transaction_id}", response_model=TransactionRead)
def update_transaction(transaction_id: int, payload: TransactionUpdate, session: Session = Depends(get_session)):
    tx = crud.update_transaction(session, transaction_id, payload)
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return tx


@app.delete("/api/transactions/{transaction_id}", status_code=204)
def delete_transaction(transaction_id: int, session: Session = Depends(get_session)):
    deleted = crud.delete_transaction(session, transaction_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return None


@app.get("/api/reports/summary", response_model=Summary)
def get_summary(session: Session = Depends(get_session)):
    return crud.summary(session)
