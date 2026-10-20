"""
SmartSchool AI - FastAPI Backend Entrypoint
Menangani CORS, Ngrok tunnel header, dan route AI.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="SmartSchool AI Backend API",
    version="1.0.0",
    description="Backend API untuk Chatbot Akademik & SPP Sekolah (FastAPI + LangChain + Qdrant Cloud)"
)

# CORS Middleware agar Frontend Next.js dapat memanggil API tanpa kendala CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "SmartSchool AI FastAPI",
        "fastapi": True,
        "mode": "live"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
