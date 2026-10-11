<?php
require_once __DIR__ . '/../config/db.php';

try {
    // 1. Tổng thu chi từ bảng transactions
    $stmtTx = $pdo->query("SELECT 
        COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END), 0) AS total_revenue,
        COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END), 0) AS total_expense,
        COUNT(id) AS transaction_count
        FROM transactions WHERE status = 'COMPLETED'");
    $txStats = $stmtTx->fetch();

    $totalRevenue = floatval($txStats['total_revenue']);
    $totalExpense = floatval($txStats['total_expense']);
    $netProfit = $totalRevenue - $totalExpense;
    $profitMargin = $totalRevenue > 0 ? round(($netProfit / $totalRevenue) * 100, 2) : 0;

    // 2. Thống kê đơn hàng sàn TMĐT
    $stmtOrders = $pdo->query("SELECT 
        COUNT(id) AS total_orders,
        COALESCE(SUM(revenue), 0) AS order_revenue,
        COALESCE(SUM(platform_fee), 0) AS total_platform_fee,
        COALESCE(SUM(net_cash_received), 0) AS total_cash_received,
        COALESCE(SUM(net_profit), 0) AS total_order_profit
        FROM ecommerce_orders WHERE status = 'COMPLETED'");
    $orderStats = $stmtOrders->fetch();

    // 3. Số dư quỹ tiền mặt & ngân hàng
    $stmtCash = $pdo->query("SELECT 
        COALESCE(SUM(CASE WHEN payment_method = 'CASH' AND type = 'INCOME' THEN amount 
                          WHEN payment_method = 'CASH' AND type = 'EXPENSE' THEN -amount ELSE 0 END), 0) AS cash_balance,
        COALESCE(SUM(CASE WHEN payment_method IN ('BANK_TRANSFER', 'SHOPEE_PAY') AND type = 'INCOME' THEN amount 
                          WHEN payment_method IN ('BANK_TRANSFER', 'SHOPEE_PAY') AND type = 'EXPENSE' THEN -amount ELSE 0 END), 0) AS bank_balance
        FROM transactions WHERE status = 'COMPLETED'");
    $balances = $stmtCash->fetch();

    echo json_encode([
        'success' => true,
        'kpis' => [
            'totalRevenue' => $totalRevenue,
            'totalExpense' => $totalExpense,
            'netProfit' => $netProfit,
            'profitMargin' => $profitMargin,
            'transactionCount' => intval($txStats['transaction_count']),
            'cashBalance' => floatval($balances['cash_balance']),
            'bankBalance' => floatval($balances['bank_balance']),
            'totalBalance' => floatval($balances['cash_balance']) + floatval($balances['bank_balance']),
            'ecommerce' => [
                'totalOrders' => intval($orderStats['total_orders']),
                'grossRevenue' => floatval($orderStats['order_revenue']),
                'platformFee' => floatval($orderStats['total_platform_fee']),
                'cashReceived' => floatval($orderStats['total_cash_received']),
                'orderProfit' => floatval($orderStats['total_order_profit'])
            ]
        ]
    ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
