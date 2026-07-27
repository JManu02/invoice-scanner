import re
from datetime import datetime

def clean(text: str) -> str:
    return " ".join(text.split())

def parse_amount(raw: str) -> float | None:
    """Convierte montos en múltiples formatos CR a float."""
    try:
        cleaned = raw.strip()
        # Elimina prefijos de moneda
        cleaned = re.sub(r'^(CRC|₡|¢|colones)\s*', '', cleaned, flags=re.IGNORECASE).strip()
        cleaned = cleaned.replace(" ", "")

        if "," in cleaned and "." in cleaned:
            if cleaned.index(",") < cleaned.index("."):
                # 10,000.00 → coma=miles, punto=decimal
                cleaned = cleaned.replace(",", "")
            else:
                # 10.000,00 → punto=miles, coma=decimal
                cleaned = cleaned.replace(".", "").replace(",", ".")
        elif "," in cleaned:
            parts = cleaned.split(",")
            if len(parts[-1]) <= 2:
                cleaned = cleaned.replace(",", ".")
            else:
                cleaned = cleaned.replace(",", "")

        amount = float(cleaned)
        if amount > 50_000_000 or amount <= 0:
            return None
        return amount
    except (ValueError, AttributeError):
        return None

def extract_amount(text: str) -> float | None:
    """
    Extrae el monto total soportando todos los formatos de factura CR:
    - Compre Bien / supermercados: TOTAL: 22 255,00
    - Alymo / gasolineras: Total Factura: ₡ 10,000.00
    - Factura Profesional / profesionales: Total: CRC 90,000.00
    - TicoFactura / Alegra: Total: CRC 1,500.00
    """
    patterns = [
        # Formato: Total Factura: ₡ / CRC número
        r"Total\s+Factura[:\s]*(?:CRC|₡|¢)?\s*([\d][\d ,\.]*\d)",
        # Formato: TOTAL: número (supermercados)
        r"^TOTAL[:\s]*(?:CRC|₡|¢)?\s*([\d][\d ,\.]*\d)",
        # Formato: Total: CRC número (Factura Profesional)
        r"Total[:\s]*CRC\s+([\d][\d ,\.]*\d)",
        # Formato genérico Total con moneda
        r"Total[:\s]*(?:CRC|₡|¢)\s*([\d][\d ,\.]*\d)",
        # Formato: Monto:¢número (Alymo)
        r"Monto[:\s]*(?:CRC|₡|¢)([\d][\d ,\.]*\d)",
        # Formato: TOTAL sin moneda
        r"\bTOTAL\b[:\s]*([\d][\d ,\.]*\d)",
    ]

    for pattern in patterns:
        matches = re.findall(pattern, text, re.IGNORECASE | re.MULTILINE)
        if matches:
            for match in reversed(matches):
                result = parse_amount(match)
                if result is not None:
                    return result
    return None

def extract_date(text: str) -> str | None:
    """Busca fechas en todos los formatos CR."""
    patterns = [
        r"Fecha[^:]*:\s*(\d{1,2}[-/]\d{1,2}[-/]\d{4})",
        r"Fecha[^:]*:\s*(\d{4}[-/]\d{1,2}[-/]\d{1,2})",
        r"\b(\d{1,2}/\d{1,2}/\d{4})\b",
        r"\b(\d{4}-\d{1,2}-\d{1,2})\b",
        r"\b(\d{1,2}-\d{1,2}-\d{4})\b",
        r"(\d{2}-\d{2}-\d{4})\s+\d{2}:\d{2}",  # formato Factura Profesional
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1)
    return None

def extract_vendor(text: str) -> str | None:
    """Extrae el nombre del proveedor/emisor."""
    # Patrones específicos por sistema de facturación
    patterns = [
        # Factura Profesional: primera línea con nombre completo
        r"^([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑA-Za-záéíóúñ\s]+(?:S\.A\.|S\.R\.L\.|LTDA\.?|BARBOZA|RODRIGUEZ|QUESADA|VARELA|MORA)?)\n",
        # Emisor explícito
        r"Emisor[:\s]+(.+)",
        # Nombre de empresa en mayúsculas al inicio
        r"^([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ\s,\.&]+(?:S\.A\.|S\.R\.L\.)?)",
    ]

    for pattern in patterns:
        match = re.search(pattern, text, re.MULTILINE)
        if match:
            vendor = match.group(1).strip()
            vendor = re.sub(r'\s+', ' ', vendor)
            if len(vendor) > 3 and len(vendor) <= 100:
                return vendor

    lines = [l.strip() for l in text.split("\n") if l.strip()]
    if lines:
        return lines[0][:100]
    return None

def extract_tax(text: str) -> float | None:
    """
    Extrae IVA/impuesto soportando todos los formatos CR.
    - Supermercados: IMPUESTO: 1 756,83
    - Factura Profesional: Total IVA: + CRC 3,600.00
    - Alymo: Imp. de Ventas (13%): ₡ 0.00
    """
    patterns = [
        r"Total\s+IVA[:\s+]*(?:CRC|₡|¢)?\s*([\d][\d ,\.]*\d)",
        r"IVA\s+Devuelto[:\s-]*(?:CRC|₡|¢)?\s*([\d][\d ,\.]*\d)",
        r"IMPUESTO[:\s]*(?:CRC|₡|¢)?\s*([\d][\d ,\.]*\d)",
        r"Imp\.\s*de\s*Ventas[^:]*[:\s]*(?:CRC|₡|¢)?\s*([\d][\d ,\.]*\d)",
        r"IVA[:\s]*(?:CRC|₡|¢)?\s*([\d][\d ,\.]*\d)",
        r"impuesto[:\s]*(?:CRC|₡|¢)?\s*([\d][\d ,\.]*\d)",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            result = parse_amount(match.group(1))
            if result is not None:
                return result
    return None

def classify_category(text: str) -> str:
    """
    Clasifica por categoría basado en palabras clave de comercios CR.
    Cubre los principales emisores del país.
    """
    categories = {
        "Alimentación": [
            # Supermercados
            "compre bien", "walmart", "maxi pali", "pali", "fresh market",
            "super mas", "automercado", "pequeño mundo", "megasuper",
            "supermercado", "tiquete electronico",
            # Restaurantes y comida
            "restaurante", "soderia", "soda ", "mcdonalds", "burger king",
            "subway", "pizza hut", "dominos", "kfc", "taco bell",
            "panaderia", "pasteleria", "cafeteria", "cafe ", "comida",
            "carniceria", "pescaderia", "fruteria", "verduleria",
        ],
        "Transporte": [
            # Combustible
            "alymo", "gasolinera", "gasolina", "combustible", "super",
            "diesel", "recope", "delta", "servicentro",
            # Transporte
            "uber", "taxi", "didi", "indriver", "peaje", "autopista",
            "autobús", "autobus", "tren", "aeropuerto", "vuelo",
            "parking", "parqueo", "alquiler de vehículo",
        ],
        "Servicios": [
            # Utilities
            "ice", "a y a", "aya", "racsa", "cnfl", "jasec",
            "electricidad", "agua", "internet", "telefono", "celular",
            "cable", "streaming", "netflix", "spotify",
            # Servicios profesionales
            "notaria", "abogado", "contador", "consultor",
            # Gobierno
            "municipalidad", "ccss", "imas", "bncr", "bcr",
        ],
        "Salud": [
            # Farmacias
            "farmacia", "fischel", "chavarria", "sucre", "la bomba",
            "botica", "drogueria", "medicina", "medicamento",
            # Médicos y clínicas
            "clinica", "hospital", "medico", "doctor", "dentist",
            "dental", "odontologo", "optometria", "laboratorio",
            "examen", "consulta medica", "resina", "extraccion",
            "ortodoncia", "radiografia",
        ],
        "Tecnología": [
            "amazon", "apple", "google", "microsoft", "adobe",
            "computadora", "laptop", "celular", "telefono", "samsung",
            "software", "licencia", "hosting", "dominio",
            "electronica", "tec store", "multimax",
        ],
        "Educación": [
            "universidad", "colegio", "escuela", "instituto", "curso",
            "matricula", "mensualidad", "beca", "libro", "librería",
            "útiles", "utiles",
        ],
        "Hogar": [
            "ferreteria", "el lagar", "construplaza", "novyplaza",
            "muebles", "electrodomestico", "pinturas", "cemento",
            "EPA", "cemaco", "cuestamoras",
        ],
    }

    text_lower = text.lower()
    for category, keywords in categories.items():
        for keyword in keywords:
            if keyword.lower() in text_lower:
                return category
    return "Otros"

def extract_invoice_data_regex(text: str) -> dict:
    """Extracción por regex (fallback). Devuelve JSON estructurado."""
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