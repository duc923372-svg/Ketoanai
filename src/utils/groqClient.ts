/**
 * Groq API client cho chức năng "Kế toán AI Hỏi đáp".
 * Khóa API được giữ ở máy chủ; trình duyệt chỉ gọi endpoint cùng nguồn.
 */

const GROQ_CHAT_ENDPOINT = '/api/ai-chat';

export interface GroqMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface GroqChatContext {
  companyName?: string;
  kpis?: Record<string, any>;
  transactions?: any[];
  categories?: any[];
  alerts?: any[];
  orders?: any[];
  products?: any[];
}

export async function callGroqAPI(
  userMessage: string,
  history: GroqMessage[],
  context: GroqChatContext
): Promise<string> {
  const response = await fetch(GROQ_CHAT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: userMessage,
      history: history.slice(-10),
      context,
    }),
  });

  const data = await response.json().catch(() => ({})) as {
    answer?: string;
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error || `Không thể gọi Trợ lý AI (${response.status}).`);
  }

  const answer = data.answer?.trim();
  if (!answer) {
    throw new Error('Groq API trả về phản hồi rỗng.');
  }

  return answer;
}
