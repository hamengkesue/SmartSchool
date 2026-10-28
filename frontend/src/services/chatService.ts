import { FASTAPI_BASE_URL } from "./apiClient";
import { ApiChatResponse } from "../types/api.types";
import { UserRole } from "../types/chat.types";
import { getMockResponse } from "../mocks/mockChatResponses";

export interface SendMessageParams {
  message: string;
  sessionId: string;
  role: UserRole;
  pdfAttachmentId?: string;
  pdfAttachmentName?: string;
  pdfContent?: string;       // Teks yang diekstrak dari file PDF yang dilampirkan
  chatMessages?: Array<{ sender: string; text?: string; content?: string }>;
  forceMock?: boolean;
}

/**
 * Sends a user query to the AI engine (FastAPI /api/v1/chat).
 * Automatically falls back to mock responses if backend is unreachable or forceMock is true.
 */
export async function sendChatMessage(
  params: SendMessageParams
): Promise<{ response: ApiChatResponse; isFromMock: boolean }> {
  const { message, sessionId, role, pdfAttachmentId, pdfAttachmentName, pdfContent, chatMessages, forceMock } = params;

  if (forceMock) {
    await new Promise((res) => setTimeout(res, 600));
    const mock = getMockResponse(message, role, !!pdfAttachmentId, pdfAttachmentName);
    return { response: mock, isFromMock: true };
  }

  // URL Target FastAPI (Default: http://127.0.0.1:8000/api/v1/chat)
  const chatApiUrl =
    process.env.NEXT_PUBLIC_FASTAPI_CHAT_URL ||
    (FASTAPI_BASE_URL
      ? `${FASTAPI_BASE_URL.replace(/\/$/, "")}/api/v1/chat`
      : "http://127.0.0.1:8000/api/v1/chat");

  try {
    // 1. Format riwayat pesan dari UI menjadi format yang dikenali FastAPI ({ role, content })
    //    (Asumsi: 'messages' adalah array obrolan di UI Anda saat ini)
    const formattedHistory = (chatMessages || []).map((msg) => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.text || msg.content || "",
    }));

    const response = await fetch(chatApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: message,
        role: role,
        session_id: sessionId,
        pdf_content: pdfContent || "",
        pdf_filename: pdfAttachmentName || "",
        history: formattedHistory, // <--- TAMBAHKAN BARIS INI
      }),
      // AbortController timeout 60 detik untuk mengakomodasi eksekusi model AI & tools
      signal: AbortSignal.timeout(60000),
    });

    if (response.ok) {
      const data = await response.json();
      const answer =
        data.content ||
        data.answer ||
        data.message ||
        (typeof data === "string" ? data : "");

      return {
        response: {
          answer,
          type: data.type || "text",
          citations: data.citations,
          sppData: data.sppData,
          generatedPdf: data.generatedPdf,
        },
        isFromMock: false,
      };
    } else {
      console.warn(
        `[SmartSchool AI] FastAPI mengembalikan status ${response.status}: ${response.statusText}`
      );
    }
  } catch (err) {
    console.warn("[SmartSchool AI] Gagal terhubung ke FastAPI backend, beralih ke mock:", err);
  }

  // Graceful Fallback: Generate intelligent mock response so UI remains 100% interactive
  console.warn(
    "[SmartSchool AI] Backend FastAPI offline atau timed out. Mengaktifkan respons simulasi (mock)."
  );
  await new Promise((res) => setTimeout(res, 400));
  const fallbackMock = getMockResponse(message, role, !!pdfAttachmentId, pdfAttachmentName);
  return { response: fallbackMock, isFromMock: true };
}

