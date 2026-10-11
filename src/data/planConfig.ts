export type PlanTier = 'free' | 'pro' | 'business' | 'enterprise';

export interface PlanFeature {
  name: string;
  included: boolean;
  note?: string;
}

export interface PlanDefinition {
  id: PlanTier;
  name: string;
  badge: string;
  price: number;
  formattedPrice: string;
  billingPeriod: string;
  description: string;
  popular?: boolean;
  limits: {
    maxTransactions: number;
    maxPartners: number;
    maxCategories: number;
    maxAiQueries: number;
    exportExcel: boolean;
    exportPdf: boolean;
    advancedAnalytics: boolean;
    anomalyDetection: boolean;
    multiUser: boolean;
    auditLogRetentionDays: number;
  };
  features: PlanFeature[];
}

export const PLAN_CONFIGS: Record<PlanTier, PlanDefinition> = {
  free: {
    id: 'free',
    name: 'FREE',
    badge: 'Miễn Phí',
    price: 0,
    formattedPrice: '0đ',
    billingPeriod: '/tháng',
    description: 'Dành cho cá nhân, hộ kinh doanh trải nghiệm sổ cái thông minh cơ bản.',
    limits: {
      maxTransactions: 100,
      maxPartners: 20,
      maxCategories: 20,
      maxAiQueries: 20,
      exportExcel: false,
      exportPdf: false,
      advancedAnalytics: false,
      anomalyDetection: false,
      multiUser: false,
      auditLogRetentionDays: 30,
    },
    features: [
      { name: 'Tối đa 100 giao dịch ghi sổ', included: true },
      { name: 'Tối đa 20 đối tác (Khách hàng & NCC)', included: true },
      { name: 'Tối đa 20 danh mục thu chi', included: true },
      { name: 'Trợ lý AI cơ bản (20 lượt hỏi/tháng)', included: true },
      { name: 'Dashboard tổng quan thu chi & dòng tiền', included: true },
      { name: 'Sổ quỹ tiền mặt & tiền gửi', included: true },
      { name: 'Phân tích tài chính chuyên sâu AI', included: false },
      { name: 'Kiểm toán phát hiện chi phí bất thường', included: false },
      { name: 'Xuất file Excel & Báo cáo PDF', included: false },
      { name: 'Hỗ trợ ưu tiên 24/7', included: false },
    ],
  },
  pro: {
    id: 'pro',
    name: 'PRO',
    badge: 'Chuyên Nghiệp',
    price: 99000,
    formattedPrice: '99.000đ',
    billingPeriod: '/tháng',
    popular: true,
    description: 'Tối ưu cho Doanh nghiệp vừa & nhỏ (SME), Kế toán dịch vụ & Startup.',
    limits: {
      maxTransactions: 5000,
      maxPartners: 500,
      maxCategories: 100,
      maxAiQueries: 1000,
      exportExcel: true,
      exportPdf: true,
      advancedAnalytics: true,
      anomalyDetection: true,
      multiUser: false,
      auditLogRetentionDays: 365,
    },
    features: [
      { name: 'Không giới hạn giao dịch (lên đến 5.000/tháng)', included: true },
      { name: 'Quản lý 500+ đối tác khách hàng & nhà cung cấp', included: true },
      { name: 'Trợ lý Kế toán AI Pro (1.000 lượt/tháng)', included: true },
      { name: 'Kiểm toán chi phí bất thường thời gian thực', included: true },
      { name: 'Báo cáo P&L, Dòng tiền & Dự báo 30 ngày', included: true },
      { name: 'Xuất báo cáo chuẩn Excel & PDF có chữ ký', included: true },
      { name: 'Nhập xuất dữ liệu hàng loạt không giới hạn', included: true },
      { name: 'Lưu trữ sao lưu đám mây Firestore an toàn', included: true },
      { name: 'Hỗ trợ kỹ thuật & tư vấn nghiệp vụ ưu tiên', included: true },
    ],
  },
  business: {
    id: 'business',
    name: 'BUSINESS',
    badge: 'Doanh Nghiệp',
    price: 299000,
    formattedPrice: '299.000đ',
    billingPeriod: '/tháng',
    description: 'Mở rộng cho doanh nghiệp nhiều chi nhánh và phân quyền đa nhân viên.',
    limits: {
      maxTransactions: 50000,
      maxPartners: 5000,
      maxCategories: 500,
      maxAiQueries: 5000,
      exportExcel: true,
      exportPdf: true,
      advancedAnalytics: true,
      anomalyDetection: true,
      multiUser: true,
      auditLogRetentionDays: 1825,
    },
    features: [
      { name: 'Mọi tính năng của gói PRO', included: true },
      { name: '50.000+ giao dịch/tháng', included: true },
      { name: 'Phân quyền kế toán viên & Giám đốc duyệt chi', included: true },
      { name: 'Tích hợp API phần mềm hóa đơn điện tử', included: true },
      { name: 'Chuyên gia kế toán trưởng đồng hành 1:1', included: true },
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'ENTERPRISE',
    badge: 'Tùy Chỉnh',
    price: 0,
    formattedPrice: 'Liên hệ',
    billingPeriod: '',
    description: 'Giải pháp tùy chỉnh riêng theo hạ tầng và chính sách tập đoàn.',
    limits: {
      maxTransactions: 999999,
      maxPartners: 999999,
      maxCategories: 999999,
      maxAiQueries: 999999,
      exportExcel: true,
      exportPdf: true,
      advancedAnalytics: true,
      anomalyDetection: true,
      multiUser: true,
      auditLogRetentionDays: 3650,
    },
    features: [
      { name: 'Triển khai Server riêng hoặc On-Premise', included: true },
      { name: 'Tùy biến chuẩn mực kế toán riêng', included: true },
      { name: 'Cam kết SLA 99.99% & Bảo mật cấp ngân hàng', included: true },
      { name: 'Hợp đồng & Xuất hóa đơn VAT đầy đủ', included: true },
    ],
  },
};

export const PLAN_LIMITS = {
  free: PLAN_CONFIGS.free.limits,
  pro: PLAN_CONFIGS.pro.limits,
  business: PLAN_CONFIGS.business.limits,
  enterprise: PLAN_CONFIGS.enterprise.limits,
};


// Plan checking helpers
export const getPlanDetails = (plan: string = 'free'): PlanDefinition => {
  const normalized = (plan?.toLowerCase() as PlanTier) || 'free';
  return PLAN_CONFIGS[normalized] || PLAN_CONFIGS.free;
};

export const checkPlanLimit = (
  currentCount: number,
  limitType: 'maxTransactions' | 'maxPartners' | 'maxCategories' | 'maxAiQueries',
  plan: string = 'free'
): { allowed: boolean; max: number; current: number; percentage: number } => {
  const planInfo = getPlanDetails(plan);
  const max = planInfo.limits[limitType];
  const allowed = currentCount < max;
  const percentage = Math.min(100, Math.round((currentCount / max) * 100));
  return { allowed, max, current: currentCount, percentage };
};

export const hasFeature = (
  feature: 'exportExcel' | 'exportPdf' | 'advancedAnalytics' | 'anomalyDetection' | 'multiUser',
  plan: string = 'free'
): boolean => {
  const planInfo = getPlanDetails(plan);
  return !!planInfo.limits[feature];
};
