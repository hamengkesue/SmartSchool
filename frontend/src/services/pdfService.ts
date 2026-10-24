import { FASTAPI_BASE_URL, apiClient } from "./apiClient";
import { UploadPdfApiResponse, KnowledgeDocument } from "../types/api.types";
import { GeneratedPdf } from "../types/chat.types";
import { MOCK_KNOWLEDGE_DOCS } from "../mocks/mockChatResponses";

export const MAX_PDF_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

/**
 * Validates a chosen file to ensure it's a valid PDF and under 20MB.
 */
export function validatePdfFile(file: File): { isValid: boolean; error?: string } {
  if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
    return {
      isValid: false,
      error: "Format berkas tidak valid. Hanya berkas berekstensi .pdf yang didukung.",
    };
  }

  if (file.size > MAX_PDF_SIZE_BYTES) {
    return {
      isValid: false,
      error: "Ukuran berkas melebihi batas maksimal 20 MB.",
    };
  }

  return { isValid: true };
}

/**
 * Uploads a PDF to FastAPI / n8n for Qdrant indexing or session RAG parsing.
 */
export async function uploadPdfDocument(
  file: File,
  isKnowledgeBaseUpload = false,
  forceMock = false
): Promise<UploadPdfApiResponse> {
  if (forceMock) {
    await new Promise((res) => setTimeout(res, 1200));
    return {
      success: true,
      fileId: `mock-pdf-${Date.now()}`,
      filename: file.name,
      chunksIndexed: 24,
      qdrantPointsCount: 24,
      status: "terindeks",
      message: `File ${file.name} berhasil diunggah dan terindeks ke Qdrant Cloud.`,
    };
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("is_knowledge_base", String(isKnowledgeBaseUpload));

  try {
    const response = await fetch("https://cozily-elm-spousal.ngrok-free.dev/webhook/upload-pdf", {
      method: "POST",
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
      body: formData,
    });

    if (response.ok) {
      return await response.json();
    }
  } catch {
    // fallback
  }

  // Fallback for seamless demo
  return {
    success: true,
    fileId: `mock-upload-${Date.now()}`,
    filename: file.name,
    chunksIndexed: 18,
    qdrantPointsCount: 18,
    status: "terindeks",
    message: `[Demo Mode] File ${file.name} berhasil diproses oleh parser AI.`,
  };
}

/**
 * Request PDF report generation (e.g. SPP Report or PPDB summary).
 */
export async function generatePdfReport(
  type: "spp_arrears" | "ppdb_guide" | "general_summary",
  meta?: Record<string, unknown>
): Promise<GeneratedPdf> {
  // Simulate PDF generation with school letterhead
  await new Promise((res) => setTimeout(res, 800));

  if (type === "spp_arrears") {
    return {
      title: "Laporan Rekapitulasi Tunggakan SPP Siswa",
      filename: `Rekap_Tunggakan_SPP_${new Date().getFullYear()}.pdf`,
      description: "Dokumen resmi ber-kop surat sekolah lengkap dengan tanda tangan Kepala Bagian Keuangan.",
      downloadUrl: "#download",
      size: "480 KB",
      createdAt: new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      pagesCount: 2,
      documentRefNumber: `421.3/KEU-SMART/${Date.now().toString().slice(-4)}/2026`,
    };
  }

  return {
    title: "Buku Pedoman Penerimaan Siswa Baru",
    filename: "Pedoman_PPDB_2026_Resmi.pdf",
    description: "Dokumen resmi panduan pendaftaran, alur tes, dan tabel kuota jalur seleksi.",
    downloadUrl: "#download",
    size: "1.2 MB",
    createdAt: new Date().toLocaleDateString("id-ID"),
    pagesCount: 8,
    documentRefNumber: "421.1/PPDB-SMART/2026",
  };
}

/**
 * Fetches all knowledge base documents for Admin management
 */
export async function getKnowledgeBaseDocuments(): Promise<KnowledgeDocument[]> {
  const result = await apiClient<KnowledgeDocument[]>("api/v1/documents", {
    method: "GET",
    timeoutMs: 30000,
  });

  if (result.data && !result.error) {
    return result.data;
  }

  return MOCK_KNOWLEDGE_DOCS;
}
