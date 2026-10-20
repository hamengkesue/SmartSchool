"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FileText, Printer, Download, BookOpen, CheckCircle } from "lucide-react";

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  pageNumber?: number;
  highlightSnippet?: string;
}

export function PdfPreviewModal({
  isOpen,
  onClose,
  documentTitle,
  pageNumber = 1,
  highlightSnippet,
}: PdfPreviewModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="4xl"
      title={
        <div className="flex items-center gap-2 text-sm text-slate-800">
          <FileText className="w-4 h-4 text-rose-500" />
          <span>Pratinjau Dokumen: <strong className="font-semibold">{documentTitle}</strong></span>
          <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-normal">
            Halaman {pageNumber}
          </span>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Document Action Toolbar */}
        <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <BookOpen className="w-4 h-4 text-[#0D9488]" />
            <span>Mode Baca Terverifikasi (Qdrant Cloud RAG Index)</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="text-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak Dokumen
            </Button>
            <Button
              type="button"
              variant="teal"
              size="sm"
              onClick={() => alert(`Mengunduh salinan resmi: ${documentTitle}`)}
              className="text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              Unduh File Asli
            </Button>
          </div>
        </div>

        {/* Simulated High-Fidelity Paper Document Container */}
        <div className="relative bg-white border border-slate-200 rounded-xl p-8 sm:p-12 shadow-sm font-serif text-slate-800 min-h-[460px] overflow-hidden select-text">
          {/* Subtle Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-4 select-none">
            <span className="text-7xl font-bold -rotate-45 tracking-widest text-[#1B365D]">
              SMARTSCHOOL AI
            </span>
          </div>

          {/* Official Kop Surat (School Letterhead) */}
          <div className="border-b-2 border-slate-800 pb-4 mb-6 flex items-center gap-5">
            <img
              src="/images/logo-sekolah.png"
              alt="Logo Sekolah"
              className="w-16 h-16 object-contain shrink-0"
            />
            <div className="flex-1 text-center font-sans">
              <h2 className="text-xs font-bold tracking-wider text-slate-600 uppercase">
                Yayasan Pendidikan Bina Bangsa Mandiri
              </h2>
              <h1 className="text-lg font-black text-[#1B365D] tracking-tight">
                SMA SMART SCHOOL ACADEMY
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">
                Jl. Pendidikan Terpadu No. 128, Kawasan Edukasi • Telp: (021) 7890-1234 • Website: www.smartschool.sch.id
              </p>
            </div>
          </div>

          {/* Document Content */}
          <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-slate-700">
            <div className="text-center font-sans mb-6">
              <h3 className="text-base font-bold text-slate-900 uppercase underline decoration-1 underline-offset-4">
                {documentTitle.replace(".pdf", "").replace(/_/g, " ")}
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-1">
                Ref. Dokumen: 421.3/KEU-SMART/PPDB/X/2026 • Hal. {pageNumber}
              </p>
            </div>

            {/* Citation Highlight Box if opened via citation pill */}
            {highlightSnippet && (
              <div className="my-4 p-4 rounded-xl bg-amber-50/80 border-l-4 border-amber-500 text-amber-950 font-sans shadow-xs">
                <div className="flex items-center gap-1.5 font-bold text-xs text-amber-800 mb-1">
                  <CheckCircle className="w-3.5 h-3.5 text-amber-600" />
                  Kutipan yang Dirujuk AI (Halaman {pageNumber}):
                </div>
                <p className="text-xs italic leading-normal font-medium">
                  &ldquo;{highlightSnippet}&rdquo;
                </p>
              </div>
            )}

            <p>
              Penerimaan Peserta Didik Baru (PPDB) SMA Smart School diselenggarakan secara terpusat, transparan, dan akuntabel menggunakan sistem digital terintegrasi. Calon peserta didik dan orang tua/wali wajib memenuhi seluruh prasyarat administratif sebelum mengikuti tes pemetaan bakat akademik.
            </p>

            <h4 className="font-bold text-slate-900 font-sans text-xs uppercase tracking-wider mt-4">
              Ketentuan Pembayaran & Registrasi Ulang:
            </h4>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 font-sans">
              <li>Biaya formulir dan pendaftaran bersifat non-refundable (tidak dapat ditarik kembali).</li>
              <li>Peserta didik yang dinyatakan lulus seleksi wajib melakukan pelunasan SPP bulan pertama paling lambat 7 hari kerja setelah pengumuman.</li>
              <li>Bagi siswa pemegang KIP/PIP dapat mengajukan surat dispensasi keringanan SPP melalui loket Tata Usaha sekolah.</li>
            </ul>

            <div className="pt-8 mt-8 border-t border-slate-200 flex justify-between items-end font-sans text-xs text-slate-600">
              <div>
                <p className="font-semibold text-slate-800">Mengetahui,</p>
                <p className="mt-12 font-bold text-slate-900 underline">Dr. Hendra Wijaya, M.Pd.</p>
                <p className="text-[11px] text-slate-500">Kepala Sekolah</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-slate-400">Dicap dan ditandatangani secara digital</p>
                <span className="inline-block px-2.5 py-1 mt-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                  ✓ Qdrant Vector Certified
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex justify-end pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Tutup Pratinjau
          </Button>
        </div>
      </div>
    </Modal>
  );
}
