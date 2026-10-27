"use client";

import { useState, useCallback } from "react";
import { FileAttachment } from "../types/chat.types";
import { validatePdfFile, uploadPdfDocument } from "../services/pdfService";

/**
 * Hook untuk Admin: Upload PDF ke backend FastAPI → Qdrant Cloud (indexing RAG).
 * Hanya digunakan oleh role Admin untuk menambahkan dokumen pedoman ke knowledge base.
 */
export function usePdfUpload() {
  const [attachedPdf, setAttachedPdf] = useState<FileAttachment | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);

  const handleSelectFile = useCallback(async (file: File, isMockMode = false) => {
    setUploadError(null);
    setUploadSuccessMsg(null);

    const validation = validatePdfFile(file);
    if (!validation.isValid) {
      setUploadError(validation.error || "File tidak valid.");
      return false;
    }

    const newAttachment: FileAttachment = {
      id: `pdf-att-${Date.now()}`,
      name: file.name,
      size: file.size,
      type: "application/pdf",
      progress: 10,
      status: "uploading",
    };

    setAttachedPdf(newAttachment);
    setIsUploading(true);

    try {
      // Animasi progress awal
      setAttachedPdf((prev) => (prev ? { ...prev, progress: 25 } : null));
      await new Promise((r) => setTimeout(r, 150));
      setAttachedPdf((prev) => (prev ? { ...prev, progress: 55 } : null));

      // Upload ke FastAPI → Qdrant Cloud (indexing RAG)
      const result = await uploadPdfDocument(file, true, isMockMode);

      setAttachedPdf((prev) => (prev ? { ...prev, progress: 100, status: "ready" } : null));
      setUploadSuccessMsg(
        `✅ "${file.name}" berhasil diindeks ke Qdrant Cloud (${result.chunksIndexed} chunks). AI kini dapat menjawab berdasarkan dokumen ini.`
      );
      setIsUploading(false);
      return true;
    } catch (err) {
      setAttachedPdf((prev) =>
        prev ? { ...prev, status: "error", errorMessage: "Gagal mengindeks dokumen ke Qdrant." } : null
      );
      setUploadError("Gagal mengindeks dokumen. Pastikan backend FastAPI aktif.");
      setIsUploading(false);
      return false;
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setAttachedPdf(null);
    setIsUploading(false);
    setUploadError(null);
    setUploadSuccessMsg(null);
  }, []);

  return {
    attachedPdf,
    isUploading,
    uploadError,
    uploadSuccessMsg,
    handleSelectFile,
    handleRemoveFile,
    setAttachedPdf,
  };
}
