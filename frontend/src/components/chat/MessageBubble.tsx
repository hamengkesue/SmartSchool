"use client";

import React, { useState } from "react";
import { ChatMessage, Citation, GeneratedPdf } from "@/types/chat.types";
import { SppArrearsTable } from "./SppArrearsTable";
import { PdfDownloadCard } from "@/components/pdf/PdfDownloadCard";
import {
  Bot,
  User,
  BookOpen,
  Copy,
  Check,
  FileText,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: ChatMessage;
  onOpenCitationPdf?: (citation: Citation) => void;
  onPreviewPdf?: (pdf: GeneratedPdf) => void;
  onExportSppPdf?: () => void;
}

export function MessageBubble({
  message,
  onOpenCitationPdf,
  onPreviewPdf,
  onExportSppPdf,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple clean markdown formatter for headers, bold, lists, and quotes
  const renderFormattedContent = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, idx) => {
      // H3
      if (line.startsWith("### ")) {
        return (
          <h3 key={idx} className="text-base font-bold text-slate-900 mt-3 mb-1.5 flex items-center gap-2">
            {line.replace("### ", "")}
          </h3>
        );
      }
      // H4
      if (line.startsWith("#### ")) {
        return (
          <h4 key={idx} className="text-sm font-bold text-slate-800 mt-2.5 mb-1">
            {line.replace("#### ", "")}
          </h4>
        );
      }
      // Blockquote
      if (line.startsWith("> ")) {
        return (
          <blockquote
            key={idx}
            className="my-2 p-3 rounded-xl bg-amber-50/80 border-l-3 border-amber-500 text-xs text-amber-900 font-medium"
          >
            {line.replace("> ", "")}
          </blockquote>
        );
      }
      // Bullet list item
      if (line.trim().startsWith("- ")) {
        const text = line.trim().replace("- ", "");
        return (
          <li key={idx} className="ml-4 list-disc text-xs sm:text-sm text-slate-700 my-0.5 leading-relaxed">
            <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(text) }} />
          </li>
        );
      }
      // Numbered list item
      if (/^\d+\.\s/.test(line.trim())) {
        return (
          <li key={idx} className="ml-4 list-decimal text-xs sm:text-sm text-slate-700 my-0.5 leading-relaxed">
            <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line.trim().replace(/^\d+\.\s/, "")) }} />
          </li>
        );
      }
      // Empty line
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }
      // Regular paragraph
      return (
        <p
          key={idx}
          className="text-xs sm:text-sm text-slate-700 leading-relaxed my-1"
          dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line) }}
        />
      );
    });
  };

  // Format bold (**text**), code (`code`), span tags
  const formatInlineMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong class='font-bold text-slate-900'>$1</strong>")
      .replace(/`([^`]+)`/g, "<code class='px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[11px] font-semibold'>$1</code>");
  };

  return (
    <div
      className={cn(
        "flex gap-3 py-3 px-2 sm:px-4 transition-colors animate-in fade-in duration-200",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs mt-1",
          isUser
            ? "bg-[#1B365D] text-white"
            : "bg-gradient-to-tr from-[#0D9488] to-[#14B8A6] text-white shadow-teal-500/20"
        )}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Bubble Container */}
      <div
        className={cn(
          "flex-1 max-w-3xl min-w-0",
          isUser ? "flex flex-col items-end" : "flex flex-col items-start"
        )}
      >
        {/* Header: Sender & Timestamp */}
        <div className="flex items-center gap-2 mb-1 px-1 text-[11px] text-slate-400">
          <span className="font-semibold text-slate-600">
            {isUser ? "Anda" : "SmartSchool AI"}
          </span>
          <span>•</span>
          <span>{message.timestamp}</span>
          {!isUser && (
            <span className="flex items-center gap-0.5 text-[#0D9488] font-medium ml-1">
              <Sparkles className="w-3 h-3" />
              Terverifikasi
            </span>
          )}
        </div>

        {/* User Attached PDF preview if sent by user */}
        {isUser && message.attachment && (
          <div className="mb-2 p-2.5 px-3 bg-white border border-slate-200 rounded-xl shadow-2xs flex items-center gap-2.5 max-w-sm">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-800 truncate">
                {message.attachment.name}
              </p>
              <p className="text-[10px] text-slate-400">Lampiran PDF Terunggah</p>
            </div>
          </div>
        )}

        {/* Main Content Bubble */}
        <div
          className={cn(
            "rounded-2xl p-4 sm:p-5 shadow-xs transition-shadow w-full",
            isUser
              ? "bg-[#1B365D] text-white max-w-lg rounded-tr-none"
              : "bg-white border border-slate-200/90 rounded-tl-none shadow-xs text-slate-800"
          )}
        >
          {isUser ? (
            <p className="text-xs sm:text-sm text-white leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          ) : (
            <div>
              {/* Formatted Text Content */}
              <div>{renderFormattedContent(message.content)}</div>

              {/* Respons Tipe B: Embedded SPP Table (Fitur #5) */}
              {message.sppData && (
                <SppArrearsTable
                  data={message.sppData}
                  onExportPdf={onExportSppPdf}
                />
              )}

              {/* Respons Tipe C: Generated PDF Download Card (Fitur #2) */}
              {message.generatedPdf && (
                <PdfDownloadCard
                  pdf={message.generatedPdf}
                  onPreview={onPreviewPdf}
                />
              )}

              {/* Respons Tipe A: Citation Pills (Fitur #4 - RAG Citations) */}
              {message.citations && message.citations.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#0D9488]" />
                    <span>Rujukan Dokumen Resmi (RAG Citation)</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {message.citations.map((citation, cIdx) => (
                      <button
                        key={cIdx}
                        type="button"
                        onClick={() => onOpenCitationPdf?.(citation)}
                        title="Klik untuk membuka pratinjau halaman PDF resmi"
                        className="inline-flex items-center gap-2 p-1.5 px-3 rounded-full bg-blue-50/80 hover:bg-blue-100 border border-blue-200/90 text-blue-900 text-xs font-medium transition-all shadow-2xs group cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
                        <span>
                          📘 <strong>{citation.documentTitle}</strong> (Halaman {citation.pageNumber})
                        </span>
                        <ExternalLink className="w-3 h-3 text-blue-500 opacity-60 group-hover:opacity-100" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Message Actions (Copy & Quick Feedback) */}
        {!isUser && (
          <div className="flex items-center gap-2 mt-1.5 px-1">
            <button
              type="button"
              onClick={handleCopy}
              className="text-[11px] text-slate-400 hover:text-slate-700 flex items-center gap-1 p-1 rounded-md hover:bg-slate-100 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-600">Disalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Salin Jawaban</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
