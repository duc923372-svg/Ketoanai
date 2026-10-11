import React, { useState, useEffect } from 'react';
import { X, FolderPlus, Sparkles } from 'lucide-react';
import { useLedger } from '../../context/LedgerContext';
import { Category, TransactionType } from '../../types';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit?: Category | null;
}

const AVAILABLE_ICONS = [
  'Code2', 'Briefcase', 'Layers', 'TrendingUp', 'Users', 'Building2',
  'Server', 'Megaphone', 'Coffee', 'Receipt', 'ShoppingBag', 'CreditCard',
  'Truck', 'Cpu', 'BookOpen', 'ShieldCheck', 'Globe', 'PieChart'
];

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  categoryToEdit,
}) => {
  const { addCategory, updateCategory } = useLedger();

  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [name, setName] = useState('');
  const [accountCode, setAccountCode] = useState('');
  const [icon, setIcon] = useState('FolderTree');
  const [color, setColor] = useState('#3B82F6');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  useEffect(() => {
    if (categoryToEdit) {
      setType(categoryToEdit.type);
      setName(categoryToEdit.name);
      setAccountCode(categoryToEdit.accountCode || '');
      setIcon(categoryToEdit.icon || 'FolderTree');
      setColor(categoryToEdit.color || '#3B82F6');
      setDescription(categoryToEdit.description || '');
      setStatus(categoryToEdit.status);
    } else {
      setType('EXPENSE');
      setName('');
      setAccountCode('642');
      setIcon('FolderTree');
      setColor('#EF4444');
      setDescription('');
      setStatus('ACTIVE');
    }
  }, [categoryToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (categoryToEdit) {
      updateCategory(categoryToEdit.id, {
        type,
        name,
        accountCode,
        icon,
        color,
        description,
        status,
      });
    } else {
      addCategory({
        type,
        name,
        accountCode,
        icon,
        color,
        description,
        status,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-800 text-base">
              {categoryToEdit ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
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
          {/* Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Loại danh mục</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setType('INCOME');
                  setColor('#10B981');
                  setAccountCode('511');
                }}
                className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                  type === 'INCOME'
                    ? 'bg-emerald-500 text-white border-emerald-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                Danh mục Thu (+)
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('EXPENSE');
                  setColor('#EF4444');
                  setAccountCode('642');
                }}
                className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                  type === 'EXPENSE'
                    ? 'bg-rose-500 text-white border-rose-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                Danh mục Chi (-)
              </button>
            </div>
          </div>

          {/* Name & Account code */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên danh mục <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Chi phí Tiếp khách..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mã Tài Khoản</label>
              <input
                type="text"
                placeholder="511, 6422..."
                value={accountCode}
                onChange={(e) => setAccountCode(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Icon selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Biểu tượng (Icon)</span>
              <span className="text-[11px] text-indigo-600 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Gợi ý theo loại
              </span>
            </label>
            <div className="grid grid-cols-6 gap-2 max-h-24 overflow-y-auto p-1 border border-slate-100 rounded-lg bg-slate-50">
              {AVAILABLE_ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`p-2 rounded-lg text-xs font-mono flex items-center justify-center transition-all ${
                    icon === ic
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-200'
                  }`}
                  title={ic}
                >
                  {ic.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mô tả chi tiết</label>
            <textarea
              rows={2}
              placeholder="Ghi chú mục đích sử dụng danh mục này..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Status Toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div>
              <span className="text-xs font-semibold text-slate-800">Trạng thái kích hoạt</span>
              <p className="text-[11px] text-slate-500">Cho phép chọn khi tạo giao dịch mới</p>
            </div>
            <button
              type="button"
              onClick={() => setStatus(status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                status === 'ACTIVE' ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  status === 'ACTIVE' ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
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
              {categoryToEdit ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
