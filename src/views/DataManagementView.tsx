import React, { useState } from 'react';
import {
  Database,
  Download,
  Upload,
  RotateCcw,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Trash2,
  HardDrive,
} from 'lucide-react';
import { useLedger } from '../context/LedgerContext';
import { exportToCSV } from '../utils/formatters';

export const DataManagementView: React.FC = () => {
  const {
    transactions,
    categories,
    partners,
    alerts,
    companySettings,
    exportFullBackupJSON,
    importFullBackupJSON,
    resetToInitialData,
    bulkAddTransactions,
  } = useLedger();

  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleJSONFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const success = importFullBackupJSON(json);
        if (success) {
          setImportStatus('Khôi phục dữ liệu thành công từ file sao lưu JSON!');
        } else {
          setImportStatus('File JSON không đúng định dạng chuẩn của Kế Toán AI.');
        }
      } catch (err) {
        setImportStatus('Lỗi đọc file JSON. Vui lòng thử lại.');
      }
    };
    reader.readAsText(file);
  };

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter((l) => l.trim().length > 0);
        if (lines.length <= 1) {
          alert('File CSV không có dữ liệu giao dịch.');
          return;
        }

        // Simple parser
        const newTxs: any[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
          if (cols.length >= 4) {
            newTxs.push({
              code: `GD-${Math.floor(1000 + Math.random() * 9000)}`,
              type: cols[1]?.toUpperCase().includes('THU') ? 'INCOME' : 'EXPENSE',
              date: cols[2] || new Date().toISOString().slice(0, 10),
              time: '09:00',
              categoryId: categories[0]?.id || 'cat-1',
              categoryName: cols[3] || 'Chi phí hoạt động',
              amount: Number(cols[4]) || 1000000,
              paymentMethod: 'BANK_TRANSFER',
              partnerName: cols[5] || 'Đối tác khác',
              description: cols[6] || 'Giao dịch nhập từ file CSV',
              status: 'COMPLETED',
              creator: 'Nguyễn Thị Mai',
            });
          }
        }

        if (newTxs.length > 0) {
          bulkAddTransactions(newTxs);
          setImportStatus(`Đã nhập thành công ${newTxs.length} giao dịch vào sổ cái!`);
        }
      } catch (err) {
        setImportStatus('Lỗi khi phân tích cú pháp file CSV.');
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadSampleCSV = () => {
    const sample = [
      { 'Mã GD': 'GD-9999', 'Loại (THU/CHI)': 'THU', 'Ngày': '2026-08-25', 'Danh mục': 'Doanh thu dịch vụ', 'Số tiền': 50000000, 'Đối tác': 'Công ty Mẫu', 'Nội dung': 'Thu tiền hợp đồng đợt 1' },
      { 'Mã GD': 'GD-9998', 'Loại (THU/CHI)': 'CHI', 'Ngày': '2026-08-25', 'Danh mục': 'Chi phí văn phòng', 'Số tiền': 12000000, 'Đối tác': 'NCC Mẫu', 'Nội dung': 'Chi tiền mua văn phòng phẩm' },
    ];
    exportToCSV(sample, `Mau_nhap_so_cai_ke_toan.csv`);
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Quản Lý Dữ Liệu & Sao Lưu An Toàn
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Trung tâm trích xuất báo cáo, nhập khẩu chứng từ hàng loạt và khôi phục dữ liệu kế toán
        </p>
      </div>

      {importStatus && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{importStatus}</span>
        </div>
      )}

      {/* 3 Main Functional Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Backup & JSON */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <HardDrive className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Sao Lưu Toàn Bộ Hệ Thống</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Xuất một bản snapshot đầy đủ gồm {transactions.length} giao dịch, danh mục tài khoản và đối tác dưới dạng file JSON bảo mật.
            </p>
          </div>

          <button
            onClick={exportFullBackupJSON}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Tải file sao lưu JSON</span>
          </button>
        </div>

        {/* Restore from JSON */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Phục Hồi Dữ Liệu</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Nạp lại toàn bộ dữ liệu kế toán từ file JSON sao lưu trước đó để khôi phục trạng thái làm việc.
            </p>
          </div>

          <label className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer text-center">
            <Upload className="w-4 h-4" />
            <span>Chọn file JSON phục hồi</span>
            <input type="file" accept=".json" onChange={handleJSONFileImport} className="hidden" />
          </label>
        </div>

        {/* Reset Database */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Đặt Lại Dữ Liệu Mẫu</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Khôi phục lại bộ số liệu tài chính mẫu của Tháng 8/2026 với 10 giao dịch chuẩn mực và đối tác thực tế.
            </p>
          </div>

          <button
            onClick={() => {
              if (confirm('Bạn có chắc muốn đặt lại toàn bộ dữ liệu về trạng thái mẫu ban đầu?')) {
                resetToInitialData();
                setImportStatus('Đã khôi phục dữ liệu mẫu ban đầu thành công!');
              }
            }}
            className="w-full py-2.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4 text-rose-500" />
            <span>Reset dữ liệu gốc</span>
          </button>
        </div>
      </div>

      {/* CSV / Excel Bulk Import Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Nhập Khẩu Chứng Từ Sổ Cái Hàng Loạt (CSV / Excel)
              </h3>
              <p className="text-xs text-slate-500">Hỗ trợ trích xuất từ phần mềm MISA, Fast, SAP hoặc bảng tính Excel</p>
            </div>
          </div>

          <button
            onClick={handleDownloadSampleCSV}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Tải File Mẫu Chuẩn (.CSV)</span>
          </button>
        </div>

        <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center bg-slate-50/50 hover:bg-emerald-50/30 transition-colors">
          <FileSpreadsheet className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
          <h4 className="font-bold text-slate-800 text-sm">Kéo & thả file CSV hoặc nhấp để chọn file</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Hệ thống AI sẽ tự động phân tích các cột Ngày, Loại, Diễn giải, Danh mục và Số tiền để ghi nhận vào sổ cái.
          </p>

          <label className="mt-4 inline-block px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer">
            <span>Chọn file từ máy tính</span>
            <input type="file" accept=".csv" onChange={handleCSVImport} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
};
