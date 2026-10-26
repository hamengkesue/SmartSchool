"use client";

import { useEffect, useState } from "react";
import { useChatSession } from "@/hooks/useChatSession";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { ChatWorkspace } from "@/components/chat/ChatWorkspace";
import { MultimodalInputBar } from "@/components/chat/MultimodalInputBar";
import { PdfPreviewModal } from "@/components/pdf/PdfPreviewModal";
import { Citation, GeneratedPdf } from "@/types/chat.types";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

export default function ChatPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const {
    currentRole,
    setCurrentRole,
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
    sessions,
    activeSessionId,
    loadSession,
    restoreLastOpenedSession,
  } = useChatSession();

  // Set default sidebar open state according to device width on initial mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsSidebarOpen(window.innerWidth >= 1024);
    }
  }, []);

  const handleRoleChange = (newRole: typeof currentRole) => {
    setCurrentRole(newRole);
    localStorage.setItem("active_user_role", newRole);
  };

  // Handles citation click (RAG Citation Pill)
  const handleOpenCitation = (citation: Citation) => {
    openPdfPreview(citation.documentTitle, citation.pageNumber, citation.url);
  };

  // Handles PDF preview from Download Card
  const handlePreviewPdfCard = (pdf: GeneratedPdf) => {
    openPdfPreview(pdf.filename, 1, pdf.downloadUrl);
  };

  // Handles Export SPP Table to PDF
  const handleExportSppPdf = () => {
    // Trigger festive micro-animation
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.7 },
      colors: ["#1B365D", "#0D9488", "#10B981"],
    });

    // Send automated prompt to request formal PDF generation
    sendMessage(
      "Tolong buatkan dan cetak rekapitulasi data tunggakan SPP ini ke dalam format dokumen PDF resmi."
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      {/* 1. Collapsible App Sidebar (dapat dipinggirkan dengan tombol garis 3) */}
      <AppSidebar
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onToggle={() => setIsSidebarOpen((prev) => !prev)}
        onNewChat={resetChat}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={loadSession}
        onRestoreLastSession={restoreLastOpenedSession}
      />

      {/* 2. Main Chat Area with Smooth Layout Transition */}
      <div
        className={cn(
          "flex flex-1 flex-col h-full overflow-hidden transition-all duration-300 ease-in-out",
          isSidebarOpen ? "lg:pl-72" : "pl-0"
        )}
      >
        {/* Top Navigation Bar with Role Switcher at Top-Right & Hamburger Menu (Garis 3) */}
        <TopNavbar
          currentRole={currentRole}
          onRoleChange={handleRoleChange}
          isMockMode={isMockMode}
          onToggleMockMode={() => setIsMockMode(!isMockMode)}
          isBackendHealthy={isBackendHealthy}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onResetChat={resetChat}
          isSidebarOpen={isSidebarOpen}
        />

        {/* Central Scrollable Chat Workspace */}
        <main className="flex-1 overflow-y-auto flex flex-col justify-between">
          <ChatWorkspace
            messages={messages}
            currentRole={currentRole}
            isLoading={isLoading}
            onSelectPrompt={(text) => sendMessage(text)}
            onOpenCitationPdf={handleOpenCitation}
            onPreviewPdf={handlePreviewPdfCard}
            onExportSppPdf={handleExportSppPdf}
          />

          {/* Multimodal Input Bar (Normal, Attached PDF, Voice Recording) */}
          <MultimodalInputBar
            onSendMessage={sendMessage}
            isLoading={isLoading}
          />
        </main>
      </div>

      {/* 3. Pop-up Modal for PDF Previews & Citations */}
      <PdfPreviewModal
        isOpen={previewPdfModal.isOpen}
        onClose={closePdfPreview}
        documentTitle={previewPdfModal.title || "Dokumen_Sekolah.pdf"}
        pageNumber={previewPdfModal.page}
        highlightSnippet="Pedoman resmi operasional akademik dan tata tertib sekolah T.A 2026/2027."
      />
    </div>
  );
}
