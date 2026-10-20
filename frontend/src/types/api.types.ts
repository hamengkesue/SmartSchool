import { UserRole, Citation, GeneratedPdf } from "./chat.types";
import { SppSummaryData } from "./spp.types";

export interface ApiChatRequest {
  message: string;
  sessionId: string;
  role: UserRole;
  pdfAttachmentId?: string;
  pdfAttachmentUrl?: string;
}

export interface ApiChatResponse {
  answer: string;
  type: "text" | "rag_explanation" | "spp_table" | "pdf_download" | "combined";
  citations?: Citation[];
  sppData?: SppSummaryData;
  generatedPdf?: GeneratedPdf;
  tokensUsed?: {
    prompt: number;
    completion: number;
    total: number;
  };
  latencyMs?: number;
}

export interface KnowledgeDocument {
  id: string;
  filename: string;
  title: string;
  category: "akademik" | "keuangan" | "ppdb" | "tata_tertib" | "panduan";
  fileSizeBytes: number;
  totalPages: number;
  uploadedAt: string;
  status: "terindeks" | "memproses" | "gagal";
  qdrantPointsCount: number;
  description?: string;
  downloadUrl?: string;
}

export interface UploadPdfApiResponse {
  success: boolean;
  fileId: string;
  filename: string;
  chunksIndexed: number;
  qdrantPointsCount: number;
  status: "terindeks" | "memproses";
  message: string;
}

export interface BackendHealthStatus {
  fastapi: boolean;
  n8n: boolean;
  qdrant: boolean;
  database: boolean;
  lastChecked: string;
  mode: "live" | "mock";
  activeNgrokUrl?: string;
}
