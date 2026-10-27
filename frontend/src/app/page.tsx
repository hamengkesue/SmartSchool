"use client";

import { useEffect, useState } from 'react';
import { useChatSession } from "@/hooks/useChatSession";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { ChatWorkspace } from "@/components/chat/ChatWorkspace";
import { MultimodalInputBar } from "@/components/chat/MultimodalInputBar";
import { PdfPreviewModal } from "@/components/pdf/PdfPreviewModal";
import { Citation, GeneratedPdf } from "@/types/chat.types";
import confetti from "canvas-confetti";

export default function ChatPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const {
    currentRole,
    setCurrentRole,
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
  } = useChatSession();

  useEffect(() => {
    const savedRole = localStorage.getItem("active_user_role");
    if (savedRole) {
      setCurrentRole(savedRole as typeof currentRole);
    }
  }, [setCurrentRole]);

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
    sendMessage("Tolong buatkan dan cetak rekapitulasi data tunggakan SPP ini ke dalam format dokumen PDF resmi.");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      {/* 1. Collapsible App Sidebar */}
      <AppSidebar
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNewChat={resetChat}
        sessions={sessions}
        activeSessionId={sessionId}
        onSelectSession={switchSession}
        onDeleteSession={deleteSession}
      />

      {/* 2. Main Chat Area */}
       <div className="flex flex-1 flex-col h-full overflow-hidden">
        {/* Top Navigation Bar with Role and Backend/Mock Status */}
        <TopNavbar
          currentRole={currentRole}
          isMockMode={isMockMode}
          onToggleMockMode={() => setIsMockMode(!isMockMode)}
          isBackendHealthy={isBackendHealthy}
          onToggleSidebar={() => setIsSidebarOpen(true)}
          onResetChat={resetChat}
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
