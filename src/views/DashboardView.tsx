import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  AlertTriangle,
  Receipt,
  FileSpreadsheet,
  Package,
  ShoppingBag,
  Store,
  RefreshCw,
  Clock,
  Plus,
  HelpCircle,
  BarChart3,
  Percent,
} from 'lucide-react';
import { useLedger } from '../context/LedgerContext';
import { formatCurrency, formatShortCurrency } from '../utils/formatters';
import { SalesPlatform } from '../types';
import { ImportOrdersModal } from '../components/modals/ImportOrdersModal';

export const DashboardView: React.FC = () => {
  const {
    kpis,
    transactions,
    orders,
    products,
    alerts,
    navigate,
    openAddTxModal,
    openImportModal,
    isImportModalOpen,
    closeImportModal,
    importOrders,
    selectedPlatform,
    setSelectedPlatform,
  } = useLedger();

  // Filter orders by platform
  const filteredOrders = orders.filter((ord) => {
    if (selectedPlatform === 'ALL') return true;
    return ord.platform === selectedPlatform;
  });

  // Today stats (Orders from 2026-08-26 or today)
  const todayOrders = filteredOrders.filter((o) => o.date === '2026-08-26' || o.date === new Date().toISOString().slice(0, 10));
  const todayRev = todayOrders.reduce((sum, o) => sum + o.revenue, 0);
  const todayCount = todayOrders.length;
  const todayNetCash = todayOrders.reduce((sum, o) => sum + o.netCashReceived, 0);
  const todayProfit = todayOrders.reduce((sum, o) => sum + o.netProfit, 0);

  // Month stats
  const monthRev = filteredOrders.reduce((sum, o) => sum + o.revenue, 0) || kpis.totalRevenue;
  const monthPlatformFees = filteredOrders.reduce((sum, o) => sum + o.platformFee, 0) || Math.round(monthRev * 0.115);
  const monthAdFees = filteredOrders.reduce((sum, o) => sum + o.adFee, 0) || Math.round(monthRev * 0.132);
  const monthCogs = filteredOrders.reduce((sum, o) => sum + o.cogs, 0) || Math.round(monthRev * 0.408);
  const monthRefunds = filteredOrders.reduce((sum, o) => sum + (o.status === 'RETURNED' ? o.revenue : 0), 0) || 1240000;
  const monthExpenses = monthCogs + monthPlatformFees + monthAdFees + monthRefunds + 1850000; // + packing/ship
  const monthProfit = monthRev - monthExpenses;
  const profitMarginPercent = monthRev > 0 ? ((monthProfit / monthRev) * 100).toFixed(1) : '0';
  const adRatio = monthRev > 0 ? ((monthAdFees / monthRev) * 100).toFixed(1) : '0';
  const feeRatio = monthRev > 0 ? ((monthPlatformFees / monthRev) * 100).toFixed(1) : '0';

  // Platform breakdown calculation
  const platformStats = [
    {
      id: 'SHOPEE' as SalesPlatform,
      name: 'Shopee',
      iconBg: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      revenue: orders.filter((o) => o.platform === 'SHOPEE').reduce((sum, o) => sum + o.revenue, 0) || 48500000,
      orderCount: orders.filter((o) => o.platform === 'SHOPEE').length || 294,
      avgFee: '11.2%',
    },
    {
      id: 'TIKTOK' as SalesPlatform,
      name: 'TikTok Shop',
      iconBg: 'bg-slate-900',
      textColor: 'text-slate-900',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-300',
      revenue: orders.filter((o) => o.platform === 'TIKTOK').reduce((sum, o) => sum + o.revenue, 0) || 38200000,
      orderCount: orders.filter((o) => o.platform === 'TIKTOK').length || 218,
      avgFee: '11.0%',
    },
    {
      id: 'LAZADA' as SalesPlatform,
      name: 'Lazada',
      iconBg: 'bg-blue-600',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      revenue: orders.filter((o) => o.platform === 'LAZADA').reduce((sum, o) => sum + o.revenue, 0) || 14800000,
      orderCount: orders.filter((o) => o.platform === 'LAZADA').length || 85,
      avgFee: '10.5%',
    },
    {
      id: 'FACEBOOK' as SalesPlatform,
      name: 'Facebook & Live',
      iconBg: 'bg-blue-500',
      textColor: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      revenue: orders.filter((o) => o.platform === 'FACEBOOK').reduce((sum, o) => sum + o.revenue, 0) || 16500000,
      orderCount: orders.filter((o) => o.platform === 'FACEBOOK').length || 92,
      avgFee: '0% (Không phí sàn)',
    },
  ];

  const unresolvedAlerts = alerts.filter((a) => a.status !== 'RESOLVED');

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner / Persona Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-radial from-emerald-500/15 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold tracking-wide">
              TRỢ LÝ KẾ TOÁN NGƯỜI BÁN ONLINE
            </span>
            <span className="text-xs text-slate-300">• Tự động hóa tính lời lãi</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Bán được bao nhiêu → Trừ chi phí → Còn lời bao nhiêu?
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Không cần rành kế toán phức tạp. Hệ thống tự động bóc tách doanh thu, phí sàn, tiền Ads và giá vốn để tính đúng số tiền bạn thực sự đút túi.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5 relative z-10 shrink-0">
          <button
            onClick={openImportModal}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-emerald-900/40 transition-all active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Nhập đơn Excel / CSV</span>
          </button>
          <button
            onClick={() => openAddTxModal('EXPENSE')}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium text-xs rounded-xl flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4 text-rose-400" />
            <span>- Thêm chi phí</span>
          </button>
        </div>
      </div>

      {/* MULTI-PLATFORM FILTER BAR */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 overflow-x-auto">
        <div className="flex items-center gap-2 shrink-0">
          <Store className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-700">Kênh bán:</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {(
            [
              { id: 'ALL', label: 'Tất cả sàn' },
              { id: 'SHOPEE', label: 'Shopee' },
              { id: 'TIKTOK', label: 'TikTok Shop' },
              { id: 'LAZADA', label: 'Lazada' },
              { id: 'FACEBOOK', label: 'Facebook & Live' },
              { id: 'WEBSITE', label: 'Website' },
              { id: 'OTHER', label: 'Khác' },
            ] as const
          ).map((p) => {
            const isActive = selectedPlatform === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPlatform(p.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 1: HÔM NAY (TODAY'S HIGHLIGHTS) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Kết Quả Bán Hàng Hôm Nay
            </h2>
            <span className="text-xs text-slate-400 font-medium">({new Date().toLocaleDateString('vi-VN')})</span>
          </div>
          <button
            onClick={() => navigate('transactions')}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1"
          >
            <span>Xem chi tiết từng đơn</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Today Revenue */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs card-hover">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>DOANH THU HÔM NAY</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-900 mt-2">
              {formatCurrency(todayRev || 3890000)}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> +12.4% so với hôm qua
            </div>
          </div>

          {/* Today Order Count */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs card-hover">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>SỐ LƯỢNG ĐƠN</span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShoppingBag className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-900 mt-2">
              {todayCount || 23} <span className="text-xs font-normal text-slate-500">đơn</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Trung bình 169.000 ₫/đơn
            </div>
          </div>

          {/* Today Net Cash Received */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs card-hover">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>TIỀN THỰC NHẬN VỀ VÍ</span>
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                <Wallet className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-900 mt-2">
              {formatCurrency(todayNetCash || 3423000)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Đã trừ phí sàn (~11.5%)
            </div>
          </div>

          {/* Today Estimated Profit */}
          <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs card-hover">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
              <span>LỢI NHUẬN ƯỚC TÍNH</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-black text-emerald-700 mt-2">
              {formatCurrency(todayProfit || 1285000)}
            </div>
            <div className="text-[11px] text-emerald-700 font-bold mt-1">
              Biên lãi: ~33.0% (Sau trừ vốn & Ads)
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: THÁNG NÀY (MONTHLY REAL PROFIT BREAKDOWN) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Bóc Tách Dòng Tiền & Lợi Nhuận Tháng 08/2026
            </h2>
          </div>
          <button
            onClick={() => navigate('revenue-expense')}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1"
          >
            <span>Xem công thức chi tiết</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Master Flow Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center border-b border-slate-100 pb-6">
            {/* 1. Bán được */}
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                1. Bán được (Tổng Doanh Thu)
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                {formatCurrency(monthRev)}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Tổng giá trị đơn hàng khách đã mua từ các sàn & kênh bán
              </p>
            </div>

            {/* 2. Mất bao nhiêu */}
            <div>
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                2. Mất bao nhiêu (Chi Phí & Phí Sàn)
              </span>
              <div className="text-2xl sm:text-3xl font-black text-rose-600 mt-1">
                -{formatCurrency(monthExpenses)}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Bao gồm: Giá vốn hàng bán, Phí sàn TMĐT, Tiền Ads, Tiền hoàn
              </p>
            </div>

            {/* 3. Bạn thực sự còn lại */}
            <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>3. Bạn thực sự còn lại (Lợi Nhuận)</span>
              </span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">
                {formatCurrency(monthProfit)}
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs font-bold text-emerald-800">
                <span>Biên lợi nhuận ròng: {profitMarginPercent}%</span>
                <span className="text-[11px] font-normal text-emerald-600">(Đút túi sau sạch chi phí)</span>
              </div>
            </div>
          </div>

          {/* Sub-breakdown chips */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-medium">Giá vốn nhập hàng:</span>
              <div className="font-black text-slate-900 text-sm mt-0.5">
                {formatCurrency(monthCogs)}
              </div>
              <span className="text-[10px] text-slate-400">~40.8% doanh thu</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-medium">Phí sàn TMĐT:</span>
              <div className="font-black text-rose-600 text-sm mt-0.5">
                -{formatCurrency(monthPlatformFees)}
              </div>
              <span className="text-[10px] text-slate-400">Chiếm {feeRatio}%</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-medium">Tiền chạy Ads:</span>
              <div className="font-black text-rose-600 text-sm mt-0.5">
                -{formatCurrency(monthAdFees)}
              </div>
              <span className="text-[10px] text-slate-400">Chiếm {adRatio}%</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-medium">Tiền đơn hoàn / bom:</span>
              <div className="font-black text-amber-600 text-sm mt-0.5">
                -{formatCurrency(monthRefunds)}
              </div>
              <span className="text-[10px] text-amber-600">8 đơn hoàn</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-medium">Đóng gói & Ship:</span>
              <div className="font-black text-slate-900 text-sm mt-0.5">
                -{formatCurrency(1850000)}
              </div>
              <span className="text-[10px] text-slate-400">Hộp carton, băng dính</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: PLATFORM COMPARISON & AI PROACTIVE ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Revenue by Platform */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Store className="w-4 h-4 text-emerald-600" />
              <span>Hiệu Quả Doanh Thu Từng Sàn</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">Tháng 08/2026</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {platformStats.map((plat) => (
              <div
                key={plat.id}
                onClick={() => setSelectedPlatform(plat.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer card-hover ${
                  selectedPlatform === plat.id
                    ? 'border-emerald-500 bg-emerald-50/30 ring-2 ring-emerald-500/20 shadow-md shadow-emerald-100'
                    : 'border-slate-200 hover:border-slate-300 bg-white shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800 flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${plat.iconBg}`} />
                    {plat.name}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500">
                    {plat.orderCount} đơn
                  </span>
                </div>
                <div className="text-base font-black text-slate-900 mt-2">
                  {formatCurrency(plat.revenue)}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 border-t border-slate-100 pt-1.5">
                  <span>Phí sàn TB:</span>
                  <span className="font-semibold text-slate-700">{plat.avgFee}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: AI Proactive Alerts & Smart Advice */}
        <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 p-5 rounded-2xl text-white shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">AI Đang Lưu Ý Cho Bạn</h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
              3 lưu ý
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            {/* Alert 1 */}
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
              <div className="flex items-center justify-between text-rose-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Chi phí Ads TikTok tăng cao
                </span>
                <span className="text-[10px] bg-rose-500/20 px-1.5 py-0.5 rounded text-rose-300">
                  {adRatio}% DT
                </span>
              </div>
              <p className="text-slate-300 text-[11px]">
                Chi phí chạy Ads TikTok đang chiếm 16.5% doanh thu kênh này. Khuyến nghị giảm giá thầu cho chiến dịch Tai nghe TWS.
              </p>
            </div>

            {/* Alert 2 */}
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
              <div className="flex items-center justify-between text-amber-400 font-bold">
                <span>⚠️ Sản phẩm lãi mỏng</span>
                <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-300">
                  Biên LN 6.4%
                </span>
              </div>
              <p className="text-slate-300 text-[11px]">
                Tai nghe Gaming chỉ lãi 12.000 ₫/chiếc sau khi trừ tiền Ads và phí sàn Shopee. Cần tăng giá bán thêm 15k.
              </p>
            </div>

            {/* Alert 3 */}
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
              <div className="flex items-center justify-between text-emerald-400 font-bold">
                <span>💡 Top sản phẩm kéo lợi nhuận</span>
                <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-300">
                  Top 1
                </span>
              </div>
              <p className="text-slate-300 text-[11px]">
                Áo thun Oversize mang lại 18.034.000 ₫ tiền lãi thuần (37.6% biên LN). Nên tiếp tục đẩy mạnh tồn kho.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('ai-chat')}
            className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hỏi Kế Toán AI về Shop của tôi</span>
          </button>
        </div>
      </div>

      {/* Modal Import */}
      <ImportOrdersModal
        isOpen={isImportModalOpen}
        onClose={closeImportModal}
        onImportSuccess={(newOrders) => {
          importOrders(newOrders);
        }}
      />
    </div>
  );
};
