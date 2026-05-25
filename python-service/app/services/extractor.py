import re
from datetime import datetime

def clean(text: str) -> str:
    return " ".join(text.split())

def extract_amount(text: str) -> float | None:
    """Busca el monto total en el texto."""
    patterns = [
        r"total\s*:?\s*\$?\s*([\d,]+\.?\d*)",
        r"monto\s*:?\s*\$?\s*([\d,]+\.?\d*)",
        r"importe\s*:?\s*\$?\s*([\d,]+\.?\d*)",
        r"amount\s*:?\s*\$?\s*([\d,]+\.?\d*)",
        r"\$\s*([\d,]+\.?\d*)",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            raw = match.group(1).replace(",", "")
            try:
                return float(raw)
            except ValueError:
                continue
    return None

def extract_date(text: str) -> str | None:
    """Busca fechas en formatos comunes."""
    patterns = [
        r"\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b",
        r"\b(\d{4}[/-]\d{1,2}[/-]\d{1,2})\b",
        r"\b(\d{1,2}\s+(?:enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+\d{4})\b",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1)
    return None

def extract_vendor(text: str) -> str | None:
    """Toma las primeras líneas no vacías como nombre del proveedor."""
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    if lines:
        return lines[0][:100]  # Máximo 100 caracteres
    return None

def extract_tax(text: str) -> float | None:
    """Busca IVA o impuesto en el texto."""
    patterns = [
        r"iva\s*:?\s*\$?\s*([\d,]+\.?\d*)",
        r"impuesto\s*:?\s*\$?\s*([\d,]+\.?\d*)",
        r"tax\s*:?\s*\$?\s*([\d,]+\.?\d*)",
        r"igv\s*:?\s*\$?\s*([\d,]+\.?\d*)",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            raw = match.group(1).replace(",", "")
            try:
                return float(raw)
            except ValueError:
                continue
    return None

def classify_category(text: str) -> str:
    """Clasifica la factura en una categoría según palabras clave."""
    categories = {
        "Alimentación": ["supermercado", "restaurante", "comida", "food", "grocery", "cafe"],
        "Transporte": ["gasolina", "combustible", "uber", "taxi", "peaje", "parking", "gasolinera"],
        "Servicios": ["internet", "electricidad", "agua", "telefono", "luz", "gas"],
        "Salud": ["farmacia", "médico", "hospital", "clinica", "medicina"],
        "Tecnología": ["amazon", "apple", "google", "microsoft", "software", "hardware"],
    }
    text_lower = text.lower()
    for category, keywords in categories.items():
        for keyword in keywords:
            if keyword in text_lower:
                return category
    return "Otros"

def extract_invoice_data(text: str) -> dict:
    """Orquesta toda la extracción y devuelve un JSON limpio."""
    return {
        "vendor": extract_vendor(text),
        "amount": extract_amount(text),
        "date": extract_date(text),
        "tax": extract_tax(text),
        "category": classify_category(text),
        "raw_text": text[:500],  # Primeros 500 chars para debug
        "processed_at": datetime.utcnow().isoformat(),
    }