import React, { useState } from 'react';
import { LedgerProvider, useLedger } from './context/LedgerContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { TransactionModal } from './components/modals/TransactionModal';
import { UpgradeModal } from './components/modals/UpgradeModal';

// 16 Core Stitch Screen Views & New SaaS Views
import { LandingView } from './views/LandingView';
import { AuthView } from './views/AuthView';
import { PricingView } from './views/PricingView';
import { SubscriptionBillingView } from './views/SubscriptionBillingView';
import { AdminView } from './views/AdminView';

import { DashboardView } from './views/DashboardView';
import { TransactionsView } from './views/TransactionsView';
import { TransactionDetailView } from './views/TransactionDetailView';
import { CategoriesView } from './views/CategoriesView';
import { PartnersView } from './views/PartnersView';
import { CashLedgerView } from './views/CashLedgerView';
import { ReportsView } from './views/ReportsView';
import { RevenueExpenseReportView } from './views/RevenueExpenseReportView';
import { AIAnalyticsView } from './views/AIAnalyticsView';
import { AIChatAssistantView } from './views/AIChatAssistantView';
import { SmartAlertsView } from './views/SmartAlertsView';
import { SettingsView } from './views/SettingsView';
import { DataManagementView } from './views/DataManagementView';
import { UserProfileView } from './views/UserProfileView';

const AppContent: React.FC = () => {
  const {
    currentTab,
    isAuthenticated,
    isAuthLoading,
    isTxModalOpen,
    closeTxModal,
    transactionToEdit,
    defaultTxType,
    isUpgradeModalOpen,
    closeUpgradeModal,
    upgradeFeatureTrigger,
  } = useLedger();

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ketoanai_sidebar_open');
      if (saved !== null) return saved === 'true';
      return window.innerWidth >= 1024;
    }
    return true;
  });

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => {
      const next = !prev;
      localStorage.setItem('ketoanai_sidebar_open', String(next));
      return next;
    });
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    localStorage.setItem('ketoanai_sidebar_open', 'false');
  };

  // If initial auth is checking, show elegant loader
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-sans">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-slate-950 text-xl shadow-xl shadow-emerald-500/20 animate-pulse mb-4">
          K
        </div>
        <div className="text-sm font-bold text-slate-200">Kế Toán AI Smart Ledger</div>
        <p className="text-xs text-slate-500 mt-1">Đang khởi tạo phiên làm việc bảo mật Firestore...</p>
      </div>
    );
  }

  // Full-page Public Views (Landing & Auth)
  if (currentTab === 'landing') {
    return (
      <>
        <LandingView />
        <UpgradeModal
          isOpen={isUpgradeModalOpen}
          onClose={closeUpgradeModal}
          featureTrigger={upgradeFeatureTrigger}
        />
      </>
    );
  }

  if (currentTab === 'auth') {
    return (
      <>
        <AuthView />
        <UpgradeModal
          isOpen={isUpgradeModalOpen}
          onClose={closeUpgradeModal}
          featureTrigger={upgradeFeatureTrigger}
        />
      </>
    );
  }

  // If public guest accesses Pricing page
  if (currentTab === 'pricing' && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <PricingView />
        </div>
        <UpgradeModal
          isOpen={isUpgradeModalOpen}
          onClose={closeUpgradeModal}
          featureTrigger={upgradeFeatureTrigger}
        />
      </div>
    );
  }

  // Authenticated App Shell & Screens
  const renderActiveScreen = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'transactions':
        return <TransactionsView />;
      case 'transaction-detail':
        return <TransactionDetailView />;
      case 'categories':
        return <CategoriesView />;
      case 'partners':
        return <PartnersView />;
      case 'cash-ledger':
        return <CashLedgerView />;
      case 'reports':
        return <ReportsView />;
      case 'revenue-expense':
      case 'revenue-expense-report':
        return <RevenueExpenseReportView />;
      case 'ai-analytics':
        return <AIAnalyticsView />;
      case 'ai-chat':
        return <AIChatAssistantView />;
      case 'smart-alerts':
        return <SmartAlertsView />;
      case 'subscription':
        return <SubscriptionBillingView />;
      case 'pricing':
        return <PricingView />;
      case 'admin':
        return <AdminView />;
      case 'settings':
        return <SettingsView />;
      case 'data-management':
        return <DataManagementView />;
      case 'user-profile':
        return <UserProfileView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 font-sans text-slate-900 overflow-hidden">
      {/* Navigation Sidebar - Conditional render để không chiếm layout khi đóng */}
      {isSidebarOpen && <Sidebar onClose={handleCloseSidebar} />}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-slate-100 dark-scrollbar">
        <Header isSidebarOpen={isSidebarOpen} onMenuToggle={handleToggleSidebar} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            {renderActiveScreen()}
          </div>
        </main>
      </div>

      {/* Global Transaction Modal */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={closeTxModal}
        transactionToEdit={transactionToEdit}
        defaultType={defaultTxType}
      />

      {/* Global SaaS Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={closeUpgradeModal}
        featureTrigger={upgradeFeatureTrigger}
      />
    </div>
  );
};

export default function App() {
  return (
    <LedgerProvider>
      <AppContent />
    </LedgerProvider>
  );
}
