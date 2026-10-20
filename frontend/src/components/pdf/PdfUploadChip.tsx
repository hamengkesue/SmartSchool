"use client";

import React from "react";
import { FileText, X, CheckCircle2, AlertCircle } from "lucide-react";
import { FileAttachment } from "@/types/chat.types";
import { formatFileSize } from "@/lib/utils";

interface PdfUploadChipProps {
  attachment: FileAttachment;
  onRemove: () => void;
}

export function PdfUploadChip({ attachment, onRemove }: PdfUploadChipProps) {
  const isReady = attachment.status === "ready";
  const isError = attachment.status === "error";

  return (
    <div className="relative mb-2.5 mx-1 flex items-center gap-3 p-2.5 px-3 bg-white border border-slate-200/90 rounded-xl shadow-xs animate-in slide-in-from-bottom-2 duration-200">
      {/* Red PDF Icon badge */}
      <div className="w-9 h-9 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0 text-rose-600">
        <FileText className="w-5 h-5" />
      </div>

      {/* File Info & Upload Progress */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-slate-800 truncate" title={attachment.name}>
            {attachment.name}
          </p>
          <span className="text-[11px] text-slate-500 shrink-0 font-medium">
            {formatFileSize(attachment.size)}
          </span>
        </div>

        {/* Progress or status line */}
        <div className="mt-1.5 flex items-center gap-2">
          {!isReady && !isError && (
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#0D9488] h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${attachment.progress}%` }}
              />
            </div>
          )}

          {isReady && (
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>PDF siap dibaca AI</span>
            </div>
          )}

          {isError && (
            <div className="flex items-center gap-1 text-[11px] text-rose-600 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{attachment.errorMessage || "Gagal mengunggah"}</span>
            </div>
          )}
        </div>
      </div>

      {/* Remove Button */}
      <button
        type="button"
        onClick={onRemove}
        aria-label="Batalkan lampiran PDF"
        className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
