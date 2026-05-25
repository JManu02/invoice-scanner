import pytesseract
import cv2
import numpy as np
from PIL import Image
import pdfplumber
from pdf2image import convert_from_path
import os

def preprocess_image(image_path: str) -> np.ndarray:
    """Mejora la imagen para que Tesseract lea mejor."""
    img = cv2.imread(image_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    # Elimina ruido
    denoised = cv2.fastNlMeansDenoising(gray, h=30)
    # Binarización adaptativa (mejor para facturas con fondo no uniforme)
    binary = cv2.adaptiveThreshold(
        denoised, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY, 11, 2
    )
    return binary

def extract_text_from_image(image_path: str) -> str:
    """Extrae texto de una imagen con preprocesamiento."""
    processed = preprocess_image(image_path)
    lang = os.getenv("TESSERACT_LANG", "spa+eng")
    config = "--oem 3 --psm 6"
    text = pytesseract.image_to_string(processed, lang=lang, config=config)
    return text.strip()

def extract_text_from_pdf(pdf_path: str) -> str:
    """Intenta extraer texto directo del PDF; si no puede, usa OCR."""
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"

    # Si el PDF no tiene texto seleccionable, convierte a imagen y usa OCR
    if not text.strip():
        images = convert_from_path(pdf_path, dpi=300)
        for img in images:
            text += pytesseract.image_to_string(img, lang=os.getenv("TESSERACT_LANG", "spa+eng"))

    return text.strip()

def extract_text_from_file(file_path: str) -> str:
    """Punto de entrada: detecta el tipo y extrae el texto."""
    extension = file_path.split(".")[-1].lower()
    if extension == "pdf":
        return extract_text_from_pdf(file_path)
    else:
        return extract_text_from_image(file_path)