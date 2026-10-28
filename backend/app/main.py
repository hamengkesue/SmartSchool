import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psycopg2
from psycopg2.extras import RealDictCursor
from routers.pdf_router import router as pdf_router
from routers import chat_router, knowledge_router

app = FastAPI(title="SmartSchool AI Live Backend API")

# Konfigurasi CORS: mendukung domain produksi dan lokal
raw_origins = os.getenv("ALLOWED_ORIGINS", "*")
if raw_origins.strip() == "*":
    allowed_origins = ["*"]
else:
    allowed_origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(chat_router.router)
app.include_router(pdf_router)
app.include_router(knowledge_router.router)
@app.get("/")
def read_root():
    return {"message": "Server SmartSchool Aktif"}

# Fungsi koneksi langsung ke PostgreSQL lokal Anda
def get_db_connection():
    return psycopg2.connect(
        host="localhost",
        database="smartschool_db",
        user="postgres",
        password="1234", # ⚠️ Ganti dengan password asli database Anda
        port="5432"
    )

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "SmartSchool AI FastAPI",
        "fastapi": True,
        "mode": "live"
    }

class SppQueryRequest(BaseModel):
    role: str = "guest"

@app.post("/api/spp")
async def cek_data_spp(request: SppQueryRequest):
    # Izinkan variasi string role admin yang dikirim dari frontend/n8n
    allowed_roles = ["Admin Keuangan & TU", "admin", "admin_keuangan_tu"]
    
    if request.role not in allowed_roles:
        return {"pesan": f"Akses ditolak. Role '{request.role}' tidak berwenang melihat data SPP."}
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        query_sql = """
            SELECT nama, kelas, nominal_tagihan AS tunggakan, status_pembayaran AS status 
            FROM data_spp 
            WHERE status_pembayaran = 'BELUM LUNAS';
        """
        cursor.execute(query_sql)
        records = cursor.fetchall()
        
        total_siswa = len(records)
        total_nominal = sum(int(row['tunggakan']) for row in records)
        
        cursor.close()
        conn.close()
        
        return {
            "pesan": f"Berdasarkan database live, ada {total_siswa} siswa menunggak dengan total Rp {total_nominal:,}.",
            "data_mentah": {
                "total_siswa_menunggak": total_siswa,
                "total_nominal": total_nominal,
                "daftar_siswa": records
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal mengambil data: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
