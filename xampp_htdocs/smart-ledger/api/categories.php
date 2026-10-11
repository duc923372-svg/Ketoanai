<?php
require_once __DIR__ . '/../config/db.php';

try {
    $sql = "SELECT c.*, 
            COALESCE(COUNT(t.id), 0) AS transaction_count,
            COALESCE(SUM(t.amount), 0) AS total_amount
            FROM categories c
            LEFT JOIN transactions t ON c.id = t.category_id AND t.status = 'COMPLETED'
            GROUP BY c.id
            ORDER BY c.type ASC, total_amount DESC";
    
    $stmt = $pdo->query($sql);
    $data = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'count' => count($data),
        'data' => $data
    ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
