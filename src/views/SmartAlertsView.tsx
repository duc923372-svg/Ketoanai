import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Filter,
  RefreshCw,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useLedger } from '../context/LedgerContext';
import { SmartAlert } from '../types';

export const SmartAlertsView: React.FC = () => {
  const { alerts, resolveAlert, dismissAlert, navigate } = useLedger();

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'UNRESOLVED' | 'CRITICAL' | 'RESOLVED'>('ALL');

  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL' && a.status !== 'RESOLVED').length;
  const highCount = alerts.filter((a) => a.severity === 'HIGH' && a.status !== 'RESOLVED').length;
  const resolvedCount = alerts.filter((a) => a.status === 'RESOLVED').length;
  const totalUnresolved = alerts.filter((a) => a.status !== 'RESOLVED').length;

  const filteredAlerts = alerts.filter((a) => {
    if (activeFilter === 'UNRESOLVED') return a.status !== 'RESOLVED';
    if (activeFilter === 'CRITICAL') return a.severity === 'CRITICAL' && a.status !== 'RESOLVED';
    if (activeFilter === 'RESOLVED') return a.status === 'RESOLVED';
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-rose-600" /> HỆ THỐNG KIỂM TOÁN TỰ ĐỘNG
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Trung Tâm Cảnh Báo Thông Minh & Kiểm Toán
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Phát hiện sớm các rủi ro sai sót kế toán, bất thường dòng tiền và nguy cơ lệch chứng từ hóa đơn
          </p>
        </div>

        <button
          onClick={() => alert('Hệ thống AI vừa quét lại toàn bộ 100% chứng từ sổ cái. Dữ liệu đã được cập nhật mới nhất!')}
          className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 shadow-2xs transition-colors flex items-center gap-1.5 shrink-0"
        >
          <RefreshCw className="w-4 h-4 text-emerald-600" />
          <span>Quét lại toàn bộ sổ cái</span>
        </button>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">TỔNG SỐ CẢNH BÁO</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{alerts.length}</div>
          <span className="text-[11px] text-slate-400">Toàn bộ kỳ kế toán</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-rose-600">MỨC ĐỘ KHẨN CẤP (CRITICAL)</span>
          <div className="text-2xl font-black text-rose-600 mt-1">{criticalCount}</div>
          <span className="text-[11px] text-rose-500 font-medium">Cần xử lý ngay</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-amber-600">MỨC ĐỘ CAO (HIGH)</span>
          <div className="text-2xl font-black text-amber-600 mt-1">{highCount}</div>
          <span className="text-[11px] text-amber-600 font-medium">Lệch định mức dự kiến</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-emerald-600">ĐÃ GIẢI QUYẾT XONG</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{resolvedCount}</div>
          <span className="text-[11px] text-emerald-600 font-medium">Đã kiểm toán & đối soát</span>
        </div>
      </div>

      {/* Main Alert List Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Filter Tabs */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="inline-flex p-1 bg-slate-200/70 rounded-lg text-xs font-semibold w-full sm:w-auto">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-md transition-all ${
                activeFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({alerts.length})
            </button>
            <button
              onClick={() => setActiveFilter('UNRESOLVED')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-md transition-all ${
                activeFilter === 'UNRESOLVED' ? 'bg-rose-600 text-white shadow-xs' : 'text-rose-700 hover:text-rose-900'
              }`}
            >
              Chưa xử lý ({totalUnresolved})
            </button>
            <button
              onClick={() => setActiveFilter('CRITICAL')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-md transition-all ${
                activeFilter === 'CRITICAL' ? 'bg-red-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Khẩn cấp ({criticalCount})
            </button>
            <button
              onClick={() => setActiveFilter('RESOLVED')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-md transition-all ${
                activeFilter === 'RESOLVED' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đã giải quyết ({resolvedCount})
            </button>
          </div>
        </div>

        {/* Alerts List */}
        <div className="divide-y divide-slate-100">
          {filteredAlerts.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              Không có cảnh báo nào trong danh mục này.
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const isResolved = alert.status === 'RESOLVED';
              return (
                <div
                  key={alert.id}
                  className={`p-5 transition-colors ${
                    isResolved ? 'bg-slate-50/50 opacity-70' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          alert.severity === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-700'
                            : alert.severity === 'HIGH'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        <AlertTriangle className="w-5 h-5" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                              alert.severity === 'CRITICAL'
                                ? 'bg-rose-600 text-white'
                                : alert.severity === 'HIGH'
                                ? 'bg-amber-500 text-white'
                                : 'bg-blue-500 text-white'
                            }`}
                          >
                            {alert.severity}
                          </span>
                          <h4 className="font-bold text-slate-900 text-sm">{alert.title}</h4>
                          {isResolved && (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                              ✓ Đã xử lý
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                          {alert.description}
                        </p>

                        <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                          <span>Phát hiện lúc: {alert.detectedAt}</span>
                          <span>•</span>
                          <span>Thuật toán: AI Anomaly Detector v2.4</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      {alert.relatedTransactionId && (
                        <button
                          onClick={() => navigate('transaction-detail', alert.relatedTransactionId)}
                          className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-2xs transition-colors flex items-center gap-1"
                        >
                          <span>Xem chứng từ</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </button>
                      )}

                      {!isResolved ? (
                        <>
                          <button
                            onClick={() => resolveAlert(alert.id)}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                          >
                            Đã giải quyết
                          </button>
                          <button
                            onClick={() => dismissAlert(alert.id)}
                            className="px-3 py-1.5 text-slate-500 hover:text-slate-800 text-xs font-semibold"
                          >
                            Bỏ qua
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Đã lưu hồ sơ kiểm toán</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
