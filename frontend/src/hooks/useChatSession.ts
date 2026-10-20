"use client";

import { useState, useCallback, useEffect } from "react";
import { ChatMessage, UserRole, FileAttachment } from "../types/chat.types";
import { sendChatMessage } from "../services/chatService";
import { checkBackendHealth } from "../services/apiClient";

export const INITIAL_GUEST_PROMPTS = [
  {
    id: "prompt-ppdb",
    title: "Alur & Syarat PPDB 2026",
    prompt: "Bagaimana alur & syarat pendaftaran siswa baru (PPDB)?",
    category: "ppdb" as const,
    iconName: "GraduationCap",
    allowedRoles: ["guest", "parent", "admin"] as UserRole[],
    badge: "Fitur RAG",
    colorScheme: "blue" as const,
  },
  {
    id: "prompt-spp",
    title: "Cek Tunggakan SPP",
    prompt: "Siapa saja siswa yang belum membayar SPP bulan ini?",
    category: "spp" as const,
    iconName: "CreditCard",
    allowedRoles: ["admin", "parent"] as UserRole[],
    badge: "Database Query",
    colorScheme: "teal" as const,
  },
  {
    id: "prompt-pdf-read",
    title: "Baca & Rangkum Berkas PDF",
    prompt: "Baca & rangkum isi dokumen PDF yang saya unggah",
    category: "pdf_read" as const,
    iconName: "FileText",
    allowedRoles: ["guest", "parent", "admin"] as UserRole[],
    badge: "PDF Ingestion",
    colorScheme: "purple" as const,
  },
  {
    id: "prompt-pdf-export",
    title: "Buat Format Dokumen PDF",
    prompt: "Buatkan rekap laporan dalam format dokumen PDF",
    category: "pdf_export" as const,
    iconName: "Printer",
    allowedRoles: ["guest", "parent", "admin"] as UserRole[],
    badge: "Dynamic PDF",
    colorScheme: "amber" as const,
  },
];

export function useChatSession() {
  const [currentRole, setCurrentRole] = useState<UserRole>("guest");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMockMode, setIsMockMode] = useState<boolean>(true); // default true for rock-solid demo
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string>(() => `session-${Date.now()}`);

  // PDF Preview Modal state
  const [previewPdfModal, setPreviewPdfModal] = useState<{
    isOpen: boolean;
    title: string;
    page: number;
    url?: string;
  }>({
    isOpen: false,
    title: "",
    page: 1,
  });

  // Check backend health periodically
  useEffect(() => {
    let mounted = true;
    const verifyHealth = async () => {
      const isHealthy = await checkBackendHealth();
      if (mounted) {
        setIsBackendHealthy(isHealthy);
      }
    };

    verifyHealth();
    const interval = setInterval(verifyHealth, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const openPdfPreview = useCallback((title: string, page = 1, url?: string) => {
    setPreviewPdfModal({
      isOpen: true,
      title,
      page,
      url,
    });
  }, []);

  const closePdfPreview = useCallback(() => {
    setPreviewPdfModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleRoleChange = useCallback((newRole: UserRole) => {
    setCurrentRole(newRole);
  }, []);

  const resetChat = useCallback(() => {
    setMessages([]);
    setSessionId(`session-${Date.now()}`);
  }, []);

  const sendMessage = useCallback(
    async (text: string, attachment?: FileAttachment | null) => {
      if (!text.trim() && !attachment) return;

      const userMsgId = `msg-user-${Date.now()}`;
      const nowStr = new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const userMessage: ChatMessage = {
        id: userMsgId,
        role: "user",
        content: text.trim() || `[Mengunggah Dokumen: ${attachment?.name}]`,
        timestamp: nowStr,
        attachment: attachment || undefined,
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const { response } = await sendChatMessage({
          message: text,
          sessionId,
          role: currentRole,
          pdfAttachmentId: attachment?.id,
          pdfAttachmentName: attachment?.name,
          forceMock: isMockMode || !isBackendHealthy,
        });

        const assistantMsgId = `msg-ai-${Date.now()}`;
        const assistantMessage: ChatMessage = {
          id: assistantMsgId,
          role: "assistant",
          content: response.answer,
          timestamp: new Date().toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          type: response.type,
          citations: response.citations,
          sppData: response.sppData,
          generatedPdf: response.generatedPdf,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error ? err.message : "Gagal memproses pesan.";
        const fallbackMsg: ChatMessage = {
          id: `msg-err-${Date.now()}`,
          role: "assistant",
          content: `⚠️ Terjadi kendala saat memproses permintaan: ${errorMsg}. Silakan aktifkan **Mode Simulasi (Mock Mode)** untuk tetap menguji coba UI.`,
          timestamp: new Date().toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [currentRole, sessionId, isMockMode, isBackendHealthy]
  );

  return {
    currentRole,
    setCurrentRole: handleRoleChange,
    messages,
    isLoading,
    isMockMode,
    setIsMockMode,
    isBackendHealthy,
    sendMessage,
    resetChat,
    previewPdfModal,
    openPdfPreview,
    closePdfPreview,
  };
}
