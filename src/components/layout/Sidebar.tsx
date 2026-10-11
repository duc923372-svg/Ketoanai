import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  FolderTree,
  Users,
  PieChart,
  BarChart3,
  Sparkles,
  MessageSquareText,
  AlertTriangle,
  Database,
  Settings,
  User,
  Plus,
  ShieldCheck,
  ChevronRight,
  LogOut,
  CreditCard,
  Zap,
  X,
} from 'lucide-react';
import { useLedger } from '../../context/LedgerContext';
import { ScreenTab } from '../../types';
import { PLAN_LIMITS } from '../../data/planConfig';

interface NavItem {
  id: ScreenTab;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
}

export const Sidebar: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const {
    currentTab,
    navigate,
    openAddTxModal,
    alerts,
    currentUser,
    userProfile,
    transactions,
    openUpgradeModal,
    logout,
  } = useLedger();

  const unresolvedAlertsCount = alerts.filter((a) => a.status === 'UNRESOLVED').length;
  const plan = currentUser?.plan || 'free';
  const limits = PLAN_LIMITS[plan];
  const txCount = transactions.length;
  const isFree = plan === 'free';
  const isAdmin = currentUser?.role === 'admin' || currentUser?.email === 'duc923372@gmail.com';

  const mainNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Tổng quan Bán hàng', icon: LayoutDashboard },
    { id: 'transactions', label: 'Trung tâm Đơn hàng', icon: Receipt },
    { id: 'cash-ledger', label: 'Ví sàn & Dòng tiền', icon: Wallet },
    { id: 'categories', label: 'Chi phí của tôi', icon: FolderTree },
    { id: 'partners', label: 'Sản phẩm & Giá vốn', icon: Users },
  ];

  const reportNavItems: NavItem[] = [
    { id: 'revenue-expense', label: 'Tính Lợi Nhuận Thực', icon: BarChart3 },
    { id: 'reports', label: 'Thuế & Nghĩa vụ TMĐT', icon: PieChart },
    { id: 'ai-analytics', label: 'Phân tích AI chuyên sâu', icon: Sparkles, badge: 'PRO', badgeColor: 'bg-indigo-500 text-white' },
    { id: 'ai-chat', label: 'Kế Toán AI (Hỏi đáp)', icon: MessageSquareText, badge: 'AI', badgeColor: 'bg-emerald-500 text-white' },
    {
      id: 'smart-alerts',
      label: 'AI Đang lưu ý cho bạn',
      icon: AlertTriangle,
      badge: unresolvedAlertsCount > 0 ? unresolvedAlertsCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
  ];

  const systemNavItems: NavItem[] = [
    { id: 'subscription', label: 'Gói & Thanh toán', icon: CreditCard, badge: isFree ? 'FREE' : 'PRO', badgeColor: isFree ? 'bg-slate-700 text-slate-300' : 'bg-emerald-500 text-white' },
    { id: 'data-management', label: 'Quản lý dữ liệu', icon: Database },
    { id: 'settings', label: 'Cài đặt hệ thống', icon: Settings },
    { id: 'user-profile', label: 'Hồ sơ tài khoản', icon: User },
    ...(isAdmin ? [{ id: 'admin' as ScreenTab, label: 'Quản trị Multi-Tenant', icon: ShieldCheck, badge: 'ADMIN', badgeColor: 'bg-purple-600 text-white' }] : []),
  ];

  const handleNav = (id: ScreenTab) => {
    navigate(id);
    if (onClose && window.innerWidth < 1024) onClose();
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col shrink-0 h-full border-r border-slate-800/50">
      <div className="w-64 h-full flex flex-col">
        {/* Brand Header & Close Button */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 shrink-0">
          <div className="flex items-center gap-3 cursor-pointer min-w-0" onClick={() => handleNav('dashboard')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20 text-slate-950 font-black text-lg shrink-0">
              K
            </div>
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white tracking-tight text-base truncate">Kế Toán AI</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                  TMĐT
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">Dành Cho Người Bán Online</p>
            </div>
          </div>

          {/* Nút đóng Menu */}
          <button
            type="button"
            onClick={onClose}
            title="Đóng Menu (Thu gọn)"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all shrink-0 ml-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Add CTA */}
        <div className="p-4 shrink-0">
          <button
            onClick={() => {
              openAddTxModal('EXPENSE');
              if (onClose) onClose();
            }}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Thêm Giao Dịch Mới</span>
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-1 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
          {/* Section 1 */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Quản lý sổ cái
            </div>
            <div className="space-y-1">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/30 font-semibold'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-emerald-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${item.badgeColor || 'bg-slate-700'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2 */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              AI & Báo cáo quản trị
            </div>
            <div className="space-y-1">
              {reportNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/30 font-semibold'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-emerald-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${item.badgeColor || 'bg-slate-700'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3 */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Thuê bao & Hệ thống
            </div>
            <div className="space-y-1">
              {systemNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/30 font-semibold'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-emerald-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${item.badgeColor || 'bg-slate-700'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quota Mini Widget */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-semibold">Gói {plan.toUpperCase()}</span>
              <span className="text-white font-bold">{txCount}/{limits.maxTransactions} GD</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (txCount / limits.maxTransactions) * 100)}%` }}
              />
            </div>
            {isFree && (
              <button
                onClick={() => openUpgradeModal('Sidebar widget')}
                className="w-full py-1 px-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
              >
                <Zap className="w-3 h-3 fill-emerald-400" />
                <span>Nâng cấp PRO (99k)</span>
              </button>
            )}
          </div>
        </div>

        {/* User Card Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 shrink-0">
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
            <div
              className="flex items-center gap-2.5 cursor-pointer truncate"
              onClick={() => handleNav('user-profile')}
            >
              <div className="w-8 h-8 rounded-full bg-emerald-700 text-emerald-100 flex items-center justify-center font-bold text-xs shrink-0">
                {currentUser?.avatar || userProfile.avatar || 'TH'}
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-white truncate">
                  {currentUser?.name || userProfile.name}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {currentUser?.email || 'Kế toán viên'}
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              title="Đăng xuất"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
