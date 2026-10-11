import React from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  TrendingUp,
  FileSpreadsheet,
  Building2,
  Bot,
  Layers,
  Lock,
  Star,
  Users,
  Check,
  ChevronRight,
  Receipt,
  PieChart,
} from 'lucide-react';
import { useLedger } from '../context/LedgerContext';
import { PLAN_CONFIGS } from '../data/planConfig';

export const LandingView: React.FC = () => {
  const { navigate, isAuthenticated, loginWithGoogle, demoLogin } = useLedger();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* 1. Public Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('landing')}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-300 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/25">
              <Sparkles className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white">KẾ TOÁN AI</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold tracking-wider border border-emerald-500/30">
                  SMART LEDGER
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Hệ thống Sổ cái & Kiểm toán Thông minh SaaS</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
            <a href="#features" className="hover:text-emerald-400 transition-colors">Tính năng nổi bật</a>
            <a href="#security" className="hover:text-emerald-400 transition-colors">Bảo mật Cloud</a>
            <button onClick={() => navigate('pricing')} className="hover:text-emerald-400 transition-colors">
              Bảng giá & Gói dịch vụ
            </button>
            <a href="#faq" className="hover:text-emerald-400 transition-colors">Câu hỏi thường gặp</a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={() => navigate('dashboard')}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition-all"
              >
                <span>Vào Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('auth')}
                  className="px-4 py-2.5 text-xs font-bold text-slate-300 hover:text-white transition-colors"
                >
                  Đăng Nhập
                </button>
                <button
                  onClick={() => navigate('auth')}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition-all active:scale-95"
                >
                  <span>Bắt Đầu Miễn Phí</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-20 pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Glow Ambient Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-10 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 text-emerald-400 text-xs font-bold mb-8 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Nâng cấp Thế hệ Kế toán 4.0 với Trợ lý AI & Cloud Firestore</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] mb-6">
            Kế Toán Đơn Giản Hóa. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400">
              Kiểm Toán & Dòng Tiền Với AI.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-300 text-sm sm:text-base leading-relaxed mb-10">
            Tự động hóa ghi sổ thu chi, phát hiện rủi ro hóa đơn bất thường theo thời gian thực và lập báo cáo tài chính chuẩn mực Việt Nam (Thông tư 133 & 200).
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => loginWithGoogle().catch(() => navigate('auth'))}
              className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-2xl shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-2.5 active:scale-95 group"
            >
              <span>Tiếp tục với Google</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={demoLogin}
              className="w-full sm:w-auto px-7 py-4 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <Bot className="w-4 h-4 text-emerald-400" />
              <span>Trải nghiệm Demo Trực tiếp</span>
            </button>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Miễn phí khởi tạo 100 giao dịch</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Dữ liệu Firestore riêng biệt 100%</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Không cần thẻ tín dụng khi bắt đầu</span>
            </div>
          </div>
        </div>

        {/* 3. Interactive Mockup Showcase */}
        <div className="mt-16 max-w-6xl mx-auto relative">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden p-2 sm:p-4 backdrop-blur-xl">
            {/* Window control bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 rounded-2xl mb-3 border border-slate-800/80 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-slate-400 font-mono text-[11px]">ketoanai.vn/dashboard - Smart Ledger Enterprise</span>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-slate-400">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">Cloud Sync OK</span>
                <span className="text-[11px]">Bảo mật Firestore</span>
              </div>
            </div>

            {/* Dashboard Mockup Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left p-2">
              {/* Stat 1 */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs font-semibold text-slate-400">Tổng doanh thu kỳ này</span>
                <div className="text-2xl font-black text-emerald-400 mt-1">337.500.000 ₫</div>
                <div className="text-[11px] text-emerald-500 mt-2 flex items-center gap-1 font-semibold">
                  <TrendingUp className="w-3.5 h-3.5" /> +14.8% so với kỳ trước
                </div>
              </div>
              {/* Stat 2 */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs font-semibold text-slate-400">Tổng chi phí vận hành</span>
                <div className="text-2xl font-black text-rose-400 mt-1">418.400.000 ₫</div>
                <div className="text-[11px] text-slate-400 mt-2">Gồm 6 mục chi phí định mức</div>
              </div>
              {/* Stat 3 - AI Alert */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/50 to-slate-950/60 border border-indigo-500/30">
                <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>AI Kiểm toán thông minh</span>
                </div>
                <div className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Phát hiện 2 biến động chi phí TK 642 và đề xuất phân bổ tối ưu hóa dòng tiền.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Features Grid */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              Tính năng vượt trội
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-3">
              Mọi công cụ kế toán doanh nghiệp trong một nền tảng duy nhất
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-3">
              Thiết kế chuẩn mực cho Kế toán trưởng, Giám đốc tài chính và Chủ doanh nghiệp vừa & nhỏ (SME).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Ghi sổ & Định khoản tự động</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tự động phân loại thu chi, gợi ý tài khoản hạch toán theo Thông tư 133 & 200 giúp giảm 80% thời gian nhập liệu thủ công.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Trợ lý AI Trực giác 24/7</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Hỏi đáp bằng ngôn ngữ tự nhiên về doanh thu, công nợ phải thu, biên lợi nhuận và nhận thẻ phân tích biểu đồ trực quan tức thì.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Kiểm toán & Phát hiện rủi ro</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Phát hiện hóa đơn trùng lặp, cảnh báo vượt hạn mức ngân sách và dự báo thời điểm thiếu hụt tiền mặt trước 30 ngày.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-teal-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <PieChart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Báo cáo P&L & Sổ quỹ tức thì</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tự động tổng hợp báo cáo Kết quả hoạt động kinh doanh, Sổ quỹ tiền mặt, tiền gửi ngân hàng theo từng ngày, tháng, quý.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-rose-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Quản lý Công nợ Đối tác</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Theo dõi chi tiết công nợ phải thu của khách hàng, công nợ phải trả của nhà cung cấp và lịch sử chứng từ đối soát.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Nhập xuất Excel & PDF Chuẩn</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Hỗ trợ nhập hàng loạt từ file bảng tính và xuất báo cáo PDF chuẩn mực có thể ký duyệt trình Ban Giám Đốc ngay.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Pricing Preview Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 bg-slate-900/40">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              Gói dịch vụ minh bạch
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-3">
              Lựa chọn gói phù hợp với quy mô doanh nghiệp
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-3">
              Bắt đầu miễn phí với đầy đủ chức năng cơ bản, nâng cấp PRO bất kỳ lúc nào khi doanh nghiệp mở rộng.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* FREE TIER */}
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-white">GÓI FREE</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold">
                    Trải nghiệm
                  </span>
                </div>
                <div className="text-3xl font-black text-white mb-2">0đ</div>
                <p className="text-xs text-slate-400 mb-6">{PLAN_CONFIGS.free.description}</p>
                <div className="space-y-3 text-xs text-slate-300">
                  {PLAN_CONFIGS.free.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2.5">
                      {feat.included ? (
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center text-[10px] font-bold shrink-0">
                          ✕
                        </span>
                      )}
                      <span className={feat.included ? 'text-slate-200' : 'text-slate-500 line-through'}>
                        {feat.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => navigate('auth')}
                className="mt-8 w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors"
              >
                Bắt Đầu Miễn Phí
              </button>
            </div>

            {/* PRO TIER - FEATURED */}
            <div className="p-8 rounded-3xl bg-gradient-to-b from-slate-900 via-indigo-950/40 to-slate-900 border-2 border-emerald-500 shadow-2xl shadow-emerald-500/10 flex flex-col justify-between relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] tracking-wider uppercase">
                Khuyên Dùng Cho SME
              </div>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-emerald-400">GÓI PRO</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    Tiết kiệm nhất
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-black text-white">99.000đ</span>
                  <span className="text-xs text-slate-400">/tháng</span>
                </div>
                <p className="text-xs text-slate-400 mb-6">{PLAN_CONFIGS.pro.description}</p>
                <div className="space-y-3 text-xs text-slate-200">
                  {PLAN_CONFIGS.pro.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{feat.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => (isAuthenticated ? navigate('subscription') : navigate('auth'))}
                className="mt-8 w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition-all"
              >
                Nâng Cấp PRO Ngay
              </button>
            </div>

            {/* BUSINESS TIER */}
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-white">GÓI BUSINESS</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                    Mở rộng
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-black text-white">299.000đ</span>
                  <span className="text-xs text-slate-400">/tháng</span>
                </div>
                <p className="text-xs text-slate-400 mb-6">{PLAN_CONFIGS.business.description}</p>
                <div className="space-y-3 text-xs text-slate-300">
                  {PLAN_CONFIGS.business.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>{feat.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => navigate('pricing')}
                className="mt-8 w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors"
              >
                Xem Chi Tiết & Tư Vấn
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Security & Multi-Tenant Isolation Section */}
      <section id="security" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-800 bg-slate-950">
        <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 p-8 sm:p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Kiến trúc Multi-Tenant & Bảo Mật Tuyệt Đối
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-3 max-w-2xl mx-auto leading-relaxed">
            Mỗi tài khoản được cấp một phân vùng lưu trữ độc lập trên Cloud Firestore với Security Rules nghiêm ngặt. Dữ liệu của bạn được mã hóa an toàn và chỉ có thể truy cập bởi chính bạn.
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <Lock className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
              <div className="font-bold text-white">Firestore Security Rules</div>
              <div className="text-[11px] text-slate-400 mt-1">Chặn 100% truy cập chéo giữa các user</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <Zap className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
              <div className="font-bold text-white">Realtime Synchronization</div>
              <div className="text-[11px] text-slate-400 mt-1">Đồng bộ tức thì mọi thay đổi kế toán</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <ShieldCheck className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
              <div className="font-bold text-white">Bảo mật chuẩn Doanh nghiệp</div>
              <div className="text-[11px] text-slate-400 mt-1">Xác thực Google Auth & Email an toàn</div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-800 bg-slate-900/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Câu hỏi thường gặp</h2>
            <p className="text-xs text-slate-400 mt-2">Giải đáp các thắc mắc về tài khoản và gói dịch vụ</p>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <h4 className="text-sm font-bold text-white mb-2">Tôi có bị tính phí khi dùng gói FREE không?</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Hoàn toàn không. Gói FREE là gói miễn phí vĩnh viễn với hạn mức 100 giao dịch và 20 đối tác. Bạn không cần nhập bất kỳ thông tin thẻ ngân hàng nào để bắt đầu.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <h4 className="text-sm font-bold text-white mb-2">Dữ liệu kế toán của tôi có bị người khác nhìn thấy không?</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Không. Hệ thống áp dụng quy tắc bảo mật Firestore Security Rules phía máy chủ. Mỗi người dùng chỉ có thể đọc và ghi vào cây thư mục dữ liệu riêng của chính mình.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <h4 className="text-sm font-bold text-white mb-2">Khi nâng cấp lên PRO, tôi có được hỗ trợ xuất báo cáo Excel & PDF không?</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Có. Gói PRO mở khóa không giới hạn tính năng xuất báo cáo P&L, Sổ quỹ, Nhật ký chung chuẩn Excel & PDF có thể in và ký duyệt ngay.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Public Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 bg-slate-950 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-white">KẾ TOÁN AI SMART LEDGER</span>
            <span className="text-slate-600">|</span>
            <span>Phiên bản Multi-User SaaS 3.0</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => navigate('pricing')} className="hover:text-white transition-colors">Bảng giá</button>
            <button onClick={() => navigate('auth')} className="hover:text-white transition-colors">Đăng nhập</button>
            <a href="#security" className="hover:text-white transition-colors">Chính sách bảo mật</a>
          </div>

          <p className="text-[11px] text-slate-500">© 2026 Kế Toán AI. Bản quyền thuộc về AI Smart Ledger Solutions.</p>
        </div>
      </footer>
    </div>
  );
};
