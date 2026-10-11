<?php
// ==============================================================================
// KẾ TOÁN AI SMART LEDGER - API XÁC THỰC NGƯỜI DÙNG XAMPP MYSQL
// ==============================================================================

require_once __DIR__ . '/../config/db.php';

$action = isset($_GET['action']) ? $_GET['action'] : 'login';
$method = $_SERVER['REQUEST_METHOD'];

switch ($action) {
    // 1. ĐĂNG NHẬP (LOGIN)
    case 'login':
        if ($method !== 'POST') {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Yêu cầu phương thức POST']);
            exit();
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $email = trim($input['email'] ?? '');
        $password = trim($input['password'] ?? '');

        if (empty($email)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Vui lòng cung cấp email']);
            exit();
        }

        try {
            // Tìm user trong bảng users của XAMPP MySQL
            $stmt = $pdo->prepare("SELECT u.*, t.company_name, t.accounting_standard, t.currency 
                                  FROM users u 
                                  LEFT JOIN tenants t ON u.tenant_id = t.id 
                                  WHERE u.email = :email LIMIT 1");
            $stmt->execute([':email' => $email]);
            $user = $stmt->fetch();

            if (!$user) {
                // Nếu chưa tồn tại trong XAMPP, tự động tạo mới vào bảng users để người dùng vào được ngay
                $newId = 'usr-' . substr(md5($email . time()), 0, 10);
                $tenantId = 'tenant-demo-01';
                $nameParts = explode('@', $email);
                $fullName = ucfirst($nameParts[0]);
                $role = ($email === 'duc923372@gmail.com') ? 'admin' : 'accountant';
                $plan = ($email === 'duc923372@gmail.com') ? 'enterprise' : 'pro';

                $insertStmt = $pdo->prepare("INSERT INTO users 
                    (id, tenant_id, email, full_name, role, plan, plan_status, ai_usage_count, department) 
                    VALUES 
                    (:id, :tenant_id, :email, :full_name, :role, :plan, 'active', 0, 'Phòng Kế toán & Tài chính')");
                
                $insertStmt->execute([
                    ':id' => $newId,
                    ':tenant_id' => $tenantId,
                    ':email' => $email,
                    ':full_name' => $fullName,
                    ':role' => $role,
                    ':plan' => $plan
                ]);

                // Lấy lại user vừa tạo
                $stmt->execute([':email' => $email]);
                $user = $stmt->fetch();
            }

            // Trả về dữ liệu phiên đăng nhập
            $userProfile = [
                'id' => $user['id'],
                'uid' => $user['id'],
                'name' => $user['full_name'],
                'displayName' => $user['full_name'],
                'email' => $user['email'],
                'role' => $user['role'],
                'plan' => $user['plan'],
                'planStatus' => $user['plan_status'],
                'aiUsageCount' => intval($user['ai_usage_count']),
                'phone' => $user['phone'] ?? '',
                'department' => $user['department'] ?? 'Phòng Kế toán & Tài chính',
                'companyName' => $user['company_name'] ?? 'Doanh Nghiệp Kế Toán AI',
                'avatar' => strtoupper(substr($user['full_name'], 0, 2)),
                'twoFactorEnabled' => false,
                'source' => 'XAMPP_MYSQL',
                'createdAt' => $user['created_at'],
                'recentLogins' => [
                    [
                        'ip' => '127.0.0.1 (XAMPP Local)',
                        'device' => 'Web Browser',
                        'time' => date('d/m/Y H:i:s'),
                        'location' => 'Việt Nam (Hiện tại)'
                    ]
                ]
            ];

            echo json_encode([
                'success' => true,
                'message' => 'Đăng nhập XAMPP Database thành công!',
                'user' => $userProfile
            ], JSON_UNESCAPED_UNICODE);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Lỗi đăng nhập MySQL: ' . $e->getMessage()]);
        }
        break;

    // 2. ĐĂNG KÝ (REGISTER)
    case 'register':
        if ($method !== 'POST') {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Yêu cầu phương thức POST']);
            exit();
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $email = trim($input['email'] ?? '');
        $fullName = trim($input['name'] ?? $input['fullName'] ?? '');
        $companyName = trim($input['company'] ?? $input['companyName'] ?? '');

        if (empty($email) || empty($fullName)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Vui lòng điền đủ email và họ tên']);
            exit();
        }

        try {
            // Kiểm tra email đã có chưa
            $check = $pdo->prepare("SELECT id FROM users WHERE email = :email");
            $check->execute([':email' => $email]);
            if ($check->fetch()) {
                // Đã có -> chuyển sang đăng nhập
                http_response_code(200);
                echo json_encode(['success' => true, 'message' => 'Email đã tồn tại, đã tự động đăng nhập']);
                exit();
            }

            $userId = 'usr-' . substr(md5($email . time()), 0, 10);
            $tenantId = 'tenant-demo-01';

            $insertStmt = $pdo->prepare("INSERT INTO users 
                (id, tenant_id, email, full_name, role, plan, plan_status, ai_usage_count, department) 
                VALUES 
                (:id, :tenant_id, :email, :full_name, 'accountant', 'free', 'active', 0, 'Phòng Kế toán & Tài chính')");
            
            $insertStmt->execute([
                ':id' => $userId,
                ':tenant_id' => $tenantId,
                ':email' => $email,
                ':full_name' => $fullName
            ]);

            echo json_encode([
                'success' => true,
                'message' => 'Đăng ký tài khoản trong CSDL XAMPP thành công!',
                'userId' => $userId
            ], JSON_UNESCAPED_UNICODE);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Lỗi tạo tài khoản: ' . $e->getMessage()]);
        }
        break;

    // 3. DANH SÁCH TÀI KHOẢN CÓ SẴN TRONG XAMPP (QUICK SWITCH)
    case 'users':
        try {
            $stmt = $pdo->query("SELECT id, email, full_name, role, plan, department FROM users ORDER BY created_at ASC");
            $users = $stmt->fetchAll();
            echo json_encode(['success' => true, 'users' => $users], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        break;

    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Hành động không hợp lệ']);
        break;
}
