import json
import logging
import os

from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

VALID_CATEGORIES = {
    "Alimentación", "Transporte", "Servicios", "Salud",
    "Tecnología", "Educación", "Hogar", "Otros",
}

REQUIRED_KEYS = ("vendor", "amount", "date", "tax", "category")

MAX_INPUT_CHARS = 6000

PROMPT_TEMPLATE = """Eres un extractor de datos de facturas electrónicas de Costa Rica.
A continuación tienes el TEXTO CRUDO obtenido por OCR de una factura (puede tener errores de reconocimiento, saltos de línea raros o ruido). Extrae los siguientes campos y responde ÚNICAMENTE con un JSON válido, sin explicaciones ni markdown:

{{
  "vendor": string o null,      // nombre del comercio/emisor
  "amount": number o null,      // monto TOTAL de la factura, en colones (CRC), como número (sin símbolos ni separadores de miles)
  "date": string o null,        // fecha de la factura en formato YYYY-MM-DD
  "tax": number o null,         // monto de IVA/impuesto, como número
  "category": string            // una de: Alimentación, Transporte, Servicios, Salud, Tecnología, Educación, Hogar, Otros
}}

Reglas:
- Si un campo no aparece o no estás seguro, usa null (menos "category", que siempre debe tener un valor de la lista).
- No inventes datos que no estén en el texto.
- El monto y el impuesto son números en colones costarricenses, sin símbolos de moneda.

TEXTO DE LA FACTURA:
---
{invoice_text}
---
"""


class GeminiExtractionError(Exception):
    """Se lanza cuando Gemini no puede producir un JSON válido y completo."""


def is_gemini_available() -> bool:
    return bool(os.getenv("GEMINI_API_KEY"))


def _get_client() -> genai.Client:
    return genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def _coerce_number(value):
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return float(value)
    try:
        return float(str(value).strip())
    except (ValueError, TypeError):
        return None


def _validate_and_normalize(data: dict) -> dict:
    if not isinstance(data, dict):
        raise GeminiExtractionError("La respuesta de Gemini no es un objeto JSON")

    missing = [key for key in REQUIRED_KEYS if key not in data]
    if missing:
        raise GeminiExtractionError(f"Faltan campos en la respuesta de Gemini: {missing}")

    category = data.get("category")
    if category not in VALID_CATEGORIES:
        category = "Otros"

    return {
        "vendor": data.get("vendor") or None,
        "amount": _coerce_number(data.get("amount")),
        "date": data.get("date") or None,
        "tax": _coerce_number(data.get("tax")),
        "category": category,
    }


def extract_invoice_data_gemini(text: str) -> dict:
    """
    Envía el texto OCR a Gemini y devuelve dict con:
    vendor, amount, date, tax, category
    Lanza GeminiExtractionError si algo falla.
    """
    if not is_gemini_available():
        raise GeminiExtractionError("GEMINI_API_KEY no está configurada")

    try:
        client = _get_client()
        prompt = PROMPT_TEMPLATE.format(invoice_text=text[:MAX_INPUT_CHARS])
        response = client.models.generate_content(
            model=os.getenv("GEMINI_MODEL", "gemini-flash-latest"),
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                http_options=types.HttpOptions(timeout=20_000),
            ),
        )
    except Exception as e:
        raise GeminiExtractionError(f"Fallo al llamar a la API de Gemini: {e}") from e

    try:
        data = json.loads(response.text)
    except (json.JSONDecodeError, AttributeError, ValueError) as e:
        raise GeminiExtractionError(f"Respuesta de Gemini no es JSON válido: {e}") from e

    return _validate_and_normalize(data)
