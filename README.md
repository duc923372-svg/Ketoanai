<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Kế Toán AI Smart Ledger

This contains everything you need to run your app locally.

## Chạy ứng dụng

Yêu cầu: Node.js và XAMPP (Apache, PHP cURL; MySQL nếu dùng cơ sở dữ liệu XAMPP).


1. Cài dependencies: `npm install`
2. Tạo `.env` ở thư mục gốc từ `.env.example` rồi điền `GROQ_API_KEY`.
3. Khởi động Apache trong XAMPP nếu dùng MySQL/PHP, sau đó chạy `npm run dev`.

Chat AI gửi yêu cầu tới endpoint cùng nguồn `/api/ai-chat`. Vite chạy endpoint này khi phát triển; Vercel triển khai endpoint từ `api/ai-chat.ts`. Cả hai dùng cùng model, system prompt và tham số Groq nên câu trả lời không còn âm thầm chuyển sang engine giả lập khi thiếu cấu hình.

Trên Vercel, thêm `GROQ_API_KEY` trong **Project Settings → Environment Variables** cho Production (và Preview nếu cần), rồi triển khai lại. Có thể dùng biến `VITE_GROQ_API_KEY` cũ tạm thời; nên chuyển sang `GROQ_API_KEY` và xóa biến `VITE_` để tránh đưa khóa vào bundle trình duyệt. Không commit `.env` hoặc gửi API key lên Git.
