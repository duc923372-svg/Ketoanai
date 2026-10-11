import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  X,
  Zap,
  ShieldCheck,
  CreditCard,
  Building2,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { useLedger } from '../../context/LedgerContext';
import { PLAN_CONFIGS } from '../../data/planConfig';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPlan?: 'pro' | 'business';
  featureTrigger?: string;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  targetPlan = 'pro',
  featureTrigger,
}) => {
  const { currentUser, upgradePlan } = useLedger();
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'business'>(targetPlan);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const proConfig = PLAN_CONFIGS.pro;
  const businessConfig = PLAN_CONFIGS.business;
  const currentPlanName = currentUser?.plan?.toUpperCase() || 'FREE';

  const handleUpgrade = async () => {
    setIsProcessing(true);
    try {
      await upgradePlan(selectedPlan);
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  const proPrice = billingCycle === 'yearly' ? 79000 : 99000;
  const businessPrice = billingCycle === 'yearly' ? 239000 : 299000;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden relative">
        {/* Header background accent */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5 border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Nâng Cấp Kế Toán AI PRO
            </span>
            <span className="text-xs text-slate-300">
              Gói hiện tại: <strong className="text-white">{currentPlanName}</strong>
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Mở khóa toàn bộ sức mạnh Kế toán Thông minh
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            {featureTrigger
              ? `Tính năng "${featureTrigger}" yêu cầu gói PRO. Nâng cấp ngay để không bị gián đoạn công việc.`
              : 'Tối ưu hóa hạch toán, đối soát tự động và dự báo tài chính theo thời gian thực cho doanh nghiệp.'}
          </p>

          {/* Billing Cycle Switch */}
          <div className="mt-5 flex items-center gap-3">
            <div className="bg-slate-800/90 p-1 rounded-xl flex items-center border border-slate-700 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  billingCycle === 'monthly' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Thanh toán theo tháng
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  billingCycle === 'yearly' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Thanh toán 12 tháng</span>
                <span className="px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-950 font-bold text-[10px]">
                  Tiết kiệm 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {isSuccess ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Nâng cấp thành công!</h3>
              <p className="text-sm text-slate-600">
                Tài khoản của bạn đã được nâng cấp lên gói <strong>{selectedPlan.toUpperCase()}</strong>. Toàn bộ tính năng cao cấp đã được kích hoạt.
              </p>
            </div>
          ) : (
            <>
              {/* Plan Choice Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* PRO CARD */}
                <div
                  onClick={() => setSelectedPlan('pro')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all relative ${
                    selectedPlan === 'pro'
                      ? 'border-emerald-600 bg-emerald-50/40 shadow-md ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-black text-slate-900">GÓI PRO</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                      Phổ biến nhất
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 my-2">
                    <span className="text-2xl font-black text-slate-900">
                      {proPrice.toLocaleString('vi-VN')} ₫
                    </span>
                    <span className="text-xs text-slate-500">/tháng</span>
                  </div>
                  <p className="text-xs text-slate-600 mb-4">{proConfig.description}</p>
                  <div className="space-y-2 text-xs text-slate-700">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>5.000 giao dịch/tháng</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Trợ lý Kế toán AI 1.000 câu/tháng</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Xuất Báo cáo Excel & PDF chuẩn</span>
                    </div>
                  </div>
                </div>

                {/* BUSINESS CARD */}
                <div
                  onClick={() => setSelectedPlan('business')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all relative ${
                    selectedPlan === 'business'
                      ? 'border-indigo-600 bg-indigo-50/40 shadow-md ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-black text-slate-900">GÓI BUSINESS</span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold">
                      Doanh nghiệp
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 my-2">
                    <span className="text-2xl font-black text-slate-900">
                      {businessPrice.toLocaleString('vi-VN')} ₫
                    </span>
                    <span className="text-xs text-slate-500">/tháng</span>
                  </div>
                  <p className="text-xs text-slate-600 mb-4">{businessConfig.description}</p>
                  <div className="space-y-2 text-xs text-slate-700">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>50.000+ giao dịch & Đa chi nhánh</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>AI cao cấp & Cảnh báo dòng tiền</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>Đồng hành chuyên gia kế toán 1:1</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Architecture note */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Kích hoạt gói ngay lập tức trên Firestore Cloud</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="text-[11px] font-medium">Hỗ trợ: VNPay, VietQR, MoMo, Thẻ tín dụng</span>
                </div>
              </div>

              {/* CTA Button */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Để sau
                </button>
                <button
                  type="button"
                  onClick={handleUpgrade}
                  disabled={isProcessing}
                  className="flex-[2] py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Đang kích hoạt gói...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                      <span>Tiếp Tục Nâng Cấp Gói {selectedPlan.toUpperCase()}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
