import io
import os
from fastapi import APIRouter, UploadFile, File, HTTPException
from services.rag_service import index_pdf_document, get_qdrant_points_count
from pypdf import PdfReader

router = APIRouter(prefix="/api/v1", tags=["Knowledge Base & RAG"])

@router.post("/extract-pdf-text")
async def extract_pdf_text(file: UploadFile = File(...)):
    """
    Ekstrak teks dari berkas PDF yang diunggah pengguna di chat room.
    Hasilnya dikirimkan kembali ke frontend dan disertakan dalam pesan chat
    agar AI dapat membaca dan merangkum dokumen PDF tersebut.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Hanya berkas PDF yang didukung.")

    try:
        content = await file.read()
        if len(content) > 20 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Ukuran berkas melebihi batas 20 MB.")

        reader = PdfReader(io.BytesIO(content))
        pages_text = []
        for page_idx, page in enumerate(reader.pages):
            page_text = page.extract_text() or ""
            if page_text.strip():
                pages_text.append(f"[Halaman {page_idx + 1}]\n{page_text.strip()}")

        full_text = "\n\n".join(pages_text)

        if not full_text.strip():
            raise HTTPException(
                status_code=422,
                detail="Tidak ada teks yang dapat diekstrak dari PDF ini (mungkin berupa gambar/scan)."
            )

        return {
            "filename": file.filename,
            "total_pages": len(reader.pages),
            "text": full_text,
            "char_count": len(full_text),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal memproses PDF: {str(e)}")


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
            "collection": "testing_collection"
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "qdrantPoints": 0
        }
