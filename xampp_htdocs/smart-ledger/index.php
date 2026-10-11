<?php
require_once __DIR__ . '/config/db.php';

// Fetch quick stats
$kpis = [
    'total_rev' => 0,
    'total_exp' => 0,
    'net_profit' => 0,
    'tx_count' => 0,
];

try {
    $res = $pdo->query("SELECT 
        SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END) AS total_rev,
        SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END) AS total_exp,
        COUNT(id) AS tx_count
        FROM transactions WHERE status = 'COMPLETED'")->fetch();
    if ($res) {
        $kpis['total_rev'] = floatval($res['total_rev']);
        $kpis['total_exp'] = floatval($res['total_exp']);
        $kpis['net_profit'] = $kpis['total_rev'] - $kpis['total_exp'];
        $kpis['tx_count'] = intval($res['tx_count']);
    }

    $recentTxs = $pdo->query("SELECT t.*, c.name AS cat_name, p.name AS partner_name 
                              FROM transactions t 
                              LEFT JOIN categories c ON t.category_id = c.id 
                              LEFT JOIN partners p ON t.partner_id = p.id 
                              ORDER BY t.date DESC, t.time DESC LIMIT 10")->fetchAll();

    $recentOrders = $pdo->query("SELECT * FROM ecommerce_orders ORDER BY date DESC, time DESC LIMIT 5")->fetchAll();
} catch (Exception $e) {
    $dbError = $e->getMessage();
}
?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kế Toán AI Smart Ledger - XAMPP Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
    </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen">

    <!-- Top Navigation -->
    <header class="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-slate-950 text-lg shadow-lg shadow-emerald-500/20">
                    K
                </div>
                <div>
                    <h1 class="text-base font-bold text-white leading-tight">Kế Toán AI Smart Ledger</h1>
                    <p class="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        XAMPP MySQL Active: <span class="text-slate-300 font-mono">smart_ledger_db</span>
                    </p>
                </div>
            </div>

            <div class="flex items-center gap-3">
                <a href="/phpmyadmin/index.php?route=/database/structure&db=smart_ledger_db" target="_blank" 
                   class="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700 flex items-center gap-2">
                    <svg class="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7zM9 9h6M9 13h6M9 17h4"/></svg>
                    Mở phpMyAdmin
                </a>
                <a href="api/kpis.php" target="_blank" 
                   class="px-3.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold transition border border-emerald-500/30 flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
                    REST APIs
                </a>
            </div>
        </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        <!-- KPI Overview Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Doanh thu -->
            <div class="p-5 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden">
                <div class="text-xs font-medium text-slate-400">Tổng Doanh Thu</div>
                <div class="text-2xl font-extrabold text-emerald-400 mt-2">
                    <?= number_format($kpis['total_rev'], 0, ',', '.') ?> <span class="text-xs font-semibold text-slate-400">VNĐ</span>
                </div>
                <div class="text-xs text-slate-500 mt-1">Từ Shopee, TikTok & POS</div>
                <div class="absolute -right-2 -bottom-2 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl pointer-events-none"></div>
            </div>

            <!-- Chi phí -->
            <div class="p-5 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden">
                <div class="text-xs font-medium text-slate-400">Tổng Chi Phí</div>
                <div class="text-2xl font-extrabold text-rose-400 mt-2">
                    <?= number_format($kpis['total_exp'], 0, ',', '.') ?> <span class="text-xs font-semibold text-slate-400">VNĐ</span>
                </div>
                <div class="text-xs text-slate-500 mt-1">Giá vốn, Phí sàn & Quảng cáo</div>
                <div class="absolute -right-2 -bottom-2 w-16 h-16 bg-rose-500/5 rounded-full blur-xl pointer-events-none"></div>
            </div>

            <!-- Lợi nhuận ròng -->
            <div class="p-5 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden">
                <div class="text-xs font-medium text-slate-400">Lợi Nhuận Ròng Thực Tế</div>
                <div class="text-2xl font-extrabold <?= $kpis['net_profit'] >= 0 ? 'text-teal-300' : 'text-rose-400' ?> mt-2">
                    <?= number_format($kpis['net_profit'], 0, ',', '.') ?> <span class="text-xs font-semibold text-slate-400">VNĐ</span>
                </div>
                <div class="text-xs text-slate-500 mt-1">Doanh thu trừ toàn bộ chi phí</div>
                <div class="absolute -right-2 -bottom-2 w-16 h-16 bg-teal-500/5 rounded-full blur-xl pointer-events-none"></div>
            </div>

            <!-- Tổng giao dịch -->
            <div class="p-5 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden">
                <div class="text-xs font-medium text-slate-400">Số Bút Toán Ghi Sổ</div>
                <div class="text-2xl font-extrabold text-white mt-2">
                    <?= number_format($kpis['tx_count']) ?> <span class="text-xs font-semibold text-slate-400">giao dịch</span>
                </div>
                <div class="text-xs text-emerald-400 mt-1">Đã lưu trữ an toàn trong MySQL</div>
                <div class="absolute -right-2 -bottom-2 w-16 h-16 bg-indigo-500/5 rounded-full blur-xl pointer-events-none"></div>
            </div>
        </div>

        <!-- Recent Transactions Table -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                    <h2 class="text-base font-bold text-white">Sổ Quỹ Thu Chi Mới Nhất</h2>
                    <p class="text-xs text-slate-400 mt-0.5">Dữ liệu đọc trực tiếp từ bảng <code class="text-emerald-400">transactions</code></p>
                </div>
                <a href="api/transactions.php" target="_blank" class="text-xs text-emerald-400 hover:text-emerald-300 font-medium">Xem dạng JSON &rarr;</a>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm text-slate-300">
                    <thead class="bg-slate-950/50 text-xs uppercase text-slate-400 font-semibold border-b border-slate-800">
                        <tr>
                            <th class="px-6 py-3.5">Mã GD</th>
                            <th class="px-6 py-3.5">Ngày giờ</th>
                            <th class="px-6 py-3.5">Diễn giải</th>
                            <th class="px-6 py-3.5">Danh mục</th>
                            <th class="px-6 py-3.5">Đối tác / Sàn</th>
                            <th class="px-6 py-3.5 text-right">Số tiền</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-800/60 font-sans">
                        <?php if (!empty($recentTxs)): ?>
                            <?php foreach ($recentTxs as $tx): ?>
                                <tr class="hover:bg-slate-800/30 transition">
                                    <td class="px-6 py-3.5 font-mono text-xs font-bold text-slate-200"><?= htmlspecialchars($tx['code']) ?></td>
                                    <td class="px-6 py-3.5 text-xs text-slate-400"><?= htmlspecialchars($tx['date']) ?> <span class="text-slate-600"><?= htmlspecialchars($tx['time']) ?></span></td>
                                    <td class="px-6 py-3.5 text-slate-200 font-medium max-w-xs truncate"><?= htmlspecialchars($tx['description']) ?></td>
                                    <td class="px-6 py-3.5 text-xs text-slate-400"><?= htmlspecialchars($tx['cat_name'] ?? 'Chưa phân loại') ?></td>
                                    <td class="px-6 py-3.5">
                                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                                            <?= htmlspecialchars($tx['platform']) ?>
                                        </span>
                                    </td>
                                    <td class="px-6 py-3.5 text-right font-bold text-xs font-mono <?= $tx['type'] === 'INCOME' ? 'text-emerald-400' : 'text-rose-400' ?>">
                                        <?= $tx['type'] === 'INCOME' ? '+' : '-' ?><?= number_format($tx['amount'], 0, ',', '.') ?> đ
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        <?php else: ?>
                            <tr>
                                <td colspan="6" class="px-6 py-8 text-center text-slate-500">Chưa có giao dịch nào được ghi sổ.</td>
                            </tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Ecommerce Orders Table -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                    <h2 class="text-base font-bold text-white">Đơn Hàng Sàn TMĐT Bóc Tách Chi Phí</h2>
                    <p class="text-xs text-slate-400 mt-0.5">Dữ liệu đọc trực tiếp từ bảng <code class="text-emerald-400">ecommerce_orders</code></p>
                </div>
                <a href="api/orders.php" target="_blank" class="text-xs text-emerald-400 hover:text-emerald-300 font-medium">Xem dạng JSON &rarr;</a>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm text-slate-300">
                    <thead class="bg-slate-950/50 text-xs uppercase text-slate-400 font-semibold border-b border-slate-800">
                        <tr>
                            <th class="px-6 py-3.5">Mã đơn</th>
                            <th class="px-6 py-3.5">Sàn</th>
                            <th class="px-6 py-3.5">Sản phẩm</th>
                            <th class="px-6 py-3.5 text-right">Doanh thu gộp</th>
                            <th class="px-6 py-3.5 text-right">Phí sàn</th>
                            <th class="px-6 py-3.5 text-right">Thực nhận ví</th>
                            <th class="px-6 py-3.5 text-right">Lợi nhuận</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-800/60 font-sans">
                        <?php if (!empty($recentOrders)): ?>
                            <?php foreach ($recentOrders as $ord): ?>
                                <tr class="hover:bg-slate-800/30 transition">
                                    <td class="px-6 py-3.5 font-mono text-xs text-slate-200"><?= htmlspecialchars($ord['code']) ?></td>
                                    <td class="px-6 py-3.5">
                                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold <?= $ord['platform'] === 'SHOPEE' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-pink-500/10 text-pink-400 border border-pink-500/20' ?>">
                                            <?= htmlspecialchars($ord['platform']) ?>
                                        </span>
                                    </td>
                                    <td class="px-6 py-3.5 text-slate-200 text-xs"><?= htmlspecialchars($ord['product_name']) ?></td>
                                    <td class="px-6 py-3.5 text-right font-mono text-xs"><?= number_format($ord['revenue'], 0, ',', '.') ?> đ</td>
                                    <td class="px-6 py-3.5 text-right font-mono text-xs text-rose-400">-<?= number_format($ord['platform_fee'], 0, ',', '.') ?> đ</td>
                                    <td class="px-6 py-3.5 text-right font-mono text-xs text-teal-400"><?= number_format($ord['net_cash_received'], 0, ',', '.') ?> đ</td>
                                    <td class="px-6 py-3.5 text-right font-mono text-xs font-bold text-emerald-400">+<?= number_format($ord['net_profit'], 0, ',', '.') ?> đ</td>
                                </tr>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>

    </main>

</body>
</html>
