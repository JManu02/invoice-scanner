import re
from datetime import datetime

def clean(text: str) -> str:
    return " ".join(text.split())

def parse_amount(raw: str) -> float | None:
    try:
        cleaned = raw.strip().replace(" ", "")
        # Formato: 10,000.00 (coma=miles, punto=decimal)
        if "," in cleaned and "." in cleaned:
            if cleaned.index(",") < cleaned.index("."):
                # coma antes que punto: 10,000.00
                cleaned = cleaned.replace(",", "")
            else:
                # punto antes que coma: 10.000,00 (formato europeo)
                cleaned = cleaned.replace(".", "").replace(",", ".")
        elif "," in cleaned:
            parts = cleaned.split(",")
            if len(parts[-1]) <= 2:
                # 10,00 → decimal
                cleaned = cleaned.replace(",", ".")
            else:
                # 10,000 → miles sin decimal
                cleaned = cleaned.replace(",", "")
        amount = float(cleaned)
        if amount > 50_000_000:
            return None
        return amount
    except ValueError:
        return None

def extract_amount(text: str) -> float | None:
    patterns = [
        r"TOTAL[:\s]*[₡¢]?\s*([\d][\d \.,]*\d)",
        r"Total Factura[:\s]*[₡¢]?\s*([\d][\d \.,]*\d)",
        r"Monto[:\s]*[₡¢]([\d][\d \.,]*\d)",
        r"Sub Total[:\s]*[₡¢]?\s*([\d][\d \.,]*\d)",
    ]
    for pattern in patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        if matches:
            for match in reversed(matches):
                result = parse_amount(match)
                if result is not None and result > 0:
                    return result
    return None

def extract_date(text: str) -> str | None:
    """Busca fechas en formatos costarricenses."""
    patterns = [
        r"\b(\d{1,2}/\d{1,2}/\d{4})\b",
        r"Fecha[:\s]+(\d{1,2}/\d{1,2}/\d{4})",
        r"FECHA[:\s]+(\d{1,2}/\d{1,2}/\d{4})",
        r"\b(\d{4}-\d{1,2}-\d{1,2})\b",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1)
    return None

def extract_vendor(text: str) -> str | None:
    """Extrae el nombre del proveedor."""
    # Busca patrones comunes en facturas CR
    patterns = [
        r"^([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ\s,\.]+(?:S\.A\.|S\.R\.L\.|LTDA\.?)?)",
        r"Emisor[:\s]+(.+)",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
        if match:
            vendor = match.group(1).strip()[:100]
            if len(vendor) > 3:
                return vendor

    # Fallback: primera línea no vacía
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    if lines:
        return lines[0][:100]
    return None

def extract_tax(text: str) -> float | None:
    """Busca IVA o impuesto en formato costarricense."""
    patterns = [
        r"IMPUESTO[:\s]*[₡¢]?\s*([\d\s]+,\d{2})",
        r"Imp\.\s*de\s*Ventas[^:]*[:\s]*[₡¢]?\s*([\d\s]+,\d{2})",
        r"IVA[:\s]*[₡¢]?\s*([\d\s]+,\d{2})",
        r"impuesto[:\s]*[₡¢]?\s*([\d\s]+,\d{2})",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return parse_amount(match.group(1))
    return None

def classify_category(text: str) -> str:
    """Clasifica la factura por palabras clave."""
    categories = {
        "Alimentación": ["supermercado", "compre bien", "tiquete", "restaurante", "comida", "sodería", "panadería", "carnicería"],
        "Transporte": ["gasolina", "combustible", "super", "diesel", "gasolinera", "alymo", "recope", "uber", "taxi", "peaje"],
        "Servicios": ["internet", "electricidad", "agua", "telefono", "luz", "gas", "ICE", "AyA", "RACSA"],
        "Salud": ["farmacia", "médico", "hospital", "clinica", "medicina", "caja", "CCSS"],
        "Tecnología": ["amazon", "apple", "google", "microsoft", "software", "hardware", "computadora"],
    }
    text_lower = text.lower()
    for category, keywords in categories.items():
        for keyword in keywords:
            if keyword.lower() in text_lower:
                return category
    return "Otros"

def extract_invoice_data(text: str) -> dict:
    """Orquesta la extracción y devuelve JSON limpio."""
    return {
        "vendor": extract_vendor(text),
        "amount": extract_amount(text),
        "date": extract_date(text),
        "tax": extract_tax(text),
        "category": classify_category(text),
        "raw_text": text[:500],
        "processed_at": datetime.utcnow().isoformat(),
        "currency": "CRC",
    }