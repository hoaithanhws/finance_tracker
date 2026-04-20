import logging
import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.models import Category, Transaction, User  # noqa: F401 (register models)
from app.routers import auth, categories, transactions

load_dotenv()

logger = logging.getLogger(__name__)

app = FastAPI(title="Personal Finance Tracker API", version="1.0.0")


@app.on_event("startup")
def startup():
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        logger.error(f"Could not create tables: {e}")

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(transactions.router, prefix="/transactions", tags=["transactions"])
app.include_router(categories.router, prefix="/categories", tags=["categories"])


@app.get("/")
def root():
    return {"status": "ok", "message": "Finance Tracker API"}
