import { env } from 'node:process';
import { handleGroqChatRequest } from '../src/server/groqChatHandler';

const MAX_BODY_BYTES = 256_000;

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
      return Response.json(
        { success: false, error: 'Chỉ hỗ trợ POST.' },
        { status: 405, headers: { Allow: 'POST' } }
      );
    }

    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > MAX_BODY_BYTES) {
      return Response.json(
        { success: false, error: 'Dữ liệu gửi lên quá lớn.' },
        { status: 413 }
      );
    }

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return Response.json(
        { success: false, error: 'Nội dung yêu cầu không hợp lệ.' },
        { status: 400 }
      );
    }

    const apiKey = env.GROQ_API_KEY || env.VITE_GROQ_API_KEY;
    const result = await handleGroqChatRequest(payload, apiKey);
    return Response.json(result.body, { status: result.status });
  },
};
