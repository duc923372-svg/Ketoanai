import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  Trash2,
  Edit2,
  Eye,
  CheckSquare,
  Square,
  AlertTriangle,
  FileSpreadsheet,
  ArrowUpDown,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Calendar,
  X,
  Store,
  ShoppingBag,
  Receipt,
  HelpCircle,
  ChevronRight,
  Info,
} from 'lucide-react';
import { useLedger } from '../context/LedgerContext';
import { OrderItem, OrderStatus, SalesPlatform, Transaction } from '../types';
import { formatCurrency, exportToCSV } from '../utils/formatters';
import { ImportOrdersModal } from '../components/modals/ImportOrdersModal';

export const TransactionsView: React.FC = () => {
  const {
    orders,
    transactions,
    selectedPlatform,
    setSelectedPlatform,
    openAddTxModal,
    openEditTxModal,
    deleteTransaction,
    deleteOrder,
    importOrders,
    isImportModalOpen,
    openImportModal,
    closeImportModal,
    searchQuery,
    setSearchQuery,
    canExport,
    openUpgradeModal,
  } = useLedger();

  const [activeTab, setActiveTab] = useState<'ORDERS' | 'EXPENSES'>('ORDERS');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<'ALL' | OrderStatus>('ALL');
  const [viewingOrder, setViewingOrder] = useState<OrderItem | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      // Platform filter
      if (selectedPlatform !== 'ALL' && ord.platform !== selectedPlatform) return false;

      // Status filter
      if (statusFilter !== 'ALL' && ord.status !== statusFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = ord.code.toLowerCase().includes(q);
        const matchProd = ord.productName.toLowerCase().includes(q);
        const matchSku = ord.sku.toLowerCase().includes(q);
        const matchCust = ord.customerName?.toLowerCase().includes(q);
        if (!matchCode && !matchProd && !matchSku && !matchCust) return false;
      }

      return true;
    });
  }, [orders, selectedPlatform, statusFilter, searchQuery]);

  // KPIs for orders
  const totalRev = filteredOrders.reduce((sum, o) => sum + o.revenue, 0);
  const totalPlatformFees = filteredOrders.reduce((sum, o) => sum + o.platformFee, 0);
  const totalNetCash = filteredOrders.reduce((sum, o) => sum + o.netCashReceived, 0);
  const totalProfit = filteredOrders.reduce((sum, o) => sum + o.netProfit, 0);

  // Pagination slice
  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Select all handler
  const handleSelectAll = () => {
    if (selectedOrderIds.length === paginatedOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(paginatedOrders.map((o) => o.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa ${selectedOrderIds.length} đơn hàng đã chọn?`)) {
      return;
    }
    for (const id of selectedOrderIds) {
      await deleteOrder(id);
    }
    setSelectedOrderIds([]);
  };

  const handleExportCSV = () => {
    if (!canExport()) {
      openUpgradeModal('Tính năng xuất file Excel yêu cầu gói PRO');
      return;
    }
    const dataToExport = filteredOrders.map((o) => ({
      'Mã đơn hàng': o.code,
      'Ngày đặt': o.date,
      'Sàn': o.platform,
      'Sản phẩm': o.productName,
      'SKU': o.sku,
      'Số lượng': o.quantity,
      'Đơn giá': o.unitPrice,
      'Doanh thu': o.revenue,
      'Phí sàn': o.platformFee,
      'Tiền ship người bán': o.shippingFeeSeller,
      'Tiền Ads': o.adFee,
      'Tiền vốn (COGS)': o.cogs,
      'Tiền thực nhận': o.netCashReceived,
      'Lợi nhuận ròng': o.netProfit,
      'Trạng thái': o.status,
    }));
    exportToCSV(dataToExport, `Danh_Sach_Don_Hang_${new Date().toISOString().slice(0, 10)}`);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              QUẢN LÝ BÁN HÀNG TMĐT
            </span>
            <span className="text-xs text-slate-400">• Tự động tính phí sàn & lãi lỗ</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Trung Tâm Đơn Hàng & Sổ Giao Dịch</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi chi tiết từng đơn hàng từ Shopee, TikTok Shop, Lazada, Facebook và Website.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2 shrink-0">
          <button
            onClick={openImportModal}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm shadow-emerald-900/20 transition-all active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Nhập đơn từ Excel/CSV</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Xuất Excel</span>
          </button>
          <button
            onClick={() => openAddTxModal('EXPENSE')}
            className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 text-rose-400" />
            <span>+ Ghi nhận chi phí</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">TỔNG SỐ ĐƠN</span>
          <div className="text-lg font-black text-slate-900 mt-1">
            {filteredOrders.length} <span className="text-xs font-normal text-slate-500">đơn</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">TỔNG DOANH THU</span>
          <div className="text-lg font-black text-slate-900 mt-1">
            {formatCurrency(totalRev)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-rose-500">TỔNG PHÍ SÀN</span>
          <div className="text-lg font-black text-rose-600 mt-1">
            -{formatCurrency(totalPlatformFees)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-teal-600">TIỀN THỰC NHẬN</span>
          <div className="text-lg font-black text-teal-700 mt-1">
            {formatCurrency(totalNetCash)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold text-emerald-800">BẠN THỰC SỰ CÒN LẠI</span>
          <div className="text-lg font-black text-emerald-700 mt-1">
            {formatCurrency(totalProfit)}
          </div>
        </div>
      </div>

      {/* Tab Switcher & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {/* Row 1: Sub-Tabs & Platform Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('ORDERS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'ORDERS'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Trung tâm Đơn hàng ({orders.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('EXPENSES')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'EXPENSES'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Sổ chi phí & Vận hành ({transactions.filter((t) => t.type === 'EXPENSE').length})</span>
            </button>
          </div>

          {/* Quick Platform Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {(['ALL', 'SHOPEE', 'TIKTOK', 'LAZADA', 'FACEBOOK'] as const).map((plat) => (
              <button
                key={plat}
                onClick={() => {
                  setSelectedPlatform(plat);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedPlatform === plat
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {plat === 'ALL'
                  ? 'Tất cả sàn'
                  : plat === 'SHOPEE'
                  ? 'Shopee'
                  : plat === 'TIKTOK'
                  ? 'TikTok Shop'
                  : plat === 'LAZADA'
                  ? 'Lazada'
                  : 'Facebook'}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Search & Status Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo mã đơn, SKU, sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-400">Trạng thái:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="COMPLETED">Đã hoàn thành</option>
                <option value="SHIPPED">Đã gửi hàng</option>
                <option value="PROCESSING">Đang xử lý</option>
                <option value="RETURNED">Hoàn hàng / Bom</option>
                <option value="CANCELLED">Đã hủy</option>
              </select>
            </div>

            {selectedOrderIds.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa ({selectedOrderIds.length})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {activeTab === 'ORDERS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-3.5 w-10 text-center">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      {selectedOrderIds.length === paginatedOrders.length && paginatedOrders.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="p-3.5">Mã đơn & Thời gian</th>
                  <th className="p-3.5">Kênh sàn</th>
                  <th className="p-3.5">Sản phẩm & SKU</th>
                  <th className="p-3.5 text-right">Doanh thu</th>
                  <th className="p-3.5 text-right">Phí sàn</th>
                  <th className="p-3.5 text-right">Tiền thực nhận</th>
                  <th className="p-3.5 text-right">Lợi nhuận</th>
                  <th className="p-3.5 text-center">Trạng thái</th>
                  <th className="p-3.5 text-center">Bóc tách</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-400">
                      Không tìm thấy đơn hàng nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((ord) => {
                    const isSelected = selectedOrderIds.includes(ord.id);
                    const isProfit = ord.netProfit > 0;
                    return (
                      <tr
                        key={ord.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isSelected ? 'bg-emerald-50/30' : ''
                        }`}
                      >
                        <td className="p-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleSelect(ord.id)}
                            className="text-slate-400 hover:text-slate-700"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{ord.code}</div>
                          <div className="text-[11px] text-slate-400">
                            {ord.date} • {ord.time}
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                              ord.platform === 'SHOPEE'
                                ? 'bg-orange-100 text-orange-700'
                                : ord.platform === 'TIKTOK'
                                ? 'bg-slate-900 text-white'
                                : ord.platform === 'LAZADA'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {ord.platform}
                          </span>
                        </td>

                        <td className="p-3.5 max-w-[200px]">
                          <div className="font-semibold text-slate-800 truncate" title={ord.productName}>
                            {ord.productName}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            SKU: {ord.sku} • SL: <span className="font-bold text-slate-700">{ord.quantity}</span>
                          </div>
                        </td>

                        <td className="p-3.5 text-right font-black text-slate-900">
                          {formatCurrency(ord.revenue)}
                        </td>

                        <td className="p-3.5 text-right font-semibold text-rose-600">
                          -{formatCurrency(ord.platformFee)}
                        </td>

                        <td className="p-3.5 text-right font-bold text-teal-700">
                          {formatCurrency(ord.netCashReceived)}
                        </td>

                        <td className="p-3.5 text-right">
                          <div
                            className={`font-black ${
                              isProfit ? 'text-emerald-700' : 'text-rose-600'
                            }`}
                          >
                            {isProfit ? '+' : ''}
                            {formatCurrency(ord.netProfit)}
                          </div>
                          {ord.netProfit < 0 && (
                            <span className="text-[10px] font-bold text-rose-500 block">
                              (Lỗ đơn do Ads/Hoàn)
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              ord.status === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.status === 'SHIPPED'
                                ? 'bg-blue-100 text-blue-800'
                                : ord.status === 'PROCESSING'
                                ? 'bg-amber-100 text-amber-800'
                                : ord.status === 'RETURNED'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {ord.status === 'COMPLETED'
                              ? 'Hoàn thành'
                              : ord.status === 'SHIPPED'
                              ? 'Đã gửi'
                              : ord.status === 'PROCESSING'
                              ? 'Đang xử lý'
                              : ord.status === 'RETURNED'
                              ? 'Hoàn hàng'
                              : 'Đã hủy'}
                          </span>
                        </td>

                        <td className="p-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => setViewingOrder(ord)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Xem bóc tách dòng tiền chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                Hiển thị trang <strong>{currentPage}</strong> trên <strong>{totalPages}</strong> (
                {filteredOrders.length} đơn)
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold disabled:opacity-40"
                >
                  Trước
                </button>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold disabled:opacity-40"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Expenses Table */}
      {activeTab === 'EXPENSES' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Sổ Chi Phí Vận Hành & Giá Vốn
            </h3>
            <button
              onClick={() => openAddTxModal('EXPENSE')}
              className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm chi phí</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase">
                  <th className="p-3.5">Mã & Ngày</th>
                  <th className="p-3.5">Nhóm chi phí</th>
                  <th className="p-3.5">Mô tả / Diễn giải</th>
                  <th className="p-3.5">Đối tác / Nhà cung cấp</th>
                  <th className="p-3.5 text-right">Số tiền</th>
                  <th className="p-3.5 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {transactions
                  .filter((t) => t.type === 'EXPENSE')
                  .map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/80">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{tx.code}</div>
                        <div className="text-[11px] text-slate-400">{tx.date}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-semibold text-[11px]">
                          {tx.categoryName}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-700 max-w-[240px] truncate">{tx.description}</td>
                      <td className="p-3.5 text-slate-600">{tx.partnerName || 'Vãng lai'}</td>
                      <td className="p-3.5 text-right font-black text-rose-600">
                        -{formatCurrency(tx.amount)}
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditTxModal(tx)}
                            className="p-1 text-slate-400 hover:text-slate-700"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteTransaction(tx.id)}
                            className="p-1 text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Modal / Dòng tiền bóc tách */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  BÓC TÁCH DÒNG TIỀN ĐƠN HÀNG
                </span>
                <h3 className="text-base font-bold text-white mt-1">Đơn {viewingOrder.code}</h3>
              </div>
              <button
                onClick={() => setViewingOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Product Info */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 font-semibold">Sản phẩm đặt mua:</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{viewingOrder.productName}</p>
                <div className="flex items-center justify-between text-slate-500 mt-1 text-[11px]">
                  <span>SKU: {viewingOrder.sku}</span>
                  <span>
                    SL: <strong>{viewingOrder.quantity}</strong> • Giá: <strong>{formatCurrency(viewingOrder.unitPrice)}</strong>
                  </span>
                </div>
              </div>

              {/* Waterfall breakdown */}
              <div className="space-y-2 border-t border-b border-slate-100 py-3">
                <div className="flex items-center justify-between text-slate-700">
                  <span>1. Doanh thu đơn hàng (Khách thanh toán):</span>
                  <span className="font-black text-slate-900">{formatCurrency(viewingOrder.revenue)}</span>
                </div>

                <div className="flex items-center justify-between text-rose-600">
                  <span>2. Phí sàn khấu trừ (Cố định, TT, Dịch vụ):</span>
                  <span className="font-bold">-{formatCurrency(viewingOrder.platformFee)}</span>
                </div>

                <div className="flex items-center justify-between text-rose-600">
                  <span>3. Thuế sàn khấu trừ nộp thay (1.5%):</span>
                  <span className="font-bold">-{formatCurrency(viewingOrder.taxDeducted || Math.round(viewingOrder.revenue * 0.015))}</span>
                </div>

                <div className="flex items-center justify-between text-teal-800 bg-teal-50/60 p-2 rounded-lg font-bold">
                  <span>👉 Tiền thực nhận về tài khoản/ví sàn:</span>
                  <span>{formatCurrency(viewingOrder.netCashReceived)}</span>
                </div>

                <div className="flex items-center justify-between text-slate-600 pt-1">
                  <span>4. Tiền vốn nhập hàng (Giá vốn COGS):</span>
                  <span className="font-bold text-slate-800">-{formatCurrency(viewingOrder.cogs)}</span>
                </div>

                <div className="flex items-center justify-between text-rose-600">
                  <span>5. Chi phí quảng cáo Ads phân bổ:</span>
                  <span className="font-bold">-{formatCurrency(viewingOrder.adFee)}</span>
                </div>
              </div>

              {/* Net profit callout */}
              <div
                className={`p-4 rounded-xl border ${
                  viewingOrder.netProfit > 0
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">
                    {viewingOrder.netProfit > 0 ? '💰 BẠN THỰC SỰ CÒN LẠI (LÃI):' : '⚠️ ĐƠN HÀNG BỊ LỖ:'}
                  </span>
                  <span className="text-base font-black">
                    {viewingOrder.netProfit > 0 ? '+' : ''}
                    {formatCurrency(viewingOrder.netProfit)}
                  </span>
                </div>
                <p className="text-[11px] mt-1 text-slate-600">
                  {viewingOrder.netProfit > 0
                    ? `Biên lợi nhuận ròng đạt ${((viewingOrder.netProfit / viewingOrder.revenue) * 100).toFixed(1)}% sau khi trừ sạch vốn, phí sàn và tiền Ads.`
                    : 'Đơn hàng bị âm tiền do chi phí chạy Ads chuyển đổi quá cao hoặc đơn hoàn hàng.'}
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingOrder(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
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
