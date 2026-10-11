import { Transaction, FinancialKPIs } from '../types';

export const formatCurrency = (amount: number, currency: 'VND' | 'USD' = 'VND'): string => {
  if (isNaN(amount)) return '0 ₫';
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }
  return new Intl.NumberFormat('vi-VN').format(Math.round(amount)) + ' ₫';
};

export const formatShortCurrency = (amount: number): string => {
  const abs = Math.abs(amount);
  if (abs >= 1_000_000_000) {
    return (amount / 1_000_000_000).toFixed(1).replace('.0', '') + ' Tỷ';
  }
  if (abs >= 1_000_000) {
    return (amount / 1_000_000).toFixed(1).replace('.0', '') + ' Tr';
  }
  if (abs >= 1_000) {
    return (amount / 1_000).toFixed(0) + ' K';
  }
  return amount.toLocaleString('vi-VN') + ' ₫';
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

export const calculateKPIs = (transactions: Transaction[]): FinancialKPIs => {
  let totalRevenue = 0;
  let totalExpense = 0;
  let cashBalance = 52500000; // Số dư tiền mặt khởi tạo
  let bankBalance = 384200000; // Số dư ngân hàng khởi tạo

  transactions.forEach((tx) => {
    if (tx.status === 'CANCELLED') return;
    if (tx.type === 'INCOME') {
      totalRevenue += tx.amount;
      if (tx.paymentMethod === 'CASH') cashBalance += tx.amount;
      else bankBalance += tx.amount;
    } else {
      totalExpense += tx.amount;
      if (tx.paymentMethod === 'CASH') cashBalance -= tx.amount;
      else bankBalance -= tx.amount;
    }
  });

  const netProfit = totalRevenue - totalExpense;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  const totalBalance = cashBalance + bankBalance;

  return {
    totalRevenue,
    totalExpense,
    netProfit,
    profitMargin,
    cashBalance,
    bankBalance,
    totalBalance,
    transactionCount: transactions.length,
    revenueGrowth: 14.8,
    expenseGrowth: -3.2,
    profitGrowth: 28.5,
  };
};

export const exportToCSV = (data: Record<string, any>[], filename = 'ke-toan-smart-ledger.csv') => {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map((obj) =>
    headers
      .map((header) => {
        const val = obj[header] === undefined || obj[header] === null ? '' : String(obj[header]);
        const escaped = val.replace(/"/g, '""');
        return `"${escaped}"`;
      })
      .join(',')
  );

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
