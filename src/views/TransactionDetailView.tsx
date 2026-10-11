import React, { useState } from 'react';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Copy,
  Printer,
  FileText,
  Download,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Building,
  CreditCard,
  Tag,
  ShieldCheck,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useLedger } from '../context/LedgerContext';
import { formatCurrency } from '../utils/formatters';

export const TransactionDetailView: React.FC = () => {
  const {
    transactions,
    selectedTransactionId,
    navigate,
    openEditTxModal,
    duplicateTransaction,
    deleteTransaction,
    updateTransaction,
  } = useLedger();

  const [isUploading, setIsUploading] = useState(false);

  const tx = transactions.find((t) => t.id === selectedTransactionId) || transactions[0];

  if (!tx) {
    return (
      <div className="p-12 text-center">
        <p className="text-slate-500 mb-4">Không tìm thấy giao dịch đã chọn.</p>
        <button
          onClick={() => navigate('transactions')}
          className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDuplicate = () => {
    duplicateTransaction(tx.id);
  };

  const handleDelete = () => {
    if (confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn giao dịch ${tx.code}?`)) {
      deleteTransaction(tx.id);
    }
  };

  const handleAddAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newAtt = Array.from(e.target.files).map((f: File) => ({
        id: `att-${Date.now()}-${Math.random()}`,
        name: f.name,
        size: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
        type: f.type || 'application/octet-stream',
        uploadedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      }));
      updateTransaction(tx.id, {
        attachments: [...(tx.attachments || []), ...newAtt],
      });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => navigate('transactions')}
            className="text-slate-500 hover:text-emerald-600 flex items-center gap-1 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Sổ giao dịch</span>
          </button>
          <span className="text-slate-300">/</span>
          <span className="font-bold text-slate-800">Chi tiết giao dịch {tx.code}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>In Phiếu</span>
          </button>
          <button
            onClick={handleDuplicate}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5 text-slate-500" />
            <span>Nhân bản</span>
          </button>
          <button
            onClick={handleDelete}
            className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-600 text-xs font-semibold rounded-xl border border-rose-200 shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa</span>
          </button>
          <button
            onClick={() => openEditTxModal(tx)}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Chỉnh sửa</span>
          </button>
        </div>
      </div>

      {/* Hero Card: Big Amount & Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span
                className={`px-3 py-1 rounded-lg text-xs font-black tracking-wider uppercase ${
                  tx.type === 'INCOME'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {tx.type === 'INCOME' ? 'PHIẾU THU TIỀN (+)' : 'PHIẾU CHI TIỀN (-)'}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-bold font-mono">
                {tx.code}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đã ghi sổ
              </span>
            </div>

            <div
              className={`text-3xl sm:text-4xl font-black font-mono tracking-tight ${
                tx.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {tx.type === 'INCOME' ? '+' : '-'} {formatCurrency(tx.amount)}
            </div>

            <p className="text-xs text-slate-500 mt-2 flex items-center gap-2">
              <span>Khởi tạo bởi: <strong className="text-slate-700">{tx.creator}</strong></span>
              <span>•</span>
              <span>Thời gian: <strong className="text-slate-700">{tx.date} lúc {tx.time}</strong></span>
            </p>
          </div>

          {/* Quick AI Audit Pill */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 md:w-80 shrink-0">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>AI Audit Status</span>
              <span className="ml-auto text-[10px] px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full font-bold">
                98% TIN CẬY
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Chứng từ khớp với quy chế chi tiêu và định mức kế toán doanh nghiệp.
            </p>
          </div>
        </div>
      </div>

      {/* 2-Column Grid Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Full Details & Attachments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">
              Thông tin hạch toán chi tiết
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs">
              <div>
                <span className="text-slate-400 font-medium block mb-1">Nội dung diễn giải:</span>
                <span className="font-semibold text-slate-900 text-sm leading-snug block">
                  {tx.description}
                </span>
              </div>

              <div>
                <span className="text-slate-400 font-medium block mb-1">Danh mục kế toán:</span>
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-800">{tx.categoryName}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-medium block mb-1">Phương thức thanh toán:</span>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-slate-500" />
                  <span className="font-semibold text-slate-800">
                    {tx.paymentMethod === 'BANK_TRANSFER'
                      ? 'Chuyển khoản Ngân hàng (Vietcombank)'
                      : tx.paymentMethod === 'CASH'
                      ? 'Tiền mặt tại quỹ'
                      : 'Thẻ tín dụng'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-medium block mb-1">Khách hàng / Đối tác:</span>
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-slate-500" />
                  <span className="font-semibold text-slate-800">{tx.partnerName}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {tx.notes && (
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="font-bold text-slate-700 block mb-1">Ghi chú nghiệp vụ:</span>
                <p className="text-slate-600 leading-relaxed">{tx.notes}</p>
              </div>
            )}
          </div>

          {/* Attachments Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">
                  Chứng từ đính kèm ({tx.attachments ? tx.attachments.length : 0})
                </h3>
                <p className="text-xs text-slate-500">Hóa đơn điện tử, biên bản nghiệm thu, phiếu chi</p>
              </div>

              <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer transition-colors flex items-center gap-1.5">
                <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
                <span>Thêm chứng từ</span>
                <input type="file" multiple onChange={handleAddAttachment} className="hidden" />
              </label>
            </div>

            {tx.attachments && tx.attachments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tx.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between gap-3 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-800 truncate" title={att.name}>
                          {att.name}
                        </div>
                        <div className="text-[10px] text-slate-400">{att.size} • {att.uploadedAt}</div>
                      </div>
                    </div>

                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        alert(`Đang tải xuống chứng từ: ${att.name}`);
                      }}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg transition-colors"
                      title="Tải về"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-xl">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                <p className="text-xs text-slate-500">Chưa có chứng từ nào đính kèm cho giao dịch này.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Analysis & Audit Log Timeline */}
        <div className="space-y-6">
          {/* AI Auditor Box */}
          <div className="bg-indigo-950 text-white rounded-2xl p-5 shadow-md relative overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg bg-indigo-500/30 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              </div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-200">
                AI Kiểm toán Giao dịch
              </h4>
            </div>

            {tx.aiFlags?.isAnomaly ? (
              <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl mb-3">
                <div className="flex items-center gap-1.5 text-rose-300 font-bold text-xs mb-1">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Phát hiện biến động chi phí</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{tx.aiFlags.reason}</p>
              </div>
            ) : (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl mb-3">
                <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-xs mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Giao dịch hợp lệ 100%</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Số tiền và danh mục chi tiêu hoàn toàn tương thích với các kỳ kế toán trước.
                </p>
              </div>
            )}

            <div className="space-y-2 text-xs text-indigo-200">
              <div className="flex justify-between border-b border-indigo-900/60 pb-1.5">
                <span>Mã TK dự kiến:</span>
                <span className="font-mono font-bold text-white">TK {tx.aiFlags?.suggestedAccount || '642'}</span>
              </div>
              <div className="flex justify-between border-b border-indigo-900/60 pb-1.5">
                <span>Độ tin cậy:</span>
                <span className="font-bold text-emerald-400">{tx.aiFlags?.confidence || 98}%</span>
              </div>
            </div>
          </div>

          {/* Audit Log Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Nhật ký hoạt động (Audit Trail)</span>
            </h4>

            <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {tx.auditLogs && tx.auditLogs.length > 0 ? (
                tx.auditLogs.map((log) => (
                  <div key={log.id} className="relative flex items-start gap-3 pl-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white shrink-0 mt-1" />
                    <div>
                      <div className="text-xs font-bold text-slate-800">{log.action}</div>
                      <div className="text-[11px] text-slate-500">
                        {log.user} • {log.timestamp}
                      </div>
                      {log.details && (
                        <p className="text-[11px] text-slate-600 mt-0.5 bg-slate-50 p-1.5 rounded-md">
                          {log.details}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 pl-4">Chưa có nhật ký hoạt động.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
