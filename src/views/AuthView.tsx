import React, { useState } from 'react';
import {
  Sparkles,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  ChevronLeft,
  AlertCircle,
  Database,
  Server,
  UserCheck,
} from 'lucide-react';
import { useLedger } from '../context/LedgerContext';

export const AuthView: React.FC = () => {
  const {
    navigate,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    resetPassword,
    demoLogin,
    loginWithXamppAccount,
  } = useLedger();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'FORGOT'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await loginWithGoogle();
      navigate('dashboard');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Không thể đăng nhập với Google. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (mode === 'LOGIN') {
        await loginWithEmail(email, password);
        navigate('dashboard');
      } else if (mode === 'REGISTER') {
        if (!fullName.trim()) {
          setErrorMsg('Vui lòng nhập họ và tên của bạn.');
          setIsLoading(false);
          return;
        }
        await registerWithEmail(email, password, fullName, companyName);
        // Chuyển về form đăng nhập, giữ nguyên email, xóa mật khẩu để người dùng nhập lại
        setPassword('');
        setMode('LOGIN');
        setSuccessMsg('🎉 Đăng ký tài khoản thành công! Vui lòng nhập mật khẩu vừa tạo để đăng nhập vào hệ thống.');
      } else if (mode === 'FORGOT') {
        await resetPassword(email);
        setSuccessMsg('Đã gửi email liên kết khôi phục mật khẩu. Vui lòng kiểm tra hộp thư!');
      }
    } catch (err: any) {
      console.error(err);
      let msg = err.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        msg = 'Email hoặc mật khẩu không chính xác.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'Email này đã được đăng ký tài khoản trước đó.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Mật khẩu phải có tối thiểu 6 ký tự.';
      }
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFastDemo = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await demoLogin();
      navigate('dashboard');
    } catch (err: any) {
      setErrorMsg('Không thể đăng nhập tài khoản demo. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Ambient background glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-800 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 relative z-10">
        {/* Left Side: Brand Value Proposition */}
        <div className="p-8 sm:p-10 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800 relative overflow-hidden">
          {/* Decorative dots pattern */}
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="relative z-10">
            <button
              onClick={() => navigate('landing')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white mb-6 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Về Trang chủ</span>
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
                <Sparkles className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <span className="text-base font-black tracking-tight text-white block">
                  KẾ TOÁN AI
                </span>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                  Smart Ledger SaaS
                </span>
              </div>
            </div>

            <h2 className="text-2xl font-black leading-tight tracking-tight text-white">
              Hệ thống Kế toán & Sổ cái Thông minh Multi-Tenant
            </h2>
            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              Dữ liệu của mỗi người dùng được cô lập hoàn toàn trên Cloud Firestore. Tự động hóa ghi sổ và kiểm toán theo thời gian thực.
            </p>

            {/* Feature Checkpoints */}
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-2.5 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Gói FREE vĩnh viễn với 100 giao dịch</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Bảo mật Firestore Security Rules phía máy chủ</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Trợ lý Kế toán AI hỏi đáp chuyên sâu 24/7</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-400 relative z-10">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Mã hóa dữ liệu 256-bit an toàn</span>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="p-8 sm:p-10 bg-white flex flex-col justify-between">
          <div>
            {/* XAMPP Database Connection Badge */}
            <div className="mb-4 p-3 rounded-2xl bg-emerald-50/90 border border-emerald-200 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <div>
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-emerald-600" />
                    <span>CSDL XAMPP MySQL: <span className="font-mono text-emerald-700">smart_ledger_db</span></span>
                  </div>
                  <p className="text-[10px] text-slate-500">Localhost:3306 • Đã sẵn sàng 11 bảng & dữ liệu mẫu</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Active
              </span>
            </div>

            {/* Quick 1-click Login with XAMPP pre-seeded accounts */}
            <div className="mb-4 space-y-1.5">
              <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Đăng nhập 1-click (Tài khoản XAMPP)
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold lowercase">khuyên dùng</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    setIsLoading(true);
                    setErrorMsg(null);
                    try {
                      await loginWithXamppAccount('duc923372@gmail.com');
                      navigate('dashboard');
                    } catch (e: any) {
                      setErrorMsg(e.message || 'Lỗi đăng nhập');
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  disabled={isLoading}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/40 text-left transition active:scale-98"
                >
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    <span>👑 Admin Doanh Nghiệp</span>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5 font-mono">duc923372@gmail.com</div>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    setIsLoading(true);
                    setErrorMsg(null);
                    try {
                      await loginWithXamppAccount('demo@ketoanai.vn');
                      navigate('dashboard');
                    } catch (e: any) {
                      setErrorMsg(e.message || 'Lỗi đăng nhập');
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  disabled={isLoading}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/40 text-left transition active:scale-98"
                >
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    <span>📊 Kế Toán Trưởng PRO</span>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5 font-mono">demo@ketoanai.vn</div>
                </button>
              </div>
            </div>

            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <span className="relative px-3 bg-white text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                hoặc đăng nhập bằng email
              </span>
            </div>

            {/* Tab switch */}
            {mode !== 'FORGOT' && (
              <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl mb-4 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => { setMode('LOGIN'); setErrorMsg(null); }}
                  className={`flex-1 py-2 rounded-lg transition-all ${
                    mode === 'LOGIN' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Đăng Nhập
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('REGISTER'); setErrorMsg(null); }}
                  className={`flex-1 py-2 rounded-lg transition-all ${
                    mode === 'REGISTER' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Đăng Ký Mới
                </button>
              </div>
            )}

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex flex-col gap-1.5">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>Thông báo đăng nhập</span>
                </div>
                <p className="text-[11px] text-rose-600 pl-6 leading-relaxed">{errorMsg}</p>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'REGISTER' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Họ và Tên
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nguyễn Văn A"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tên Doanh Nghiệp (Tùy chọn)
                    </label>
                    <input
                      type="text"
                      placeholder="Công ty TNHH..."
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all focus:outline-none"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="ketoan@doanhnghiep.vn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all focus:outline-none"
                  />
                </div>
              </div>

              {mode !== 'FORGOT' && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-700">Mật khẩu</label>
                    {mode === 'LOGIN' && (
                      <button
                        type="button"
                        onClick={() => setMode('FORGOT')}
                        className="text-[11px] text-emerald-600 hover:underline"
                      >
                        Quên mật khẩu?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Tối thiểu 6 ký tự"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {mode === 'FORGOT' && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setMode('LOGIN')}
                    className="text-xs text-slate-500 hover:text-slate-800"
                  >
                    Quay lại Đăng nhập
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>
                      {mode === 'LOGIN'
                        ? 'Đăng Nhập Vào Hệ Thống'
                        : mode === 'REGISTER'
                        ? 'Tạo Tài Khoản Miễn Phí'
                        : 'Gửi Liên Kết Đặt Lại'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Demo Login */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={handleFastDemo}
              disabled={isLoading}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Dùng thử tài khoản Demo (Kế toán trưởng)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
