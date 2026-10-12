import type { GroqChatContext, GroqMessage } from '../utils/groqClient';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'openai/gpt-oss-120b';
const MAX_MESSAGE_LENGTH = 4000;

export interface GroqChatResponse {
  success: boolean;
  answer?: string;
  error?: string;
}

export interface GroqHandlerResult {
  status: number;
  body: GroqChatResponse;
}

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function buildSystemPrompt(ctx: GroqChatContext): string {
  const kpisText = ctx.kpis
    ? `
KPI HIỆN TẠI:
- Tổng doanh thu: ${ctx.kpis.totalRevenue?.toLocaleString('vi-VN')} ₫
- Tổng chi phí: ${ctx.kpis.totalExpense?.toLocaleString('vi-VN')} ₫
- Lợi nhuận ròng: ${ctx.kpis.netProfit?.toLocaleString('vi-VN')} ₫
- Biên lợi nhuận: ${ctx.kpis.netProfitMargin?.toFixed(1)}%
- Số giao dịch: ${ctx.kpis.transactionCount}`
    : '';

  const txText =
    ctx.transactions && ctx.transactions.length > 0
      ? `\nGIAO DỊCH GẦN ĐÂY (${ctx.transactions.length} giao dịch):\n` +
        ctx.transactions
          .slice(0, 30)
          .map(
            (t: any) =>
              `• [${t.date}] ${t.type === 'INCOME' ? '+' : '-'}${Number(t.amount).toLocaleString('vi-VN')}₫ | ${t.categoryName} | ${t.description}`
          )
          .join('\n')
      : '';

  const orderText =
    ctx.orders && ctx.orders.length > 0
      ? `\nĐƠN HÀNG (${ctx.orders.length} đơn):\n` +
        ctx.orders
          .slice(0, 20)
          .map(
            (o: any) =>
              `• [${o.date}] ${o.platform} | ${o.productName} x${o.quantity} | DT: ${Number(o.revenue).toLocaleString('vi-VN')}₫ | LN: ${Number(o.netProfit).toLocaleString('vi-VN')}₫ | ${o.status}`
          )
          .join('\n')
      : '';

  const productText =
    ctx.products && ctx.products.length > 0
      ? `\nSẢN PHẨM:\n` +
        ctx.products
          .slice(0, 15)
          .map(
            (p: any) =>
              `• ${p.name} (${p.sku}) | Bán: ${Number(p.sellingPrice).toLocaleString('vi-VN')}₫ | Vốn: ${Number(p.costPrice).toLocaleString('vi-VN')}₫ | Biên LN: ${p.profitMargin?.toFixed(1)}% | Đã bán: ${p.totalSold}`
          )
          .join('\n')
      : '';

  const alertText =
    ctx.alerts && ctx.alerts.length > 0
      ? `\nCẢNH BÁO HIỆN TẠI:\n` +
        ctx.alerts
          .filter((a: any) => a.status !== 'RESOLVED')
          .slice(0, 10)
          .map((a: any) => `• [${a.severity}] ${a.title}: ${a.description}`)
          .join('\n')
      : '';

  return `Bạn là **Trợ Lý Kế Toán AI Smart Ledger** - chuyên gia tài chính kế toán cao cấp cho doanh nghiệp Việt Nam.

NHIỆM VỤ CỐT LÕI:
- Phân tích dữ liệu sổ cái thực tế của ${ctx.companyName || 'doanh nghiệp'} để trả lời các câu hỏi kế toán, tài chính
- Áp dụng chuẩn mực kế toán Việt Nam: Thông tư 133/2016/TT-BTC và TT 200/2014/TT-BTC
- Tư vấn thuế GTGT, TNDN, TNCN theo Luật Thuế Việt Nam hiện hành
- Phát hiện bất thường, gợi ý tối ưu chi phí và dòng tiền
- Hỗ trợ hạch toán định khoản, lập báo cáo tài chính

QUY TẮC TRẢ LỜI:
1. Luôn trả lời bằng **tiếng Việt** rõ ràng, dễ hiểu với người không chuyên
2. Sử dụng số liệu thực tế từ dữ liệu sổ cái được cung cấp khi có
3. Định dạng câu trả lời với **in đậm**, gạch đầu dòng, và số liệu cụ thể
4. Với câu hỏi kế toán phức tạp: giải thích từng bước, nêu căn cứ pháp lý
5. Khi không có dữ liệu đủ: ước tính hợp lý và nêu rõ giả định
6. Cuối câu trả lời: gợi ý 2-3 câu hỏi liên quan để người dùng hỏi thêm

DỮ LIỆU SỔ CÁI THỰC TẾ:
${kpisText}
${txText}
${orderText}
${productText}
${alertText}

Hãy phân tích dữ liệu trên và trả lời câu hỏi của người dùng một cách chính xác, chi tiết và hữu ích.`;
}

function normalizeHistory(value: unknown): GroqMessage[] {
  if (!Array.isArray(value)) return [];

  return value
    .slice(-10)
    .filter((item): item is { role: 'user' | 'assistant'; content: string } =>
      isRecord(item) &&
      (item.role === 'user' || item.role === 'assistant') &&
      typeof item.content === 'string' &&
      item.content.trim().length > 0
    )
    .map((item) => ({
      role: item.role,
      content: item.content.trim().slice(0, MAX_MESSAGE_LENGTH),
    }));
}

export async function handleGroqChatRequest(
  payload: unknown,
  apiKey: string | undefined
): Promise<GroqHandlerResult> {
  if (!apiKey) {
    return {
      status: 503,
      body: { success: false, error: 'Chưa cấu hình GROQ_API_KEY trên máy chủ.' },
    };
  }

  if (!isRecord(payload)) {
    return { status: 400, body: { success: false, error: 'Nội dung yêu cầu không hợp lệ.' } };
  }

  const message = typeof payload.message === 'string' ? payload.message.trim() : '';
  if (!message || message.length > MAX_MESSAGE_LENGTH) {
    return {
      status: 400,
      body: { success: false, error: 'Câu hỏi không hợp lệ hoặc vượt quá 4.000 ký tự.' },
    };
  }

  const context = isRecord(payload.context) ? payload.context as GroqChatContext : {};
  const history = normalizeHistory(payload.history);
  const groqMessages = [
    { role: 'system', content: buildSystemPrompt(context) },
    ...history,
    { role: 'user', content: message },
  ];

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: groqMessages,
        temperature: 0.4,
        max_tokens: 1500,
        top_p: 0.9,
        stream: false,
      }),
    });

    const data = await response.json().catch(() => ({})) as {
      choices?: Array<{ message?: { content?: string } }>;
      error?: { message?: string };
    };

    if (!response.ok) {
      return {
        status: 502,
        body: {
          success: false,
          error: data.error?.message || 'Groq chưa xử lý được câu hỏi. Vui lòng thử lại.',
        },
      };
    }

    const answer = data.choices?.[0]?.message?.content?.trim();
    if (!answer) {
      return { status: 502, body: { success: false, error: 'Groq API trả về phản hồi rỗng.' } };
    }

    return { status: 200, body: { success: true, answer } };
  } catch {
    return {
      status: 502,
      body: { success: false, error: 'Không thể kết nối Groq. Vui lòng thử lại.' },
    };
  }
}
