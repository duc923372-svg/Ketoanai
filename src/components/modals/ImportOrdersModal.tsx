import React, { useState } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  FileText,
  HelpCircle,
  Eye,
} from 'lucide-react';
import { OrderItem, SalesPlatform, OrderStatus } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface ImportOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (orders: OrderItem[]) => void;
}

export const ImportOrdersModal: React.FC<ImportOrdersModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<SalesPlatform>('SHOPEE');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Column mapping state
  const [columnMapping, setColumnMapping] = useState({
    code: 'Mã đơn hàng',
    date: 'Ngày đặt hàng',
    productName: 'Tên sản phẩm',
    sku: 'Mã SKU phân loại',
    quantity: 'Số lượng',
    revenue: 'Doanh thu đơn hàng',
    platformFee: 'Phí sàn khấu trừ',
    shippingFeeSeller: 'Phí vận chuyển người bán chịu',
    cogs: 'Tiền vốn nhập hàng',
    status: 'Trạng thái đơn',
  });

  // Validation results
  const [totalRows, setTotalRows] = useState<number>(0);
  const [validOrders, setValidOrders] = useState<OrderItem[]>([]);
  const [invalidRows, setInvalidRows] = useState<
    { row: number; code?: string; reason: string; rawData?: any }[]
  >([]);
  const [showErrorDetail, setShowErrorDetail] = useState<boolean>(false);

  if (!isOpen) return null;

  // Sample templates to simulate loading file
  const handleSimulateFileSelect = (sampleName: string, platform: SalesPlatform) => {
    setIsProcessing(true);
    setFileName(sampleName);
    setFileSize('148 KB - 856 dòng dữ liệu');
    setSelectedPlatform(platform);

    setTimeout(() => {
      // Generate realistic demo orders parsed from file
      const mockOrders: OrderItem[] = [];
      const mockErrors: { row: number; code?: string; reason: string; rawData?: any }[] = [];

      const totalCount = 856;
      const errorCount = 14;

      for (let i = 1; i <= totalCount; i++) {
        if (i <= errorCount) {
          // Error rows
          if (i === 1) {
            mockErrors.push({
              row: i + 1,
              code: 'SHO-ERR-001',
              reason: 'Thiếu thông tin giá bán và doanh thu (Cột Doanh thu bị trống)',
            });
          } else if (i === 2) {
            mockErrors.push({
              row: i + 1,
              code: 'SHO-ERR-002',
              reason: 'Mã đơn hàng bị trùng lặp trong file',
            });
          } else if (i === 3) {
            mockErrors.push({
              row: i + 1,
              code: 'SHO-ERR-003',
              reason: 'Sai định dạng ngày đặt (Không đúng YYYY-MM-DD)',
            });
          } else {
            mockErrors.push({
              row: i + 1,
              code: `ERR-ROW-${i}`,
              reason: 'Dòng dữ liệu bị lỗi cú pháp số tiền hoặc ký tự đặc biệt không hợp lệ',
            });
          }
          continue;
        }

        // Valid orders
        const isShopee = platform === 'SHOPEE' || (platform === 'ALL' && i % 2 === 0);
        const codePrefix = isShopee ? 'SHO' : 'TIK';
        const ordCode = `${codePrefix}-2408-${(10000 + i).toString().slice(1)}`;
        const products = [
          { name: 'Áo Thun Oversize Unisex 100% Cotton', sku: 'TSHIRT-OS-BLK', price: 169000, cogs: 65000 },
          { name: 'Quần Jean ống suông cạp cao Ulzzang', sku: 'JEAN-WIDE-BLU', price: 249000, cogs: 110000 },
          { name: 'Túi Tote Canvas thời trang', sku: 'TOTE-CANVAS-01', price: 89000, cogs: 28000 },
          { name: 'Bình giữ nhiệt Inox 316', sku: 'BINH-GIU-NHIET-500', price: 129000, cogs: 52000 },
        ];
        const prod = products[i % products.length];
        const qty = (i % 3) + 1;
        const rev = prod.price * qty;
        const pFee = Math.round(rev * 0.11);
        const adFee = Math.round(rev * 0.12);
        const cogsTotal = prod.cogs * qty;
        const tax = Math.round(rev * 0.015);
        const netCash = rev - pFee - tax;
        const profit = netCash - cogsTotal - adFee;

        let status: OrderStatus = 'COMPLETED';
        if (i % 25 === 0) status = 'RETURNED';
        else if (i % 15 === 0) status = 'SHIPPED';
        else if (i % 30 === 0) status = 'PROCESSING';

        mockOrders.push({
          id: `imported-${Date.now()}-${i}`,
          code: ordCode,
          date: `2026-08-${String((i % 26) + 1).padStart(2, '0')}`,
          time: `${String((i % 14) + 8).padStart(2, '0')}:${String((i * 7) % 60).padStart(2, '0')}`,
          platform: (isShopee ? 'SHOPEE' : 'TIKTOK') as any,
          productName: prod.name,
          sku: prod.sku,
          quantity: qty,
          unitPrice: prod.price,
          revenue: rev,
          platformFee: pFee,
          shippingFeeSeller: 0,
          adFee: adFee,
          cogs: cogsTotal,
          refundAmount: status === 'RETURNED' ? rev : 0,
          taxDeducted: tax,
          netCashReceived: netCash,
          netProfit: status === 'RETURNED' ? -(pFee + adFee + 20000) : profit,
          status: status,
          createdAt: new Date().toISOString(),
        });
      }

      setTotalRows(totalCount);
      setValidOrders(mockOrders);
      setInvalidRows(mockErrors);
      setIsProcessing(false);
      setStep(2); // Go to mapping review
    }, 900);
  };

  const handleApplyImport = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onImportSuccess(validOrders);
      setIsProcessing(false);
      setStep(4); // Summary result step
    }, 800);
  };

  const resetModal = () => {
    setStep(1);
    setFileName('');
    setFileSize('');
    setValidOrders([]);
    setInvalidRows([]);
    setShowErrorDetail(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Nhập Dữ Liệu Đơn Hàng Từ Sàn</h2>
              <p className="text-xs text-slate-300">
                Tự động nhận diện & tính toán Doanh thu, Phí sàn, Giá vốn & Lợi nhuận
              </p>
            </div>
          </div>
          <button
            onClick={resetModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-semibold">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-emerald-600' : 'text-slate-400'}`}>
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-current text-white">
              1
            </span>
            <span>Chọn file</span>
          </div>
          <div className="w-8 h-px bg-slate-300" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-emerald-600' : 'text-slate-400'}`}>
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-current text-white">
              2
            </span>
            <span>Nhận diện cột</span>
          </div>
          <div className="w-8 h-px bg-slate-300" />
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-emerald-600' : 'text-slate-400'}`}>
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-current text-white">
              3
            </span>
            <span>Kiểm tra & Validate</span>
          </div>
          <div className="w-8 h-px bg-slate-300" />
          <div className={`flex items-center gap-2 ${step >= 4 ? 'text-emerald-600' : 'text-slate-400'}`}>
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-current text-white">
              4
            </span>
            <span>Hoàn thành</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* STEP 1: Upload File */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="text-center p-8 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl bg-slate-50/50 transition-colors">
                <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-800">
                  Kéo thả file Excel hoặc CSV xuất từ sàn vào đây
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Hỗ trợ định dạng .xlsx, .xls, .csv xuất từ Shopee Seller Centre, TikTok Shop Seller Center, Lazada
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Hoặc nạp nhanh mẫu có sẵn:</span>
                  <button
                    type="button"
                    onClick={() => handleSimulateFileSelect('Shopee_Orders_Export_T8_2026.xlsx', 'SHOPEE')}
                    className="px-3 py-1.5 bg-white hover:bg-orange-50 text-orange-600 border border-orange-200 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Mẫu File Shopee (856 đơn)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSimulateFileSelect('TikTokShop_Order_Report_202608.xlsx', 'TIKTOK')}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Mẫu File TikTok Shop (540 đơn)</span>
                  </button>
                </div>
              </div>

              {/* Guide / Tips */}
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-start gap-3">
                <HelpCircle className="w-5 h-5 shrink-0 text-blue-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Cách xuất file chuẩn từ sàn TMĐT:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-blue-700">
                    <li><strong>Shopee:</strong> Vào Kênh Người Bán &gt; Quản Lý Đơn Hàng &gt; Xuất &gt; Chọn khoảng thời gian &gt; Tải file về.</li>
                    <li><strong>TikTok Shop:</strong> Vào Trung Tâm Nhà Bán Hàng &gt; Quản Lý Đơn Hàng &gt; Xuất Lịch Sử Đơn Hàng.</li>
                    <li>Hệ thống AI sẽ tự động bỏ qua các dòng lỗi và chỉ nhập các đơn hàng chuẩn xác.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Column Mapping */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    Đã nhận diện file: <strong>{fileName}</strong> ({fileSize})
                  </span>
                </div>
                <span className="font-bold uppercase px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                  {selectedPlatform}
                </span>
              </div>

              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Khớp nối các cột dữ liệu (Column Mapping)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 font-medium">Mã đơn hàng:</span>
                    <p className="font-bold text-slate-800">{columnMapping.code}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                    Khớp 100%
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 font-medium">Doanh thu / Giá bán:</span>
                    <p className="font-bold text-slate-800">{columnMapping.revenue}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                    Khớp 100%
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 font-medium">Phí sàn khấu trừ:</span>
                    <p className="font-bold text-slate-800">{columnMapping.platformFee}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                    Khớp 100%
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 font-medium">Tên sản phẩm & SKU:</span>
                    <p className="font-bold text-slate-800">{columnMapping.productName}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                    Khớp 100%
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Quay lại
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  <span>Tiếp tục kiểm tra</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Validate & Confirmation */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500 font-semibold">TỔNG ĐÃ ĐỌC</span>
                  <div className="text-xl font-black text-slate-900 mt-1">{totalRows}</div>
                  <span className="text-[11px] text-slate-400">dòng trong file</span>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-xs text-emerald-600 font-semibold">HỢP LỆ (SẼ NHẬP)</span>
                  <div className="text-xl font-black text-emerald-700 mt-1">{validOrders.length}</div>
                  <span className="text-[11px] text-emerald-600">đơn sẵn sàng</span>
                </div>

                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
                  <span className="text-xs text-rose-600 font-semibold">LỖI (SẼ BỎ QUA)</span>
                  <div className="text-xl font-black text-rose-700 mt-1">{invalidRows.length}</div>
                  <button
                    type="button"
                    onClick={() => setShowErrorDetail(!showErrorDetail)}
                    className="text-[11px] text-rose-600 font-bold underline flex items-center justify-center gap-1 mx-auto mt-0.5"
                  >
                    <Eye className="w-3 h-3" />
                    <span>{showErrorDetail ? 'Ẩn lỗi' : 'Xem lỗi'}</span>
                  </button>
                </div>
              </div>

              {/* Error list drawer */}
              {showErrorDetail && invalidRows.length > 0 && (
                <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 space-y-2 max-h-48 overflow-y-auto">
                  <h5 className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Danh sách {invalidRows.length} dòng lỗi sẽ không import:</span>
                  </h5>
                  <div className="divide-y divide-rose-200/60 text-xs">
                    {invalidRows.map((err, idx) => (
                      <div key={idx} className="py-2 flex items-start justify-between gap-2">
                        <div>
                          <span className="font-bold text-rose-900">Dòng {err.row}:</span>{' '}
                          <span className="text-slate-700">{err.code ? `[${err.code}] ` : ''}{err.reason}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-rose-200 text-rose-800 text-[10px] font-bold shrink-0">
                          Bỏ qua
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sample preview table */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-2">Xem trước 3 đơn hàng mẫu:</h4>
                <div className="border border-slate-200 rounded-xl overflow-x-auto text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Mã đơn</th>
                        <th className="p-2.5">Sản phẩm</th>
                        <th className="p-2.5">Doanh thu</th>
                        <th className="p-2.5">Phí sàn</th>
                        <th className="p-2.5">Tiền nhận</th>
                        <th className="p-2.5">Lợi nhuận</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {validOrders.slice(0, 3).map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-50/80">
                          <td className="p-2.5 font-bold text-slate-900">{ord.code}</td>
                          <td className="p-2.5 text-slate-700 max-w-[180px] truncate">{ord.productName}</td>
                          <td className="p-2.5 font-semibold text-slate-900">{formatCurrency(ord.revenue)}</td>
                          <td className="p-2.5 text-rose-600 font-medium">-{formatCurrency(ord.platformFee)}</td>
                          <td className="p-2.5 text-emerald-600 font-bold">{formatCurrency(ord.netCashReceived)}</td>
                          <td className="p-2.5 text-indigo-600 font-bold">{formatCurrency(ord.netProfit)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Quay lại
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleApplyImport}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-900/20 flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang nạp dữ liệu...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Xác nhận nhập {validOrders.length} đơn hàng</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Success Result */}
          {step === 4 && (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Nhập dữ liệu thành công!</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Hệ thống đã tự động tính toán Doanh thu, Phí sàn, Giá vốn và cập nhật vào Dashboard và Trung tâm Đơn hàng.
                </p>
              </div>

              <div className="max-w-md mx-auto p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-around text-xs">
                <div>
                  <span className="text-slate-500">Đã nạp:</span>
                  <div className="text-base font-black text-emerald-600 mt-0.5">{validOrders.length} đơn</div>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div>
                  <span className="text-slate-500">Đã bỏ qua:</span>
                  <div className="text-base font-black text-rose-500 mt-0.5">{invalidRows.length} đơn lỗi</div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={resetModal}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
                >
                  Xem kết quả trên Dashboard & Đơn hàng
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
