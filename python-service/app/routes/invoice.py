from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.ocr_service import extract_text_from_file
from app.services.extractor import extract_invoice_data
import shutil, os, uuid

router = APIRouter()

UPLOAD_DIR = "temp_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/process")
async def process_invoice(file: UploadFile = File(...)):
    # Validar tipo de archivo
    allowed_types = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Tipo de archivo no permitido")

    # Guardar temporalmente
    file_id = str(uuid.uuid4())
    extension = file.filename.split(".")[-1]
    temp_path = f"{UPLOAD_DIR}/{file_id}.{extension}"

    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        raw_text = extract_text_from_file(temp_path)
        invoice_data = extract_invoice_data(raw_text)
        return {"success": True, "data": invoice_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        os.remove(temp_path)  # Limpia el archivo temporal