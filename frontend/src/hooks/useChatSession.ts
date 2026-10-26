"use client";

import { useState, useCallback, useEffect } from "react";
import { ChatMessage, UserRole, FileAttachment, QuickPrompt } from "../types/chat.types";
import { sendChatMessage } from "../services/chatService";
import { checkBackendHealth } from "../services/apiClient";
import { MOCK_SPP_SUMMARY } from "../mocks/mockChatResponses";

export interface HistorySession {
  id: string;
  title: string;
  date: string;
  role: UserRole;
  messages: ChatMessage[];
  updatedAt: number;
}

export const INITIAL_GUEST_PROMPTS: QuickPrompt[] = [
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

export const DEFAULT_HISTORY_SESSIONS: HistorySession[] = [
  {
    id: "h1",
    title: "Syarat & Jadwal PPDB 2026",
    date: "Hari ini",
    role: "guest",
    updatedAt: 1761480000000,
    messages: [
      {
        id: "msg-h1-1",
        role: "user",
        content: "Bagaimana alur & syarat pendaftaran siswa baru (PPDB) 2026?",
        timestamp: "08:30",
      },
      {
        id: "msg-h1-2",
        role: "assistant",
        content: `### 🎓 Prosedur & Persyaratan Pendaftaran Peserta Didik Baru (PPDB) 2026/2027

Berdasarkan pedoman resmi penerimaan sekolah, berikut adalah tahapan pendaftaran yang wajib diikuti calon siswa:

#### 1. Tahapan Alur Pendaftaran
- **Pendaftaran Daring (Online):** Mengisi formulir biodata lengkap melalui portal resmi \`https://ppdb.smartschool.sch.id\` pada tanggal **02 – 18 Mei 2026**.
- **Unggah Dokumen Syarat:** Mengunggah pindaian (*scan*) dokumen asli ke sistem dalam format PDF.
- **Tes Pemetaan Akademik & Psikotes:** Dilaksanakan secara serentak di kampus sekolah pada tanggal **23 Mei 2026**.
- **Pengumuman Kelulusan:** Diumumkan secara transparan di website dan papan pengumuman sekolah pada **30 Mei 2026**.
- **Daftar Ulang:** Bagi calon siswa yang dinyatakan diterima wajib melakukan registrasi ulang paling lambat **05 Juni 2026**.

#### 2. Berkas Persyaratan Wajib (Checklist)
- Fotokopi Ijazah / Surat Keterangan Lulus (SKL) berlegalisir (2 lembar).
- Fotokopi Akta Kelahiran dan Kartu Keluarga (KK).
- Pas foto terbaru ukuran 3x4 berwarna dengan latar belakang merah (4 lembar).
- Surat Keterangan Berkelakuan Baik (SKBB) dari sekolah asal.
- Sertifikat/Piagam Prestasi Minimal Tingkat Kabupaten/Kota *(Khusus Jalur Prestasi)*.

> ℹ️ **Catatan Jalur Afirmasi:** Bagi pendaftar jalur afirmasi/KIP, wajib melampirkan fotokopi Kartu Indonesia Pintar atau surat keterangan tidak mampu dari kelurahan setempat.`,
        timestamp: "08:31",
        type: "rag_explanation",
        citations: [
          {
            documentId: "doc-ppdb-2026",
            documentTitle: "Buku_Panduan_PPDB_2026.pdf",
            pageNumber: 4,
            snippet: "Bab II: Persyaratan Administrasi dan Jadwal Pelaksanaan PPDB Terpadu Tahun Ajaran 2026/2027, halaman 4 pasal 3.",
            url: "#preview-modal",
            relevanceScore: 0.94,
          },
        ],
        generatedPdf: {
          title: "Brosur & Panduan Lengkap PPDB 2026",
          filename: "Panduan_Lengkap_PPDB_2026.pdf",
          description: "Buku panduan resmi PPDB format cetak ber-kop sekolah dilengkapi jadwal kalender akademik dan peta lokasi tes.",
          downloadUrl: "#download-ppdb-guide",
          size: "1.4 MB",
          createdAt: "20 Okt 2026",
          pagesCount: 6,
          documentRefNumber: "SMART/PPDB/BRO-2026",
        },
      },
    ],
  },
  {
    id: "h2",
    title: "Cek Tunggakan SPP Kelas X",
    date: "Hari ini",
    role: "admin",
    updatedAt: 1761474600000,
    messages: [
      {
        id: "msg-h2-1",
        role: "user",
        content: "Siapa saja siswa yang belum membayar SPP bulan ini?",
        timestamp: "09:45",
      },
      {
        id: "msg-h2-2",
        role: "assistant",
        content: `Berikut adalah **Laporan Rekapitulasi Tunggakan SPP Siswa** yang ditarik langsung secara *real-time* dari Database Keuangan Sekolah per **Oktober 2026**. 

Tercatat ada **5 siswa** yang belum menyelesaikan pembayaran dengan akumulasi total tunggakan sebesar **Rp 4.250.000**. Silakan gunakan tabel di bawah untuk filter per kelas atau ekspor ke format PDF resmi.`,
        timestamp: "09:46",
        type: "spp_table",
        sppData: MOCK_SPP_SUMMARY,
        generatedPdf: {
          title: "Laporan Resmi Rekapitulasi Tunggakan SPP",
          filename: "Laporan_Tunggakan_SPP_Okt2026.pdf",
          description: "Dokumen resmi ber-kop surat sekolah lengkap dengan tanda tangan Kepala Bagian Keuangan dan tabel rincian per kelas.",
          downloadUrl: "#download-spp-pdf",
          size: "420 KB",
          createdAt: "20 Okt 2026, 14:30 WIB",
          pagesCount: 2,
          documentRefNumber: "421.3/KEU-SMART/X/2026",
        },
      },
    ],
  },
  {
    id: "h3",
    title: "Ekstraksi PDF Berkas Syarat",
    date: "Kemarin",
    role: "guest",
    updatedAt: 1761393600000,
    messages: [
      {
        id: "msg-h3-1",
        role: "user",
        content: "Tolong baca & rangkum isi dokumen berkas persyaratan pendaftaran.",
        timestamp: "Kemarin 14:20",
        attachment: {
          id: "att-1",
          name: "Berkas_Syarat_Siswa.pdf",
          size: 1540000,
          type: "application/pdf",
          progress: 100,
          status: "ready",
        },
      },
      {
        id: "msg-h3-2",
        role: "assistant",
        content: `### 📄 Hasil Rangkuman & Ekstraksi Dokumen: \`Berkas_Syarat_Siswa.pdf\`

Saya telah menganalisis dokumen yang Anda unggah secara menyeluruh melalui parser **FastAPI + LangChain**:

1. **Topik Utama:** Dokumen ini memuat regulasi administrasi dan kelengkapan berkas akademik untuk periode tahun ajaran 2026/2027.
2. **Poin-Poin Kunci:**
   - **Batas Waktu Penyerahan:** Berkas fisik wajib diserahkan ke sekretariat paling lambat **25 November 2026**.
   - **Kelengkapan Dokumen:** Fotokopi Akta Kelahiran (2 lembar legalisir), Kartu Keluarga, dan Surat Keterangan Lulus (SKL) asli.
   - **Ketentuan Format:** Berkas digital pendukung harus dipindai dalam resolusi minimal 300 DPI dan diunggah dalam format \`.pdf\`.
3. **Catatan Penting:** Terdapat stempel verifikasi pada halaman 3 yang menandakan dokumen telah memenuhi prasyarat verifikasi internal sekolah.`,
        timestamp: "Kemarin 14:21",
        type: "rag_explanation",
        citations: [
          {
            documentId: "upload-session-user",
            documentTitle: "Berkas_Syarat_Siswa.pdf",
            pageNumber: 2,
            snippet: "Seluruh berkas fisik harus diserahkan secara langsung ke panitia penerimaan...",
            url: "#preview-modal",
          },
        ],
      },
    ],
  },
  {
    id: "h4",
    title: "Format Cetak Laporan Keuangan",
    date: "18 Okt",
    role: "admin",
    updatedAt: 1761220800000,
    messages: [
      {
        id: "msg-h4-1",
        role: "user",
        content: "Tolong buatkan dan cetak rekapitulasi data tunggakan SPP ini ke dalam format dokumen PDF resmi.",
        timestamp: "18 Okt 11:15",
      },
      {
        id: "msg-h4-2",
        role: "assistant",
        content: `Dokumen rekapitulasi laporan tunggakan SPP telah berhasil dibuat dalam format PDF resmi dengan nomor referensi \`421.3/KEU-SMART/X/2026\`. Anda dapat mengunduh atau melihat pratinjau dokumen di bawah ini.`,
        timestamp: "18 Okt 11:16",
        type: "pdf_download",
        generatedPdf: {
          title: "Laporan Resmi Rekapitulasi Tunggakan SPP",
          filename: "Laporan_Tunggakan_SPP_Okt2026.pdf",
          description: "Dokumen resmi ber-kop surat sekolah lengkap dengan tanda tangan Kepala Bagian Keuangan dan tabel rincian per kelas.",
          downloadUrl: "#download-spp-pdf",
          size: "420 KB",
          createdAt: "18 Okt 2026, 11:16 WIB",
          pagesCount: 2,
          documentRefNumber: "421.3/KEU-SMART/X/2026",
        },
      },
    ],
  },
];

export function useChatSession() {
  const [currentRole, setCurrentRole] = useState<UserRole>("guest");
  const [sessions, setSessions] = useState<HistorySession[]>(DEFAULT_HISTORY_SESSIONS);
  const [activeSessionId, setActiveSessionId] = useState<string>("h1");
  const [lastOpenedSessionId, setLastOpenedSessionId] = useState<string>("h1");
  const [messages, setMessages] = useState<ChatMessage[]>(() => DEFAULT_HISTORY_SESSIONS[0].messages);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMockMode, setIsMockMode] = useState<boolean>(true);
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean>(false);

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

  // Sync initial sessions and last active session from localStorage
  useEffect(() => {
    try {
      const storedSessions = localStorage.getItem("smartschool_chat_sessions");
      let currentSessionsList = DEFAULT_HISTORY_SESSIONS;

      if (storedSessions) {
        currentSessionsList = JSON.parse(storedSessions);
        setSessions(currentSessionsList);
      } else {
        localStorage.setItem("smartschool_chat_sessions", JSON.stringify(DEFAULT_HISTORY_SESSIONS));
      }

      const savedLastId = localStorage.getItem("last_opened_session_id") || "h1";
      const targetSession = currentSessionsList.find((s) => s.id === savedLastId) || currentSessionsList[0];

      if (targetSession) {
        setActiveSessionId(targetSession.id);
        setLastOpenedSessionId(targetSession.id);
        setMessages(targetSession.messages);
        setCurrentRole(targetSession.role);
      }
    } catch {
      // Fallback gracefully on parsing errors
    }
  }, []);

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
    localStorage.setItem("active_user_role", newRole);
  }, []);

  // Load a specific history session by ID
  const loadSession = useCallback(
    (sessionId: string) => {
      const target = sessions.find((s) => s.id === sessionId);
      if (target) {
        setActiveSessionId(target.id);
        setLastOpenedSessionId(target.id);
        setMessages(target.messages);
        setCurrentRole(target.role);
        try {
          localStorage.setItem("last_opened_session_id", target.id);
          localStorage.setItem("active_user_role", target.role);
        } catch {}
      }
    },
    [sessions]
  );

  // Restore the last opened session (when clicking "Riwayat Sesi" or back to history)
  const restoreLastOpenedSession = useCallback(() => {
    const targetId = lastOpenedSessionId || "h1";
    loadSession(targetId);
  }, [lastOpenedSessionId, loadSession]);

  // Start a new blank conversation
  const resetChat = useCallback(() => {
    const newSessionId = `session-${Date.now()}`;
    setActiveSessionId(newSessionId);
    setMessages([]);
  }, []);

  // Send a message and update the active session
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

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setIsLoading(true);

      try {
        const { response } = await sendChatMessage({
          message: text,
          sessionId: activeSessionId,
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

        const finalMessages = [...updatedMessages, assistantMessage];
        setMessages(finalMessages);

        // Update or insert into session history list
        setSessions((prev) => {
          const existingIndex = prev.findIndex((s) => s.id === activeSessionId);
          let newSessionsList: HistorySession[];

          if (existingIndex >= 0) {
            newSessionsList = prev.map((s, idx) =>
              idx === existingIndex
                ? {
                    ...s,
                    messages: finalMessages,
                    updatedAt: Date.now(),
                    date: "Hari ini",
                  }
                : s
            );
          } else {
            // New conversation started
            const newTitle =
              text.trim().length > 30
                ? text.trim().slice(0, 30) + "..."
                : text.trim() || attachment?.name || "Percakapan Baru";
            const newSession: HistorySession = {
              id: activeSessionId,
              title: newTitle,
              date: "Hari ini",
              role: currentRole,
              messages: finalMessages,
              updatedAt: Date.now(),
            };
            newSessionsList = [newSession, ...prev];
          }

          try {
            localStorage.setItem("smartschool_chat_sessions", JSON.stringify(newSessionsList));
            localStorage.setItem("last_opened_session_id", activeSessionId);
          } catch {}

          return newSessionsList;
        });

        setLastOpenedSessionId(activeSessionId);
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
    [messages, activeSessionId, currentRole, isMockMode, isBackendHealthy]
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
    // History & Session features
    sessions,
    activeSessionId,
    lastOpenedSessionId,
    loadSession,
    restoreLastOpenedSession,
  };
}
