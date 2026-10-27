"use client";

import { useState, useCallback, useEffect } from "react";
import { ChatMessage, UserRole, FileAttachment, ChatSession } from "../types/chat.types";
import { sendChatMessage } from "../services/chatService";
import { checkBackendHealth } from "../services/apiClient";

const SESSIONS_STORAGE_KEY = "smartschool_chat_sessions_v1";
const ACTIVE_SESSION_KEY = "smartschool_active_session_id";

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
  const [isMockMode, setIsMockMode] = useState<boolean>(false); // default live mode (FastAPI)
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string>(() => `session-${Date.now()}`);
  const [sessions, setSessions] = useState<ChatSession[]>([]);

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

  // 1. Muat riwayat sesi dari LocalStorage saat pertama kali aplikasi dibuka
  useEffect(() => {
    try {
      const savedSessionsStr = localStorage.getItem(SESSIONS_STORAGE_KEY);
      const savedActiveId = localStorage.getItem(ACTIVE_SESSION_KEY);

      if (savedSessionsStr) {
        const parsed: ChatSession[] = JSON.parse(savedSessionsStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed);
          const activeSession = parsed.find((s) => s.id === savedActiveId) || parsed[0];
          setSessionId(activeSession.id);
          setMessages(activeSession.messages || []);
          setCurrentRole(activeSession.role || "guest");
        }
      }
    } catch (e) {
      console.warn("Gagal memuat sesi dari localStorage:", e);
    }
  }, []);

  // Helper untuk menyimpan array sesi ke localStorage
  const persistSessions = useCallback(
    (updatedSessions: ChatSession[], activeId: string) => {
      setSessions(updatedSessions);
      try {
        localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updatedSessions));
        localStorage.setItem(ACTIVE_SESSION_KEY, activeId);
      } catch (err) {
        console.warn("Gagal menyimpan ke localStorage:", err);
      }
    },
    []
  );

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

  // Memulai obrolan baru tanpa menghapus sesi sebelumnya
  const resetChat = useCallback(() => {
    const newSessionId = `session-${Date.now()}`;
    setMessages([]);
    setSessionId(newSessionId);
    try {
      localStorage.setItem(ACTIVE_SESSION_KEY, newSessionId);
    } catch {}
  }, []);

  // Berpindah ke sesi lain yang dipilih dari sidebar
  const switchSession = useCallback(
    (targetId: string) => {
      const target = sessions.find((s) => s.id === targetId);
      if (target) {
        setSessionId(target.id);
        setMessages(target.messages || []);
        setCurrentRole(target.role || "guest");
        try {
          localStorage.setItem(ACTIVE_SESSION_KEY, target.id);
        } catch {}
      }
    },
    [sessions]
  );

  // Menghapus salah satu sesi dari riwayat
  const deleteSession = useCallback(
    (targetId: string) => {
      const filtered = sessions.filter((s) => s.id !== targetId);
      if (targetId === sessionId) {
        if (filtered.length > 0) {
          const next = filtered[0];
          setSessionId(next.id);
          setMessages(next.messages || []);
          setCurrentRole(next.role || "guest");
          persistSessions(filtered, next.id);
        } else {
          const newId = `session-${Date.now()}`;
          setSessionId(newId);
          setMessages([]);
          persistSessions([], newId);
        }
      } else {
        persistSessions(filtered, sessionId);
      }
    },
    [sessions, sessionId, persistSessions]
  );

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

      const updatedMessagesWithUser = [...messages, userMessage];
      setMessages(updatedMessagesWithUser);
      setIsLoading(true);

      // Simpan pesan user ke sesi & localStorage
      const nowIso = new Date().toISOString();
      const existingIdx = sessions.findIndex((s) => s.id === sessionId);
      let workingSessions: ChatSession[];

      if (existingIdx >= 0) {
        workingSessions = sessions.map((s, idx) =>
          idx === existingIdx
            ? {
                ...s,
                updatedAt: nowIso,
                role: currentRole,
                messages: updatedMessagesWithUser,
                title:
                  s.title === "Percakapan Baru" || s.title.startsWith("Sesi ")
                    ? text.trim().slice(0, 32) + (text.trim().length > 32 ? "..." : "")
                    : s.title,
              }
            : s
        );
      } else {
        const titleStr = text.trim()
          ? text.trim().slice(0, 32) + (text.trim().length > 32 ? "..." : "")
          : (attachment?.name || "Percakapan Baru");

        const newSession: ChatSession = {
          id: sessionId,
          title: titleStr,
          role: currentRole,
          createdAt: nowIso,
          updatedAt: nowIso,
          messages: updatedMessagesWithUser,
        };
        workingSessions = [newSession, ...sessions];
      }
      persistSessions(workingSessions, sessionId);

      try {
        const { response } = await sendChatMessage({
          message: text,
          sessionId,
          role: currentRole,
          pdfAttachmentId: attachment?.id,
          pdfAttachmentName: attachment?.name,
          forceMock: isMockMode,
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

        const finalMessages = [...updatedMessagesWithUser, assistantMessage];
        setMessages(finalMessages);

        // Update sesi dengan balasan asisten
        const updatedWithAi = workingSessions.map((s) =>
          s.id === sessionId
            ? { ...s, updatedAt: new Date().toISOString(), messages: finalMessages }
            : s
        );
        persistSessions(updatedWithAi, sessionId);
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
        const errorMessages = [...updatedMessagesWithUser, fallbackMsg];
        setMessages(errorMessages);

        const updatedWithError = workingSessions.map((s) =>
          s.id === sessionId
            ? { ...s, updatedAt: new Date().toISOString(), messages: errorMessages }
            : s
        );
        persistSessions(updatedWithError, sessionId);
      } finally {
        setIsLoading(false);
      }
    },
    [currentRole, sessionId, messages, sessions, isMockMode, persistSessions]
  );

  return {
    currentRole,
    setCurrentRole: handleRoleChange,
    messages,
    isLoading,
    isMockMode,
    setIsMockMode,
    isBackendHealthy,
    sessionId,
    sessions,
    switchSession,
    deleteSession,
    sendMessage,
    resetChat,
    previewPdfModal,
    openPdfPreview,
    closePdfPreview,
  };
}
