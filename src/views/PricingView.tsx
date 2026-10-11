import React, { useState } from 'react';
import {
  Sparkles,
  Check,
  Zap,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  Building2,
  Lock,
  ChevronLeft,
} from 'lucide-react';
import { useLedger } from '../context/LedgerContext';
import { PLAN_CONFIGS, PlanTier } from '../data/planConfig';

export const PricingView: React.FC = () => {
  const { currentUser, isAuthenticated, navigate, openUpgradeModal } = useLedger();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  const currentPlan = currentUser?.plan || 'free';

  const plans: PlanTier[] = ['free', 'pro', 'business', 'enterprise'];

  const getPriceDisplay = (tier: PlanTier) => {
    const config = PLAN_CONFIGS[tier];
    if (config.price === 0 && tier !== 'enterprise') return '0 ₫';
    if (tier === 'enterprise') return 'Liên hệ';
    if (billingCycle === 'yearly') {
      const discounted = Math.round(config.price * 0.8);
      return `${discounted.toLocaleString('vi-VN')} ₫`;
    }
    return `${config.price.toLocaleString('vi-VN')} ₫`;
  };

  const handleAction = (tier: PlanTier) => {
    if (tier === currentPlan && isAuthenticated) return;
    if (!isAuthenticated) {
      navigate('auth');
      return;
    }
    if (tier === 'pro' || tier === 'business') {
      openUpgradeModal(tier === 'pro' ? 'Nâng cấp PRO' : 'Gói Doanh nghiệp Business');
    } else if (tier === 'enterprise') {
      alert('Vui lòng liên hệ hotline 0908.123.456 hoặc email enterprise@ketoanai.vn để được tư vấn thiết kế giải pháp riêng.');
    }
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate(isAuthenticated ? 'dashboard' : 'landing')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 mb-2 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Quay lại {isAuthenticated ? 'Tổng quan' : 'Trang chủ'}</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Bảng Giá & Gói Dịch Vụ Kế Toán AI
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Minh bạch chi phí, linh hoạt nâng cấp theo quy mô phát triển của doanh nghiệp bạn.
          </p>
        </div>

        {/* Billing Cycle Switch */}
        <div className="bg-slate-200/70 p-1.5 rounded-2xl flex items-center self-start sm:self-auto text-xs font-bold shadow-inner">
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-xl transition-all ${
              billingCycle === 'monthly' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Theo Tháng
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              billingCycle === 'yearly' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Thanh Toán 1 Năm</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black">
              -20%
            </span>
          </button>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((tier) => {
          const config = PLAN_CONFIGS[tier];
          const isCurrent = isAuthenticated && currentPlan === tier;
          const isPro = tier === 'pro';

          return (
            <div
              key={tier}
              className={`rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all relative ${
                isPro
                  ? 'bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white shadow-2xl ring-2 ring-emerald-500 shadow-emerald-500/10'
                  : 'bg-white border border-slate-200 text-slate-900 shadow-sm hover:shadow-md'
              }`}
            >
              {isPro && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider rounded-full shadow-md">
                  Phổ biến nhất
                </div>
              )}

              <div>
                {/* Plan Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-sm font-black uppercase tracking-wider ${isPro ? 'text-emerald-400' : 'text-slate-900'}`}>
                    {config.name}
                  </span>
                  {isCurrent && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 text-[10px] font-black border border-emerald-500/30">
                      Đang sử dụng
                    </span>
                  )}
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-1 my-3">
                  <span className="text-3xl font-black">{getPriceDisplay(tier)}</span>
                  {config.billingPeriod && (
                    <span className={`text-xs ${isPro ? 'text-slate-400' : 'text-slate-500'}`}>
                      {config.billingPeriod}
                    </span>
                  )}
                </div>

                <p className={`text-xs mb-6 ${isPro ? 'text-slate-300' : 'text-slate-600'}`}>
                  {config.description}
                </p>

                {/* Features List */}
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                  {config.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      {feat.included ? (
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                          ✕
                        </span>
                      )}
                      <span className={feat.included ? (isPro ? 'text-slate-200' : 'text-slate-700') : 'text-slate-400 line-through'}>
                        {feat.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => handleAction(tier)}
                disabled={isCurrent}
                className={`mt-8 w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  isCurrent
                    ? 'bg-slate-100 text-slate-400 cursor-default'
                    : isPro
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-lg shadow-emerald-500/25 active:scale-98'
                    : 'bg-slate-900 hover:bg-slate-800 text-white active:scale-98'
                }`}
              >
                {isCurrent ? (
                  <span>Gói Hiện Tại Của Bạn</span>
                ) : tier === 'free' ? (
                  <span>Bắt Đầu Miễn Phí</span>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    <span>Nâng Cấp {config.name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison Matrix */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <h3 className="text-lg font-black text-slate-900 mb-6">So sánh chi tiết hạn mức & tính năng</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-3 font-bold">Tính năng / Tiêu chí</th>
                <th className="pb-3 font-bold text-center">FREE (0đ)</th>
                <th className="pb-3 font-bold text-center text-emerald-600">PRO (99k)</th>
                <th className="pb-3 font-bold text-center">BUSINESS (299k)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-3 font-semibold">Giới hạn số lượng giao dịch ghi sổ</td>
                <td className="py-3 text-center">100 GD / tháng</td>
                <td className="py-3 text-center font-bold text-emerald-600">5.000 GD / tháng</td>
                <td className="py-3 text-center">50.000+ GD / tháng</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold">Quản lý Đối tác (Khách hàng & NCC)</td>
                <td className="py-3 text-center">Tối đa 20 đối tác</td>
                <td className="py-3 text-center font-bold text-emerald-600">500 đối tác</td>
                <td className="py-3 text-center">5.000 đối tác</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold">Trợ lý Kế toán Thông minh AI</td>
                <td className="py-3 text-center">20 lượt hỏi / tháng</td>
                <td className="py-3 text-center font-bold text-emerald-600">1.000 lượt hỏi / tháng</td>
                <td className="py-3 text-center">5.000 lượt hỏi / tháng</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold">Kiểm toán & Cảnh báo chi phí bất thường</td>
                <td className="py-3 text-center text-slate-400">✕</td>
                <td className="py-3 text-center text-emerald-600 font-bold">✓ Thời gian thực</td>
                <td className="py-3 text-center font-bold">✓ Nâng cao</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold">Xuất báo cáo định dạng Excel & PDF chuẩn</td>
                <td className="py-3 text-center text-slate-400">✕</td>
                <td className="py-3 text-center text-emerald-600 font-bold">✓ Đầy đủ</td>
                <td className="py-3 text-center font-bold">✓ Đầy đủ</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold">Lưu trữ đám mây Cloud Firestore tách biệt</td>
                <td className="py-3 text-center">✓ 100% riêng biệt</td>
                <td className="py-3 text-center text-emerald-600 font-bold">✓ 100% riêng biệt</td>
                <td className="py-3 text-center font-bold">✓ 100% riêng biệt</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
