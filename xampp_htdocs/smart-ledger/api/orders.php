<?php
require_once __DIR__ . '/../config/db.php';

try {
    $platform = isset($_GET['platform']) ? trim($_GET['platform']) : '';
    $sql = "SELECT * FROM ecommerce_orders WHERE 1=1";
    $params = [];

    if (!empty($platform) && $platform !== 'ALL') {
        $sql .= " AND platform = :platform";
        $params[':platform'] = $platform;
    }

    $sql .= " ORDER BY date DESC, time DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
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
