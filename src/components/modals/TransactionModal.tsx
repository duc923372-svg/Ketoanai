import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  UploadCloud,
  FileText,
  Trash2,
  AlertCircle,
  Check,
  Calendar,
  Clock,
  Building,
  CreditCard,
  Tag,
  AlignLeft,
} from 'lucide-react';
import { useLedger } from '../../context/LedgerContext';
import { TransactionType, PaymentMethod, Attachment } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { suggestCategoryFromDescription } from '../../utils/aiEngine';

export const TransactionModal: React.FC = () => {
  const {
    isTxModalOpen,
    closeTxModal,
    editingTx,
    defaultTxType,
    categories,
    partners,
    addTransaction,
    updateTransaction,
  } = useLedger();

  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [partnerId, setPartnerId] = useState<string>('');
  const [partnerName, setPartnerName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // AI Suggestion State
  const [aiSuggestion, setAiSuggestion] = useState<{
    categoryId: string;
    categoryName: string;
    accountCode: string;
    confidence: number;
    reason: string;
  } | null>(null);

  useEffect(() => {
    if (editingTx) {
      setType(editingTx.type);
      setAmount(String(editingTx.amount));
      setDate(editingTx.date);
      setTime(editingTx.time);
      setCategoryId(editingTx.categoryId);
      setDescription(editingTx.description);
      setPaymentMethod(editingTx.paymentMethod);
      setPartnerId(editingTx.partnerId || '');
      setPartnerName(editingTx.partnerName || '');
      setNotes(editingTx.notes || '');
      setAttachments(editingTx.attachments || []);
    } else {
      const now = new Date();
      setType(defaultTxType);
      setAmount('');
      setDate(now.toISOString().split('T')[0]);
      setTime(now.toTimeString().slice(0, 5));
      const firstCat = categories.find((c) => c.type === defaultTxType);
      setCategoryId(firstCat ? firstCat.id : '');
      setDescription('');
      setPaymentMethod('BANK_TRANSFER');
      setPartnerId('');
      setPartnerName('');
      setNotes('');
      setAttachments([]);
    }
    setErrors({});
    setAiSuggestion(null);
  }, [editingTx, defaultTxType, isTxModalOpen, categories]);

  // AI auto-suggestion on description change
  useEffect(() => {
    if (description.length >= 3 && !editingTx) {
      const suggestion = suggestCategoryFromDescription(description, categories, type);
      if (suggestion && suggestion.categoryId !== categoryId) {
        setAiSuggestion(suggestion);
      } else {
        setAiSuggestion(null);
      }
    } else {
      setAiSuggestion(null);
    }
  }, [description, type, categories, editingTx, categoryId]);

  if (!isTxModalOpen) return null;

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const firstCat = categories.find((c) => c.type === newType);
    if (firstCat) setCategoryId(firstCat.id);
  };

  const handlePartnerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pId = e.target.value;
    setPartnerId(pId);
    const p = partners.find((item) => item.id === pId);
    if (p) {
      setPartnerName(p.name);
    } else {
      setPartnerName('');
    }
  };

  const applyAISuggestion = () => {
    if (aiSuggestion) {
      setCategoryId(aiSuggestion.categoryId);
      setAiSuggestion(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles: Attachment[] = Array.from(e.target.files).map((f: File) => ({
        id: `att-${Date.now()}-${Math.random()}`,
        name: f.name,
        size: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
        type: f.type || 'application/octet-stream',
        uploadedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      }));
      setAttachments((prev) => [...prev, ...newFiles]);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const validate = () => {
    const errs: { [key: string]: string } = {};
    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      errs.amount = 'Vui lòng nhập số tiền hợp lệ (> 0)';
    }
    if (!description.trim()) {
      errs.description = 'Nội dung giao dịch không được để trống';
    }
    if (!date) {
      errs.date = 'Vui lòng chọn ngày giao dịch';
    }
    if (!categoryId) {
      errs.categoryId = 'Vui lòng chọn danh mục';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const selectedCat = categories.find((c) => c.id === categoryId);

    const txData = {
      type,
      amount: Number(amount),
      date,
      time,
      categoryId,
      categoryName: selectedCat ? selectedCat.name : 'Chi phí chung',
      categoryIcon: selectedCat ? selectedCat.icon : 'Receipt',
      description,
      paymentMethod,
      partnerId,
      partnerName: partnerName || 'Đối tác vãng lai',
      notes,
      attachments,
      status: 'COMPLETED' as const,
    };

    if (editingTx) {
      updateTransaction(editingTx.id, txData);
    } else {
      addTransaction(txData);
    }

    closeTxModal();
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">
              {editingTx ? `Chỉnh sửa giao dịch #${editingTx.code}` : 'Thêm giao dịch mới'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Nhập đầy đủ thông tin chứng từ để AI tự động hạch toán sổ cái
            </p>
          </div>
          <button
            onClick={closeTxModal}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Type Toggle: Thu / Chi */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Loại giao dịch</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleTypeChange('INCOME')}
                className={`py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  type === 'INCOME'
                    ? 'bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className={`w-2.5 h-2.5 rounded-full ${type === 'INCOME' ? 'bg-white' : 'bg-emerald-500'}`} />
                THU TIỀN (+)
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('EXPENSE')}
                className={`py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  type === 'EXPENSE'
                    ? 'bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-500/20'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className={`w-2.5 h-2.5 rounded-full ${type === 'EXPENSE' ? 'bg-white' : 'bg-rose-500'}`} />
                CHI TIỀN (-)
              </button>
            </div>
          </div>

          {/* Amount Field with Live Formatting */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Số tiền (VNĐ) <span className="text-rose-500">*</span>
              </label>
              {amount && !isNaN(Number(amount)) && (
                <span className="text-xs font-bold text-emerald-600">
                  {formatCurrency(Number(amount))}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="number"
                placeholder="Ví dụ: 45000000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full px-4 py-2.5 text-base font-semibold bg-slate-50 focus:bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                  errors.amount
                    ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/30'
                    : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500'
                }`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                ₫ VNĐ
              </span>
            </div>
            {errors.amount && (
              <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.amount}
              </p>
            )}
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Ngày giao dịch <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Thời gian</label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Nội dung diễn giải <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <AlignLeft className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <textarea
                rows={2}
                placeholder="Ví dụ: Thanh toán tiền thuê văn phòng Landmark Tower Tháng 8/2026..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 text-xs bg-slate-50 focus:bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                  errors.description
                    ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                    : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500'
                }`}
              />
            </div>
            {errors.description && (
              <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.description}
              </p>
            )}
          </div>

          {/* AI Category Suggestion Banner */}
          {aiSuggestion && (
            <div className="p-3 rounded-xl bg-indigo-50/90 border border-indigo-200/80 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                    <span>AI Gợi ý danh mục:</span>
                    <span className="px-2 py-0.5 bg-indigo-200/70 text-indigo-800 rounded-md font-semibold">
                      {aiSuggestion.categoryName} ({aiSuggestion.accountCode})
                    </span>
                    <span className="text-[10px] text-indigo-600 font-normal">
                      • Độ tin cậy {aiSuggestion.confidence}%
                    </span>
                  </div>
                  <p className="text-[11px] text-indigo-700 mt-0.5">{aiSuggestion.reason}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={applyAISuggestion}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0 flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Áp dụng
              </button>
            </div>
          )}

          {/* Category & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Danh mục kế toán <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none font-medium text-slate-800"
                >
                  {filteredCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.accountCode ? `(TK ${c.accountCode})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Phương thức thanh toán
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none font-medium text-slate-800"
                >
                  <option value="BANK_TRANSFER">Chuyển khoản Ngân hàng (Vietcombank)</option>
                  <option value="CASH">Tiền mặt tại quỹ</option>
                  <option value="CREDIT_CARD">Thẻ tín dụng Doanh nghiệp</option>
                  <option value="E_WALLET">Ví điện tử / Cổng thanh toán</option>
                </select>
              </div>
            </div>
          </div>

          {/* Partner / Customer */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Khách hàng / Đối tác / Nhà cung cấp
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={partnerId}
                onChange={handlePartnerSelect}
                className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none font-medium text-slate-800"
              >
                <option value="">-- Chọn đối tác trong danh bạ hoặc nhập tự do --</option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.code}] {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Attachments Section */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Đính kèm chứng từ (Hóa đơn GTGT, Phiếu thu/chi, UNC)
            </label>
            <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-xl p-4 text-center bg-slate-50/50 hover:bg-emerald-50/30 transition-all cursor-pointer relative">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <UploadCloud className="w-7 h-7 text-slate-400 mx-auto mb-1" />
              <p className="text-xs font-medium text-slate-700">
                Kéo thả chứng từ vào đây hoặc <span className="text-emerald-600 font-bold">chọn file</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Hỗ trợ PDF, PNG, JPG, XLSX (Tối đa 25MB)</p>
            </div>

            {/* Uploaded File List */}
            {attachments.length > 0 && (
              <div className="mt-2.5 space-y-1.5">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-100 text-xs border border-slate-200"
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="truncate font-medium text-slate-800">{att.name}</span>
                      <span className="text-[10px] text-slate-400 shrink-0">({att.size})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(att.id)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={closeTxModal}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all active:scale-95"
            >
              {editingTx ? 'Lưu thay đổi' : 'Tạo giao dịch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
