# Invoice Scanner

A personal expense tracker for Costa Rican invoices. Upload a photo or PDF of a receipt, and the app extracts the vendor, amount, tax, date, and spending category automatically — no manual data entry required.

**Live app:** https://invoice-scanner-frontend-1rus.onrender.com

> Hosted on Render's free tier. The backend services may take 30–50s to respond on the first request after a period of inactivity (cold start).

## How it works

1. Upload an invoice (image or PDF) from the dashboard.
2. The file is OCR'd — `pdfplumber` for text-based PDFs, or OpenCV preprocessing + Tesseract for scanned documents and images.
3. The extracted text is sent to Gemini, which returns structured JSON (vendor, amount, tax, date, category). If Gemini is unavailable or fails, the app automatically falls back to a set of regex-based extractors tuned for common Costa Rican invoice formats (supermarkets, gas stations, utility bills, professional invoices).
4. The result is saved and shown on the dashboard, with category breakdowns, spending history, and PDF report export.

## Architecture

Three independent services:

```
frontend (React + Vite)
    │  REST / JWT
    ▼
node-api (Express + MongoDB)
    │  multipart forward
    ▼
python-service (FastAPI + OCR + Gemini)
```

- **`frontend/`** — React 19 SPA. Auth, upload, dashboard with category charts, invoice history, client-side PDF report export.
- **`node-api/`** — Express REST API. Handles authentication (JWT + bcrypt), invoice CRUD, and forwards uploaded files to the Python service. Persists to MongoDB Atlas.
- **`python-service/`** — FastAPI microservice. Runs OCR and extracts structured data from invoice text via Gemini, with a regex-based fallback.

## Tech stack

| Layer | Stack |
|---|---|
| Frontend | React 19, Vite, React Router, Axios, Recharts, jsPDF |
| API | Node.js, Express 5, MongoDB (Mongoose), JWT, bcrypt |
| OCR service | Python, FastAPI, Tesseract (pytesseract), OpenCV, pdfplumber, pdf2image |
| Extraction | Google Gemini API (`google-genai`), with a regex fallback |
| Deployment | Render (Blueprint: static site + Node web service + Dockerized Python service) |

## Getting started locally

### Prerequisites
- Node.js 20+
- Python 3.11+
- [Tesseract OCR](https://github.com/tesseract-ocr/tesseract) and [Poppler](https://poppler.freedesktop.org/) installed locally
- A MongoDB Atlas connection string (free tier works)
- A free Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey) (optional — the app works without it, using the regex fallback)

### Setup

Each service has its own `.env.example` — copy it to `.env` and fill in the values.

```bash
# 1) OCR / extraction service
cd python-service
cp .env.example .env
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# 2) API
cd node-api
cp .env.example .env
npm install
node index.js

# 3) Frontend
cd frontend
npm install
npm run dev
```

The frontend expects the API at `http://localhost:3000` by default (override with `VITE_API_URL`).

## Deployment

The repo includes a [`render.yaml`](render.yaml) Blueprint that provisions all three services on Render in one step: a static site for the frontend, a native Node web service for the API, and a Docker-based web service for the Python OCR service (it needs system packages — Tesseract and Poppler — that aren't available on Render's native Python runtime).

To deploy your own copy:
1. Fork/clone the repo and push it to your own GitHub account.
2. In MongoDB Atlas, allow network access from `0.0.0.0/0` (Render's free tier has no static outbound IP).
3. In Render, create a new **Blueprint** and point it at your repo.
4. Provide the secret environment variables when prompted: `MONGODB_URI`, `JWT_SECRET`, and `GEMINI_API_KEY` (optional).
