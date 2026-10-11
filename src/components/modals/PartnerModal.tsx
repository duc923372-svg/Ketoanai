import React, { useState, useEffect } from 'react';
import { X, UserPlus, Building2 } from 'lucide-react';
import { useLedger } from '../../context/LedgerContext';
import { Partner } from '../../types';

interface PartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerToEdit?: Partner | null;
}

export const PartnerModal: React.FC<PartnerModalProps> = ({
  isOpen,
  onClose,
  partnerToEdit,
}) => {
  const { addPartner, updatePartner } = useLedger();

  const [type, setType] = useState<'CUSTOMER' | 'SUPPLIER' | 'PARTNER'>('CUSTOMER');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [address, setAddress] = useState('');
  const [receivableAmount, setReceivableAmount] = useState('0');
  const [payableAmount, setPayableAmount] = useState('0');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (partnerToEdit) {
      setType(partnerToEdit.type);
      setName(partnerToEdit.name);
      setPhone(partnerToEdit.phone);
      setEmail(partnerToEdit.email);
      setTaxCode(partnerToEdit.taxCode || '');
      setAddress(partnerToEdit.address);
      setReceivableAmount(String(partnerToEdit.receivableAmount || 0));
      setPayableAmount(String(partnerToEdit.payableAmount || 0));
      setNotes(partnerToEdit.notes || '');
    } else {
      setType('CUSTOMER');
      setName('');
      setPhone('');
      setEmail('');
      setTaxCode('');
      setAddress('');
      setReceivableAmount('0');
      setPayableAmount('0');
      setNotes('');
    }
  }, [partnerToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const data = {
      type,
      name,
      phone,
      email,
      taxCode,
      address,
      receivableAmount: Number(receivableAmount) || 0,
      payableAmount: Number(payableAmount) || 0,
      notes,
    };

    if (partnerToEdit) {
      updatePartner(partnerToEdit.id, data);
    } else {
      addPartner(data);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-800 text-base">
              {partnerToEdit ? `Chỉnh sửa đối tác #${partnerToEdit.code}` : 'Thêm Khách hàng / Đối tác mới'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Partner Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phân loại đối tác</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('CUSTOMER')}
                className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                  type === 'CUSTOMER'
                    ? 'bg-emerald-500 text-white border-emerald-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                Khách hàng (KH)
              </button>
              <button
                type="button"
                onClick={() => setType('SUPPLIER')}
                className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                  type === 'SUPPLIER'
                    ? 'bg-rose-500 text-white border-rose-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                Nhà cung cấp (NCC)
              </button>
              <button
                type="button"
                onClick={() => setType('PARTNER')}
                className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                  type === 'PARTNER'
                    ? 'bg-blue-500 text-white border-blue-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                Đối tác / Ngân hàng
              </button>
            </div>
          </div>

          {/* Name & Tax Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên Khách hàng / Công ty <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Tập đoàn VinTech..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mã Số Thuế (MST)</label>
              <input
                type="text"
                placeholder="0108923456"
                value={taxCode}
                onChange={(e) => setTaxCode(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại</label>
              <input
                type="text"
                placeholder="028 3822 9988"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email liên hệ</label>
              <input
                type="email"
                placeholder="contact@company.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Địa chỉ trụ sở</label>
            <input
              type="text"
              placeholder="Tầng 18, Tòa nhà Vincom Center, Quận 1, TP. HCM"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Debt Balance */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-emerald-800 mb-1">
                Công nợ Phải Thu (KH nợ)
              </label>
              <input
                type="number"
                value={receivableAmount}
                onChange={(e) => setReceivableAmount(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono font-bold text-emerald-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-rose-800 mb-1">
                Công nợ Phải Trả (Nợ NCC)
              </label>
              <input
                type="number"
                value={payableAmount}
                onChange={(e) => setPayableAmount(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono font-bold text-rose-700"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Ghi chú đối tác</label>
            <textarea
              rows={2}
              placeholder="Quy chế thanh toán, đầu mối kế toán phụ trách..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md"
            >
              {partnerToEdit ? 'Lưu thay đổi' : 'Thêm đối tác'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
