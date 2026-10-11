import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Building,
  Phone,
  Edit2,
  Trash2,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  CheckCircle2,
  Store,
  Tag,
  Boxes,
  HelpCircle,
} from 'lucide-react';
import { useLedger } from '../context/LedgerContext';
import { ProductItem, Partner } from '../types';
import { formatCurrency } from '../utils/formatters';
import { PartnerModal } from '../components/modals/PartnerModal';

export const PartnersView: React.FC = () => {
  const { products, partners, addProduct, updateProduct, deleteProduct, deletePartner, navigate } = useLedger();

  const [activeTab, setActiveTab] = useState<'PRODUCTS' | 'SUPPLIERS'>('PRODUCTS');
  const [search, setSearch] = useState('');
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);

  // Product modal state
  const [isProdModalOpen, setIsProdModalOpen] = useState(false);
  const [editingProd, setEditingProd] = useState<ProductItem | null>(null);

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    }
    return true;
  });

  // Filtered Partners
  const filteredSuppliers = partners.filter((p) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q) || (p.phone && p.phone.includes(q));
    }
    return true;
  });

  const handleOpenAddProd = () => {
    setEditingProd(null);
    setIsProdModalOpen(true);
  };

  const handleOpenEditProd = (prod: ProductItem) => {
    setEditingProd(prod);
    setIsProdModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
              SẢN PHẨM & GIÁ VỐN
            </span>
            <span className="text-xs text-slate-400">• Tự động tính lãi trên từng SKU</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Quản Lý Sản Phẩm & Nhà Cung Cấp</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi giá vốn, phí sàn, chi phí quảng cáo ước tính và biên lợi nhuận thực tế trên từng sản phẩm.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {activeTab === 'PRODUCTS' ? (
            <button
              onClick={handleOpenAddProd}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm shadow-emerald-900/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Thêm sản phẩm mới</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setEditingPartner(null);
                setIsPartnerModalOpen(true);
              }}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Thêm nhà cung cấp</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('PRODUCTS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'PRODUCTS'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Danh mục Sản phẩm & Biên lãi ({products.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('SUPPLIERS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'SUPPLIERS'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Xưởng & Nhà cung cấp ({partners.length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={activeTab === 'PRODUCTS' ? 'Tìm theo tên sản phẩm, SKU...' : 'Tìm nhà cung cấp, xưởng may...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* TAB 1: PRODUCTS TABLE */}
      {activeTab === 'PRODUCTS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="p-3.5">Sản phẩm & SKU</th>
                  <th className="p-3.5 text-right">Giá bán</th>
                  <th className="p-3.5 text-right">Giá vốn (Nhập)</th>
                  <th className="p-3.5 text-right">Phí sàn ước tính</th>
                  <th className="p-3.5 text-right">Tiền Ads/đơn</th>
                  <th className="p-3.5 text-right">Lãi / Sản phẩm</th>
                  <th className="p-3.5 text-center">Biên lợi nhuận</th>
                  <th className="p-3.5 text-center">Tồn kho / Đã bán</th>
                  <th className="p-3.5">AI Lưu ý</th>
                  <th className="p-3.5 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 max-w-[220px]">
                      <div className="font-bold text-slate-900 truncate" title={prod.name}>
                        {prod.name}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                          {prod.sku}
                        </span>
                        <span>{prod.category}</span>
                      </div>
                    </td>

                    <td className="p-3.5 text-right font-black text-slate-900">
                      {formatCurrency(prod.sellingPrice)}
                    </td>

                    <td className="p-3.5 text-right font-semibold text-slate-700">
                      {formatCurrency(prod.costPrice)}
                    </td>

                    <td className="p-3.5 text-right font-semibold text-rose-600">
                      -{formatCurrency(prod.platformFeeAvg)}
                    </td>

                    <td className="p-3.5 text-right font-semibold text-rose-600">
                      -{formatCurrency(prod.adFeeEst)}
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="font-black text-emerald-700 text-sm">
                        +{formatCurrency(prod.unitProfit)}
                      </div>
                    </td>

                    <td className="p-3.5 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                          prod.profitMargin >= 30
                            ? 'bg-emerald-100 text-emerald-800'
                            : prod.profitMargin >= 15
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {prod.profitMargin.toFixed(1)}%
                      </span>
                    </td>

                    <td className="p-3.5 text-center">
                      <div className="font-bold text-slate-900">
                        {prod.inventory} <span className="text-[10px] text-slate-400">tồn</span>
                      </div>
                      <div className="text-[11px] text-emerald-600 font-semibold">
                        Đã bán: {prod.totalSold}
                      </div>
                    </td>

                    <td className="p-3.5 max-w-[200px]">
                      {prod.aiInsight ? (
                        <div
                          className={`p-2 rounded-xl text-[11px] font-medium leading-tight flex items-start gap-1.5 ${
                            prod.aiInsight.type === 'WARNING'
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>{prod.aiInsight.message}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Bình thường</span>
                      )}
                    </td>

                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditProd(prod)}
                          className="p-1 text-slate-400 hover:text-slate-700"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteProduct(prod.id)}
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

      {/* TAB 2: SUPPLIERS LIST */}
      {activeTab === 'SUPPLIERS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.map((sup) => (
            <div
              key={sup.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {sup.code}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm">{sup.name}</h3>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingPartner(sup);
                      setIsPartnerModalOpen(true);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-700"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deletePartner(sup.id)}
                    className="p-1 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                {sup.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{sup.phone}</span>
                  </div>
                )}
                {sup.address && <div className="text-slate-500">{sup.address}</div>}
              </div>

              <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                <span className="text-slate-500">Tiền hàng cần thanh toán:</span>
                <span className="font-black text-rose-600">
                  {formatCurrency(sup.payableAmount || 0)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Partner Modal */}
      <PartnerModal
        isOpen={isPartnerModalOpen}
        onClose={() => {
          setIsPartnerModalOpen(false);
          setEditingPartner(null);
        }}
        partner={editingPartner}
      />
    </div>
  );
};
