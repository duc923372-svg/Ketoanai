import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  Building,
  Tag,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  PieChart,
  BarChart3,
  DollarSign,
  Package,
  Store,
  Sliders,
  HelpCircle,
} from 'lucide-react';
import { useLedger } from '../context/LedgerContext';
import { formatCurrency, exportToCSV } from '../utils/formatters';

export const RevenueExpenseReportView: React.FC = () => {
  const { transactions, categories, orders, kpis, canExport, openUpgradeModal } = useLedger();

  // Price simulator state
  const [simPrice, setSimPrice] = useState<number>(169000);
  const [simCogs, setSimCogs] = useState<number>(65000);
  const [simPlatformFeePercent, setSimPlatformFeePercent] = useState<number>(11);
  const [simAdCost, setSimAdCost] = useState<number>(22000);
  const [simSoldQty, setSimSoldQty] = useState<number>(200);

  // Simulated metrics
  const simRev = simPrice * simSoldQty;
  const simFee = Math.round((simPrice * simPlatformFeePercent) / 100) * simSoldQty;
  const simCogsTotal = simCogs * simSoldQty;
  const simAdsTotal = simAdCost * simSoldQty;
  const simProfit = simRev - simFee - simCogsTotal - simAdsTotal;
  const simMargin = simRev > 0 ? ((simProfit / simRev) * 100).toFixed(1) : '0';

  // Real data calculations
  const totalRev = orders.reduce((s, o) => s + o.revenue, 0) || kpis.totalRevenue;
  const cogs = orders.reduce((s, o) => s + o.cogs, 0) || Math.round(totalRev * 0.408);
  const platformFees = orders.reduce((s, o) => s + o.platformFee, 0) || Math.round(totalRev * 0.115);
  const adFees = orders.reduce((s, o) => s + o.adFee, 0) || Math.round(totalRev * 0.132);
  const shippingPacking = 1850000;
  const refundCost = 1240000;
  const fixedExpenses = 2500000;
  const totalCost = cogs + platformFees + adFees + shippingPacking + refundCost + fixedExpenses;
  const netRemaining = totalRev - totalCost;
  const netMargin = totalRev > 0 ? ((netRemaining / totalRev) * 100).toFixed(1) : '0';

  const handleExport = () => {
    if (!canExport()) {
      openUpgradeModal('Tính năng xuất báo cáo yêu cầu gói PRO');
      return;
    }
    const breakdown = [
      { 'Khoản mục': '1. Doanh thu bán hàng (Khách mua)', 'Số tiền': totalRev, 'Tỷ trọng': '100%' },
      { 'Khoản mục': '2. Tiền vốn nhập hàng (COGS)', 'Số tiền': -cogs, 'Tỷ trọng': `${((cogs / totalRev) * 100).toFixed(1)}%` },
      { 'Khoản mục': '3. Phí sàn TMĐT (Shopee, TikTok, Laz)', 'Số tiền': -platformFees, 'Tỷ trọng': `${((platformFees / totalRev) * 100).toFixed(1)}%` },
      { 'Khoản mục': '4. Chi phí chạy Ads chuyển đổi', 'Số tiền': -adFees, 'Tỷ trọng': `${((adFees / totalRev) * 100).toFixed(1)}%` },
      { 'Khoản mục': '5. Đóng gói & Vận chuyển shop chịu', 'Số tiền': -shippingPacking, 'Tỷ trọng': `${((shippingPacking / totalRev) * 100).toFixed(1)}%` },
      { 'Khoản mục': '6. Đơn hoàn hàng & Bom hàng', 'Số tiền': -refundCost, 'Tỷ trọng': `${((refundCost / totalRev) * 100).toFixed(1)}%` },
      { 'Khoản mục': '7. Chi phí khác (Kho, Tool, Mạng)', 'Số tiền': -fixedExpenses, 'Tỷ trọng': `${((fixedExpenses / totalRev) * 100).toFixed(1)}%` },
      { 'Khoản mục': '👉 BẠN THỰC SỰ CÒN LẠI (LỢI NHUẬN)', 'Số tiền': netRemaining, 'Tỷ trọng': `${netMargin}%` },
    ];
    exportToCSV(breakdown, `Bao_Cao_Loi_Nhuan_Thuc_Te_${new Date().toISOString().slice(0, 10)}`);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              CÔNG THỨC LỢI NHUẬN THỰC TẾ
            </span>
            <span className="text-xs text-slate-400">• Không mập mờ, bóc tách đến từng đồng</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Tính Lợi Nhuận Thực (Real Profit Engine)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Doanh thu bán được - Tiền vốn - Phí sàn - Tiền Ads - Tiền Ship - Hoàn hàng = Bạn thực sự còn lại.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all active:scale-95 shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Xuất bảng tính CSV</span>
        </button>
      </div>

      {/* Waterfall Breakdown Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-emerald-600" />
          <span>Bóc Tách Từng Tầng Chi Phí Của Shop (Tháng 08/2026)</span>
        </h2>

        <div className="space-y-3">
          {/* 1. Doanh thu */}
          <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                TẦNG 1: TỔNG DOANH THU
              </span>
              <p className="font-black text-lg text-white mt-0.5">
                + {formatCurrency(totalRev)}
              </p>
              <span className="text-[11px] text-slate-300">Tổng giá trị tất cả đơn khách mua</span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs">
              100%
            </span>
          </div>

          {/* 2. Tiền vốn COGS */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-700">(-) Tiền vốn nhập hàng (Giá vốn COGS):</span>
              <p className="text-[11px] text-slate-500">Tiền trả cho xưởng may / nhà sản xuất / đại lý</p>
            </div>
            <div className="text-right">
              <div className="font-bold text-slate-900 text-sm">-{formatCurrency(cogs)}</div>
              <span className="text-[10px] text-slate-400">~{((cogs / totalRev) * 100).toFixed(1)}% doanh thu</span>
            </div>
          </div>

          {/* 3. Phí sàn */}
          <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-100 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-rose-800">(-) Phí sàn TMĐT (Shopee, TikTok, Lazada):</span>
              <p className="text-[11px] text-slate-500">Phí cố định, phí thanh toán, Freeship Extra, Voucher Extra</p>
            </div>
            <div className="text-right">
              <div className="font-bold text-rose-600 text-sm">-{formatCurrency(platformFees)}</div>
              <span className="text-[10px] text-rose-400">~{((platformFees / totalRev) * 100).toFixed(1)}%</span>
            </div>
          </div>

          {/* 4. Tiền Ads */}
          <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-100 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-rose-800">(-) Chi phí chạy Ads chuyển đổi:</span>
              <p className="text-[11px] text-slate-500">Ngân sách TikTok Ads, Shopee Ads, Facebook Ads</p>
            </div>
            <div className="text-right">
              <div className="font-bold text-rose-600 text-sm">-{formatCurrency(adFees)}</div>
              <span className="text-[10px] text-rose-400">~{((adFees / totalRev) * 100).toFixed(1)}%</span>
            </div>
          </div>

          {/* 5. Ship & Đóng gói */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-700">(-) Đóng gói & Phí vận chuyển shop hỗ trợ:</span>
              <p className="text-[11px] text-slate-500">Hộp carton, bóng khí, băng keo in logo, trợ giá ship</p>
            </div>
            <div className="text-right">
              <div className="font-bold text-slate-900 text-sm">-{formatCurrency(shippingPacking)}</div>
              <span className="text-[10px] text-slate-400">~{((shippingPacking / totalRev) * 100).toFixed(1)}%</span>
            </div>
          </div>

          {/* 6. Tiền đơn hoàn bom */}
          <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-100 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-amber-800">(-) Chi phí hoàn hàng & Đơn bom:</span>
              <p className="text-[11px] text-slate-500">Tiền cước chuyển hoàn bưu tá + chi phí cơ hội tiền ads đã đốt</p>
            </div>
            <div className="text-right">
              <div className="font-bold text-amber-700 text-sm">-{formatCurrency(refundCost)}</div>
              <span className="text-[10px] text-amber-600">8 đơn hoàn</span>
            </div>
          </div>

          {/* 7. Chi phí khác */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-700">(-) Chi phí vận hành cố định:</span>
              <p className="text-[11px] text-slate-500">Thuê kho mini, tiền điện, mạng internet, tool phần mềm chốt đơn</p>
            </div>
            <div className="text-right">
              <div className="font-bold text-slate-900 text-sm">-{formatCurrency(fixedExpenses)}</div>
              <span className="text-[10px] text-slate-400">Cố định hàng tháng</span>
            </div>
          </div>

          {/* MASTER RESULT: BẠN THỰC SỰ CÒN LẠI */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-100 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-300" />
                <span>👉 BẠN THỰC SỰ CÒN LẠI (LỢI NHUẬN RÒNG ĐÚT TÚI)</span>
              </span>
              <div className="text-2xl sm:text-3xl font-black text-white mt-1">
                {formatCurrency(netRemaining)}
              </div>
              <p className="text-xs text-emerald-100 mt-1 max-w-xl">
                Đây là số tiền lãi thực tế bạn có thể rút về chi tiêu cá nhân hoặc tái đầu tư mở rộng nguồn hàng.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-xs border border-white/20 p-4 rounded-xl text-right shrink-0">
              <span className="text-[11px] text-emerald-200">Biên lợi nhuận ròng:</span>
              <div className="text-2xl font-black text-white mt-0.5">{netMargin}%</div>
              <span className="text-[10px] text-emerald-200">100k doanh thu lãi {netMargin}k</span>
            </div>
          </div>
        </div>
      </div>

      {/* PRICE SENSITIVITY SIMULATOR */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Công Cụ Mô Phỏng Lợi Nhuận Khi Thay Đổi Giá Bán & Tiền Ads
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">Kế toán AI Simulator</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Input 1: Giá bán */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Giá bán dự kiến (₫):</label>
            <input
              type="number"
              value={simPrice}
              onChange={(e) => setSimPrice(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-sm"
            />
          </div>

          {/* Input 2: Giá vốn */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Giá vốn nhập (₫):</label>
            <input
              type="number"
              value={simCogs}
              onChange={(e) => setSimCogs(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-sm"
            />
          </div>

          {/* Input 3: Phí sàn % */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Phí sàn (%):</label>
            <input
              type="number"
              value={simPlatformFeePercent}
              onChange={(e) => setSimPlatformFeePercent(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-sm"
            />
          </div>

          {/* Input 4: Tiền Ads/đơn */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Tiền Ads ước tính/đơn (₫):</label>
            <input
              type="number"
              value={simAdCost}
              onChange={(e) => setSimAdCost(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-sm"
            />
          </div>
        </div>

        {/* Simulation Output Card */}
        <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-400">
              KẾT QUẢ DỰ TÍNH TRÊN {simSoldQty} SẢN PHẨM:
            </span>
            <div className="text-xl font-black text-white mt-1">
              Lợi nhuận: {formatCurrency(simProfit)} ({simMargin}% biên lãi)
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Mỗi sản phẩm bạn đút túi: <strong>{formatCurrency(Math.round(simProfit / simSoldQty))} ₫/chiếc</strong>.
            </p>
          </div>

          <div className="text-xs space-y-1 text-slate-300 text-right">
            <div>Doanh thu: <strong>{formatCurrency(simRev)}</strong></div>
            <div>Tổng phí sàn: <strong>-{formatCurrency(simFee)}</strong></div>
            <div>Tổng tiền Ads: <strong>-{formatCurrency(simAdsTotal)}</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
};
