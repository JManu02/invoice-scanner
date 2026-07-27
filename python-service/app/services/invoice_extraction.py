import logging
from datetime import datetime

from app.services.extractor import extract_invoice_data_regex
from app.services.gemini_extractor import (
    GeminiExtractionError,
    extract_invoice_data_gemini,
    is_gemini_available,
)

logger = logging.getLogger(__name__)


def extract_invoice_data(text: str) -> dict:
    """Orquesta la extracción: Gemini como método principal, regex como fallback."""
    if is_gemini_available():
        try:
            data = extract_invoice_data_gemini(text)
            data["raw_text"] = text[:500]
            data["processed_at"] = datetime.utcnow().isoformat()
            data["currency"] = "CRC"
            return data
        except GeminiExtractionError as e:
            logger.warning(f"Gemini falló, usando fallback regex: {e}")

    return extract_invoice_data_regex(text)
