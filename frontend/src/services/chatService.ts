import { apiClient, N8N_WEBHOOK_URL } from "./apiClient";
import { ApiChatRequest, ApiChatResponse } from "../types/api.types";
import { UserRole } from "../types/chat.types";
import { getMockResponse } from "../mocks/mockChatResponses";

export interface SendMessageParams {
  message: string;
  sessionId: string;
  role: UserRole;
  pdfAttachmentId?: string;
  pdfAttachmentName?: string;
  forceMock?: boolean;
}

/**
 * Sends a user query to the AI engine (FastAPI / n8n via Ngrok).
 * Automatically falls back to mock responses if backend is unreachable or forceMock is true.
 */
export async function sendChatMessage(
  params: SendMessageParams
): Promise<{ response: ApiChatResponse; isFromMock: boolean }> {
  const { message, sessionId, role, pdfAttachmentId, pdfAttachmentName, forceMock } = params;

  // If user explicitly chose Demo/Mock Mode, immediately return mock
  if (forceMock) {
    // Artificial latency for realistic conversational UI feel
    await new Promise((res) => setTimeout(res, 600));
    const mock = getMockResponse(message, role, !!pdfAttachmentId, pdfAttachmentName);
    return { response: mock, isFromMock: true };
  }

  // 1. Try FastAPI endpoint
  const payload: ApiChatRequest = {
    message,
    sessionId,
    role,
    pdfAttachmentId,
  };

  const result = await apiClient<ApiChatResponse>("api/v1/chat", {
    method: "POST",
    body: JSON.stringify(payload),
    timeoutMs: 9000,
  });

  if (result.data && !result.error) {
    return { response: result.data, isFromMock: false };
  }

  // 2. Optional secondary fallback to n8n webhook if FastAPI is unreachable
  if (N8N_WEBHOOK_URL) {
    try {
      const n8nResult = await apiClient<ApiChatResponse>(N8N_WEBHOOK_URL, {
        method: "POST",
        body: JSON.stringify({
          query: message,
          session_id: sessionId,
          user_role: role,
          attachment_id: pdfAttachmentId,
        }),
        timeoutMs: 6000,
      });

      if (n8nResult.data && !n8nResult.error) {
        return { response: n8nResult.data, isFromMock: false };
      }
    } catch {
      // Proceed to mock fallback
    }
  }

  // 3. Graceful Fallback: Generate intelligent mock response so UI remains 100% interactive
  console.warn(
    "[SmartSchool AI] Backend Ngrok tunnel offline or timed out. Activating smart mock response."
  );
  await new Promise((res) => setTimeout(res, 400));
  const fallbackMock = getMockResponse(message, role, !!pdfAttachmentId, pdfAttachmentName);
  return { response: fallbackMock, isFromMock: true };
}
