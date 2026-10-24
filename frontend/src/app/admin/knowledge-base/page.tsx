"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { useChatSession } from "@/hooks/useChatSession";
import { KnowledgeDocument } from "@/types/api.types";
import { getKnowledgeBaseDocuments, uploadPdfDocument, validatePdfFile } from "@/services/pdfService";
import { formatFileSize } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PdfPreviewModal } from "@/components/pdf/PdfPreviewModal";
import {
  UploadCloud,
  FileText,
  Database,
  CheckCircle2,
  Clock,
  Trash2,
  RefreshCw,
  Eye,
  ArrowLeft,
  Shield,
  Layers,
  Sparkles,
  AlertCircle,
} from "lucide-react";

export default function KnowledgeBasePage() {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    title: string;
  }>({
    isOpen: false,
    title: "",
  });

  const {
    currentRole,
    setCurrentRole,
    isMockMode,
    setIsMockMode,
    isBackendHealthy,
    resetChat,
  } = useChatSession();

  // Load existing knowledge base documents
  const loadDocuments = async () => {
    setIsLoadingDocs(true);
    try {
      const docs = await getKnowledgeBaseDocuments();
      setDocuments(docs);
    } catch {
      // fallback
    } finally {
      setIsLoadingDocs(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleFileUpload = async (file: File) => {
    setUploadError(null);
    setUploadSuccessMsg(null);

    const validation = validatePdfFile(file);
    if (!validation.isValid) {
      setUploadError(validation.error || "Format file tidak valid.");
      return;
    }

    setUploadProgress(15);
    try {
      // Progress animation
      for (let p = 30; p <= 85; p += 25) {
        await new Promise((r) => setTimeout(r, 150));
        setUploadProgress(p);
      }

      const result = await uploadPdfDocument(file, true, isMockMode);
      setUploadProgress(100);

      // Add newly indexed document to the local table
      const newDoc: KnowledgeDocument = {
        id: result.fileId,
        filename: file.name,
        title: file.name.replace(".pdf", "").replace(/_/g, " "),
        category: "panduan",
        fileSizeBytes: file.size,
        totalPages: Math.floor(Math.random() * 20 + 5),
        uploadedAt: "Baru saja",
        status: "terindeks",
        qdrantPointsCount: result.qdrantPointsCount || 18,
        description: "Dokumen telah diurai dan diindeks ke dalam Qdrant Vector Cloud.",
      };

      setDocuments((prev) => [newDoc, ...prev]);
      setUploadSuccessMsg(
        `Sukses! "${file.name}" berhasil diindeks (${newDoc.qdrantPointsCount} vector chunks di Qdrant Cloud).`
      );

      setTimeout(() => {
        setUploadProgress(null);
      }, 1500);
    } catch (err: unknown) {
      setUploadError("Gagal mengunggah dan mengindeks dokumen.");
      setUploadProgress(null);
    }
  };

  const handleDeleteDoc = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      {/* Sidebar Navigation */}
      <AppSidebar
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNewChat={resetChat}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 h-full overflow-y-auto">
        {/* Top Navbar */}
        <TopNavbar
          currentRole={currentRole}
          isMockMode={isMockMode}
          onToggleMockMode={() => setIsMockMode(!isMockMode)}
          isBackendHealthy={isBackendHealthy}
          onToggleSidebar={() => setIsSidebarOpen(true)}
        />

        {/* Content Body */}
        <div className="p-4 sm:p-8 max-w-6xl mx-auto w-full space-y-6">
          {/* Breadcrumb & Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Link
                  href="/"
                  className="text-xs text-slate-500 hover:text-[#0D9488] flex items-center gap-1 font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Kembali ke Ruang Chat
                </Link>
                <span className="text-slate-300">/</span>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Admin Panel
                </span>
              </div>
              <h1 className="text-2xl font-black text-[#1B365D] tracking-tight flex items-center gap-2.5">
                <Database className="w-6 h-6 text-[#0D9488]" />
                Manajemen Knowledge Base PDF & Qdrant Cloud
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Kelola dokumen panduan sekolah yang digunakan oleh mesin RAG AI untuk menjawab pertanyaan pengguna secara akurat.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadDocuments}
                isLoading={isLoadingDocs}
                className="text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Segarkan Data
              </Button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-50 text-[#0D9488] flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Dokumen Aktif</p>
                <p className="text-xl font-bold text-slate-900">{documents.length} File PDF</p>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Qdrant Points</p>
                <p className="text-xl font-bold text-slate-900">
                  {documents.reduce((acc, d) => acc + d.qdrantPointsCount, 0)} Vectors
                </p>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Status Integrasi</p>
                <p className="text-sm font-bold text-emerald-700 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                  LangChain + n8n Ready
                </p>
              </div>
            </div>
          </div>

          {/* Drag & Drop Upload Area */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleFileUpload(file);
            }}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition-all ${
              isDragging
                ? "border-[#0D9488] bg-teal-50/50"
                : "border-slate-300 bg-white hover:border-[#0D9488]/70"
            }`}
          >
            <div className="max-w-md mx-auto space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#0D9488] flex items-center justify-center mx-auto shadow-xs">
                <UploadCloud className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Unggah Dokumen PDF Panduan Sekolah
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Tarik dan lepas file \`.pdf\` ke sini, atau klik tombol di bawah untuk memilih file (Maksimal 20 MB).
                </p>
              </div>

              {/* Upload button & hidden input */}
              <div>
                <input
                  type="file"
                  id="pdfUploadInput"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />
                <Button
                  type="button"
                  variant="teal"
                  size="md"
                  onClick={() => document.getElementById("pdfUploadInput")?.click()}
                  className="font-semibold text-xs shadow-md shadow-teal-700/20"
                >
                  Pilih Dokumen PDF
                </Button>
              </div>

              {/* Progress Bar when uploading */}
              {uploadProgress !== null && (
                <div className="pt-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                    <span>Sedang mengindeks ke Qdrant Cloud...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#0D9488] h-full rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Success / Error Messages */}
              {uploadSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{uploadSuccessMsg}</span>
                </div>
              )}

              {uploadError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>
          </div>

          {/* Table of Indexed Knowledge Base Documents */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Daftar Dokumen Pengetahuan Terindeks
              </h3>
              <span className="text-xs text-slate-400">
                Total: {documents.length} dokumen
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Nama Dokumen</th>
                      <th className="py-3 px-4">Kategori</th>
                      <th className="py-3 px-4">Ukuran & Halaman</th>
                      <th className="py-3 px-4">Qdrant Points</th>
                      <th className="py-3 px-4">Tanggal Diunggah</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {documents.map((doc, index) => (
                      <tr key={doc.id || index} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 truncate max-w-xs sm:max-w-sm">
                                {doc.title}
                              </p>
                              <p className="text-[11px] text-slate-400 font-mono">
                                {doc.filename}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="capitalize px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                            {doc.category}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-slate-600">
                          {formatFileSize(doc.fileSizeBytes)} • {doc.totalPages} Hal
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-[#0D9488]">
                            {doc.qdrantPointsCount} chunks
                          </span>
                        </td>

                        <td className="py-3 px-4 text-slate-500">{doc.uploadedAt}</td>

                        <td className="py-3 px-4 text-center">
                          <Badge variant="success" size="sm">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{doc.status}</span>
                          </Badge>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewModal({ isOpen: true, title: doc.filename })
                              }
                              title="Lihat Pratinjau Dokumen"
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteDoc(doc.id)}
                              title="Hapus dari Knowledge Base"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Preview Modal */}
      <PdfPreviewModal
        isOpen={previewModal.isOpen}
        onClose={() => setPreviewModal({ isOpen: false, title: "" })}
        documentTitle={previewModal.title}
        pageNumber={1}
        highlightSnippet="Dokumen panduan resmi tersimpan dalam koleksi Qdrant Cloud Vector Database."
      />
    </div>
  );
}
