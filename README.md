<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Kế Toán AI Smart Ledger

This contains everything you need to run your app locally.

## Chạy ứng dụng

Yêu cầu: Node.js và XAMPP (Apache, PHP cURL; MySQL nếu dùng cơ sở dữ liệu XAMPP).


1. Cài dependencies: `npm install`
2. Khởi động Apache trong XAMPP và chạy `npm run dev`.
3. Đặt `GROQ_API_KEY` trong cấu hình Apache XAMPP (ví dụ thêm `SetEnv GROQ_API_KEY "your-new-groq-key"` vào `xampp/apache/conf/extra/httpd-xampp.conf`), sau đó khởi động lại Apache.

Chat AI gọi Groq từ `xampp_htdocs/smart-ledger/api/ai-chat.php`; API key chỉ được đọc phía PHP và không đưa vào ứng dụng trình duyệt. Không commit hoặc gửi API key lên Git. Nếu key đã chia sẻ trong cuộc trò chuyện, hãy thu hồi key đó và cấu hình key mới.
