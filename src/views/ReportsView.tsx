import React, { useState } from 'react';
import {
  FileSpreadsheet,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Info,
  DollarSign,
  TrendingUp,
  Download,
  CheckCircle2,
  Receipt,
  HelpCircle,
} from 'lucide-react';
import { useLedger } from '../context/LedgerContext';
import { formatCurrency, exportToCSV } from '../utils/formatters';

export const ReportsView: React.FC = () => {
  const { kpis, orders, canExport, openUpgradeModal } = useLedger();

  const [yearRevenue, setYearRevenue] = useState<number>(85200000);
  const threshold = 100000000;
  const isOverThreshold = yearRevenue > threshold;
  const percentThreshold = Math.min(100, Math.round((yearRevenue / threshold) * 100));

  // Taxes
  const vatRate = 0.01; // 1% GTGT
  const pitRate = 0.005; // 0.5% TNCN
  const totalTaxRate = vatRate + pitRate; // 1.5%

  const estimatedTax = isOverThreshold ? yearRevenue * totalTaxRate : 0;
  const vatAmount = isOverThreshold ? yearRevenue * vatRate : 0;
  const pitAmount = isOverThreshold ? yearRevenue * pitRate : 0;

  // Platform deducted taxes
  const platformDeductedTaxes = 1278000;

  const handleExportTaxReport = () => {
    if (!canExport()) {
      openUpgradeModal('Tính năng xuất báo cáo thuế yêu cầu gói PRO');
      return;
    }
    const reportData = [
      { 'Khoản mục': 'Doanh thu năm lũy kế', 'Giá trị': yearRevenue },
      { 'Khoản mục': 'Ngưỡng miễn thuế', 'Giá trị': threshold },
      { 'Khoản mục': 'Trạng thái', 'Giá trị': isOverThreshold ? 'Phát sinh nghĩa vụ thuế' : 'Chưa vượt ngưỡng 100tr' },
      { 'Khoản mục': 'Thuế GTGT (1%)', 'Giá trị': vatAmount },
      { 'Khoản mục': 'Thuế TNCN (0.5%)', 'Giá trị': pitAmount },
      { 'Khoản mục': 'Tổng thuế ước tính (1.5%)', 'Giá trị': estimatedTax },
      { 'Khoản mục': 'Thuế sàn đã khấu trừ tạm tính', 'Giá trị': platformDeductedTaxes },
    ];
    exportToCSV(reportData, `Bao_Cao_Nghia_Vu_Thue_TMDT_${new Date().toISOString().slice(0, 10)}`);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
              NGHĨA VỤ THUẾ TMĐT
            </span>
            <span className="text-xs text-slate-400">• Dành riêng cho người bán hàng online</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Theo Dõi Thuế & Nghĩa Vụ Bán Hàng</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tự động theo dõi ngưỡng doanh thu 100 triệu/năm, tính thuế GTGT (1%) và TNCN (0.5%) cho sàn TMĐT.
          </p>
        </div>

        <button
          onClick={handleExportTaxReport}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all active:scale-95 shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Xuất báo cáo thuế CSV</span>
        </button>
      </div>

      {/* Threshold Progress Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              DOANH THU LŨY KẾ TRONG NĂM 2026
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {formatCurrency(yearRevenue)}
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400">Ngưỡng bắt đầu phát sinh thuế:</span>
            <div className="text-lg font-bold text-slate-700">{formatCurrency(threshold)} / năm</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isOverThreshold ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${percentThreshold}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-emerald-700">Đã đạt {percentThreshold}% ngưỡng</span>
            <span className="text-slate-500">
              {isOverThreshold
                ? 'Đã vượt ngưỡng 100tr, bắt đầu phát sinh thuế TMĐT'
                : `Còn ${formatCurrency(threshold - yearRevenue)} nữa trước khi chạm ngưỡng`}
            </span>
          </div>
        </div>
      </div>

      {/* Tax Calculation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            1. Thuế GTGT (1.0%)
          </span>
          <div className="text-xl font-black text-slate-900 mt-2">
            {formatCurrency(vatAmount)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Tính trên 1% tổng doanh thu bán hàng
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            2. Thuế TNCN (0.5%)
          </span>
          <div className="text-xl font-black text-slate-900 mt-2">
            {formatCurrency(pitAmount)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Tính trên 0.5% tổng doanh thu bán lẻ TMĐT
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-indigo-200 bg-indigo-50/20 shadow-xs">
          <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
            Tổng thuế ước tính (1.5%)
          </span>
          <div className="text-xl font-black text-indigo-700 mt-2">
            {formatCurrency(estimatedTax)}
          </div>
          <p className="text-[11px] text-indigo-800 font-medium mt-1">
            Cần đối soát với thuế sàn đã trừ
          </p>
        </div>
      </div>

      {/* AI Tax Advice & Guidance */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-lg space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white">Hướng Dẫn Về Thuế TMĐT Từ Kế Toán AI</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
            <h4 className="font-bold text-emerald-300">Quy định về ngưỡng 100 triệu:</h4>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Cá nhân kinh doanh có doanh thu trong năm dương lịch từ 100 triệu đồng trở xuống thì không phải nộp thuế GTGT và không phải nộp thuế TNCN. Khi doanh thu vượt 100 triệu đồng, cá nhân phải nộp thuế trên toàn bộ doanh thu phát sinh trong năm.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
            <h4 className="font-bold text-emerald-300">Về việc sàn TMĐT khấu trừ:</h4>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Hiện nay các sàn TMĐT (Shopee, TikTok Shop, Lazada) thực hiện cung cấp thông tin doanh thu của người bán cho cơ quan thuế và tiến hành khấu trừ tại nguồn nếu có quy định chi tiết. Hãy lưu trữ bảng sao kê để đối soát.
            </p>
          </div>
        </div>
      </div>

      {/* Disclaimer Notice */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold">Tuyên bố miễn trừ trách nhiệm:</p>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            Thông tin tính toán trên mang tính hỗ trợ tính toán nội bộ giúp bạn ước lượng dòng tiền. Người dùng cần kiểm tra quy định hiện hành hoặc tham khảo cán bộ thuế/chuyên gia tư vấn khi kê khai chính thức.
          </p>
        </div>
      </div>
    </div>
  );
};
