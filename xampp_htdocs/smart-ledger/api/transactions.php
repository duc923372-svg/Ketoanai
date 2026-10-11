<?php
require_once __DIR__ . '/../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        try {
            $type = isset($_GET['type']) ? trim($_GET['type']) : '';
            $search = isset($_GET['q']) ? trim($_GET['q']) : '';
            
            $sql = "SELECT t.*, c.name AS category_name, c.icon AS category_icon, p.name AS partner_name 
                    FROM transactions t
                    LEFT JOIN categories c ON t.category_id = c.id
                    LEFT JOIN partners p ON t.partner_id = p.id
                    WHERE 1=1";
            $params = [];

            if (!empty($type) && in_array($type, ['INCOME', 'EXPENSE'])) {
                $sql .= " AND t.type = :type";
                $params[':type'] = $type;
            }

            if (!empty($search)) {
                $sql .= " AND (t.code LIKE :q1 OR t.description LIKE :q2 OR p.name LIKE :q3)";
                $params[':q1'] = "%$search%";
                $params[':q2'] = "%$search%";
                $params[':q3'] = "%$search%";
            }

            $sql .= " ORDER BY t.date DESC, t.time DESC";
            
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
        break;

    case 'POST':
        try {
            $rawInput = file_get_contents('php://input');
            $body = json_decode($rawInput, true);

            if (!$body) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Dữ liệu JSON không hợp lệ']);
                exit();
            }

            $id = !empty($body['id']) ? $body['id'] : 'tx-' . round(microtime(true) * 1000);
            $tenantId = !empty($body['tenant_id']) ? $body['tenant_id'] : 'tenant-demo-01';
            $code = !empty($body['code']) ? $body['code'] : 'GD-' . rand(1000, 9999);
            $type = !empty($body['type']) ? $body['type'] : 'EXPENSE';
            $amount = floatval($body['amount'] ?? 0);
            $date = !empty($body['date']) ? $body['date'] : date('Y-m-d');
            $time = !empty($body['time']) ? $body['time'] : date('H:i');
            $categoryId = !empty($body['category_id']) ? $body['category_id'] : null;
            $partnerId = !empty($body['partner_id']) ? $body['partner_id'] : null;
            $paymentMethod = !empty($body['payment_method']) ? $body['payment_method'] : 'BANK_TRANSFER';
            $platform = !empty($body['platform']) ? $body['platform'] : 'OTHER';
            $description = !empty($body['description']) ? $body['description'] : 'Giao dịch mới';

            $sql = "INSERT INTO transactions 
                    (id, tenant_id, code, type, amount, date, time, category_id, partner_id, payment_method, platform, description) 
                    VALUES 
                    (:id, :tenant_id, :code, :type, :amount, :date, :time, :category_id, :partner_id, :payment_method, :platform, :description)";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':id' => $id,
                ':tenant_id' => $tenantId,
                ':code' => $code,
                ':type' => $type,
                ':amount' => $amount,
                ':date' => $date,
                ':time' => $time,
                ':category_id' => $categoryId,
                ':partner_id' => $partnerId,
                ':payment_method' => $paymentMethod,
                ':platform' => $platform,
                ':description' => $description
            ]);

            echo json_encode([
                'success' => true,
                'message' => 'Tạo giao dịch thành công',
                'id' => $id,
                'code' => $code
            ], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Phương thức HTTP không được hỗ trợ']);
        break;
}
