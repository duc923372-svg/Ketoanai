<?php
// ==============================================================================
// KẾ TOÁN AI SMART LEDGER - KẾT NỐI CƠ SỞ DỮ LIỆU XAMPP (PDO MYSQL)
// ==============================================================================

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Xử lý pre-flight request của CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = '127.0.0.1';
$port = '3306';
$dbname = 'smart_ledger_db';
$username = 'root';
$password = ''; // Mặc định trong XAMPP để trống

try {
    $dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];
    $pdo = new PDO($dsn, $username, $password, $options);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi kết nối MySQL trong XAMPP: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
    exit();
}
