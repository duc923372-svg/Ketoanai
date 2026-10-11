import React, { useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Building2,
  Sparkles,
  RefreshCw,
  Search,
  CheckCircle2,
  ChevronLeft,
} from 'lucide-react';
import { useLedger } from '../context/LedgerContext';

export const AdminView: React.FC = () => {
  const { currentUser, adminStats, loadAdminStats, navigate } = useLedger();

  useEffect(() => {
    loadAdminStats();
  }, []);

  const isAdmin = currentUser?.role === 'admin' || currentUser?.email === 'duc923372@gmail.com';

  if (!isAdmin) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <ShieldCheck className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900">Không có quyền truy cập</h2>
        <p className="text-xs text-slate-600 mt-2">
          Khu vực quản trị chỉ dành cho tài khoản Quản trị viên hệ thống (Admin).
        </p>
        <button
          onClick={() => navigate('dashboard')}
          className="mt-6 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
        >
          Quay về Trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('dashboard')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 mb-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Quay lại Dashboard</span>
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Quản Trị Hệ Thống Multi-Tenant
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black tracking-wider uppercase border border-rose-200">
              Admin Master
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Tổng quan người dùng, phân bổ gói thuê bao và trạng thái các phân vùng dữ liệu Cloud Firestore.
          </p>
        </div>

        <button
          onClick={loadAdminStats}
          className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Làm Mới Dữ Liệu</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Tổng Người Dùng</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {adminStats?.totalUsers || 1} <span className="text-xs font-normal text-slate-500">tài khoản</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Thuê Bao FREE</span>
            <Building2 className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-black text-slate-700">
            {adminStats?.freeUsers || 1} <span className="text-xs font-normal text-slate-500">tài khoản</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Thuê Bao PRO / Doanh Nghiệp</span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {adminStats?.proUsers || 0} <span className="text-xs font-normal text-slate-500">tài khoản</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Doanh Thu Ước Tính (MRR)</span>
            <CreditCard className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {(adminStats?.totalRevenue || 0).toLocaleString('vi-VN')} ₫
          </div>
        </div>
      </div>

      {/* User Directory Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-black text-slate-900">Danh Sách Người Dùng & Phân Quyền</h3>
            <p className="text-xs text-slate-500">Các tenant đang hoạt động độc lập trên Firestore</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-3 font-bold">Người Dùng</th>
                <th className="pb-3 font-bold">Email</th>
                <th className="pb-3 font-bold">Vai Trò</th>
                <th className="pb-3 font-bold">Gói Dịch Vụ</th>
                <th className="pb-3 font-bold">Trạng Thái</th>
                <th className="pb-3 font-bold text-right">Ngày Tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {adminStats?.usersList && adminStats.usersList.length > 0 ? (
                adminStats.usersList.map((u: any) => (
                  <tr key={u.id}>
                    <td className="py-3 font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-700">
                        {u.avatar || u.name?.slice(0, 2).toUpperCase() || 'KT'}
                      </div>
                      <span>{u.name || u.displayName || 'Kế toán viên'}</span>
                    </td>
                    <td className="py-3 text-slate-600">{u.email}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {u.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.plan === 'pro' || u.plan === 'business'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {(u.plan || 'free').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Hoạt động
                      </span>
                    </td>
                    <td className="py-3 text-right text-slate-400">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : 'Mới tạo'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-3 font-bold text-slate-900 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-700">
                      {currentUser?.avatar || 'TH'}
                    </div>
                    <span>{currentUser?.name}</span>
                  </td>
                  <td className="py-3 text-slate-600">{currentUser?.email}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                      Quản trị viên
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                      {(currentUser?.plan || 'free').toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Hoạt động
                    </span>
                  </td>
                  <td className="py-3 text-right text-slate-400">Hôm nay</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
