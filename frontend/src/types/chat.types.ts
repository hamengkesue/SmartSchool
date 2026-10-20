import { SppSummaryData } from "./spp.types";

export type UserRole = "guest" | "parent" | "admin";

export interface RoleConfig {
  id: UserRole;
  label: string;
  badgeLabel: string;
  description: string;
  avatarColor: string;
  badgeColor: string;
  borderColor: string;
  accentBg: string;
}

export interface Citation {
  documentId: string;
  documentTitle: string;
  pageNumber: number;
  snippet?: string;
  url?: string;
  relevanceScore?: number;
}

export interface GeneratedPdf {
  title: string;
  filename: string;
  description: string;
  downloadUrl: string;
  size: string;
  createdAt: string;
  pagesCount?: number;
  documentRefNumber?: string;
}

export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  progress: number;
  status: "uploading" | "ready" | "error";
  errorMessage?: string;
}

export type MessageType =
  | "text"
  | "rag_explanation"
  | "spp_table"
  | "pdf_download"
  | "combined";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  type?: MessageType;
  citations?: Citation[];
  sppData?: SppSummaryData;
  generatedPdf?: GeneratedPdf;
  attachment?: FileAttachment;
  isStreaming?: boolean;
}

export interface QuickPrompt {
  id: string;
  title: string;
  prompt: string;
  category: "ppdb" | "spp" | "pdf_read" | "pdf_export";
  iconName: string;
  allowedRoles: UserRole[];
  badge: string;
  colorScheme: "blue" | "teal" | "purple" | "amber";
}

export interface ChatSession {
  id: string;
  title: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}
