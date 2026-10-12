import { env } from 'node:process';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleGroqChatRequest } from '../src/server/groqChatHandler';

const MAX_BODY_BYTES = 256_000;

interface VercelRequest extends IncomingMessage {
  body?: unknown;
}

interface VercelResponse extends ServerResponse {
  status(code: number): VercelResponse;
  json(body: unknown): VercelResponse;
}

function parsePayload(body: unknown): unknown {
  if (typeof body !== 'string') return body;
  return JSON.parse(body);
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ success: false, error: 'Chỉ hỗ trợ POST.' });
  }

  const contentLength = Number(request.headers['content-length'] || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return response.status(413).json({ success: false, error: 'Dữ liệu gửi lên quá lớn.' });
  }

  let payload: unknown;
  try {
    payload = parsePayload(request.body);
  } catch {
    return response.status(400).json({ success: false, error: 'Nội dung yêu cầu không hợp lệ.' });
  }

  try {
    const apiKey = env.GROQ_API_KEY || env.VITE_GROQ_API_KEY;
    const result = await handleGroqChatRequest(payload, apiKey);
    return response.status(result.status).json(result.body);
  } catch {
    return response.status(500).json({
      success: false,
      error: 'Máy chủ chưa xử lý được yêu cầu AI. Vui lòng thử lại.',
    });
  }
}
