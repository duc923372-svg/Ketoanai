/**
 * Gmail service helper for sending transactional and welcome emails
 * using Google Workspace / Gmail API (OAuth 2.0).
 */

export interface SendEmailParams {
  to: string;
  toName?: string;
  subject: string;
  bodyHtml: string;
  accessToken?: string;
}

/**
 * Encodes a standard MIME email string to base64url format for Gmail API
 */
function createMimeMessage(to: string, toName: string | undefined, subject: string, htmlContent: string): string {
  const recipient = toName ? `"${toName.replace(/"/g, '')}" <${to}>` : to;
  
  // UTF-8 base64 encoding helper for Vietnamese characters
  const utf8Subject = `=?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;

  const emailLines = [
    `To: ${recipient}`,
    `Subject: ${utf8Subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    htmlContent,
  ];

  const rawEmail = emailLines.join('\r\n');

  // Convert to base64url
  const base64 = btoa(unescape(encodeURIComponent(rawEmail)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return base64;
}

/**
 * Sends an email using the Gmail REST API (users.messages.send)
 */
export async function sendGmailMessage({
  to,
  toName,
  subject,
  bodyHtml,
  accessToken,
}: SendEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const token = accessToken || localStorage.getItem('google_oauth_token') || sessionStorage.getItem('google_oauth_token');
    
    if (!token) {
      console.warn('Gmail API: No OAuth access token found. Welcome email simulated or requires user authorization.');
      return { success: false, error: 'NO_ACCESS_TOKEN' };
    }

    const raw = createMimeMessage(to, toName, subject, bodyHtml);

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw }),
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      console.error('Gmail API Send Failed:', response.status, errJson);
      return { success: false, error: errJson?.error?.message || `HTTP ${response.status}` };
    }

    const data = await response.json();
    return { success: true, messageId: data.id };
  } catch (error: any) {
    console.error('sendGmailMessage Error:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

/**
 * Generates an elegant Vietnamese HTML template for welcome email
 */
export function generateWelcomeEmailHtml(userName: string, userEmail: string): string {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chào mừng bạn đến với Kế Toán AI Smart Ledger</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #1e293b; }
    .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background: #0f172a; padding: 32px 24px; text-align: center; color: #ffffff; }
    .logo-badge { display: inline-block; background: rgba(16, 185, 129, 0.2); color: #34d399; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 9999px; border: 1px solid rgba(16, 185, 129, 0.4); text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.5px; }
    .title { font-size: 24px; font-weight: 800; margin: 0; color: #ffffff; }
    .subtitle { font-size: 13px; color: #94a3b8; margin-top: 6px; }
    .content { padding: 32px 28px; line-height: 1.6; font-size: 15px; }
    .greeting { font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 16px; }
    .card { background: #f1f5f9; border-radius: 12px; padding: 18px 20px; margin: 20px 0; border-left: 4px solid #10b981; }
    .feature-list { margin: 16px 0; padding-left: 0; list-style: none; }
    .feature-item { margin-bottom: 12px; display: flex; align-items: flex-start; }
    .feature-icon { color: #10b981; font-weight: bold; margin-right: 8px; font-size: 16px; }
    .btn-container { text-align: center; margin: 32px 0 16px 0; }
    .btn { display: inline-block; background: #10b981; color: #ffffff !important; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-size: 14px; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3); }
    .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-badge">KẾ TOÁN AI • SMART LEDGER</div>
      <h1 class="title">Chào mừng bạn gia nhập!</h1>
      <p class="subtitle">Hệ thống Kế toán & Đối soát Thông minh dành cho Nhà Bán Hàng Online</p>
    </div>
    <div class="content">
      <div class="greeting">Kính chào ${userName || 'Quý khách'},</div>
      <p>Chúc mừng bạn đã đăng ký và đăng nhập thành công vào hệ thống <strong>Kế Toán AI Smart Ledger</strong> bằng tài khoản Google (<code>${userEmail}</code>).</p>
      
      <div class="card">
        <strong style="color: #0f172a; display: block; margin-bottom: 8px;">🚀 Các công cụ đã sẵn sàng phục vụ bạn:</strong>
        <ul class="feature-list">
          <li class="feature-item">
            <span class="feature-icon">✓</span>
            <div><strong>Tính Lợi Nhuận Thực (Real Profit):</strong> Tự động bóc tách doanh thu, tiền vốn nhập (COGS), phí sàn TMĐT và chi phí quảng cáo Ads.</div>
          </li>
          <li class="feature-item">
            <span class="feature-icon">✓</span>
            <div><strong>Nhập Excel & CSV 4 bước:</strong> Nhập sao kê đơn hàng từ Shopee, TikTok Shop, Lazada chỉ trong vài giây.</div>
          </li>
          <li class="feature-item">
            <span class="feature-icon">✓</span>
            <div><strong>Theo Dõi Thuế TMĐT:</strong> Tự động giám sát ngưỡng doanh thu 100 triệu/năm và ước tính thuế GTGT 1% & TNCN 0.5%.</div>
          </li>
          <li class="feature-item">
            <span class="feature-icon">✓</span>
            <div><strong>Trợ Lý Kế Toán AI:</strong> Hỏi đáp tức thì về tình hình tài chính, đơn lỗ, dòng tiền ví sàn 24/7.</div>
          </li>
        </ul>
      </div>

      <div class="btn-container">
        <a href="https://ais-dev-bhzvb447lolgnegxozla6p-795438956534.asia-southeast1.run.app" class="btn">Mở Bảng Điều Khiển Sổ Cái</a>
      </div>

      <p style="font-size: 13px; color: #64748b; margin-top: 24px;">
        Nếu bạn cần hỗ trợ thêm về cách thiết lập danh mục sản phẩm, tính giá vốn hoặc cài đặt đối soát, đội ngũ Kế Toán AI luôn sẵn sàng đồng hành cùng bạn!
      </p>
    </div>
    <div class="footer">
      <p style="margin: 0 0 4px 0;"><strong>Kế Toán AI Smart Ledger Inc.</strong></p>
      <p style="margin: 0;">Email gửi tự động từ hệ thống Google Workspace Integration.</p>
    </div>
  </div>
</body>
</html>`;
}
