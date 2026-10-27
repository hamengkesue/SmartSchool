import os
from fastapi import APIRouter, UploadFile, File, HTTPException
from services.rag_service import index_pdf_document, get_qdrant_points_count

router = APIRouter(prefix="/api/v1", tags=["Knowledge Base & RAG"])

@router.post("/upload-pdf")
async def upload_pdf_knowledge(file: UploadFile = File(...)):
    """
    Menerima berkas PDF pedoman sekolah, mengekstrak teks,
    membuat embedding vektor OpenAI, dan menyimpannya ke Qdrant Cloud.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Hanya berkas berformat PDF yang didukung.")

    try:
        content = await file.read()
        if len(content) > 20 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Ukuran berkas melebihi batas 20 MB.")

        result = index_pdf_document(content, file.filename)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal memproses dokumen ke Qdrant: {str(e)}")

@router.get("/qdrant/stats")
async def get_qdrant_stats():
    """Mengambil status dan jumlah vektor di Qdrant Cloud"""
    try:
        points = get_qdrant_points_count()
        return {
            "status": "connected",
            "qdrantPoints": points,
            "collection": "smartschool_db"
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "qdrantPoints": 0
        }
