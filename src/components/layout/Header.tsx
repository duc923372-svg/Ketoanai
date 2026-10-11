import React, { useState, useEffect } from 'react';
import {
  Menu,
  Search,
  Sparkles,
  PlusCircle,
  MinusCircle,
  Bell,
  Building2,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  X,
  ExternalLink,
  Zap,
  CreditCard,
  User,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useLedger } from '../../context/LedgerContext';

export const Header: React.FC<{ onMenuToggle?: () => void; isSidebarOpen?: boolean }> = ({
  onMenuToggle = () => {},
  isSidebarOpen = true,
}) => {
  const {
    companySettings,
    searchQuery,
    setSearchQuery,
    openAddTxModal,
    alerts,
    navigate,
    currentUser,
    userProfile,
    currentTab,
    isAuthenticated,
    openUpgradeModal,
    logout,
  } = useLedger();

  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const unresolvedAlerts = alerts.filter((a) => a.status !== 'RESOLVED');
  const plan = currentUser?.plan || 'free';
  const isFree = plan === 'free';
  const isAdmin = currentUser?.role === 'admin' || currentUser?.email === 'duc923372@gmail.com';

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left section: Hamburger / Toggle Menu + Company Badge */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          title={isSidebarOpen ? 'Thu gọn Menu' : 'Mở Menu'}
          className="p-2 rounded-xl transition-all border hover:scale-105 active:scale-95 shrink-0 group"
          style={isSidebarOpen 
            ? { background: '#f1f5f9', borderColor: '#e2e8f0', color: '#475569' }
            : { background: 'linear-gradient(135deg, #059669, #0d9488)', borderColor: 'transparent', color: 'white', boxShadow: '0 0 12px rgba(5,150,105,0.3)' }
          }
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800">
          <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="truncate max-w-[220px]">{companySettings.companyName}</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-sm font-bold">
            {companySettings.accountingStandard}
          </span>
        </div>
      </div>

      {/* Center section: Global Search Bar */}
      <div className="flex-1 max-w-md mx-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm kiếm giao dịch, số tiền, đối tác, danh mục..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right section: Plan Badge, AI Status, Quick Actions, Notifications, User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Plan Badge / Upgrade CTA */}
        {isFree ? (
          <button
            onClick={() => openUpgradeModal('Thanh công cụ')}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-amber-50 to-emerald-50 border border-amber-200 text-slate-800 rounded-lg text-xs font-bold hover:shadow-xs transition-all active:scale-95"
          >
            <span className="px-1.5 py-0.2 bg-slate-800 text-amber-300 text-[10px] rounded-sm font-black">
              FREE
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-0.5">
              <Zap className="w-3 h-3 text-amber-500 fill-amber-500" /> Nâng Cấp PRO
            </span>
          </button>
        ) : (
          <div
            onClick={() => navigate('subscription')}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-black cursor-pointer hover:bg-emerald-100 transition-colors"
          >
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>GÓI {plan.toUpperCase()}</span>
          </div>
        )}

        {/* AI Status Badge */}
        <div
          onClick={() => navigate('ai-analytics')}
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg text-xs font-medium cursor-pointer hover:bg-indigo-100 transition-colors"
          title="Hệ thống AI tự động kiểm toán số liệu 24/7"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>AI Sẵn sàng</span>
        </div>

        {/* Live Clock */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-xs font-mono">
          <span>{currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        </div>

        {/* Quick Income Button */}
        <button
          onClick={() => openAddTxModal('INCOME')}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-lg transition-colors active:scale-95"
        >
          <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>+ Thu</span>
        </button>

        {/* Quick Expense Button */}
        <button
          onClick={() => openAddTxModal('EXPENSE')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg transition-colors active:scale-95"
        >
          <MinusCircle className="w-3.5 h-3.5 text-rose-600" />
          <span>- Chi</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsAlertsOpen(!isAlertsOpen)}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unresolvedAlerts.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-bounce">
                {unresolvedAlerts.length}
              </span>
            )}
          </button>

          {/* Dropdown Menu */}
          {isAlertsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 p-3 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span className="font-semibold text-slate-800 text-xs">Cảnh báo Kiểm toán AI</span>
                </div>
                <span className="text-[11px] font-medium text-slate-500">
                  {unresolvedAlerts.length} chưa xử lý
                </span>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2">
                {unresolvedAlerts.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-500">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
                    Mọi số liệu sổ cái đều hợp lệ!
                  </div>
                ) : (
                  unresolvedAlerts.slice(0, 3).map((a) => (
                    <div
                      key={a.id}
                      onClick={() => {
                        setIsAlertsOpen(false);
                        navigate('smart-alerts');
                      }}
                      className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/60 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <span
                          className={`font-bold px-1.5 py-0.5 rounded-sm ${
                            a.severity === 'CRITICAL'
                              ? 'bg-rose-100 text-rose-700'
                              : a.severity === 'HIGH'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {a.severity}
                        </span>
                        <span className="text-slate-400">{a.detectedAt}</span>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-800 line-clamp-1">{a.title}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{a.description}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 mt-2 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    setIsAlertsOpen(false);
                    navigate('smart-alerts');
                  }}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
                >
                  Xem toàn bộ cảnh báo <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Menu Dropdown */}
        <div className="relative">
          <div
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-xs flex items-center justify-center cursor-pointer shadow-xs ring-2 ring-white hover:opacity-90 transition-all"
            title={currentUser?.name || userProfile.name}
          >
            {currentUser?.avatar || userProfile.avatar || 'TH'}
          </div>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 p-2 animate-in fade-in zoom-in-95 text-xs">
              <div className="p-3 border-b border-slate-100">
                <div className="font-bold text-slate-900 truncate">
                  {currentUser?.name || userProfile.name}
                </div>
                <div className="text-[11px] text-slate-500 truncate">{currentUser?.email}</div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                    GÓI {plan.toUpperCase()}
                  </span>
                  {isFree && (
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        openUpgradeModal('Menu người dùng');
                      }}
                      className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700"
                    >
                      Nâng cấp PRO
                    </button>
                  )}
                </div>
              </div>

              <div className="py-1 space-y-0.5">
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    navigate('user-profile');
                  }}
                  className="w-full px-3 py-2 text-left rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Hồ sơ tài khoản</span>
                </button>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    navigate('subscription');
                  }}
                  className="w-full px-3 py-2 text-left rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                >
                  <CreditCard className="w-4 h-4 text-slate-400" />
                  <span>Gói dịch vụ & Hạn mức</span>
                </button>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    navigate('pricing');
                  }}
                  className="w-full px-3 py-2 text-left rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                >
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Bảng giá & Nâng cấp</span>
                </button>

                {isAdmin && (
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      navigate('admin');
                    }}
                    className="w-full px-3 py-2 text-left rounded-lg text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 flex items-center gap-2 font-bold"
                  >
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    <span>Quản trị Multi-Tenant</span>
                  </button>
                )}
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                  }}
                  className="w-full px-3 py-2 text-left rounded-lg text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-bold"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
