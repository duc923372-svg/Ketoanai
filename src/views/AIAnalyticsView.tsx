import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  Sliders,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  BarChart,
  BrainCircuit,
} from 'lucide-react';
import { useLedger } from '../context/LedgerContext';
import { formatCurrency, formatShortCurrency } from '../utils/formatters';
import { AIForecastChart } from '../components/charts';

export const AIAnalyticsView: React.FC = () => {
  const { kpis, navigate, openAddTxModal } = useLedger();

  // What-If Simulation State
  const [revenueSimDelta, setRevenueSimDelta] = useState<number>(10); // +10%
  const [expenseSimDelta, setExpenseSimDelta] = useState<number>(-5); // -5%

  const baseRevenue = kpis.totalRevenue;
  const baseExpense = kpis.totalExpense;

  const simRevenue = baseRevenue * (1 + revenueSimDelta / 100);
  const simExpense = baseExpense * (1 + expenseSimDelta / 100);
  const simNetProfit = simRevenue - simExpense;
  const simMargin = (simNetProfit / simRevenue) * 100;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-600" /> GEMINI AI FINANCIAL ADVISOR
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Phân Tích AI Chuyên Sâu & Dự Báo Tài Chính
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Mô hình phân tích thông minh dựa trên dữ liệu lịch sử sổ cái, chuẩn mực kế toán và dự báo dòng tiền Q4/2026
          </p>
        </div>

        <button
          onClick={() => navigate('ai-chat')}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 shrink-0"
        >
          <BrainCircuit className="w-4 h-4" />
          <span>Hỏi Đáp AI Trợ Lý Kế Toán</span>
        </button>
      </div>

      {/* Top Row: Financial Health Score & 4 Dimension Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Score Card */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
              CHỈ SỐ SỨC KHỎE TÀI CHÍNH
            </span>
            <div className="flex items-baseline gap-2 mt-3">
              <span className="text-5xl font-black font-mono tracking-tight text-white">88</span>
              <span className="text-lg text-slate-400 font-bold">/100</span>
              <span className="ml-auto px-2.5 py-1 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-black rounded-lg">
                HẠNG A • TỐT
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              Cơ cấu tài chính vững chắc. Dòng tiền thuần dương liên tục 6 tháng, tỷ lệ nợ phải trả/doanh thu ở mức an toàn 8.3%.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between relative z-10">
            <span>Kỳ đánh giá: T8/2026</span>
            <span className="text-emerald-400 font-bold">Tăng +4 điểm so T7</span>
          </div>
        </div>

        {/* 4 Health Dimension Progress Bars */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <h3 className="font-bold text-slate-900 text-sm mb-4">
            Đánh Giá Chi Tiết Theo 4 Trụ Cột Tài Chính
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">1. Khả năng thanh toán & Dòng tiền (Liquidity)</span>
                <span className="font-bold text-emerald-600">95 / 100 (Rất an toàn)</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '95%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">2. Biên sinh lời ròng (Profitability Margin)</span>
                <span className="font-bold text-indigo-600">85 / 100 (Đạt 34.3%)</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '85%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">3. Hiệu quả kiểm soát chi phí vận hành (Cost Efficiency)</span>
                <span className="font-bold text-amber-600">82 / 100 (Lương biến động)</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '82%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">4. Tuân thủ chuẩn mực kế toán & Hóa đơn (Compliance)</span>
                <span className="font-bold text-emerald-600">98 / 100 (Chuẩn chỉ)</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: '98%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendations Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-rose-600 uppercase">Phát hiện bất thường</span>
            </div>
            <h4 className="text-xs font-black text-slate-900 leading-snug">
              Chi phí lương (TK 6422) tăng 35% so với tháng trước
            </h4>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Tổng chi lương đạt 350.000.000 ₫ do thưởng dự án VinTech. Cần kiểm tra bảng phân bổ thuế TNCN và trích nộp bảo hiểm xã hội tương ứng.
            </p>
          </div>
          <button
            onClick={() => navigate('transactions')}
            className="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors text-center"
          >
            Kiểm tra chứng từ lương
          </button>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-indigo-600 uppercase">Dự báo tăng trưởng</span>
            </div>
            <h4 className="text-xs font-black text-slate-900 leading-snug">
              Dự báo doanh thu Quý 4 vượt mốc 1.2 Tỷ VNĐ/tháng
            </h4>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Dựa trên nhịp thanh toán từ các hợp đồng dịch vụ ERP và bảo trì hệ thống. Dự kiến lợi nhuận ròng tăng thêm 22% trong Q4.
            </p>
          </div>
          <button
            onClick={() => navigate('reports')}
            className="mt-4 w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-colors text-center"
          >
            Xem bảng P&L dự phóng
          </button>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <Lightbulb className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-emerald-600 uppercase">Tối ưu thuế & Dòng tiền</span>
            </div>
            <h4 className="text-xs font-black text-slate-900 leading-snug">
              Cơ hội khấu trừ thuế GTGT đầu vào hợp lệ
            </h4>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Các hóa đơn mua bản quyền máy chủ Cloud nước ngoài có thể trích trừ thuế Nhà Thầu (FCT) nếu có ủy nhiệm chi kèm mã số thuế đối tác.
            </p>
          </div>
          <button
            onClick={() => navigate('smart-alerts')}
            className="mt-4 w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl transition-colors text-center"
          >
            Xem hướng dẫn thuế AI
          </button>
        </div>
      </div>

      {/* Forecast Chart */}
      <AIForecastChart />

      {/* What-If Financial Scenario Simulator */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Mô Phỏng Kịch Bản Tài Chính (What-If Simulation)
              </h3>
              <p className="text-xs text-slate-500">
                Điều chỉnh các biến số tăng trưởng để tính toán ngay lập tức tác động lên Lợi nhuận và Dòng tiền
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-mono font-bold rounded-lg self-start sm:self-auto">
            Thời gian thực
          </span>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Revenue Delta Slider */}
          <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800">Biến động Doanh Thu kỳ tới:</span>
              <span
                className={`font-mono font-bold px-2 py-0.5 rounded-md ${
                  revenueSimDelta >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {revenueSimDelta > 0 ? `+${revenueSimDelta}%` : `${revenueSimDelta}%`}
              </span>
            </div>
            <input
              type="range"
              min="-30"
              max="50"
              step="5"
              value={revenueSimDelta}
              onChange={(e) => setRevenueSimDelta(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>-30%</span>
              <span>Hiện tại (0%)</span>
              <span>+50%</span>
            </div>
          </div>

          {/* Expense Delta Slider */}
          <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800">Biến động Chi Phí vận hành kỳ tới:</span>
              <span
                className={`font-mono font-bold px-2 py-0.5 rounded-md ${
                  expenseSimDelta <= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {expenseSimDelta > 0 ? `+${expenseSimDelta}%` : `${expenseSimDelta}%`}
              </span>
            </div>
            <input
              type="range"
              min="-30"
              max="50"
              step="5"
              value={expenseSimDelta}
              onChange={(e) => setExpenseSimDelta(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>-30% (Tiết kiệm)</span>
              <span>Hiện tại (0%)</span>
              <span>+50% (Phát sinh)</span>
            </div>
          </div>
        </div>

        {/* Simulation Output Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl">
            <span className="text-xs font-semibold text-emerald-800">DOANH THU MÔ PHỎNG</span>
            <div className="text-lg font-black text-emerald-700 font-mono mt-1">
              {formatCurrency(simRevenue)}
            </div>
            <span className="text-[11px] text-emerald-600">
              Chênh lệch: {revenueSimDelta >= 0 ? '+' : ''}{formatCurrency(simRevenue - baseRevenue)}
            </span>
          </div>

          <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-xl">
            <span className="text-xs font-semibold text-rose-800">CHI PHÍ MÔ PHỎNG</span>
            <div className="text-lg font-black text-rose-700 font-mono mt-1">
              {formatCurrency(simExpense)}
            </div>
            <span className="text-[11px] text-rose-600">
              Chênh lệch: {expenseSimDelta >= 0 ? '+' : ''}{formatCurrency(simExpense - baseExpense)}
            </span>
          </div>

          <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-xl">
            <span className="text-xs font-semibold text-indigo-800">LỢI NHUẬN RÒNG MÔ PHỎNG</span>
            <div className="text-lg font-black text-indigo-900 font-mono mt-1">
              {formatCurrency(simNetProfit)}
            </div>
            <span className="text-[11px] text-indigo-600 font-bold">
              Biên LN: {simMargin.toFixed(1)}% ({simNetProfit > kpis.netProfit ? 'Tăng' : 'Giảm'})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
