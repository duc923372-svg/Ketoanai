import React, { useState } from 'react';
import {
  Building2,
  Sliders,
  Sparkles,
  Shield,
  Save,
  CheckCircle2,
  FileCheck,
  Mail,
  Send,
  Loader2,
} from 'lucide-react';
import { useLedger } from '../context/LedgerContext';
import { sendGmailMessage, generateWelcomeEmailHtml } from '../utils/emailService';

export const SettingsView: React.FC = () => {
  const { companySettings, updateCompanySettings, currentUser } = useLedger();

  const [formData, setFormData] = useState(companySettings);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSendingTestMail, setIsSendingTestMail] = useState(false);
  const [testMailStatus, setTestMailStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanySettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSendTestWelcomeEmail = async () => {
    if (!currentUser?.email) {
      setTestMailStatus({ success: false, message: 'Chưa có email tài khoản đăng nhập để gửi thư thử nghiệm.' });
      return;
    }
    setIsSendingTestMail(true);
    setTestMailStatus(null);

    const userName = currentUser.name || currentUser.displayName || 'Thành viên Kế Toán AI';
    const emailHtml = generateWelcomeEmailHtml(userName, currentUser.email);

    try {
      const res = await sendGmailMessage({
        to: currentUser.email,
        toName: userName,
        subject: 'Thư thử nghiệm: Chào mừng bạn đến với Kế Toán AI Smart Ledger 🎉',
        bodyHtml: emailHtml,
      });

      if (res.success) {
        setTestMailStatus({
          success: true,
          message: `Đã gửi thành công thư chào mừng tới ${currentUser.email}! Hãy kiểm tra hộp thư đến của bạn.`,
        });
      } else {
        setTestMailStatus({
          success: false,
          message: `Không thể gửi qua Gmail API (${res.error || 'Yêu cầu ủy quyền lại khi đăng nhập Google'}).`,
        });
      }
    } catch (err: any) {
      setTestMailStatus({
        success: false,
        message: err.message || 'Lỗi khi gửi email.',
      });
    } finally {
      setIsSendingTestMail(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Cài Đặt Hệ Thống & Thông Tin Doanh Nghiệp
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cấu hình hồ sơ pháp lý, chuẩn mực kế toán và các quy tắc kiểm toán tự động AI
          </p>
        </div>

        <button
          onClick={handleSubmit}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all active:scale-95 flex items-center gap-2 shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>Lưu Cấu Hình</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Đã lưu thành công toàn bộ thiết lập hệ thống sổ cái kế toán!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Legal Business Profile */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Hồ Sơ Doanh Nghiệp & Pháp Lý</h3>
              <p className="text-xs text-slate-500">Thông tin xuất hiện trên các phiếu thu, phiếu chi và báo cáo tài chính</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên Doanh Nghiệp / Công Ty (Đầy đủ)
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mã Số Thuế (MST)
              </label>
              <input
                type="text"
                value={formData.taxCode}
                onChange={(e) => setFormData({ ...formData, taxCode: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 font-mono font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Người Đại Diện Pháp Luật
              </label>
              <input
                type="text"
                value={formData.representative}
                onChange={(e) => setFormData({ ...formData, representative: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 font-medium text-slate-800"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Địa Chỉ Trụ Sở Chính
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 font-medium text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số Điện Thoại Liên Hệ
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 font-medium text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Kế Toán / Nhận Hóa Đơn
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 font-medium text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Accounting Standards & Regime */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Chế Độ & Chuẩn Mực Kế Toán</h3>
              <p className="text-xs text-slate-500">Khung pháp lý áp dụng cho hệ thống tài khoản và mẫu báo cáo</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chế độ kế toán áp dụng
              </label>
              <select
                value={formData.accountingStandard}
                onChange={(e) => setFormData({ ...formData, accountingStandard: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="Thông tư 133/2016/TT-BTC">Thông tư 133/2016/TT-BTC (Doanh nghiệp vừa & nhỏ)</option>
                <option value="Thông tư 200/2014/TT-BTC">Thông tư 200/2014/TT-BTC (Doanh nghiệp lớn)</option>
                <option value="Thông tư 88/2021/TT-BTC">Thông tư 88/2021/TT-BTC (Hộ kinh doanh cá thể)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Đơn vị tiền tệ chính
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="VND">VNĐ (Đồng Việt Nam)</option>
                <option value="USD">USD (Đô la Mỹ)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Năm tài chính
              </label>
              <input
                type="text"
                value={formData.fiscalYear}
                onChange={(e) => setFormData({ ...formData, fiscalYear: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kế toán trưởng / Người phụ trách
              </label>
              <input
                type="text"
                value={formData.chiefAccountant}
                onChange={(e) => setFormData({ ...formData, chiefAccountant: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>
        </div>

        {/* Section 3: AI & Smart Audit Automation */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Cấu Hình AI & Kiểm Toán Tự Động</h3>
              <p className="text-xs text-slate-500">Tự động hóa nhận diện nghiệp vụ, gợi ý danh mục và phát hiện gian lận</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={formData.autoCategorizeAI}
                onChange={(e) => setFormData({ ...formData, autoCategorizeAI: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded-md border-slate-300 focus:ring-emerald-500"
              />
              <div>
                <span className="font-bold text-slate-800 text-xs block">
                  Tự động gợi ý danh mục và tài khoản hạch toán khi nhập diễn giải
                </span>
                <span className="text-[11px] text-slate-500">
                  Phân tích chuỗi ngôn ngữ tự nhiên tiếng Việt để tìm mã tài khoản cấp 1 và cấp 2 phù hợp nhất.
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={formData.anomalyDetectionEnabled}
                onChange={(e) => setFormData({ ...formData, anomalyDetectionEnabled: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded-md border-slate-300 focus:ring-emerald-500"
              />
              <div>
                <span className="font-bold text-slate-800 text-xs block">
                  Kích hoạt hệ thống cảnh báo bất thường và chống trùng lặp hóa đơn
                </span>
                <span className="text-[11px] text-slate-500">
                  Tự động gắn cờ khi phát hiện số tiền chi vượt định mức trung bình hoặc trùng nội dung trong cùng ngày.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Section 4: Email & Gmail Workspace Integration */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Tích Hợp Email & Thư Chào Mừng Gmail</h3>
              <p className="text-xs text-slate-500">Tự động gửi thư chào mừng đến hòm thư người dùng khi đăng nhập bằng tài khoản Google</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                  <span>Trạng thái kết nối Google Workspace (Gmail API)</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-extrabold rounded-full">Đã kích hoạt</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Tài khoản đăng nhập: <strong>{currentUser?.email || 'Chưa đăng nhập'}</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={handleSendTestWelcomeEmail}
                disabled={isSendingTestMail}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5 shrink-0"
              >
                {isSendingTestMail ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi Thư Thử Nghiệm</span>
                  </>
                )}
              </button>
            </div>

            {testMailStatus && (
              <div
                className={`p-3.5 rounded-xl text-xs font-bold border animate-in fade-in flex items-center gap-2.5 ${
                  testMailStatus.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{testMailStatus.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Button Bottom */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Lưu Toàn Bộ Cấu Hình</span>
          </button>
        </div>
      </form>
    </div>
  );
};
