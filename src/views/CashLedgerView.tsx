import React, { useState, useMemo } from 'react';
import {
  Wallet,
  Building2,
  TrendingUp,
  TrendingDown,
  Download,
  Printer,
  Plus,
  Sparkles,
  Calendar,
  Filter,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { useLedger } from '../context/LedgerContext';
import { formatCurrency, formatShortCurrency, exportToCSV } from '../utils/formatters';
import { CashFlowBarChart } from '../components/charts';

export const CashLedgerView: React.FC = () => {
  const { transactions, kpis, openAddTxModal, navigate } = useLedger();

  const [fundFilter, setFundFilter] = useState<'ALL' | 'CASH' | 'BANK'>('ALL');
  const [periodFilter, setPeriodFilter] = useState<'30d' | 'this_month' | 'quarter'>('30d');

  // Compute Cash Ledger running balance entries
  const initialBalance = 118900000; // Số dư đầu kỳ

  let currentRunning = initialBalance;
  const ledgerEntries = useMemo(() => {
    return [...transactions]
      .filter((tx) => {
        if (fundFilter === 'CASH' && tx.paymentMethod !== 'CASH') return false;
        if (fundFilter === 'BANK' && tx.paymentMethod !== 'BANK_TRANSFER' && tx.paymentMethod !== 'CREDIT_CARD') return false;
        return true;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((tx) => {
        if (tx.type === 'INCOME') {
          currentRunning += tx.amount;
        } else {
          currentRunning -= tx.amount;
        }
        return {
          ...tx,
          runningBalance: currentRunning,
        };
      })
      .reverse(); // Newest on top for view
  }, [transactions, fundFilter]);

  const handleExport = () => {
    const data = ledgerEntries.map((item) => ({
      'Ngày hạch toán': item.date,
      'Số chứng từ': item.code,
      'Nội dung thu chi': item.description,
      'Tài khoản / Quỹ': item.paymentMethod === 'CASH' ? 'Tiền mặt tại quỹ' : 'Vietcombank',
      'Số tiền Thu (+)': item.type === 'INCOME' ? item.amount : 0,
      'Số tiền Chi (-)': item.type === 'EXPENSE' ? item.amount : 0,
      'Số dư lũy kế': item.runningBalance,
    }));
    exportToCSV(data, `So_quy_tien_mat_ngan_hang_${Date.now()}.csv`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Sổ Quỹ Tiền Mặt & Ngân Hàng
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi chi tiết dòng tiền vào, dòng tiền ra và số dư lũy kế thực tế theo thời gian thực
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => window.print()}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>In Sổ Quỹ</span>
          </button>
          <button
            onClick={handleExport}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Xuất Excel</span>
          </button>
          <button
            onClick={() => openAddTxModal('EXPENSE')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Lập Phiếu Thu / Chi</span>
          </button>
        </div>
      </div>

      {/* AI Cashflow Alert Widget */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-50 to-indigo-50 border border-amber-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-xs">AI Cảnh báo Dự báo Dòng tiền</span>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full text-[10px] font-bold">
                CẦN CHÚ Ý
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              Dự báo ngày 05/09 tới có thể thiếu hụt nhẹ <strong className="text-rose-600">15.000.000 ₫</strong> do thanh toán tiền thuê văn phòng và nộp BHXH. Đề xuất gửi email đối tác VinTech Group giải ngân đợt 3 sớm 5 ngày.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('smart-alerts')}
          className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0"
        >
          Xem chi tiết cảnh báo
        </button>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">SỐ DƯ ĐẦU KỲ</span>
          <div className="text-xl font-black text-slate-900 font-mono mt-2">
            {formatCurrency(initialBalance)}
          </div>
          <span className="text-[11px] text-slate-400">Chốt ngày 01/08/2026</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-emerald-600">TỔNG THU TRONG KỲ</span>
          <div className="text-xl font-black text-emerald-600 font-mono mt-2">
            +{formatCurrency(kpis.totalRevenue)}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> +14.8% tăng trưởng
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-rose-600">TỔNG CHI TRONG KỲ</span>
          <div className="text-xl font-black text-rose-600 font-mono mt-2">
            -{formatCurrency(kpis.totalExpense)}
          </div>
          <span className="text-[11px] text-rose-500 font-semibold flex items-center gap-0.5">
            <TrendingDown className="w-3 h-3" /> 100% có chứng từ
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-700">SỐ DƯ CUỐI KỲ (HIỆN TẠI)</span>
          <div className="text-xl font-black text-slate-900 font-mono mt-2">
            {formatCurrency(kpis.totalBalance)}
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-100 pt-1.5 mt-1.5">
            <span>Tiền mặt: {formatShortCurrency(kpis.cashBalance)}</span>
            <span className="font-bold text-slate-800">VCB: {formatShortCurrency(kpis.bankBalance)}</span>
          </div>
        </div>
      </div>

      {/* Chart: 30-Day Cashflow Dynamics */}
      <CashFlowBarChart />

      {/* Main Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Filters Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="inline-flex p-1 bg-slate-200/70 rounded-lg text-xs font-semibold w-full sm:w-auto">
            <button
              onClick={() => setFundFilter('ALL')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-md transition-all ${
                fundFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Toàn bộ quỹ ({transactions.length})
            </button>
            <button
              onClick={() => setFundFilter('BANK')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-md transition-all ${
                fundFilter === 'BANK' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ngân hàng Vietcombank
            </button>
            <button
              onClick={() => setFundFilter('CASH')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-md transition-all ${
                fundFilter === 'CASH' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Quỹ tiền mặt
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Kỳ đối soát: <strong className="text-slate-800">01/08/2026 — 31/08/2026</strong>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-500 font-semibold uppercase text-[10px]">
                <th className="py-3 px-4">Ngày / Số CT</th>
                <th className="py-3 px-4">Diễn giải nghiệp vụ</th>
                <th className="py-3 px-3">Tài khoản / Quỹ</th>
                <th className="py-3 px-3 text-right text-emerald-600">Thu (+)</th>
                <th className="py-3 px-3 text-right text-rose-600">Chi (-)</th>
                <th className="py-3 px-4 text-right font-bold text-slate-900">Số dư lũy kế</th>
                <th className="py-3 px-3 text-center">AI Đối soát</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ledgerEntries.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => navigate('transaction-detail', item.id)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-4 font-mono">
                    <div className="font-bold text-slate-900">{item.code}</div>
                    <div className="text-[11px] text-slate-400">{item.date}</div>
                  </td>
                  <td className="py-3.5 px-4 max-w-[280px]">
                    <div className="font-semibold text-slate-800 truncate">{item.description}</div>
                    <div className="text-[11px] text-slate-400">{item.partnerName}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] font-medium">
                      {item.paymentMethod === 'CASH' ? 'Tiền mặt tại quỹ' : 'Vietcombank 0071...'}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-600">
                    {item.type === 'INCOME' ? `+${formatCurrency(item.amount)}` : '—'}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-rose-600">
                    {item.type === 'EXPENSE' ? `-${formatCurrency(item.amount)}` : '—'}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900">
                    {formatCurrency(item.runningBalance)}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold border border-emerald-200 inline-flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-600" /> Khớp 100%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
