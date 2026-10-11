import React, { useState } from 'react';
import {
  FolderTree,
  Plus,
  Search,
  Tag,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  TrendingUp,
  TrendingDown,
  Sparkles,
} from 'lucide-react';
import { useLedger } from '../context/LedgerContext';
import { Category, TransactionType } from '../types';
import { formatCurrency } from '../utils/formatters';
import { CategoryModal } from '../components/modals/CategoryModal';

export const CategoriesView: React.FC = () => {
  const { categories, deleteCategory, updateCategory } = useLedger();

  const [activeTab, setActiveTab] = useState<'ALL' | 'EXPENSE' | 'INCOME'>('EXPENSE');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const incomeCats = categories.filter((c) => c.type === 'INCOME');
  const expenseCats = categories.filter((c) => c.type === 'EXPENSE');

  const filteredCategories = categories.filter((c) => {
    if (activeTab !== 'ALL' && c.type !== activeTab) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        (c.accountCode && c.accountCode.includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Category) => {
    setEditingCategory(c);
    setIsModalOpen(true);
  };

  const toggleStatus = (c: Category) => {
    updateCategory(c.id, {
      status: c.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
    });
  };

  const handleDelete = (c: Category) => {
    if (confirm(`Bạn có chắc muốn xóa danh mục "${c.name}"?`)) {
      deleteCategory(c.id);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Quản Lý Danh Mục Thu / Chi
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Phân loại cây tài khoản theo Chuẩn mực Kế toán Doanh nghiệp (TT 133 / TT 200)
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all active:scale-95 flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Thêm Danh Mục Mới</span>
        </button>
      </div>

      {/* 3 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">TỔNG SỐ DANH MỤC</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{categories.length}</div>
            <span className="text-[11px] text-slate-400">Đang hoạt động ổn định</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FolderTree className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-600">DANH MỤC THU TIỀN</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">{incomeCats.length}</div>
            <span className="text-[11px] text-slate-500">
              Tổng phát sinh: {formatCurrency(incomeCats.reduce((s, c) => s + c.totalAmount, 0))}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-rose-600">DANH MỤC CHI TIỀN</span>
            <div className="text-2xl font-black text-rose-600 mt-1">{expenseCats.length}</div>
            <span className="text-[11px] text-slate-500">
              Tổng phát sinh: {formatCurrency(expenseCats.reduce((s, c) => s + c.totalAmount, 0))}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Filter Tabs & Search */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="inline-flex p-1 bg-slate-200/70 rounded-lg text-xs font-semibold w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('EXPENSE')}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md transition-all ${
                activeTab === 'EXPENSE'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Danh mục Chi ({expenseCats.length})
            </button>
            <button
              onClick={() => setActiveTab('INCOME')}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md transition-all ${
                activeTab === 'INCOME'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Danh mục Thu ({incomeCats.length})
            </button>
            <button
              onClick={() => setActiveTab('ALL')}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md transition-all ${
                activeTab === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({categories.length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm tên danh mục, mã TK..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Categories Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-500 font-semibold uppercase text-[10px]">
                <th className="py-3 px-4">Tên danh mục & Mã TK</th>
                <th className="py-3 px-3">Loại</th>
                <th className="py-3 px-3 text-center">Số GD</th>
                <th className="py-3 px-3 text-right">Tổng giá trị</th>
                <th className="py-3 px-4 w-48">Tỷ trọng</th>
                <th className="py-3 px-3 text-center">Trạng thái</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCategories.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0"
                        style={{ backgroundColor: c.color || '#3B82F6' }}
                      >
                        {c.accountCode ? c.accountCode.slice(0, 3) : 'DM'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{c.name}</span>
                          {c.accountCode && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded-sm">
                              TK {c.accountCode}
                            </span>
                          )}
                        </div>
                        {c.description && (
                          <div className="text-[11px] text-slate-500 line-clamp-1">{c.description}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        c.type === 'INCOME'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {c.type === 'INCOME' ? 'THU' : 'CHI'}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center font-semibold text-slate-700">
                    {c.transactionCount}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">
                    {formatCurrency(c.totalAmount)}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(100, c.percentage || 15)}%`,
                            backgroundColor: c.color || '#3B82F6',
                          }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-700 w-10 text-right">
                        {c.percentage || 0}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {c.status === 'ACTIVE' ? 'Sử dụng' : 'Tạm khóa'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        title="Chỉnh sửa"
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => toggleStatus(c)}
                        title={c.status === 'ACTIVE' ? 'Khóa danh mục' : 'Mở khóa'}
                        className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      >
                        {c.status === 'ACTIVE' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleDelete(c)}
                        title="Xóa"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categoryToEdit={editingCategory}
      />
    </div>
  );
};
