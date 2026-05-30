from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.routes import invoice
import os
import pytesseract

load_dotenv()

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

app = FastAPI(
    title="Invoice Scanner API",
    description="Microservicio de extracción de datos de facturas con OCR",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(invoice.router, prefix="/api/invoices", tags=["invoices"])

@app.get("/")
def health_check():
    return {"status": "ok", "service": "python-invoice-processor"}