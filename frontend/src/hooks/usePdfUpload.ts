"use client";

import { useState, useCallback } from "react";
import { FileAttachment } from "../types/chat.types";
import { validatePdfFile } from "../services/pdfService";

export function usePdfUpload() {
  const [attachedPdf, setAttachedPdf] = useState<FileAttachment | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleSelectFile = useCallback(async (file: File) => {
    setUploadError(null);
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
      progress: 15,
      status: "uploading",
    };

    setAttachedPdf(newAttachment);
    setIsUploading(true);

    // Simulate smooth progress animation
    try {
      for (let p = 25; p <= 90; p += 25) {
        await new Promise((r) => setTimeout(r, 120));
        setAttachedPdf((prev) => (prev ? { ...prev, progress: p } : null));
      }

      await new Promise((r) => setTimeout(r, 180));
      setAttachedPdf((prev) =>
        prev
          ? {
              ...prev,
              progress: 100,
              status: "ready",
            }
          : null
      );
      setIsUploading(false);
      return true;
    } catch {
      setAttachedPdf((prev) =>
        prev ? { ...prev, status: "error", errorMessage: "Gagal memproses file." } : null
      );
      setIsUploading(false);
      return false;
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setAttachedPdf(null);
    setIsUploading(false);
    setUploadError(null);
  }, []);

  return {
    attachedPdf,
    isUploading,
    uploadError,
    handleSelectFile,
    handleRemoveFile,
    setAttachedPdf,
  };
}
