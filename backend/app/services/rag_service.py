import os
import io
import uuid
from pathlib import Path
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
from openai import OpenAI
from qdrant_client import QdrantClient
from qdrant_client.http import models
from pypdf import PdfReader

# Load environment variables
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
QDRANT_URL = os.getenv("QDRANT_URL", "https://23aa2cf8-6d70-434f-bb9e-8636b64b135b.eu-west-2-0.aws.cloud.qdrant.io")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY", "")
COLLECTION_NAME = os.getenv("QDRANT_COLLECTION", "smartschool_db")

openai_client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None
qdrant_client = (
    QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY, check_compatibility=False)
    if QDRANT_URL and QDRANT_API_KEY
    else None
)

def ensure_collection_exists():
    """Memastikan collection smartschool_db siap di Qdrant Cloud"""
    if not qdrant_client:
        return
    try:
        collections = [c.name for c in qdrant_client.get_collections().collections]
        if COLLECTION_NAME not in collections:
            qdrant_client.create_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=models.VectorParams(size=1536, distance=models.Distance.COSINE),
            )
    except Exception as e:
        print(f"[RAG] Warning check collection: {e}")

def get_qdrant_points_count() -> int:
    """Mengambil jumlah total vector points saat ini"""
    if not qdrant_client:
        return 0
    try:
        info = qdrant_client.get_collection(COLLECTION_NAME)
        return info.points_count or 0
    except Exception:
        return 0

def search_knowledge_base(query: str, limit: int = 3) -> List[Dict[str, Any]]:
    """
    Melakukan Semantic Search ke Qdrant Cloud berdasarkan embedding OpenAI
    """
    if not qdrant_client or not openai_client:
        return []

    try:
        # 1. Buat embedding dari kueri user
        emb_resp = openai_client.embeddings.create(
            input=query,
            model="text-embedding-3-small"
        )
        query_vector = emb_resp.data[0].embedding

        # 2. Cari vektor terdekat di Qdrant
        res = qdrant_client.query_points(
            collection_name=COLLECTION_NAME,
            query=query_vector,
            limit=limit,
            with_payload=True
        )

        results = []
        for point in res.points:
            content = point.payload.get("content", "")
            meta = point.payload.get("metadata", {})
            results.append({
                "content": content,
                "source": meta.get("source", "Buku Panduan Sekolah"),
                "score": float(point.score or 0.0),
            })
        return results
    except Exception as e:
        print(f"[RAG] Search error: {e}")
        return []

def split_text_into_chunks(text: str, chunk_size: int = 800, chunk_overlap: int = 150) -> List[str]:
    """Memecah teks panjang menjadi potongan-potongan kecil (chunks) dengan overlap"""
    if not text:
        return []
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        start += chunk_size - chunk_overlap
    return chunks

def index_pdf_document(file_bytes: bytes, filename: str) -> Dict[str, Any]:
    """
    Ekstrak teks PDF, buat embedding vektor, dan simpan ke Qdrant Cloud
    """
    if not openai_client or not qdrant_client:
        raise RuntimeError("Koneksi OpenAI atau Qdrant belum terkonfigurasi di file .env")

    ensure_collection_exists()

    # 1. Ekstrak teks dari berkas PDF
    reader = PdfReader(io.BytesIO(file_bytes))
    all_chunks = []
    
    for page_idx, page in enumerate(reader.pages):
        page_text = page.extract_text() or ""
        page_chunks = split_text_into_chunks(page_text)
        for chunk in page_chunks:
            all_chunks.append({
                "text": f"[{filename} - Halaman {page_idx + 1}]\n{chunk}",
                "page": page_idx + 1,
            })

    if not all_chunks:
        raise ValueError(f"Tidak ada teks yang dapat diekstrak dari berkas {filename}.")

    # 2. Buat embedding untuk setiap chunk secara batch
    texts = [c["text"] for c in all_chunks]
    
    # Batch create embeddings
    points = []
    batch_size = 50
    for i in range(0, len(texts), batch_size):
        batch_texts = texts[i:i + batch_size]
        emb_res = openai_client.embeddings.create(
            input=batch_texts,
            model="text-embedding-3-small"
        )
        for idx, item in enumerate(emb_res.data):
            real_idx = i + idx
            chunk_data = all_chunks[real_idx]
            point_id = str(uuid.uuid4())
            points.append(
                models.PointStruct(
                    id=point_id,
                    vector=item.embedding,
                    payload={
                        "content": chunk_data["text"],
                        "metadata": {
                            "source": filename,
                            "page": chunk_data["page"],
                            "type": "school_knowledge",
                        }
                    }
                )
            )

    # 3. Upsert ke Qdrant Cloud
    qdrant_client.upsert(
        collection_name=COLLECTION_NAME,
        points=points
    )

    total_points = get_qdrant_points_count()

    return {
        "success": True,
        "fileId": str(uuid.uuid4()),
        "filename": filename,
        "chunksIndexed": len(points),
        "qdrantPointsCount": total_points,
        "status": "terindeks",
        "message": f"File '{filename}' berhasil diuraikan ({len(points)} chunks) dan terindeks ke Qdrant Cloud.",
    }
