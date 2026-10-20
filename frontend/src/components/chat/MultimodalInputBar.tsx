"use client";

import React, { useRef, useState, useEffect } from "react";
import { Paperclip, Send, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { VoiceMicButton } from "@/components/voice/VoiceMicButton";
import { VoiceWaveformBar } from "@/components/voice/VoiceWaveformBar";
import { PdfUploadChip } from "@/components/pdf/PdfUploadChip";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";
import { usePdfUpload } from "@/hooks/usePdfUpload";
import { FileAttachment } from "@/types/chat.types";

interface MultimodalInputBarProps {
  onSendMessage: (text: string, attachment?: FileAttachment | null) => void;
  isLoading: boolean;
  placeholder?: string;
}

export function MultimodalInputBar({
  onSendMessage,
  isLoading,
  placeholder = "Tanyakan prosedur PPDB, tagihan SPP, atau lampirkan berkas PDF...",
}: MultimodalInputBarProps) {
  const [inputText, setInputText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Hook 1: PDF Upload handling
  const {
    attachedPdf,
    isUploading: isPdfUploading,
    uploadError,
    handleSelectFile,
    handleRemoveFile,
  } = usePdfUpload();

  // Hook 2: Voice Recognition handling
  const {
    isRecording,
    transcript,
    formattedDuration,
    audioLevels,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useVoiceRecognition({
    onTranscriptChange: (liveText) => {
      // Keep textarea in sync if needed
    },
    onRecordingComplete: (finalTranscript) => {
      if (finalTranscript.trim()) {
        setInputText(finalTranscript);
      }
    },
  });

  // Adjust textarea height dynamically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputText]);

  // When voice recording finishes, set transcript
  const handleFinishVoice = () => {
    const text = stopRecording();
    if (text) {
      setInputText(text);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleSelectFile(file);
    }
    // reset input value so re-uploading the same file works
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLoading || isPdfUploading) return;
    if (!inputText.trim() && !attachedPdf) return;

    onSendMessage(inputText, attachedPdf);
    setInputText("");
    handleRemoveFile();

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
      {/* STATE 3: Voice Recognition Active */}
      {isRecording ? (
        <VoiceWaveformBar
          durationFormatted={formattedDuration}
          transcript={transcript}
          audioLevels={audioLevels}
          onCancel={cancelRecording}
          onFinish={handleFinishVoice}
        />
      ) : (
        <div className="relative bg-white rounded-2xl border border-slate-300/80 shadow-md transition-all focus-within:border-[#0D9488] focus-within:ring-2 focus-within:ring-[#0D9488]/15">
          {/* Upload Error Banner */}
          {uploadError && (
            <div className="m-2 p-2 px-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* STATE 2: Attached PDF Preview Chip */}
          {attachedPdf && (
            <div className="pt-2 px-2">
              <PdfUploadChip
                attachment={attachedPdf}
                onRemove={handleRemoveFile}
              />
            </div>
          )}

          {/* STATE 1: Normal Input Bar */}
          <div className="flex items-end gap-2 p-2 sm:p-2.5">
            {/* Hidden File Input for PDF */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,application/pdf"
              className="hidden"
            />

            {/* Upload PDF Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || isPdfUploading}
              aria-label="Unggah Dokumen PDF"
              title="Unggah Dokumen PDF untuk dibaca AI (Maks 20MB)"
              className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 disabled:opacity-40"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            {/* Dynamic Textarea */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder={
                attachedPdf
                  ? `Ketik instruksi khusus untuk ${attachedPdf.name}...`
                  : placeholder
              }
              className="flex-1 max-h-32 min-h-[38px] py-2 px-1 text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent resize-none border-0 focus:outline-none leading-relaxed"
            />

            {/* Right Group: Voice Mic Button & Send Button */}
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
                disabled={
                  isLoading ||
                  isPdfUploading ||
                  (!inputText.trim() && !attachedPdf)
                }
                className="w-10 h-10 rounded-xl bg-[#1B365D] hover:bg-[#142846] text-white shadow-xs"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Input Helper Text */}
      <div className="mt-2 text-center text-[11px] text-slate-600 font-medium select-none">
        Tekan <kbd className="font-mono bg-slate-200/80 px-1 rounded text-[10px]">Enter</kbd> untuk kirim, <kbd className="font-mono bg-slate-200/80 px-1 rounded text-[10px]">Shift+Enter</kbd> untuk baris baru. Mendukung PDF hingga 20 MB.
      </div>
    </div>
  );
}
