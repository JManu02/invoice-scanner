FROM python:3.11-slim

# tesseract-ocr + tesseract-ocr-spa: motor OCR y paquete de idioma español (TESSERACT_LANG=spa+eng)
# poppler-utils: requerido por pdf2image.convert_from_path
# libgl1/libglib2.0-0/libsm6/libxext6/libxrender1: librerías nativas que necesita opencv-python
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    tesseract-ocr-spa \
    poppler-utils \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
