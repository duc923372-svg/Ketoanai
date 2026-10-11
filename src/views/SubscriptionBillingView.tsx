import React from 'react';
import {
  Sparkles,
  Zap,
  CheckCircle2,
  TrendingUp,
  Receipt,
  Users,
  Bot,
  Layers,
  CreditCard,
  Download,
  AlertCircle,
  Clock,
  ShieldCheck,
  Building2,
  ArrowUpRight,
} from 'lucide-react';
import { useLedger } from '../context/LedgerContext';
import { PLAN_CONFIGS, PLAN_LIMITS, getPlanDetails } from '../data/planConfig';

export const SubscriptionBillingView: React.FC = () => {
  const { currentUser, transactions, partners, categories, openUpgradeModal, upgradePlan } = useLedger();

  const plan = currentUser?.plan || 'free';
  const planInfo = getPlanDetails(plan);
  const limits = PLAN_LIMITS[plan];

  const txCount = transactions.length;
  const partnerCount = partners.length;
  const catCount = categories.length;
  const aiCount = currentUser?.aiUsageCount || 0;

  const txPercent = Math.min(100, Math.round((txCount / limits.maxTransactions) * 100));
  const partnerPercent = Math.min(100, Math.round((partnerCount / limits.maxPartners) * 100));
  const catPercent = Math.min(100, Math.round((catCount / limits.maxCategories) * 100));
  const aiPercent = Math.min(100, Math.round((aiCount / limits.maxAiQueries) * 100));

  const isFree = plan === 'free';

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Gói Dịch Vụ & Hạn Mức Sử Dụng
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Quản lý thuê bao kế toán SaaS, theo dõi hạn mức giao dịch và hóa đơn thanh toán.
          </p>
        </div>

        {isFree && (
          <button
            onClick={() => openUpgradeModal('Quản lý gói')}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition-all active:scale-95 self-start sm:self-auto"
          >
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>Nâng Cấp Gói PRO</span>
          </button>
        )}
      </div>

      {/* Current Plan Overview Card */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-black tracking-wider uppercase border border-emerald-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Gói Hiện Tại: {planInfo.name}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-600/30 text-emerald-400 text-[10px] font-bold">
                Trạng thái: Hoạt động
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {isFree ? 'Kế Toán AI Smart Ledger FREE' : `Kế Toán AI ${planInfo.name}`}
            </h2>
            <p className="text-xs text-slate-300 mt-2 max-w-xl leading-relaxed">
              {planInfo.description}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-6 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Chu kỳ: {isFree ? 'Miễn phí vĩnh viễn' : 'Gia hạn hàng tháng'}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Bảo mật dữ liệu: Firestore Cloud Tenant</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 backdrop-blur-sm shrink-0 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] text-slate-400 font-medium">Chi phí thuê bao</span>
            <div className="text-2xl font-black text-white mt-1">
              {planInfo.price === 0 ? '0 ₫' : `${planInfo.price.toLocaleString('vi-VN')} ₫`}
            </div>
            <span className="text-[10px] text-slate-400 mb-3">
              {planInfo.billingPeriod || '/vĩnh viễn'}
            </span>
            {isFree ? (
              <button
                onClick={() => openUpgradeModal('Nâng cấp PRO')}
                className="w-full py-2 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-colors"
              >
                Nâng cấp chỉ 99.000₫/tháng
              </button>
            ) : (
              <button
                onClick={() => upgradePlan('free')}
                className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors"
              >
                Hủy gia hạn hoặc chuyển về FREE
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quota Usage Meters */}
      <div className="space-y-4">
        <h3 className="text-base font-black text-slate-900">
          Hạn mức & Tình trạng sử dụng tài nguyên
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Quota 1: Transactions */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold">Số lượng giao dịch</span>
              </div>
              <span className="text-xs font-black text-slate-900">{txPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  txPercent > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${txPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Đã dùng: <strong className="text-slate-900">{txCount}</strong></span>
              <span>Tối đa: {limits.maxTransactions}</span>
            </div>
          </div>

          {/* Quota 2: Partners */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700">
                <Users className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold">Đối tác & Khách hàng</span>
              </div>
              <span className="text-xs font-black text-slate-900">{partnerPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all"
                style={{ width: `${partnerPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Đã lưu: <strong className="text-slate-900">{partnerCount}</strong></span>
              <span>Tối đa: {limits.maxPartners}</span>
            </div>
          </div>

          {/* Quota 3: Categories */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700">
                <Layers className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold">Danh mục hạch toán</span>
              </div>
              <span className="text-xs font-black text-slate-900">{catPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all"
                style={{ width: `${catPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Đã tạo: <strong className="text-slate-900">{catCount}</strong></span>
              <span>Tối đa: {limits.maxCategories}</span>
            </div>
          </div>

          {/* Quota 4: AI Queries */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700">
                <Bot className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-bold">Lượt hỏi Trợ lý AI</span>
              </div>
              <span className="text-xs font-black text-slate-900">{aiPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all"
                style={{ width: `${aiPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Đã hỏi: <strong className="text-slate-900">{aiCount}</strong></span>
              <span>Tối đa: {limits.maxAiQueries}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Gateway & Billing History */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900">Lịch sử giao dịch & Hóa đơn VAT</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Hệ thống hỗ trợ xuất hóa đơn điện tử cho các gói đăng ký doanh nghiệp.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <CreditCard className="w-4 h-4 text-slate-400" />
            <span>Cổng hỗ trợ: VietQR, VNPay, MoMo, Visa/Mastercard</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-3 font-bold">Mã Hóa Đơn</th>
                <th className="pb-3 font-bold">Ngày Thanh Toán</th>
                <th className="pb-3 font-bold">Gói Dịch Vụ</th>
                <th className="pb-3 font-bold">Số Tiền</th>
                <th className="pb-3 font-bold">Phương Thức</th>
                <th className="pb-3 font-bold">Trạng Thái</th>
                <th className="pb-3 font-bold text-right">Tải Hóa Đơn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-3 font-mono font-bold text-slate-900">INV-2026-0801</td>
                <td className="py-3">01/08/2026</td>
                <td className="py-3 font-semibold">{planInfo.name}</td>
                <td className="py-3 font-bold">
                  {planInfo.price === 0 ? '0 ₫' : `${planInfo.price.toLocaleString('vi-VN')} ₫`}
                </td>
                <td className="py-3">VietQR / Tự động</td>
                <td className="py-3">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                    Thành công
                  </span>
                </td>
                <td className="py-3 text-right">
                  <button
                    onClick={() => alert('Đang tải hóa đơn điện tử PDF...')}
                    className="inline-flex items-center gap-1 text-slate-600 hover:text-emerald-600 font-semibold"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
