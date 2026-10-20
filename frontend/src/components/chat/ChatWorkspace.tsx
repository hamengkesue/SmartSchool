"use client";

import React, { useRef, useEffect } from "react";
import { ChatMessage, UserRole, Citation, GeneratedPdf } from "@/types/chat.types";
import { MessageBubble } from "./MessageBubble";
import { EmptyWelcomeScreen } from "./EmptyWelcomeScreen";
import { Bot, Sparkles } from "lucide-react";

interface ChatWorkspaceProps {
  messages: ChatMessage[];
  currentRole: UserRole;
  isLoading: boolean;
  onSelectPrompt: (promptText: string) => void;
  onOpenCitationPdf: (citation: Citation) => void;
  onPreviewPdf: (pdf: GeneratedPdf) => void;
  onExportSppPdf: () => void;
}

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

  // Auto-scroll on new messages or loading state change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-4 space-y-4">
      {/* If no messages, render Empty State with 4 Quick Action Cards */}
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

          {/* AI Thinking / Processing Shimmer Indicator */}
          {isLoading && (
            <div className="flex gap-3 py-3 px-2 sm:px-4 animate-in fade-in duration-200">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0D9488] to-[#14B8A6] text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-none p-4 max-w-md shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#0D9488] mb-2">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>AI sedang memproses data & dokumen...</span>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-slate-100 rounded-md animate-shimmer" />
                  <div className="h-3 bg-slate-100 rounded-md animate-shimmer w-5/6" />
                  <div className="h-3 bg-slate-100 rounded-md animate-shimmer w-3/4" />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
