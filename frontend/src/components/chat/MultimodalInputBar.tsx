"use client";

import React, { useRef, useState, useEffect } from "react";
import { Paperclip, Send, AlertCircle, CheckCircle2, UploadCloud, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { VoiceMicButton } from "@/components/voice/VoiceMicButton";
import { VoiceWaveformBar } from "@/components/voice/VoiceWaveformBar";
import { PdfUploadChip } from "@/components/pdf/PdfUploadChip";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";
import { usePdfUpload } from "@/hooks/usePdfUpload";
import { FileAttachment, UserRole } from "@/types/chat.types";

interface MultimodalInputBarProps {
  onSendMessage: (text: string, attachment?: FileAttachment | null) => void;
  isLoading: boolean;
  currentRole: UserRole;
  isMockMode?: boolean;
  placeholder?: string;
}

export function MultimodalInputBar({
  onSendMessage,
  isLoading,
  currentRole,
  isMockMode = false,
  placeholder = "Tanyakan prosedur PPDB, tagihan SPP, atau pertanyaan seputar sekolah...",
}: MultimodalInputBarProps) {
  const [inputText, setInputText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isAdmin = currentRole === "admin" || currentRole === "admin_keuangan_tu" as UserRole;

  // Hook PDF Upload — hanya digunakan oleh Admin
  const {
    attachedPdf,
    isUploading: isPdfUploading,
    uploadError,
    uploadSuccessMsg,
    handleSelectFile,
    handleRemoveFile,
  } = usePdfUpload();

  // Hook Voice Recognition
  const {
    isRecording,
    transcript,
    formattedDuration,
    audioLevels,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useVoiceRecognition({
    onTranscriptChange: () => {},
    onRecordingComplete: (finalTranscript) => {
      if (finalTranscript.trim()) {
        setInputText(finalTranscript);
      }
    },
  });

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputText]);

  const handleFinishVoice = () => {
    const text = stopRecording();
    if (text) setInputText(text);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleSelectFile(file, isMockMode);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLoading || isPdfUploading) return;
    if (!inputText.trim()) return;

    onSendMessage(inputText, null);
    setInputText("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-4 pt-2">
      {/* STATE 3: Voice Recording Active */}
      {isRecording ? (
        <VoiceWaveformBar
          durationFormatted={formattedDuration}
          transcript={transcript}
          audioLevels={audioLevels}
          onCancel={cancelRecording}
          onFinish={handleFinishVoice}
        />
      ) : (
        <>
          {/* === ADMIN ONLY: Panel Upload Dokumen Pedoman ke Qdrant === */}
          {isAdmin && (
            <div className="mb-3 p-3 bg-gradient-to-r from-[#1B365D]/5 to-[#0D9488]/5 border border-[#0D9488]/20 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-[#0D9488]/15 flex items-center justify-center">
                  <BookOpen className="w-3.5 h-3.5 text-[#0D9488]" />
                </div>
                <span className="text-[11px] font-bold text-[#0D9488] uppercase tracking-wider">
                  Admin · Unggah Dokumen Pedoman ke Knowledge Base AI
                </span>
              </div>

              {/* Upload Error Banner */}
              {uploadError && (
                <div className="mb-2 p-2 px-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Upload Success Banner */}
              {uploadSuccessMsg && !attachedPdf && (
                <div className="mb-2 p-2 px-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{uploadSuccessMsg}</span>
                </div>
              )}

              {/* PDF Chip saat sedang upload/siap */}
              {attachedPdf ? (
                <PdfUploadChip attachment={attachedPdf} onRemove={handleRemoveFile} />
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,application/pdf"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isPdfUploading}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#0D9488] bg-[#0D9488]/10 border border-[#0D9488]/25 hover:bg-[#0D9488]/20 transition-colors disabled:opacity-50"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    {isPdfUploading ? "Mengindeks ke Qdrant..." : "Pilih File PDF"}
                  </button>
                  <span className="text-[10px] text-slate-400">
                    PDF diunggah akan diindeks ke Qdrant Cloud agar AI dapat menjawab berdasarkan isinya
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Input Bar Utama */}
          <div className="relative bg-white rounded-2xl border border-slate-300/80 shadow-md transition-all focus-within:border-[#0D9488] focus-within:ring-2 focus-within:ring-[#0D9488]/15">
            {/* STATE 1: Normal Input */}
            <div className="flex items-end gap-2 p-2 sm:p-2.5">
              {/* Textarea */}
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                placeholder={placeholder}
                className="flex-1 max-h-32 min-h-[38px] py-2 px-1 text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent resize-none border-0 focus:outline-none leading-relaxed"
              />

              {/* Right Group: Voice + Send */}
              <div className="flex items-center gap-1.5 shrink-0">
                <VoiceMicButton
                  isRecording={false}
                  onClick={startRecording}
                  disabled={isLoading}
                />

                <Button
                  type="button"
                  variant="primary"
                  size="icon"
                  onClick={() => handleSubmit()}
                  disabled={isLoading || !inputText.trim()}
                  className="w-10 h-10 rounded-xl bg-[#1B365D] hover:bg-[#142846] text-white shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Input Helper Text */}
      <div className="mt-2 text-center text-[11px] text-slate-600 font-medium select-none">
        Tekan <kbd className="font-mono bg-slate-200/80 px-1 rounded text-[10px]">Enter</kbd> untuk kirim,{" "}
        <kbd className="font-mono bg-slate-200/80 px-1 rounded text-[10px]">Shift+Enter</kbd> untuk baris baru.
        {isAdmin && (
          <span className="ml-1 text-[#0D9488]">
            · Admin dapat mengunggah dokumen PDF pedoman ke knowledge base AI.
          </span>
        )}
      </div>
    </div>
  );
}
