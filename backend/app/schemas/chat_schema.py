"""
Pydantic Schemas - Kontrak Data Antara FastAPI Backend dan Next.js Frontend
Harus sinkron 1:1 dengan frontend/src/types/chat.types.ts dan api.types.ts
"""

from typing import List, Optional, Literal
from pydantic import BaseModel, Field

UserRole = Literal["guest", "parent", "admin"]
MessageType = Literal["text", "rag_explanation", "spp_table", "pdf_download", "combined"]
SppStatus = Literal["BELUM LUNAS", "LUNAS", "MENUNGGU VERIFIKASI"]

class CitationSchema(BaseModel):
    documentId: str
    documentTitle: str
    pageNumber: int
    snippet: Optional[str] = None
    url: Optional[str] = None
    relevanceScore: Optional[float] = None

class GeneratedPdfSchema(BaseModel):
    title: str
    filename: str
    description: str
    downloadUrl: str
    size: str
    createdAt: str
    pagesCount: Optional[int] = None
    documentRefNumber: Optional[str] = None

class SppStudentRecordSchema(BaseModel):
    no: int
    nisn: str
    nama: str
    kelas: str
    periodeBulan: str
    nominalTagihan: int
    status: SppStatus
    tenggatWaktu: str
    nomorHpWali: Optional[str] = None

class SppSummaryDataSchema(BaseModel):
    totalSiswaMenunggak: int
    totalNominal: int
    periodeAktif: str
    tingkatKelas: Optional[str] = None
    records: List[SppStudentRecordSchema]

class ApiChatRequestSchema(BaseModel):
    message: str
    sessionId: str
    role: UserRole
    pdfAttachmentId: Optional[str] = None
    pdfAttachmentUrl: Optional[str] = None

class ApiChatResponseSchema(BaseModel):
    answer: str
    type: MessageType
    citations: Optional[List[CitationSchema]] = None
    sppData: Optional[SppSummaryDataSchema] = None
    generatedPdf: Optional[GeneratedPdfSchema] = None
    latencyMs: Optional[int] = None
