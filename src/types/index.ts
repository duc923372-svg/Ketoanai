export type TransactionType = 'INCOME' | 'EXPENSE';

export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'E_WALLET' | 'SHOPEE_PAY' | 'TIKTOK_SHOP' | 'COD';

export type TransactionStatus = 'COMPLETED' | 'PENDING' | 'CANCELLED';

export type SalesPlatform = 'ALL' | 'SHOPEE' | 'TIKTOK' | 'LAZADA' | 'FACEBOOK' | 'WEBSITE' | 'OTHER';

export type OrderStatus = 'PROCESSING' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED' | 'RETURNED';

export interface OrderItem {
  id: string;
  code: string; // Mã đơn hàng (VD: SHO-240826-8912)
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  platform: 'SHOPEE' | 'TIKTOK' | 'LAZADA' | 'FACEBOOK' | 'WEBSITE' | 'OTHER';
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  revenue: number; // Doanh thu bán hàng
  platformFee: number; // Phí sàn (phí thanh toán, cố định, dịch vụ)
  shippingFeeSeller: number; // Phí vận chuyển người bán chịu/hỗ trợ
  adFee: number; // Phí quảng cáo phân bổ
  cogs: number; // Giá vốn hàng bán (Tiền nhập)
  refundAmount: number; // Tiền hoàn hàng/hủy nếu có
  taxDeducted: number; // Thuế đã bị sàn khấu trừ nếu có
  netCashReceived: number; // Tiền thực nhận về tài khoản/ví sàn
  netProfit: number; // Bạn thực sự còn lại (Lợi nhuận)
  status: OrderStatus;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  createdAt: string;
}

export interface ProductItem {
  id: string;
  name: string;
  sku: string;
  sellingPrice: number;
  costPrice: number; // Giá vốn nhập
  platformFeeAvg: number; // Phí sàn trung bình
  adFeeEst: number; // Chi phí quảng cáo ước tính
  unitProfit: number; // Lợi nhuận mỗi sản phẩm
  profitMargin: number; // Biên lợi nhuận (%)
  totalSold: number; // Số lượng đã bán
  inventory: number; // Tồn kho
  status: 'ACTIVE' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  category: string;
  image?: string;
  aiInsight?: {
    type: 'WARNING' | 'GOOD' | 'INFO';
    message: string;
  };
}

export interface Attachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url?: string;
  uploadedAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details?: string;
}

export interface Transaction {
  id: string;
  code: string; // e.g., GD-8921
  type: TransactionType;
  amount: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  description: string;
  paymentMethod: PaymentMethod;
  partnerId?: string;
  partnerName: string;
  creator: string;
  status: TransactionStatus;
  notes?: string;
  platform?: 'SHOPEE' | 'TIKTOK' | 'LAZADA' | 'FACEBOOK' | 'WEBSITE' | 'OTHER';
  attachments: Attachment[];
  aiFlags?: {
    isAnomaly?: boolean;
    reason?: string;
    confidence?: number;
    suggestedCategory?: string;
    suggestedAccount?: string;
  };
  auditLogs: AuditLog[];
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  transactionCount: number;
  totalAmount: number;
  percentage: number;
  status: 'ACTIVE' | 'INACTIVE';
  description?: string;
  accountCode?: string; // e.g. 511, 642, 641, 152...
}

export interface Partner {
  id: string;
  code: string; // e.g. DT-001, KH-002, NCC-003
  name: string;
  type: 'CUSTOMER' | 'SUPPLIER' | 'PARTNER';
  phone: string;
  email: string;
  taxCode?: string;
  address: string;
  totalTransactions: number;
  receivableAmount: number; // Phải thu (nếu là KH)
  payableAmount: number;    // Phải trả (nếu là NCC)
  avatar?: string;
  status: 'ACTIVE' | 'INACTIVE';
  notes?: string;
}

export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
export type AlertStatus = 'UNRESOLVED' | 'IN_PROGRESS' | 'RESOLVED';

export interface SmartAlert {
  id: string;
  code: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  sourceDoc?: string;
  relatedTransactionId?: string;
  relatedAmount?: number;
  detectedAt: string;
  aiRecommendation: string;
  category: 'ANOMALY' | 'BUDGET_OVERRUN' | 'TAX_RISK' | 'DUPLICATE' | 'CASH_DEFICIT';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'USER' | 'AI';
  text: string;
  timestamp: string;
  analysisCard?: {
    title: string;
    description: string;
    metrics?: { label: string; value: string; change?: string; isPositive?: boolean }[];
    tableData?: { label: string; current: string; previous: string; change: string }[];
    actions?: { label: string; actionType: string; payload?: string }[];
  };
  suggestedFollowUps?: string[];
}

export interface ChatSession {
  id: string;
  title: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface FinancialKPIs {
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
  profitMargin: number;
  cashBalance: number;
  bankBalance: number;
  totalBalance: number;
  transactionCount: number;
  revenueGrowth: number;
  expenseGrowth: number;
  profitGrowth: number;
}

export interface CompanySettings {
  name?: string;
  companyName: string;
  taxId?: string;
  taxCode?: string;
  address: string;
  phone: string;
  email: string;
  representative?: string;
  chiefAccountant?: string;
  fiscalYear?: string;
  currency: 'VND' | 'USD' | string;
  accountingStandard: 'TT133' | 'TT200' | string;
  fiscalYearStart?: string;
  aiAssistantEnabled?: boolean;
  autoAnalyzeEnabled?: boolean;
  autoCategorizeAI?: boolean;
  anomalyDetectionEnabled?: boolean;
  darkMode?: boolean;
  notificationEmail?: boolean;
  notificationAlerts?: boolean;
}

export type UserPlan = 'free' | 'pro' | 'business' | 'enterprise';

export interface UserProfile {
  id: string;
  uid?: string;
  name: string;
  displayName?: string;
  email: string;
  photoURL?: string;
  role: string; // 'user' | 'accountant' | 'chief_accountant' | 'admin'
  plan: UserPlan;
  planStatus: 'active' | 'trialing' | 'expired' | 'canceled';
  trialStart?: string;
  trialEnd?: string;
  expiresAt?: string;
  aiUsageCount?: number;
  phone: string;
  department: string;
  avatar: string;
  twoFactorEnabled: boolean;
  companyName?: string;
  taxCode?: string;
  welcomeEmailSent?: boolean;
  createdAt?: string;
  updatedAt?: string;
  recentLogins: {
    ip: string;
    device: string;
    time: string;
    location: string;
  }[];
}

export interface SubscriptionInfo {
  id: string;
  plan: UserPlan;
  status: 'active' | 'trialing' | 'expired' | 'canceled';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  paymentMethod?: string;
}

export interface BillingHistoryItem {
  id: string;
  invoiceNumber: string;
  date: string;
  amount: number;
  plan: string;
  status: 'PAID' | 'PENDING' | 'REFUNDED';
  paymentGateway?: 'VNPAY' | 'MOMO' | 'ZALOPAY' | 'STRIPE' | 'BANK_TRANSFER';
  pdfUrl?: string;
}

export type ScreenTab =
  | 'landing'
  | 'pricing'
  | 'subscription'
  | 'admin'
  | 'dashboard'
  | 'transactions'
  | 'transaction-detail'
  | 'categories'
  | 'partners'
  | 'cash-ledger'
  | 'reports'
  | 'revenue-expense'
  | 'ai-analytics'
  | 'ai-chat'
  | 'smart-alerts'
  | 'settings'
  | 'data-management'
  | 'user-profile'
  | 'auth';

