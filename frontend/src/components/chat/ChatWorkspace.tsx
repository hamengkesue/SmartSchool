"use client";

import React, { useRef, useEffect, useState } from "react";
import { ChatMessage, UserRole, Citation, GeneratedPdf } from "@/types/chat.types";
import { MessageBubble } from "./MessageBubble";
import { EmptyWelcomeScreen } from "./EmptyWelcomeScreen";

interface ChatWorkspaceProps {
  messages: ChatMessage[];
  currentRole: UserRole;
  isLoading: boolean;
  onSelectPrompt: (promptText: string) => void;
  onOpenCitationPdf: (citation: Citation) => void;
  onPreviewPdf: (pdf: GeneratedPdf) => void;
  onExportSppPdf: () => void;
}

// 1. Daftar pesan indikator yang akan ditampilkan secara bergantian
const LOADING_STEPS = [
  "SmartSchool AI sedang menganalisis permintaan...",
  "Mengekstrak data dari database sekolah...",
  "Menyusun dan merender berkas PDF...",
  "Mengunggah dokumen ke penyimpanan cloud...",
  "Memfinalisasi balasan..."
];

export function ChatWorkspace({
  messages,
  currentRole,
  isLoading,
  onSelectPrompt,
  onOpenCitationPdf,
  onPreviewPdf,
  onExportSppPdf,
}: ChatWorkspaceProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);

  // Rotasi teks loading setiap 1.5 detik
  useEffect(() => {
    if (!isLoading) {
      setLoadingTextIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setLoadingTextIndex((prevIndex) =>
        prevIndex < LOADING_STEPS.length - 1 ? prevIndex + 1 : prevIndex
      );
    }, 1500);

    return () => clearInterval(interval);
  }, [isLoading]);

  // Auto-scroll saat ada pesan baru atau status loading berubah
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-4 space-y-4">
      {/* Jika tidak ada pesan, tampilkan Empty Welcome Screen */}
      {messages.length === 0 ? (
        <EmptyWelcomeScreen
          currentRole={currentRole}
          onSelectPrompt={onSelectPrompt}
        />
      ) : (
        <div className="max-w-4xl mx-auto space-y-3">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onOpenCitationPdf={onOpenCitationPdf}
              onPreviewPdf={onPreviewPdf}
              onExportSppPdf={onExportSppPdf}
            />
          ))}

          {/* Indikator Loading Dinamis */}
          {isLoading && (
            <div className="flex items-center space-x-3 p-3.5 bg-gray-50 border border-gray-200/80 rounded-2xl w-fit my-3 shadow-sm transition-all duration-300">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
              <span className="text-xs sm:text-sm text-gray-600 font-medium animate-pulse">
                {LOADING_STEPS[loadingTextIndex]}
              </span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}