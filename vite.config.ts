import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { Buffer } from 'node:buffer';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import { handleGroqChatRequest } from './src/server/groqChatHandler';

const MAX_GROQ_BODY_BYTES = 256_000;

function localGroqApi(apiKey: string | undefined): Plugin {
  return {
    name: 'local-groq-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/ai-chat', async (req, res) => {
        const sendJson = (status: number, body: unknown) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify(body));
        };

        if (req.method !== 'POST') {
          res.setHeader('Allow', 'POST');
          sendJson(405, { success: false, error: 'Chỉ hỗ trợ POST.' });
          return;
        }

        const chunks: Buffer[] = [];
        let bodyLength = 0;
        try {
          for await (const chunk of req) {
            const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
            bodyLength += buffer.length;
            if (bodyLength > MAX_GROQ_BODY_BYTES) {
              sendJson(413, { success: false, error: 'Dữ liệu gửi lên quá lớn.' });
              return;
            }
            chunks.push(buffer);
          }

          let payload: unknown;
          try {
            payload = JSON.parse(Buffer.concat(chunks).toString('utf8'));
          } catch {
            sendJson(400, { success: false, error: 'Nội dung yêu cầu không hợp lệ.' });
            return;
          }

          const result = await handleGroqChatRequest(payload, apiKey);
          sendJson(result.status, result.body);
        } catch {
          if (!res.writableEnded) {
            sendJson(502, { success: false, error: 'Không thể xử lý yêu cầu AI.' });
          }
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const localEnv = loadEnv(mode, process.cwd(), '');
  const groqApiKey = process.env.GROQ_API_KEY || localEnv.GROQ_API_KEY || localEnv.VITE_GROQ_API_KEY;

  return {
    plugins: [localGroqApi(groqApiKey), react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
