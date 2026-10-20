"use client";

import React, { useState } from "react";
import { FileText, Download, Eye, CheckCircle2, ShieldCheck } from "lucide-react";
import { GeneratedPdf } from "@/types/chat.types";
import { Button } from "@/components/ui/Button";

interface PdfDownloadCardProps {
  pdf: GeneratedPdf;
  onPreview?: (pdf: GeneratedPdf) => void;
}

export function PdfDownloadCard({ pdf, onPreview }: PdfDownloadCardProps) {
  const [hasDownloaded, setHasDownloaded] = useState(false);

  const handleDownload = () => {
    setHasDownloaded(true);
    // Create an elegant simulated download of the PDF file
    const element = document.createElement("a");
    const sampleContent = `%PDF-1.4
% SmartSchool AI Generated Document: ${pdf.title}
% Ref Number: ${pdf.documentRefNumber || "SMART-OFFICIAL-2026"}
% Date: ${pdf.createdAt}
==================================================
PEMERINTAH DAERAH PROVINSI / YAYASAN PENDIDIKAN
SMART SCHOOL ACADEMY - TERAKREDITASI A
${pdf.title}
==================================================
Status: DIVERIFIKASI RESMI
Dicetak secara otomatis melalui SmartSchool AI Assistant.`;

    const file = new Blob([sampleContent], { type: "application/pdf" });
    element.href = URL.createObjectURL(file);
    element.download = pdf.filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    setTimeout(() => setHasDownloaded(false), 3000);
  };

  return (
    <div className="mt-3.5 rounded-xl border border-slate-200/90 bg-gradient-to-br from-white via-slate-50/50 to-slate-100/50 p-4 shadow-xs transition-all hover:shadow-md hover:border-slate-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        {/* Left: Icon & Title */}
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="relative shrink-0">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-b from-rose-500 to-rose-600 flex items-center justify-center text-white shadow-xs">
              <FileText className="w-6 h-6" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-semibold text-slate-800 tracking-tight truncate">
                {pdf.title}
              </h4>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                PDF Dokumen
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-0.5">
              {pdf.filename} • <span className="font-medium text-slate-600">{pdf.size}</span>
              {pdf.pagesCount && ` • ${pdf.pagesCount} Halaman`}
            </p>

            <p className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping" />
              Dokumen resmi ber-kop surat sekolah • Terverifikasi
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          {onPreview && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onPreview(pdf)}
              className="text-xs font-medium"
            >
              <Eye className="w-3.5 h-3.5" />
              Pratinjau
            </Button>
          )}

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleDownload}
            className="text-xs font-semibold bg-[#1B365D] hover:bg-[#142846]"
          >
            {hasDownloaded ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Tersimpan
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                Unduh PDF
              </>
            )}
          </Button>
        </div>
      </div>

      {pdf.documentRefNumber && (
        <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
          <span>No. Registrasi: <strong className="text-slate-600 font-mono">{pdf.documentRefNumber}</strong></span>
          <span>Dibuat: {pdf.createdAt}</span>
        </div>
      )}
    </div>
  );
}
