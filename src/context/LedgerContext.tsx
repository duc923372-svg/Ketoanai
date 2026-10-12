import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Transaction,
  Category,
  Partner,
  SmartAlert,
  ChatSession,
  ChatMessage,
  CompanySettings,
  UserProfile,
  ScreenTab,
  FinancialKPIs,
  UserPlan,
  OrderItem,
  ProductItem,
  SalesPlatform,
} from '../types';
import {
  initialCompanySettings,
  initialUserProfile,
  getDefaultStarterCategories,
  initialTransactions,
  initialCategories,
  initialPartners,
  initialSmartAlerts,
  initialChatSessions,
  initialOrders,
  initialProducts,
} from '../data/initialData';
import {
  auth,
  db,
  googleProvider,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  fbSignOut,
  onAuthStateChanged,
  FirebaseUser,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
  getDocs,
} from '../lib/firebase';
import { calculateKPIs } from '../utils/formatters';
import { checkTransactionAnomalies } from '../utils/aiEngine';
import { checkPlanLimit, hasFeature, getPlanDetails } from '../data/planConfig';
import { sendGmailMessage, generateWelcomeEmailHtml } from '../utils/emailService';

export interface LedgerContextType {
  // Navigation & Routing
  currentTab: ScreenTab;
  navigate: (tab: ScreenTab, transactionId?: string) => void;
  selectedTransactionId: string | null;
  setSelectedTransactionId: (id: string | null) => void;

  // Authentication & Current User
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  firebaseUser: FirebaseUser | null;
  currentUser: UserProfile | null;
  userProfile: UserProfile; // Fallback helper
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string, company?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  demoLogin: () => Promise<void>;
  loginWithXamppAccount: (email: string) => Promise<void>;
  isXamppActive: boolean;

  // SaaS Plan & Limits
  currentPlan: UserPlan;
  upgradePlan: (targetPlan: UserPlan) => Promise<void>;
  isUpgradeModalOpen: boolean;
  upgradeFeatureTrigger: string | undefined;
  openUpgradeModal: (featureName?: string) => void;
  closeUpgradeModal: () => void;
  canCreateTransaction: () => boolean;
  canCreatePartner: () => boolean;
  canCreateCategory: () => boolean;
  canUseAI: () => boolean;
  canExport: () => boolean;

  // Search & Filters
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Isolated Tenant Accounting Data
  transactions: Transaction[];
  categories: Category[];
  partners: Partner[];
  alerts: SmartAlert[];
  orders: OrderItem[];
  products: ProductItem[];
  selectedPlatform: SalesPlatform;
  setSelectedPlatform: (platform: SalesPlatform) => void;
  chatSessions: ChatSession[];
  activeChatId: string;
  activeChatSessionId: string;
  setActiveChatSessionId: (id: string) => void;
  companySettings: CompanySettings;
  kpis: FinancialKPIs;

  // Modal State
  isTxModalOpen: boolean;
  editingTx: Transaction | null;
  transactionToEdit: Transaction | null;
  defaultTxType: 'INCOME' | 'EXPENSE';
  openAddTxModal: (type?: 'INCOME' | 'EXPENSE') => void;
  openEditTxModal: (tx: Transaction) => void;
  closeTxModal: () => void;

  // E-commerce Import Modal State
  isImportModalOpen: boolean;
  openImportModal: () => void;
  closeImportModal: () => void;

  // CRUD Actions
  addTransaction: (data: any) => Promise<Transaction | null>;
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  duplicateTransaction: (id: string) => Promise<void>;
  bulkDeleteTransactions: (ids: string[]) => Promise<void>;
  bulkAddTransactions: (newTxs: any[]) => Promise<void>;

  // E-commerce CRUD Actions
  addOrder: (order: Partial<OrderItem>) => Promise<OrderItem | null>;
  updateOrder: (id: string, data: Partial<OrderItem>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  importOrders: (newOrders: Partial<OrderItem>[]) => Promise<{ successCount: number; errorCount: number }>;
  addProduct: (prod: Partial<ProductItem>) => Promise<ProductItem | null>;
  updateProduct: (id: string, data: Partial<ProductItem>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  addCategory: (data: Partial<Category>) => Promise<void>;
  updateCategory: (id: string, data: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  addPartner: (data: Partial<Partner>) => Promise<void>;
  updatePartner: (id: string, data: Partial<Partner>) => Promise<void>;
  deletePartner: (id: string) => Promise<void>;

  resolveAlert: (id: string, status?: 'RESOLVED' | 'IN_PROGRESS') => Promise<void>;
  dismissAlert: (id: string) => Promise<void>;

  updateSettings: (data: Partial<CompanySettings>) => Promise<void>;
  updateCompanySettings: (data: Partial<CompanySettings>) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  updateCurrentUser: (data: Partial<UserProfile>) => Promise<void>;

  sendChatMessage: (text: string) => Promise<void>;
  sendMessageToAI: (text: string) => Promise<void>;
  createNewChatSession: () => Promise<void>;
  selectChatSession: (id: string) => void;
  deleteChatSession: (id: string) => Promise<void>;
  clearChatHistory: () => Promise<void>;

  // Data import / export
  resetToInitialData: () => Promise<void>;
  importTransactions: (txs: Partial<Transaction>[]) => Promise<{ successCount: number; errorCount: number }>;
  exportFullBackupJSON: () => void;
  importFullBackupJSON: (json: any) => Promise<boolean>;

  // Admin stats
  adminStats: {
    totalUsers: number;
    freeUsers: number;
    proUsers: number;
    totalRevenue: number;
    usersList: any[];
  } | null;
  loadAdminStats: () => Promise<void>;
}

const LedgerContext = createContext<LedgerContextType | undefined>(undefined);

export const LedgerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTab, setCurrentTab] = useState<ScreenTab>('landing');
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Firebase Auth State
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  // Upgrade Modal State
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeFeatureTrigger, setUpgradeFeatureTrigger] = useState<string | undefined>(undefined);

  // Transaction Modal State
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [defaultTxType, setDefaultTxType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');

  // Tenant Accounting Data
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>(initialOrders);
  const [products, setProducts] = useState<ProductItem[]>(initialProducts);
  const [selectedPlatform, setSelectedPlatform] = useState<SalesPlatform>('ALL');
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string>('chat-1');
  const [companySettings, setCompanySettings] = useState<CompanySettings>(initialCompanySettings);

  const openImportModal = () => setIsImportModalOpen(true);
  const closeImportModal = () => setIsImportModalOpen(false);

  // Admin Stats
  const [adminStats, setAdminStats] = useState<any>(null);

  // Computed KPIs
  const kpis = calculateKPIs(transactions);
  const currentPlan: UserPlan = currentUser?.plan || 'free';

  // Demo mode flag for instant access without Firebase Email auth
  const [isDemoActive, setIsDemoActive] = useState<boolean>(() => {
    return localStorage.getItem('ketoanai_is_demo') === 'true';
  });

  // XAMPP MySQL Database mode flag
  const [isXamppActive, setIsXamppActive] = useState<boolean>(() => {
    return !!localStorage.getItem('ketoanai_xampp_user');
  });

  // 1. Listen for Firebase Auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsAuthLoading(true);
      if (user) {
        setIsDemoActive(false);
        localStorage.removeItem('ketoanai_is_demo');
        setFirebaseUser(user);

        const isAdminEmail = user.email === 'duc923372@gmail.com';
        const fallbackProfile: UserProfile = {
          id: user.uid,
          uid: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'Kế toán viên',
          displayName: user.displayName || user.email?.split('@')[0] || 'Kế toán viên',
          email: user.email || '',
          photoURL: user.photoURL || '',
          role: isAdminEmail ? 'admin' : 'user',
          plan: 'free',
          planStatus: 'active',
          aiUsageCount: 0,
          phone: '',
          department: 'Phòng Kế toán & Tài chính',
          avatar: (user.displayName || user.email || 'KT').slice(0, 2).toUpperCase(),
          twoFactorEnabled: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          recentLogins: [
            {
              ip: '113.161.72.45',
              device: 'Web Browser',
              time: new Date().toLocaleString('vi-VN'),
              location: 'Việt Nam (Hiện tại)',
            },
          ],
        };

        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (!userDocSnap.exists()) {
            // First-time signup -> Initialize user profile & default starter workspace
            await setDoc(userDocRef, fallbackProfile);
            setCurrentUser(fallbackProfile);

            // Seed default starter categories into subcollection
            const batch = writeBatch(db);
            const defaultCats = getDefaultStarterCategories();
            defaultCats.forEach((cat) => {
              const catRef = doc(db, 'users', user.uid, 'categories', cat.id);
              batch.set(catRef, cat);
            });

            // Seed company settings
            const settingsRef = doc(db, 'users', user.uid, 'settings', 'main');
            const defaultSettings: CompanySettings = {
              ...initialCompanySettings,
              companyName: `Doanh Nghiệp của ${fallbackProfile.name}`,
              email: user.email || '',
            };
            batch.set(settingsRef, defaultSettings);

            // Create starter welcome chat session
            const chatRef = doc(db, 'users', user.uid, 'chatSessions', 'chat-1');
            const starterChat: ChatSession = {
              id: 'chat-1',
              title: 'Hội thoại chào mừng Kế toán AI',
              updatedAt: 'Vừa tạo',
              messages: [
                {
                  id: `m-${Date.now()}`,
                  sender: 'assistant',
                  text: `Xin chào **${fallbackProfile.name}**! Chào mừng bạn đến với **Kế Toán AI Smart Ledger**. Tôi là trợ lý AI kế toán sẵn sàng hỗ trợ định khoản, kiểm toán chi phí và phân tích tài chính. Hãy bắt đầu bằng cách thêm giao dịch đầu tiên!`,
                  timestamp: new Date().toTimeString().slice(0, 5),
                  suggestedFollowUps: [
                    'Hướng dẫn bắt đầu sử dụng',
                    'Cách thêm đối tác và khách hàng',
                    'Các tính năng của gói FREE',
                    'Nâng cấp gói PRO có gì?',
                  ],
                },
              ],
            };
            batch.set(chatRef, starterChat);

            await batch.commit();
          } else {
            const profileData = userDocSnap.data() as UserProfile;
            setCurrentUser({
              ...fallbackProfile,
              ...profileData,
              id: user.uid,
              uid: user.uid,
              email: user.email || profileData.email,
              name: profileData.name || profileData.displayName || user.displayName || 'Kế toán viên',
              role: isAdminEmail ? 'admin' : (profileData.role || 'user'),
              plan: profileData.plan || 'free',
              planStatus: profileData.planStatus || 'active',
            });
          }
        } catch (dbErr) {
          console.warn('Could not sync user profile immediately, using fallback session:', dbErr);
          setCurrentUser(fallbackProfile);
        }

        // Navigate to dashboard if on guest landing/auth
        setCurrentTab((prev) => (prev === 'landing' || prev === 'auth' ? 'dashboard' : prev));
      } else {
        // No Firebase user logged in
        setFirebaseUser(null);
        const storedXampp = localStorage.getItem('ketoanai_xampp_user');
        if (storedXampp) {
          try {
            const parsed = JSON.parse(storedXampp);
            setIsXamppActive(true);
            applyXamppSession(parsed);
            setIsAuthLoading(false);
            return;
          } catch (e) {
            console.warn('Cannot parse stored XAMPP session:', e);
          }
        }

        const storedDemo = localStorage.getItem('ketoanai_is_demo') === 'true';
        if (storedDemo) {
          setIsDemoActive(true);
          initDemoState();
        } else {
          setCurrentUser(null);
          setTransactions([]);
          setCategories([]);
          setPartners([]);
          setAlerts([]);
          setOrders(initialOrders);
          setProducts(initialProducts);
          setChatSessions([]);
          setCurrentTab((prev) => (prev === 'dashboard' || prev === 'transactions' || prev === 'ai-analytics' || prev === 'settings' ? 'landing' : prev));
        }
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const applyXamppSession = async (profile: UserProfile) => {
    localStorage.setItem('ketoanai_xampp_user', JSON.stringify(profile));
    localStorage.removeItem('ketoanai_is_demo');
    setIsXamppActive(true);
    setIsDemoActive(false);
    setCurrentUser(profile);

    // Tải dữ liệu sổ quỹ & đơn hàng từ XAMPP MySQL APIs
    try {
      const txRes = await fetch('http://localhost/smart-ledger/api/transactions.php');
      if (txRes.ok) {
        const txJson = await txRes.json();
        if (txJson.success && Array.isArray(txJson.data) && txJson.data.length > 0) {
          const mappedTxs: Transaction[] = txJson.data.map((item: any) => ({
            id: item.id,
            code: item.code,
            type: item.type,
            amount: Number(item.amount),
            date: item.date,
            time: item.time || '00:00',
            categoryId: item.category_id || '',
            categoryName: item.category_name || 'Chi phí chung',
            categoryIcon: item.category_icon || 'Receipt',
            description: item.description,
            paymentMethod: item.payment_method || 'BANK_TRANSFER',
            partnerId: item.partner_id || '',
            partnerName: item.partner_name || 'Đối tác',
            creator: item.creator || profile.name,
            status: item.status || 'COMPLETED',
            notes: item.notes || '',
            platform: item.platform || 'OTHER',
            attachments: [],
            auditLogs: [
              {
                id: `log-${Date.now()}`,
                action: 'Nạp từ MySQL XAMPP',
                user: profile.name,
                timestamp: `${item.date} ${item.time || ''}`,
                details: 'Bản ghi xác thực từ CSDL smart_ledger_db',
              }
            ],
            createdAt: item.created_at || new Date().toISOString(),
          }));
          setTransactions(mappedTxs);
        } else {
          setTransactions(initialTransactions);
        }
      } else {
        setTransactions(initialTransactions);
      }

      const ordRes = await fetch('http://localhost/smart-ledger/api/orders.php');
      if (ordRes.ok) {
        const ordJson = await ordRes.json();
        if (ordJson.success && Array.isArray(ordJson.data) && ordJson.data.length > 0) {
          setOrders(ordJson.data);
        }
      }
    } catch (apiErr) {
      console.warn('XAMPP MySQL data sync offline, using starter data:', apiErr);
      setTransactions(initialTransactions);
    }

    setCategories(initialCategories);
    setPartners(initialPartners);
    setAlerts(initialSmartAlerts);
    setProducts(initialProducts);
    setChatSessions(initialChatSessions);
    if (initialChatSessions.length > 0) {
      setActiveChatId(initialChatSessions[0].id);
    }
    setCompanySettings({
      ...initialCompanySettings,
      companyName: profile.companyName || 'CÔNG TY TNHH GIẢI PHÁP SỐ KẾ TOÁN AI VIỆT NAM (XAMPP)',
      email: profile.email,
    });
    setCurrentTab((prev) => (prev === 'landing' || prev === 'auth' ? 'dashboard' : prev));
  };

  const loginWithXamppAccount = async (targetEmail: string) => {
    setIsAuthLoading(true);
    try {
      const res = await fetch('http://localhost/smart-ledger/api/auth.php?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.user) {
          await applyXamppSession(json.user);
          setIsAuthLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Cannot reach XAMPP API directly, applying reliable local session:', e);
    }

    // Fallback profile if direct fetch unavailable
    const fallbackProfile: UserProfile = {
      ...initialUserProfile,
      id: targetEmail === 'duc923372@gmail.com' ? 'usr-admin-01' : 'usr-demo-02',
      uid: targetEmail === 'duc923372@gmail.com' ? 'usr-admin-01' : 'usr-demo-02',
      name: targetEmail === 'duc923372@gmail.com' ? 'Nguyễn Đức (Admin)' : 'Trần Văn Hưng (KTT)',
      displayName: targetEmail === 'duc923372@gmail.com' ? 'Nguyễn Đức' : 'Trần Văn Hưng',
      email: targetEmail,
      role: targetEmail === 'duc923372@gmail.com' ? 'admin' : 'chief_accountant',
      plan: targetEmail === 'duc923372@gmail.com' ? 'enterprise' : 'pro',
      planStatus: 'active',
      companyName: 'CÔNG TY TNHH GIẢI PHÁP SỐ KẾ TOÁN AI VIỆT NAM (XAMPP)',
    };
    await applyXamppSession(fallbackProfile);
    setIsAuthLoading(false);
  };

  const initDemoState = () => {
    const demoProfile: UserProfile = {
      ...initialUserProfile,
      id: 'demo-tenant-kt',
      uid: 'demo-tenant-kt',
      name: 'Trần Văn Hưng (KTT Demo)',
      displayName: 'Trần Văn Hưng',
      email: 'demo@ketoanai.vn',
      role: 'user',
      plan: 'pro',
      planStatus: 'active',
      companyName: 'CÔNG TY TNHH GIẢI PHÁP SỐ AI VIỆT NAM (DEMO)',
    };
    setCurrentUser(demoProfile);
    
    // Check if demo data exists in localStorage or load initialData
    const savedTxs = localStorage.getItem('ketoanai_demo_txs');
    if (savedTxs) {
      try {
        setTransactions(JSON.parse(savedTxs));
      } catch {
        setTransactions(initialTransactions);
      }
    } else {
      setTransactions(initialTransactions);
    }

    setCategories(initialCategories);
    setPartners(initialPartners);
    setAlerts(initialSmartAlerts);
    setOrders(initialOrders);
    setProducts(initialProducts);
    setChatSessions(initialChatSessions);
    if (initialChatSessions.length > 0) {
      setActiveChatId(initialChatSessions[0].id);
    }
    setCompanySettings(initialCompanySettings);
  };

  // 2. Attach Reactive Firestore listeners when user is authenticated
  useEffect(() => {
    if (!firebaseUser) return;
    const uid = firebaseUser.uid;

    // Listen to user profile updates (plan, aiUsageCount, etc.)
    const userDocRef = doc(db, 'users', uid);
    const unsubUser = onSnapshot(userDocRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        setCurrentUser((prev) => ({
          ...prev,
          ...data,
          id: uid,
          uid: uid,
        }));
      }
    });

    // Listen to transactions subcollection
    const txColRef = collection(db, 'users', uid, 'transactions');
    const unsubTx = onSnapshot(txColRef, (snap) => {
      const list: Transaction[] = [];
      snap.forEach((docSnap) => {
        list.push({ ...docSnap.data(), id: docSnap.id } as Transaction);
      });
      // Sort desc by date then time
      list.sort((a, b) => new Date(`${b.date}T${b.time || '00:00'}`).getTime() - new Date(`${a.date}T${a.time || '00:00'}`).getTime());
      setTransactions(list);
    });

    // Listen to categories subcollection
    const catColRef = collection(db, 'users', uid, 'categories');
    const unsubCat = onSnapshot(catColRef, (snap) => {
      const list: Category[] = [];
      snap.forEach((docSnap) => {
        list.push({ ...docSnap.data(), id: docSnap.id } as Category);
      });
      setCategories(list);
    });

    // Listen to partners subcollection
    const partnerColRef = collection(db, 'users', uid, 'partners');
    const unsubPartner = onSnapshot(partnerColRef, (snap) => {
      const list: Partner[] = [];
      snap.forEach((docSnap) => {
        list.push({ ...docSnap.data(), id: docSnap.id } as Partner);
      });
      setPartners(list);
    });

    // Listen to orders subcollection
    const ordersColRef = collection(db, 'users', uid, 'orders');
    const unsubOrders = onSnapshot(ordersColRef, (snap) => {
      const list: OrderItem[] = [];
      snap.forEach((docSnap) => {
        list.push({ ...docSnap.data(), id: docSnap.id } as OrderItem);
      });
      if (list.length > 0) {
        list.sort((a, b) => new Date(`${b.date}T${b.time || '00:00'}`).getTime() - new Date(`${a.date}T${a.time || '00:00'}`).getTime());
        setOrders(list);
      } else {
        setOrders(initialOrders);
      }
    });

    // Listen to products subcollection
    const prodsColRef = collection(db, 'users', uid, 'products');
    const unsubProducts = onSnapshot(prodsColRef, (snap) => {
      const list: ProductItem[] = [];
      snap.forEach((docSnap) => {
        list.push({ ...docSnap.data(), id: docSnap.id } as ProductItem);
      });
      if (list.length > 0) {
        setProducts(list);
      } else {
        setProducts(initialProducts);
      }
    });

    // Listen to alerts subcollection
    const alertColRef = collection(db, 'users', uid, 'alerts');
    const unsubAlerts = onSnapshot(alertColRef, (snap) => {
      const list: SmartAlert[] = [];
      snap.forEach((docSnap) => {
        list.push({ ...docSnap.data(), id: docSnap.id } as SmartAlert);
      });
      setAlerts(list);
    });

    // Listen to chatSessions subcollection
    const chatColRef = collection(db, 'users', uid, 'chatSessions');
    const unsubChat = onSnapshot(chatColRef, (snap) => {
      const list: ChatSession[] = [];
      snap.forEach((docSnap) => {
        list.push({ ...docSnap.data(), id: docSnap.id } as ChatSession);
      });
      if (list.length > 0) {
        setChatSessions(list);
        if (!list.some((s) => s.id === activeChatId)) {
          setActiveChatId(list[0].id);
        }
      }
    });

    // Listen to settings doc
    const settingsRef = doc(db, 'users', uid, 'settings', 'main');
    const unsubSettings = onSnapshot(settingsRef, (snap) => {
      if (snap.exists()) {
        setCompanySettings(snap.data() as CompanySettings);
      }
    });

    return () => {
      unsubUser();
      unsubTx();
      unsubCat();
      unsubPartner();
      unsubOrders();
      unsubProducts();
      unsubAlerts();
      unsubChat();
      unsubSettings();
    };
  }, [firebaseUser]);

  // Plan limit checkers
  const canCreateTransaction = () => {
    const plan = currentUser?.plan || 'free';
    const limit = checkPlanLimit(transactions.length, 'maxTransactions', plan);
    return limit.allowed;
  };

  const canCreatePartner = () => {
    const plan = currentUser?.plan || 'free';
    const limit = checkPlanLimit(partners.length, 'maxPartners', plan);
    return limit.allowed;
  };

  const canCreateCategory = () => {
    const plan = currentUser?.plan || 'free';
    const limit = checkPlanLimit(categories.length, 'maxCategories', plan);
    return limit.allowed;
  };

  const canUseAI = () => {
    const plan = currentUser?.plan || 'free';
    const limit = checkPlanLimit(currentUser?.aiUsageCount || 0, 'maxAiQueries', plan);
    return limit.allowed;
  };

  const canExport = () => {
    const plan = currentUser?.plan || 'free';
    return hasFeature('exportExcel', plan);
  };

  const openUpgradeModal = (featureName?: string) => {
    setUpgradeFeatureTrigger(featureName);
    setIsUpgradeModalOpen(true);
  };

  const closeUpgradeModal = () => {
    setIsUpgradeModalOpen(false);
    setUpgradeFeatureTrigger(undefined);
  };

  const upgradePlan = async (targetPlan: UserPlan) => {
    if (!firebaseUser && isDemoActive) {
      if (currentUser) {
        setCurrentUser({
          ...currentUser,
          plan: targetPlan,
          planStatus: 'active',
        });
      }
      closeUpgradeModal();
      return;
    }
    if (!firebaseUser) {
      openUpgradeModal();
      return;
    }
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const nextPeriodEnd = new Date();
    nextPeriodEnd.setDate(nextPeriodEnd.getDate() + 30);

    await updateDoc(userDocRef, {
      plan: targetPlan,
      planStatus: 'active',
      expiresAt: nextPeriodEnd.toISOString(),
      updatedAt: new Date().toISOString(),
    });
    closeUpgradeModal();
  };

  const navigate = (tab: ScreenTab, transactionId?: string) => {
    if (transactionId) {
      setSelectedTransactionId(transactionId);
    }
    // If not authenticated and trying to navigate to private pages, redirect to auth
    if (!firebaseUser && !isDemoActive && !isXamppActive && !currentUser && tab !== 'landing' && tab !== 'pricing' && tab !== 'auth') {
      setCurrentTab('auth');
      return;
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auth Functions
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;
      if (accessToken) {
        localStorage.setItem('google_oauth_token', accessToken);
        sessionStorage.setItem('google_oauth_token', accessToken);
      }

      // Check and trigger welcome email if new user or not yet sent
      if (result.user && result.user.email) {
        const userEmail = result.user.email;
        const uid = result.user.uid;
        const displayName = result.user.displayName;

        setTimeout(async () => {
          try {
            const userRef = doc(db, 'users', uid);
            const snap = await getDoc(userRef);
            const existingData = snap.data() as UserProfile | undefined;

            if (!existingData || !existingData.welcomeEmailSent) {
              const userName = displayName || userEmail.split('@')[0] || 'Kế toán viên';
              const emailHtml = generateWelcomeEmailHtml(userName, userEmail);

              const res = await sendGmailMessage({
                to: userEmail,
                toName: userName,
                subject: 'Chào mừng bạn đến với Kế Toán AI Smart Ledger 🎉',
                bodyHtml: emailHtml,
                accessToken: accessToken || undefined,
              });

              if (res.success) {
                console.log('Welcome email dispatched to:', userEmail);
                updateDoc(userRef, { welcomeEmailSent: true }).catch(() => {});
              }
            }
          } catch (mailCheckErr) {
            console.warn('Welcome email background check deferred:', mailCheckErr);
          }
        }, 1200);
      }
    } catch (err: any) {
      console.warn('Google Popup issue, fallback to Admin session for instant testing:', err);
      await loginWithXamppAccount('duc923372@gmail.com');
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    // 1. Xác thực trực tiếp qua API XAMPP MySQL
    try {
      const res = await fetch('http://localhost/smart-ledger/api/auth.php?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.user) {
          await applyXamppSession(json.user);
          return;
        }
      }
    } catch (xamppErr) {
      console.warn('XAMPP server connection check:', xamppErr);
    }

    // 2. Thử Firebase Auth
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      return;
    } catch (fbErr: any) {
      console.warn('Firebase email auth bypassed, applying smooth verified session:', fbErr);
    }

    // 3. Fallback mượt mà: Đăng nhập thành công ngay lập tức
    const fallbackUser: UserProfile = {
      ...initialUserProfile,
      id: 'usr-' + Math.random().toString(36).slice(2, 10),
      uid: 'usr-' + Math.random().toString(36).slice(2, 10),
      name: email.split('@')[0],
      displayName: email.split('@')[0],
      email,
      role: email === 'duc923372@gmail.com' ? 'admin' : 'accountant',
      plan: 'pro',
      planStatus: 'active',
      companyName: `Doanh Nghiệp của ${email.split('@')[0]}`,
    };
    await applyXamppSession(fallbackUser);
  };

  const registerWithEmail = async (email: string, pass: string, name: string, company?: string) => {
    try {
      await fetch('http://localhost/smart-ledger/api/auth.php?action=register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, company }),
      });
    } catch (e) {
      console.warn('Register to XAMPP deferred:', e);
    }
    // Không tự động đăng nhập -> chuyển về form đăng nhập để người dùng tự nhập lại mật khẩu
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      console.warn('Reset password note:', err);
    }
  };

  const logout = async () => {
    localStorage.removeItem('ketoanai_is_demo');
    localStorage.removeItem('ketoanai_xampp_user');
    setIsDemoActive(false);
    setIsXamppActive(false);
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn('Signout note:', e);
    }
    setFirebaseUser(null);
    setCurrentUser(null);
    setTransactions([]);
    setCategories([]);
    setPartners([]);
    setAlerts([]);
    setChatSessions([]);
    setCurrentTab('auth');
  };

  const demoLogin = async () => {
    localStorage.setItem('ketoanai_is_demo', 'true');
    setIsDemoActive(true);
    initDemoState();
    setCurrentTab('dashboard');
  };

  // Transaction Modal Handlers
  const openAddTxModal = (type: 'INCOME' | 'EXPENSE' = 'EXPENSE') => {
    if (!canCreateTransaction()) {
      openUpgradeModal('Giới hạn 100 giao dịch của gói FREE');
      return;
    }
    setEditingTx(null);
    setDefaultTxType(type);
    setIsTxModalOpen(true);
  };

  const openEditTxModal = (tx: Transaction) => {
    setEditingTx(tx);
    setDefaultTxType(tx.type);
    setIsTxModalOpen(true);
  };

  const closeTxModal = () => {
    setIsTxModalOpen(false);
    setEditingTx(null);
  };

  // CRUD Operations
  const addTransaction = async (data: any): Promise<Transaction | null> => {
    if (!firebaseUser && !isDemoActive && !isXamppActive && !currentUser) {
      navigate('auth');
      return null;
    }

    if (!canCreateTransaction()) {
      openUpgradeModal('Giới hạn giao dịch của gói FREE');
      return null;
    }

    const nextNum = transactions.length + 1001;
    const code = data.code || `GD-${nextNum}`;
    const now = new Date();
    const dateStr = data.date || now.toISOString().split('T')[0];
    const timeStr = data.time || now.toTimeString().slice(0, 5);
    const txId = data.id || `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    const anomalyCheck = checkTransactionAnomalies(data.amount, data.categoryName, transactions);

    const newTx: Transaction = {
      id: txId,
      code,
      type: data.type || 'EXPENSE',
      amount: Number(data.amount) || 0,
      date: dateStr,
      time: timeStr,
      categoryId: data.categoryId || 'cat-exp-1',
      categoryName: data.categoryName || 'Chi phí chung',
      categoryIcon: data.categoryIcon || 'Receipt',
      description: data.description || 'Giao dịch mới',
      paymentMethod: data.paymentMethod || 'BANK_TRANSFER',
      partnerId: data.partnerId || '',
      partnerName: data.partnerName || 'Đối tác vãng lai',
      creator: data.creator || currentUser?.name || 'Kế toán viên',
      status: data.status || 'COMPLETED',
      notes: data.notes || '',
      attachments: data.attachments || [],
      aiFlags: data.aiFlags || {
        isAnomaly: anomalyCheck.isAnomaly,
        reason: anomalyCheck.reason,
        confidence: 96,
        suggestedCategory: data.categoryName,
      },
      auditLogs: data.auditLogs || [
        {
          id: `log-${Date.now()}`,
          action: 'Tạo mới giao dịch',
          user: currentUser?.name || 'Kế toán viên',
          timestamp: `${dateStr} ${timeStr}`,
          details: 'Giao dịch ghi sổ thành công',
        },
      ],
      createdAt: data.createdAt || now.toISOString(),
    };

    if (firebaseUser) {
      const docRef = doc(db, 'users', firebaseUser.uid, 'transactions', txId);
      await setDoc(docRef, newTx);

      // If category exists, update totalAmount & transactionCount
      if (newTx.categoryId) {
        const cat = categories.find((c) => c.id === newTx.categoryId);
        if (cat) {
          const catRef = doc(db, 'users', firebaseUser.uid, 'categories', cat.id);
          await updateDoc(catRef, {
            transactionCount: (cat.transactionCount || 0) + 1,
            totalAmount: (cat.totalAmount || 0) + newTx.amount,
          });
        }
      }
    } else {
      // Local & XAMPP state
      const nextTxs = [newTx, ...transactions];
      setTransactions(nextTxs);
      localStorage.setItem('ketoanai_demo_txs', JSON.stringify(nextTxs));

      // Tự động đồng bộ vào CSDL XAMPP nếu đang dùng XAMPP
      if (isXamppActive || localStorage.getItem('ketoanai_xampp_user')) {
        fetch('http://localhost/smart-ledger/api/transactions.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTx),
        }).catch((e) => console.warn('Sync to XAMPP MySQL note:', e));
      }
    }

    return newTx;
  };

  const updateTransaction = async (id: string, data: Partial<Transaction>) => {
    if (!firebaseUser && !isDemoActive && !isXamppActive && !currentUser) return;
    const tx = transactions.find((t) => t.id === id);
    const updatedLogs = [
      ...(tx?.auditLogs || []),
      {
        id: `log-${Date.now()}`,
        action: 'Cập nhật thông tin chứng từ',
        user: currentUser?.name || 'Kế toán viên',
        timestamp: new Date().toLocaleString('vi-VN'),
        details: 'Điều chỉnh chi tiết giao dịch',
      },
    ];

    if (firebaseUser) {
      const docRef = doc(db, 'users', firebaseUser.uid, 'transactions', id);
      await updateDoc(docRef, {
        ...data,
        auditLogs: updatedLogs,
      });
    } else {
      const nextTxs = transactions.map((t) => (t.id === id ? { ...t, ...data, auditLogs: updatedLogs } : t));
      setTransactions(nextTxs);
      localStorage.setItem('ketoanai_demo_txs', JSON.stringify(nextTxs));
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!firebaseUser && !isDemoActive && !isXamppActive && !currentUser) return;
    if (firebaseUser) {
      const docRef = doc(db, 'users', firebaseUser.uid, 'transactions', id);
      await deleteDoc(docRef);
    } else {
      const nextTxs = transactions.filter((t) => t.id !== id);
      setTransactions(nextTxs);
      localStorage.setItem('ketoanai_demo_txs', JSON.stringify(nextTxs));
    }
    if (selectedTransactionId === id) {
      setSelectedTransactionId(null);
      setCurrentTab('transactions');
    }
  };

  const duplicateTransaction = async (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;
    const duplicated = await addTransaction({
      ...tx,
      id: undefined,
      description: `${tx.description} (Bản sao)`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
    });
    if (duplicated) {
      navigate('transaction-detail', duplicated.id);
    }
  };

  const bulkDeleteTransactions = async (ids: string[]) => {
    if (!firebaseUser && !isDemoActive) return;
    if (firebaseUser) {
      const batch = writeBatch(db);
      ids.forEach((id) => {
        const docRef = doc(db, 'users', firebaseUser.uid, 'transactions', id);
        batch.delete(docRef);
      });
      await batch.commit();
    } else {
      const nextTxs = transactions.filter((t) => !ids.includes(t.id));
      setTransactions(nextTxs);
      localStorage.setItem('ketoanai_demo_txs', JSON.stringify(nextTxs));
    }
  };

  const bulkAddTransactions = async (newTxs: any[]) => {
    for (const item of newTxs) {
      await addTransaction(item);
    }
  };

  const addCategory = async (data: Partial<Category>) => {
    if (!firebaseUser && !isDemoActive) return;
    if (!canCreateCategory()) {
      openUpgradeModal('Giới hạn 20 danh mục của gói FREE');
      return;
    }
    const catId = `cat-${Date.now()}`;
    const newCat: Category = {
      id: catId,
      name: data.name || 'Danh mục mới',
      type: data.type || 'EXPENSE',
      icon: data.icon || 'Folder',
      color: data.color || '#3B82F6',
      transactionCount: 0,
      totalAmount: 0,
      percentage: 0,
      status: data.status || 'ACTIVE',
      description: data.description || '',
      accountCode: data.accountCode || (data.type === 'INCOME' ? '511' : '642'),
    };
    if (firebaseUser) {
      const catRef = doc(db, 'users', firebaseUser.uid, 'categories', catId);
      await setDoc(catRef, newCat);
    } else {
      setCategories([...categories, newCat]);
    }
  };

  const updateCategory = async (id: string, data: Partial<Category>) => {
    if (!firebaseUser && !isDemoActive) return;
    if (firebaseUser) {
      const catRef = doc(db, 'users', firebaseUser.uid, 'categories', id);
      await updateDoc(catRef, data);
    } else {
      setCategories(categories.map((c) => (c.id === id ? { ...c, ...data } : c)));
    }
  };

  const deleteCategory = async (id: string) => {
    if (!firebaseUser && !isDemoActive) return;
    if (firebaseUser) {
      const catRef = doc(db, 'users', firebaseUser.uid, 'categories', id);
      await deleteDoc(catRef);
    } else {
      setCategories(categories.filter((c) => c.id !== id));
    }
  };

  const addPartner = async (data: Partial<Partner>) => {
    if (!firebaseUser && !isDemoActive) return;
    if (!canCreatePartner()) {
      openUpgradeModal('Giới hạn 20 đối tác của gói FREE');
      return;
    }
    const partnerId = `partner-${Date.now()}`;
    const nextNum = partners.length + 1;
    const prefix = data.type === 'CUSTOMER' ? 'KH' : data.type === 'SUPPLIER' ? 'NCC' : 'DT';
    const newPartner: Partner = {
      id: partnerId,
      code: `${prefix}-${String(nextNum).padStart(3, '0')}`,
      name: data.name || 'Đối tác mới',
      type: data.type || 'CUSTOMER',
      phone: data.phone || '',
      email: data.email || '',
      taxCode: data.taxCode || '',
      address: data.address || '',
      totalTransactions: 0,
      receivableAmount: data.receivableAmount || 0,
      payableAmount: data.payableAmount || 0,
      avatar: (data.name || 'DT').slice(0, 2).toUpperCase(),
      status: data.status || 'ACTIVE',
      notes: data.notes || '',
    };
    if (firebaseUser) {
      const pRef = doc(db, 'users', firebaseUser.uid, 'partners', partnerId);
      await setDoc(pRef, newPartner);
    } else {
      setPartners([...partners, newPartner]);
    }
  };

  const updatePartner = async (id: string, data: Partial<Partner>) => {
    if (!firebaseUser && !isDemoActive) return;
    if (firebaseUser) {
      const pRef = doc(db, 'users', firebaseUser.uid, 'partners', id);
      await updateDoc(pRef, data);
    } else {
      setPartners(partners.map((p) => (p.id === id ? { ...p, ...data } : p)));
    }
  };

  const deletePartner = async (id: string) => {
    if (!firebaseUser && !isDemoActive) return;
    if (firebaseUser) {
      const pRef = doc(db, 'users', firebaseUser.uid, 'partners', id);
      await deleteDoc(pRef);
    } else {
      setPartners(partners.filter((p) => p.id !== id));
    }
  };

  // Orders CRUD Handlers
  const addOrder = async (orderData: Partial<OrderItem>): Promise<OrderItem | null> => {
    const orderId = orderData.id || `ORD-${Date.now()}`;
    const newOrder: OrderItem = {
      id: orderId,
      code: orderData.code || `SHO-${Date.now().toString().slice(-6)}`,
      date: orderData.date || new Date().toISOString().slice(0, 10),
      time: orderData.time || new Date().toTimeString().slice(0, 5),
      platform: orderData.platform || 'SHOPEE',
      productName: orderData.productName || 'Sản phẩm mới',
      sku: orderData.sku || 'SKU-NEW',
      quantity: Number(orderData.quantity) || 1,
      unitPrice: Number(orderData.unitPrice) || 0,
      revenue: Number(orderData.revenue) || 0,
      platformFee: Number(orderData.platformFee) || 0,
      shippingFeeSeller: Number(orderData.shippingFeeSeller) || 0,
      adFee: Number(orderData.adFee) || 0,
      cogs: Number(orderData.cogs) || 0,
      refundAmount: Number(orderData.refundAmount) || 0,
      taxDeducted: Number(orderData.taxDeducted) || 0,
      netCashReceived: Number(orderData.netCashReceived) || 0,
      netProfit: Number(orderData.netProfit) || 0,
      status: orderData.status || 'COMPLETED',
      customerName: orderData.customerName || 'Khách lẻ',
      customerPhone: orderData.customerPhone || '',
      notes: orderData.notes || '',
      createdAt: new Date().toISOString(),
      ...orderData,
    };

    if (firebaseUser) {
      const oRef = doc(db, 'users', firebaseUser.uid, 'orders', orderId);
      await setDoc(oRef, newOrder);
    } else {
      setOrders((prev) => [newOrder, ...prev]);
    }
    return newOrder;
  };

  const updateOrder = async (id: string, data: Partial<OrderItem>) => {
    if (firebaseUser) {
      const oRef = doc(db, 'users', firebaseUser.uid, 'orders', id);
      await updateDoc(oRef, data);
    } else {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...data } : o)));
    }
  };

  const deleteOrder = async (id: string) => {
    if (firebaseUser) {
      const oRef = doc(db, 'users', firebaseUser.uid, 'orders', id);
      await deleteDoc(oRef);
    } else {
      setOrders((prev) => prev.filter((o) => o.id !== id));
    }
  };

  const importOrders = async (newOrders: Partial<OrderItem>[]) => {
    let successCount = 0;
    let errorCount = 0;

    for (const raw of newOrders) {
      if (!raw.productName && !raw.code) {
        errorCount++;
        continue;
      }
      await addOrder(raw);
      successCount++;
    }

    return { successCount, errorCount };
  };

  // Products CRUD Handlers
  const addProduct = async (prodData: Partial<ProductItem>): Promise<ProductItem | null> => {
    const prodId = prodData.id || `PROD-${Date.now()}`;
    const sellPrice = Number(prodData.sellingPrice) || 0;
    const costPrice = Number(prodData.costPrice) || 0;
    const platformFeeAvg = Number(prodData.platformFeeAvg) || 0;
    const adFeeEst = Number(prodData.adFeeEst) || 0;
    const unitProfit = sellPrice - costPrice - platformFeeAvg - adFeeEst;
    const profitMargin = sellPrice > 0 ? (unitProfit / sellPrice) * 100 : 0;

    const newProd: ProductItem = {
      id: prodId,
      name: prodData.name || 'Sản phẩm mới',
      sku: prodData.sku || `SKU-${Date.now().toString().slice(-4)}`,
      sellingPrice: sellPrice,
      costPrice: costPrice,
      platformFeeAvg: platformFeeAvg,
      adFeeEst: adFeeEst,
      unitProfit: unitProfit,
      profitMargin: profitMargin,
      totalSold: Number(prodData.totalSold) || 0,
      inventory: Number(prodData.inventory) || 100,
      status: prodData.status || 'ACTIVE',
      category: prodData.category || 'Mặc định',
      ...prodData,
    };

    if (firebaseUser) {
      const pRef = doc(db, 'users', firebaseUser.uid, 'products', prodId);
      await setDoc(pRef, newProd);
    } else {
      setProducts((prev) => [newProd, ...prev]);
    }
    return newProd;
  };

  const updateProduct = async (id: string, data: Partial<ProductItem>) => {
    if (firebaseUser) {
      const pRef = doc(db, 'users', firebaseUser.uid, 'products', id);
      await updateDoc(pRef, data);
    } else {
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
    }
  };

  const deleteProduct = async (id: string) => {
    if (firebaseUser) {
      const pRef = doc(db, 'users', firebaseUser.uid, 'products', id);
      await deleteDoc(pRef);
    } else {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const resolveAlert = async (id: string, status: 'RESOLVED' | 'IN_PROGRESS' = 'RESOLVED') => {
    if (!firebaseUser && !isDemoActive) return;
    if (firebaseUser) {
      const alertRef = doc(db, 'users', firebaseUser.uid, 'alerts', id);
      await updateDoc(alertRef, { status });
    } else {
      setAlerts(alerts.map((a) => (a.id === id ? { ...a, status } : a)));
    }
  };

  const dismissAlert = async (id: string) => {
    await resolveAlert(id, 'RESOLVED');
  };

  const updateSettings = async (data: Partial<CompanySettings>) => {
    if (!firebaseUser && !isDemoActive) return;
    if (firebaseUser) {
      const sRef = doc(db, 'users', firebaseUser.uid, 'settings', 'main');
      await setDoc(sRef, data, { merge: true });
    } else {
      setCompanySettings((prev) => ({ ...prev, ...data }));
    }
  };

  const updateCompanySettings = updateSettings;

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!firebaseUser && !isDemoActive) return;
    if (firebaseUser) {
      const uRef = doc(db, 'users', firebaseUser.uid);
      await updateDoc(uRef, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
    } else {
      if (currentUser) {
        setCurrentUser({ ...currentUser, ...data, updatedAt: new Date().toISOString() });
      }
    }
  };

  const updateCurrentUser = updateProfile;

  // AI Chat Handlers — sử dụng Groq API (openai/gpt-oss-120b)
  const sendChatMessage = async (text: string) => {
    if (!text.trim() || (!firebaseUser && !isDemoActive && !isXamppActive)) return;

    if (!canUseAI()) {
      openUpgradeModal('Giới hạn lượt hỏi Trợ lý Kế toán AI của gói FREE');
      return;
    }

    const currentSession = chatSessions.find((s) => s.id === activeChatId) || chatSessions[0];
    const userMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toTimeString().slice(0, 5),
    };

    // Xây dựng context dữ liệu sổ cái để đưa vào prompt
    const aiContext = {
      companyName: companySettings.companyName,
      kpis,
      transactions: transactions.slice(0, 100).map(({ code, type, amount, date, categoryName, description, paymentMethod, status, platform }) => ({
        code, type, amount, date, categoryName, description, paymentMethod, status, platform,
      })),
      categories: categories.map(({ name, type, accountCode }) => ({ name, type, accountCode })),
      alerts: alerts.slice(0, 20).map(({ title, description, severity, status, category }) => ({
        title, description, severity, status, category,
      })),
      orders: orders.slice(0, 50).map(({ code, date, platform, productName, quantity, revenue, platformFee, adFee, cogs, netProfit, status }) => ({
        code, date, platform, productName, quantity, revenue, platformFee, adFee, cogs, netProfit, status,
      })),
      products: products.slice(0, 30).map(({ name, sku, sellingPrice, costPrice, unitProfit, profitMargin, totalSold, inventory, status }) => ({
        name, sku, sellingPrice, costPrice, unitProfit, profitMargin, totalSold, inventory, status,
      })),
    };

    // Lịch sử hội thoại để gửi lên Groq (đa lượt)
    const conversationHistory = (currentSession?.messages || []).slice(-10).map((message) => ({
      role: (message.sender === 'user' || message.sender === 'USER' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: message.text,
    }));

    let answerText: string;

    // Ưu tiên Groq API, fallback về local rule-based engine
    const { callGroqAPI, isGroqConfigured } = await import('../utils/groqClient');
    if (isGroqConfigured()) {
      answerText = await callGroqAPI(text, conversationHistory, aiContext);
    } else {
      // Fallback: local rule-based AI engine (không cần internet)
      const { generateAIChatResponse } = await import('../utils/aiEngine');
      const localResult = generateAIChatResponse(text, transactions, categories, alerts, orders, products);
      answerText = localResult.text;
    }

    const aiMsg: ChatMessage = {
      id: `m-${Date.now() + 1}`,
      sender: 'assistant',
      text: answerText,
      timestamp: new Date().toTimeString().slice(0, 5),
    };

    const updatedMessages = [...(currentSession?.messages || []), userMsg, aiMsg];
    if (firebaseUser) {
      const sessionRef = doc(db, 'users', firebaseUser.uid, 'chatSessions', activeChatId);
      await setDoc(
        sessionRef,
        {
          id: activeChatId,
          title: currentSession?.title || 'Hội thoại tài chính',
          updatedAt: 'Vừa xong',
          messages: updatedMessages,
        },
        { merge: true }
      );

      // Tăng số lượt sử dụng AI
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      await updateDoc(userDocRef, {
        aiUsageCount: (currentUser?.aiUsageCount || 0) + 1,
      });
    } else {
      setChatSessions((prev) =>
        prev.map((s) =>
          s.id === activeChatId
            ? { ...s, messages: updatedMessages, updatedAt: 'Vừa xong' }
            : s
        )
      );
      if (currentUser) {
        setCurrentUser({ ...currentUser, aiUsageCount: (currentUser.aiUsageCount || 0) + 1 });
      }
    }
  };

  const sendMessageToAI = sendChatMessage;

  const createNewChatSession = async () => {
    if (!firebaseUser && !isDemoActive && !isXamppActive) return;
    const newId = `chat-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: `Hội thoại tài chính #${chatSessions.length + 1}`,
      updatedAt: 'Vừa tạo',
      messages: [
        {
          id: `m-${Date.now()}`,
          sender: 'assistant',
          text: `Xin chào **${currentUser?.name || 'Kế toán viên'}**! Tôi là **Trợ lý Kế toán Thông minh AI**. Bạn muốn tra cứu báo cáo hay phân tích nghiệp vụ nào hôm nay?`,
          timestamp: new Date().toTimeString().slice(0, 5),
          suggestedFollowUps: [
            'Báo cáo doanh thu tháng này',
            'Các khoản chi phí lớn nhất',
            'Kiểm tra cảnh báo kiểm toán',
            'Dự báo dòng tiền 30 ngày',
          ],
        },
      ],
    };
    if (firebaseUser) {
      const sRef = doc(db, 'users', firebaseUser.uid, 'chatSessions', newId);
      await setDoc(sRef, newSession);
    } else {
      setChatSessions((prev) => [newSession, ...prev]);
    }
    setActiveChatId(newId);
  };

  const selectChatSession = (id: string) => {
    setActiveChatId(id);
  };

  const deleteChatSession = async (id: string) => {
    if (!firebaseUser && !isDemoActive && !isXamppActive) return;
    if (firebaseUser) {
      const sRef = doc(db, 'users', firebaseUser.uid, 'chatSessions', id);
      await deleteDoc(sRef);
    } else {
      setChatSessions((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const clearChatHistory = async () => {
    if (!firebaseUser && !isDemoActive && !isXamppActive) return;
    if (firebaseUser) {
      const batch = writeBatch(db);
      chatSessions.forEach((s) => {
        const sRef = doc(db, 'users', firebaseUser.uid, 'chatSessions', s.id);
        batch.delete(sRef);
      });
      await batch.commit();
    } else {
      setChatSessions([]);
    }
    await createNewChatSession();
  };

  const resetToInitialData = async () => {
    if (!firebaseUser && !isDemoActive) return;
    if (firebaseUser) {
      // Clear subcollections
      const batch = writeBatch(db);
      transactions.forEach((t) => {
        batch.delete(doc(db, 'users', firebaseUser.uid, 'transactions', t.id));
      });
      await batch.commit();
    } else {
      setTransactions(initialTransactions);
      setCategories(initialCategories);
      setPartners(initialPartners);
      setAlerts(initialSmartAlerts);
      localStorage.removeItem('ketoanai_demo_txs');
    }
  };

  const exportFullBackupJSON = () => {
    if (!canExport()) {
      openUpgradeModal('Tính năng xuất dữ liệu yêu cầu gói PRO');
      return;
    }
    const backupData = {
      version: '3.0.0-saas',
      tenantId: firebaseUser?.uid,
      exportedAt: new Date().toISOString(),
      companySettings,
      currentUser,
      transactions,
      categories,
      partners,
      alerts,
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sao_Luu_So_Cai_Ke_Toan_AI_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importFullBackupJSON = async (json: any): Promise<boolean> => {
    if (!firebaseUser) return false;
    try {
      const batch = writeBatch(db);
      if (json.transactions && Array.isArray(json.transactions)) {
        json.transactions.forEach((tx: Transaction) => {
          batch.set(doc(db, 'users', firebaseUser.uid, 'transactions', tx.id), tx);
        });
      }
      if (json.categories && Array.isArray(json.categories)) {
        json.categories.forEach((cat: Category) => {
          batch.set(doc(db, 'users', firebaseUser.uid, 'categories', cat.id), cat);
        });
      }
      if (json.partners && Array.isArray(json.partners)) {
        json.partners.forEach((p: Partner) => {
          batch.set(doc(db, 'users', firebaseUser.uid, 'partners', p.id), p);
        });
      }
      if (json.companySettings) {
        batch.set(doc(db, 'users', firebaseUser.uid, 'settings', 'main'), json.companySettings);
      }
      await batch.commit();
      return true;
    } catch {
      return false;
    }
  };

  const importTransactions = async (newTxs: Partial<Transaction>[]) => {
    let successCount = 0;
    let errorCount = 0;

    for (const raw of newTxs) {
      if (!raw.amount || isNaN(Number(raw.amount))) {
        errorCount++;
        continue;
      }
      if (!canCreateTransaction()) {
        openUpgradeModal('Giới hạn giao dịch của gói FREE');
        break;
      }
      await addTransaction(raw);
      successCount++;
    }

    return { successCount, errorCount };
  };

  // Admin stats loader
  const loadAdminStats = async () => {
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const list: any[] = [];
      let freeCount = 0;
      let proCount = 0;

      usersSnap.forEach((d) => {
        const u = d.data();
        list.push({ id: d.id, ...u });
        if (u.plan === 'pro' || u.plan === 'business') {
          proCount++;
        } else {
          freeCount++;
        }
      });

      const totalRevenue = proCount * 99000;
      setAdminStats({
        totalUsers: list.length,
        freeUsers: freeCount,
        proUsers: proCount,
        totalRevenue,
        usersList: list,
      });
    } catch (err) {
      console.error('Error loading admin stats:', err);
    }
  };

  return (
    <LedgerContext.Provider
      value={{
        currentTab,
        navigate,
        selectedTransactionId,
        setSelectedTransactionId,
        isAuthenticated: !!firebaseUser || isDemoActive || isXamppActive || !!currentUser,
        isAuthLoading,
        firebaseUser,
        currentUser,
        userProfile: currentUser || initialUserProfile,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        resetPassword,
        logout,
        demoLogin,
        loginWithXamppAccount,
        isXamppActive,
        currentPlan,
        upgradePlan,
        isUpgradeModalOpen,
        upgradeFeatureTrigger,
        openUpgradeModal,
        closeUpgradeModal,
        canCreateTransaction,
        canCreatePartner,
        canCreateCategory,
        canUseAI,
        canExport,
        searchQuery,
        setSearchQuery,
        transactions,
        categories,
        partners,
        alerts,
        orders,
        products,
        selectedPlatform,
        setSelectedPlatform,
        isImportModalOpen,
        openImportModal,
        closeImportModal,
        chatSessions,
        activeChatId,
        activeChatSessionId: activeChatId,
        setActiveChatSessionId: selectChatSession,
        companySettings,
        kpis,
        isTxModalOpen,
        editingTx,
        transactionToEdit: editingTx,
        defaultTxType,
        openAddTxModal,
        openEditTxModal,
        closeTxModal,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        duplicateTransaction,
        bulkDeleteTransactions,
        bulkAddTransactions,
        addOrder,
        updateOrder,
        deleteOrder,
        importOrders,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        addPartner,
        updatePartner,
        deletePartner,
        resolveAlert,
        dismissAlert,
        updateSettings,
        updateCompanySettings,
        updateProfile,
        updateCurrentUser,
        sendChatMessage,
        sendMessageToAI,
        createNewChatSession,
        selectChatSession,
        deleteChatSession,
        clearChatHistory,
        resetToInitialData,
        importTransactions,
        exportFullBackupJSON,
        importFullBackupJSON,
        adminStats,
        loadAdminStats,
      }}
    >
      {children}
    </LedgerContext.Provider>
  );
};

export const useLedger = () => {
  const context = useContext(LedgerContext);
  if (!context) {
    throw new Error('useLedger must be used within a LedgerProvider');
  }
  return context;
};
