-- ==============================================================================
-- CƠ SỞ DỮ LIỆU: KẾ TOÁN AI SMART LEDGER (CHUYÊN DÙNG CHO XAMPP / PHPMYADMIN / MARIADB / MYSQL)
-- Tương thích: MySQL 5.7+, MySQL 8.0+, MariaDB 10.3+
-- Mã hóa: utf8mb4 / utf8mb4_unicode_ci (Hỗ trợ tiếng Việt đầy đủ)
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `smart_ledger_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `smart_ledger_db`;

SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------------------------
-- 1. BẢNG TENANTS (Doanh nghiệp / Hộ kinh doanh / Shop online)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `tenants`;
CREATE TABLE `tenants` (
    `id` VARCHAR(50) NOT NULL,
    `company_name` VARCHAR(255) NOT NULL,
    `tax_code` VARCHAR(50) DEFAULT NULL,
    `address` TEXT DEFAULT NULL,
    `phone` VARCHAR(30) DEFAULT NULL,
    `email` VARCHAR(255) DEFAULT NULL,
    `representative` VARCHAR(100) DEFAULT NULL,
    `chief_accountant` VARCHAR(100) DEFAULT NULL,
    `accounting_standard` VARCHAR(20) DEFAULT 'TT133', -- 'TT133' hoặc 'TT200'
    `fiscal_year_start` DATE DEFAULT '2026-01-01',
    `currency` VARCHAR(10) DEFAULT 'VND',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 2. BẢNG USERS (Người dùng & Phân quyền SaaS)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `id` VARCHAR(50) NOT NULL,
    `tenant_id` VARCHAR(50) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(255) NOT NULL,
    `role` ENUM('admin', 'chief_accountant', 'accountant', 'user', 'viewer') DEFAULT 'accountant',
    `plan` ENUM('free', 'pro', 'business', 'enterprise') DEFAULT 'free',
    `plan_status` ENUM('active', 'trialing', 'expired', 'canceled') DEFAULT 'active',
    `ai_usage_count` INT DEFAULT 0,
    `phone` VARCHAR(30) DEFAULT NULL,
    `department` VARCHAR(100) DEFAULT 'Phòng Kế toán & Tài chính',
    `avatar` VARCHAR(255) DEFAULT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_users_email` (`email`),
    KEY `idx_users_tenant` (`tenant_id`),
    CONSTRAINT `fk_users_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. BẢNG CHART_OF_ACCOUNTS (Hệ thống tài khoản Thông tư 133 / 200)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `chart_of_accounts`;
CREATE TABLE `chart_of_accounts` (
    `id` VARCHAR(50) NOT NULL,
    `tenant_id` VARCHAR(50) NOT NULL,
    `account_code` VARCHAR(20) NOT NULL, -- 111, 112, 131, 156, 331, 511, 632, 641, 642...
    `account_name` VARCHAR(255) NOT NULL,
    `account_type` ENUM('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE', 'SUMMARY') NOT NULL,
    `parent_code` VARCHAR(20) DEFAULT NULL,
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_tenant_account` (`tenant_id`, `account_code`),
    CONSTRAINT `fk_accounts_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 4. BẢNG CATEGORIES (Danh mục thu chi / Nhóm ngân sách)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
    `id` VARCHAR(50) NOT NULL,
    `tenant_id` VARCHAR(50) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `type` ENUM('INCOME', 'EXPENSE') NOT NULL,
    `icon` VARCHAR(50) DEFAULT 'Receipt',
    `color` VARCHAR(20) DEFAULT '#10B981',
    `account_code` VARCHAR(20) DEFAULT NULL,
    `description` TEXT DEFAULT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_categories_tenant` (`tenant_id`),
    CONSTRAINT `fk_categories_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 5. BẢNG PARTNERS (Đối tác: Khách hàng, Nhà cung cấp, Sàn TMĐT)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `partners`;
CREATE TABLE `partners` (
    `id` VARCHAR(50) NOT NULL,
    `tenant_id` VARCHAR(50) NOT NULL,
    `code` VARCHAR(50) NOT NULL, -- KH-001, NCC-002, SAN-SHOPEE
    `name` VARCHAR(255) NOT NULL,
    `type` ENUM('CUSTOMER', 'SUPPLIER', 'PARTNER') NOT NULL,
    `tax_code` VARCHAR(50) DEFAULT NULL,
    `phone` VARCHAR(30) DEFAULT NULL,
    `email` VARCHAR(255) DEFAULT NULL,
    `address` TEXT DEFAULT NULL,
    `receivable_amount` DECIMAL(18, 2) DEFAULT 0.00, -- Công nợ phải thu (KH)
    `payable_amount` DECIMAL(18, 2) DEFAULT 0.00,    -- Công nợ phải trả (NCC)
    `status` ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    `notes` TEXT DEFAULT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_partner_code` (`tenant_id`, `code`),
    CONSTRAINT `fk_partners_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 6. BẢNG PRODUCTS (Hàng hóa, Tồn kho & Biên lợi nhuận)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
    `id` VARCHAR(50) NOT NULL,
    `tenant_id` VARCHAR(50) NOT NULL,
    `sku` VARCHAR(100) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `category` VARCHAR(100) DEFAULT NULL,
    `cost_price` DECIMAL(18, 2) DEFAULT 0.00,    -- Giá vốn nhập kho
    `selling_price` DECIMAL(18, 2) DEFAULT 0.00, -- Giá bán lẻ
    `platform_fee_avg` DECIMAL(18, 2) DEFAULT 0.00,
    `ad_fee_est` DECIMAL(18, 2) DEFAULT 0.00,
    `unit_profit` DECIMAL(18, 2) DEFAULT 0.00,
    `profit_margin` DECIMAL(5, 2) DEFAULT 0.00,  -- % Biên lợi nhuận
    `inventory` INT DEFAULT 0,
    `total_sold` INT DEFAULT 0,
    `status` ENUM('ACTIVE', 'LOW_STOCK', 'OUT_OF_STOCK') DEFAULT 'ACTIVE',
    `image` VARCHAR(255) DEFAULT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_product_sku` (`tenant_id`, `sku`),
    CONSTRAINT `fk_products_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 7. BẢNG TRANSACTIONS (Giao dịch thu chi / Sổ quỹ)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `transactions`;
CREATE TABLE `transactions` (
    `id` VARCHAR(50) NOT NULL,
    `tenant_id` VARCHAR(50) NOT NULL,
    `code` VARCHAR(50) NOT NULL, -- GD-1001, PT-001, PC-002
    `type` ENUM('INCOME', 'EXPENSE') NOT NULL,
    `amount` DECIMAL(18, 2) NOT NULL,
    `date` DATE NOT NULL,
    `time` VARCHAR(10) DEFAULT '00:00',
    `category_id` VARCHAR(50) DEFAULT NULL,
    `partner_id` VARCHAR(50) DEFAULT NULL,
    `payment_method` ENUM('CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'E_WALLET', 'SHOPEE_PAY', 'TIKTOK_SHOP', 'COD') DEFAULT 'BANK_TRANSFER',
    `platform` ENUM('ALL', 'SHOPEE', 'TIKTOK', 'LAZADA', 'FACEBOOK', 'WEBSITE', 'OTHER') DEFAULT 'OTHER',
    `status` ENUM('COMPLETED', 'PENDING', 'CANCELLED') DEFAULT 'COMPLETED',
    `description` TEXT NOT NULL,
    `notes` TEXT DEFAULT NULL,
    `creator` VARCHAR(100) DEFAULT 'Kế toán viên',
    `is_anomaly` TINYINT(1) DEFAULT 0,
    `anomaly_reason` TEXT DEFAULT NULL,
    `ai_confidence` DECIMAL(5, 2) DEFAULT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_tx_code` (`tenant_id`, `code`),
    KEY `idx_tx_date` (`tenant_id`, `date` DESC),
    KEY `idx_tx_category` (`category_id`),
    KEY `idx_tx_partner` (`partner_id`),
    CONSTRAINT `fk_tx_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_tx_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_tx_partner` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 8. BẢNG ECOMMERCE_ORDERS (Đơn hàng TMĐT Shopee, TikTok Shop, Lazada)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `ecommerce_orders`;
CREATE TABLE `ecommerce_orders` (
    `id` VARCHAR(50) NOT NULL,
    `tenant_id` VARCHAR(50) NOT NULL,
    `code` VARCHAR(100) NOT NULL, -- Mã vận đơn / Mã đơn sàn
    `platform` ENUM('SHOPEE', 'TIKTOK', 'LAZADA', 'FACEBOOK', 'WEBSITE', 'OTHER') NOT NULL,
    `date` DATE NOT NULL,
    `time` VARCHAR(10) DEFAULT '00:00',
    `product_name` VARCHAR(255) NOT NULL,
    `sku` VARCHAR(100) DEFAULT NULL,
    `quantity` INT DEFAULT 1,
    `unit_price` DECIMAL(18, 2) DEFAULT 0.00,
    `revenue` DECIMAL(18, 2) NOT NULL,              -- Doanh thu bán hàng
    `platform_fee` DECIMAL(18, 2) DEFAULT 0.00,     -- Phí sàn
    `shipping_fee_seller` DECIMAL(18, 2) DEFAULT 0.00, -- Phí ship người bán chịu
    `ad_fee` DECIMAL(18, 2) DEFAULT 0.00,           -- Phí quảng cáo phân bổ
    `cogs` DECIMAL(18, 2) DEFAULT 0.00,             -- Tiền vốn nhập
    `refund_amount` DECIMAL(18, 2) DEFAULT 0.00,
    `tax_deducted` DECIMAL(18, 2) DEFAULT 0.00,     -- Thuế sàn trừ
    `net_cash_received` DECIMAL(18, 2) NOT NULL,    -- Tiền thực nhận
    `net_profit` DECIMAL(18, 2) NOT NULL,           -- Lợi nhuận thực tế
    `status` ENUM('PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED', 'RETURNED') DEFAULT 'COMPLETED',
    `customer_name` VARCHAR(100) DEFAULT NULL,
    `customer_phone` VARCHAR(30) DEFAULT NULL,
    `notes` TEXT DEFAULT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_order_code` (`tenant_id`, `code`),
    KEY `idx_orders_date` (`tenant_id`, `date` DESC),
    KEY `idx_orders_platform` (`tenant_id`, `platform`),
    CONSTRAINT `fk_orders_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 9. BẢNG SMART_ALERTS (Cảnh báo gian lận & Bất thường từ AI)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `smart_alerts`;
CREATE TABLE `smart_alerts` (
    `id` VARCHAR(50) NOT NULL,
    `tenant_id` VARCHAR(50) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `severity` ENUM('CRITICAL', 'HIGH', 'MEDIUM', 'INFO') NOT NULL,
    `category` ENUM('ANOMALY', 'BUDGET_OVERRUN', 'TAX_RISK', 'DUPLICATE', 'CASH_DEFICIT') NOT NULL,
    `status` ENUM('UNRESOLVED', 'IN_PROGRESS', 'RESOLVED') DEFAULT 'UNRESOLVED',
    `related_transaction_id` VARCHAR(50) DEFAULT NULL,
    `related_amount` DECIMAL(18, 2) DEFAULT NULL,
    `ai_recommendation` TEXT NOT NULL,
    `detected_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_alerts_status` (`tenant_id`, `status`),
    CONSTRAINT `fk_alerts_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 10. BẢNG CHAT_SESSIONS & CHAT_MESSAGES (Trợ lý Kế toán AI)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `chat_sessions`;
CREATE TABLE `chat_sessions` (
    `id` VARCHAR(50) NOT NULL,
    `tenant_id` VARCHAR(50) NOT NULL,
    `user_id` VARCHAR(50) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_chats_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_chats_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `chat_messages`;
CREATE TABLE `chat_messages` (
    `id` VARCHAR(50) NOT NULL,
    `session_id` VARCHAR(50) NOT NULL,
    `sender` ENUM('user', 'assistant') NOT NULL,
    `text` LONGTEXT NOT NULL,
    `analysis_card_json` JSON DEFAULT NULL,
    `timestamp` VARCHAR(20) DEFAULT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_msg_session` (`session_id`),
    CONSTRAINT `fk_msg_session` FOREIGN KEY (`session_id`) REFERENCES `chat_sessions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 11. BẢNG COMPANY_SETTINGS (Thiết lập Doanh nghiệp & Kế toán)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `company_settings`;
CREATE TABLE `company_settings` (
    `tenant_id` VARCHAR(50) NOT NULL,
    `company_name` VARCHAR(255) NOT NULL,
    `tax_code` VARCHAR(50) DEFAULT NULL,
    `address` TEXT DEFAULT NULL,
    `phone` VARCHAR(30) DEFAULT NULL,
    `email` VARCHAR(255) DEFAULT NULL,
    `representative` VARCHAR(100) DEFAULT NULL,
    `chief_accountant` VARCHAR(100) DEFAULT NULL,
    `currency` VARCHAR(10) DEFAULT 'VND',
    `accounting_standard` VARCHAR(20) DEFAULT 'TT133',
    `ai_assistant_enabled` TINYINT(1) DEFAULT 1,
    `auto_analyze_enabled` TINYINT(1) DEFAULT 1,
    `anomaly_detection_enabled` TINYINT(1) DEFAULT 1,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`tenant_id`),
    CONSTRAINT `fk_settings_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- CÁC VIEWS BÁO CÁO TÀI CHÍNH TỰ ĐỘNG
-- ==============================================================================

-- 1. View Báo cáo Thu - Chi & Lợi nhuận thuần theo tháng
CREATE OR REPLACE VIEW `view_monthly_revenue_expense` AS
SELECT 
    `tenant_id`,
    DATE_FORMAT(`date`, '%Y-%m') AS `month`,
    SUM(CASE WHEN `type` = 'INCOME' THEN `amount` ELSE 0 END) AS `total_revenue`,
    SUM(CASE WHEN `type` = 'EXPENSE' THEN `amount` ELSE 0 END) AS `total_expense`,
    (SUM(CASE WHEN `type` = 'INCOME' THEN `amount` ELSE 0 END) - 
     SUM(CASE WHEN `type` = 'EXPENSE' THEN `amount` ELSE 0 END)) AS `net_profit`,
    COUNT(`id`) AS `total_transactions`
FROM `transactions`
WHERE `status` = 'COMPLETED'
GROUP BY `tenant_id`, DATE_FORMAT(`date`, '%Y-%m');

-- 2. View Báo cáo Hiệu quả bán hàng từng Sàn TMĐT
CREATE OR REPLACE VIEW `view_platform_performance` AS
SELECT 
    `tenant_id`,
    `platform`,
    COUNT(`id`) AS `order_count`,
    SUM(`revenue`) AS `gross_revenue`,
    SUM(`platform_fee`) AS `total_platform_fee`,
    SUM(`ad_fee`) AS `total_ad_fee`,
    SUM(`cogs`) AS `total_cogs`,
    SUM(`net_cash_received`) AS `actual_cash_received`,
    SUM(`net_profit`) AS `actual_profit`,
    ROUND((SUM(`net_profit`) / NULLIF(SUM(`revenue`), 0)) * 100, 2) AS `profit_margin_pct`
FROM `ecommerce_orders`
WHERE `status` = 'COMPLETED'
GROUP BY `tenant_id`, `platform`;

-- ==============================================================================
-- NẠP DỮ LIỆU MẪU BAN ĐẦU (SEED DATA TƯƠNG THÍCH MÃ NGUỒN APP)
-- ==============================================================================

-- 1. Nạp Tenant mặc định
INSERT INTO `tenants` (`id`, `company_name`, `tax_code`, `address`, `phone`, `email`, `accounting_standard`) 
VALUES ('tenant-demo-01', 'CÔNG TY TNHH GIẢI PHÁP SỐ KẾ TOÁN AI VIỆT NAM', '0109887766', 'Tầng 12, Tòa nhà Landmark 81, TP. Hồ Chí Minh', '0988.123.456', 'contact@ketoanai.vn', 'TT133');

-- 2. Nạp User Admin / Demo
INSERT INTO `users` (`id`, `tenant_id`, `email`, `full_name`, `role`, `plan`, `plan_status`, `ai_usage_count`) 
VALUES 
('usr-admin-01', 'tenant-demo-01', 'duc923372@gmail.com', 'Nguyễn Đức (Admin)', 'admin', 'enterprise', 'active', 12),
('usr-demo-02', 'tenant-demo-01', 'demo@ketoanai.vn', 'Trần Văn Hưng (KTT)', 'chief_accountant', 'pro', 'active', 45);

-- 3. Nạp Danh mục thu chi (Categories)
INSERT INTO `categories` (`id`, `tenant_id`, `name`, `type`, `icon`, `color`, `account_code`, `description`) VALUES
('cat-inc-1', 'tenant-demo-01', 'Doanh thu Shopee', 'INCOME', 'ShoppingBag', '#EE4D2D', '511_SHOPEE', 'Doanh thu bán hàng qua sàn Shopee'),
('cat-inc-2', 'tenant-demo-01', 'Doanh thu TikTok Shop', 'INCOME', 'Video', '#000000', '511_TIKTOK', 'Doanh thu giỏ hàng TikTok Shop & Livestream'),
('cat-inc-3', 'tenant-demo-01', 'Doanh thu Facebook & POS', 'INCOME', 'MessageCircle', '#1877F2', '511_FB', 'Bán qua Fanpage inbox chốt đơn'),
('cat-exp-1', 'tenant-demo-01', 'Tiền nhập hàng (Giá vốn)', 'EXPENSE', 'Package', '#EF4444', '632', 'Chi phí nhập hàng sỉ từ xưởng'),
('cat-exp-2', 'tenant-demo-01', 'Phí sàn (Shopee / TikTok / Laz)', 'EXPENSE', 'Percent', '#F97316', '641_FEE', 'Phí thanh toán 3.5%, phí cố định sàn'),
('cat-exp-3', 'tenant-demo-01', 'Quảng cáo (Ads FB / TikTok / Shopee)', 'EXPENSE', 'Megaphone', '#8B5CF6', '641_ADS', 'Ngân sách chạy quảng cáo'),
('cat-exp-4', 'tenant-demo-01', 'Đóng gói & Vận chuyển', 'EXPENSE', 'Truck', '#3B82F6', '641_PACK', 'Thùng carton, túi niêm phong, máy in nhiệt'),
('cat-exp-5', 'tenant-demo-01', 'Lương nhân viên đóng hàng', 'EXPENSE', 'Users', '#10B981', '642_STAFF', 'Tiền công nhân viên kho và trực chat');

-- 4. Nạp Đối tác (Partners)
INSERT INTO `partners` (`id`, `tenant_id`, `code`, `name`, `type`, `phone`, `email`, `receivable_amount`, `payable_amount`) VALUES
('part-01', 'tenant-demo-01', 'SAN-SHOPEE', 'Sàn Thương Mại Điện Tử Shopee Việt Nam', 'PARTNER', '19001221', 'cskh@shopee.vn', 48500000.00, 0.00),
('part-02', 'tenant-demo-01', 'SAN-TIKTOK', 'TikTok Shop Vietnam Ltd', 'PARTNER', '19009999', 'support@tiktok.com', 38200000.00, 0.00),
('part-03', 'tenant-demo-01', 'NCC-XUONGMAY', 'Xưởng May Tân Bình & Gia Công Sỉ', 'SUPPLIER', '0912.333.444', 'xuongmaytanbinh@gmail.com', 0.00, 18500000.00),
('part-04', 'tenant-demo-01', 'DVVC-GHTK', 'Giao Hàng Tiết Kiệm (GHTK Hub)', 'SUPPLIER', '18006092', 'cskh@ghtk.vn', 0.00, 4200000.00);

-- 5. Nạp Sản phẩm (Products)
INSERT INTO `products` (`id`, `tenant_id`, `sku`, `name`, `category`, `cost_price`, `selling_price`, `inventory`, `total_sold`, `profit_margin`) VALUES
('prod-01', 'tenant-demo-01', 'TSHIRT-OVR-01', 'Áo Thun Cotton Nén Oversize Phông Trơn', 'Thời trang', 65000.00, 169000.00, 340, 1420, 61.54),
('prod-02', 'tenant-demo-01', 'POLO-PREM-02', 'Áo Polo Nam Phối Bo Cổ Dệt Cao Cấp', 'Thời trang', 95000.00, 229000.00, 185, 890, 58.52),
('prod-03', 'tenant-demo-01', 'HOODIE-WNT-03', 'Áo Nỉ Hoodie Zip Form Rộng Mùa Thu Đông', 'Thời trang', 140000.00, 319000.00, 92, 540, 56.11);

-- 6. Nạp Giao dịch thu chi mẫu (Transactions)
INSERT INTO `transactions` (`id`, `tenant_id`, `code`, `type`, `amount`, `date`, `time`, `category_id`, `partner_id`, `payment_method`, `platform`, `description`, `is_anomaly`) VALUES
('tx-1001', 'tenant-demo-01', 'GD-1001', 'INCOME', 48500000.00, '2026-03-25', '14:30', 'cat-inc-1', 'part-01', 'SHOPEE_PAY', 'SHOPEE', 'Rút tiền doanh thu quyết toán đợt 2 từ Ví Shopee', 0),
('tx-1002', 'tenant-demo-01', 'GD-1002', 'INCOME', 38200000.00, '2026-03-26', '10:15', 'cat-inc-2', 'part-02', 'BANK_TRANSFER', 'TIKTOK', 'TikTok Shop thanh toán tiền hàng kỳ đối soát tuần 3', 0),
('tx-1003', 'tenant-demo-01', 'GD-1003', 'EXPENSE', 25000000.00, '2026-03-27', '11:00', 'cat-exp-1', 'part-03', 'BANK_TRANSFER', 'OTHER', 'Thanh toán tiền nhập vải và may áo đợt tháng 3', 0),
('tx-1004', 'tenant-demo-01', 'GD-1004', 'EXPENSE', 8500000.00, '2026-03-28', '16:45', 'cat-exp-3', NULL, 'CREDIT_CARD', 'SHOPEE', 'Nạp tiền ngân sách chạy Ads Shopee chiến dịch Mega Sale', 0),
('tx-1005', 'tenant-demo-01', 'GD-1005', 'EXPENSE', 3500000.00, '2026-03-29', '09:20', 'cat-exp-4', 'part-04', 'CASH', 'OTHER', 'Mua 500 hộp carton đóng hàng và màng co quấn pallet', 0);

-- 7. Nạp Đơn hàng mẫu (Ecommerce Orders)
INSERT INTO `ecommerce_orders` (`id`, `tenant_id`, `code`, `platform`, `date`, `time`, `product_name`, `sku`, `quantity`, `unit_price`, `revenue`, `platform_fee`, `shipping_fee_seller`, `ad_fee`, `cogs`, `net_cash_received`, `net_profit`, `status`) VALUES
('ord-01', 'tenant-demo-01', 'SHO-260328-9812', 'SHOPEE', '2026-03-28', '11:20', 'Áo Thun Cotton Nén Oversize Phông Trơn', 'TSHIRT-OVR-01', 2, 169000.00, 338000.00, 33800.00, 15000.00, 45000.00, 130000.00, 289200.00, 114200.00, 'COMPLETED'),
('ord-02', 'tenant-demo-01', 'TIK-260328-4411', 'TIKTOK', '2026-03-28', '14:45', 'Áo Polo Nam Phối Bo Cổ Dệt Cao Cấp', 'POLO-PREM-02', 1, 229000.00, 229000.00, 27480.00, 10000.00, 30000.00, 95000.00, 191520.00, 66520.00, 'COMPLETED');

-- 8. Nạp Cảnh báo thông minh từ AI (Smart Alerts)
INSERT INTO `smart_alerts` (`id`, `tenant_id`, `code`, `title`, `description`, `severity`, `category`, `status`, `ai_recommendation`) VALUES
('alt-01', 'tenant-demo-01', 'ALT-991', 'Tỷ lệ phí sàn Shopee tăng đột biến', 'Phí sàn Shopee chiếm 13.8% doanh thu trong 3 ngày qua (vượt ngưỡng thông thường 9.5%). Cần kiểm tra lại các gói dịch vụ Freeship Extra hoặc voucher Shop.', 'HIGH', 'BUDGET_OVERRUN', 'UNRESOLVED', 'Kiểm tra xem gian hàng có đang bị trùng gói dịch vụ Marketing hoặc phí cố định sàn tăng từ đầu tháng.');

-- 9. Nạp Cài đặt công ty (Company Settings)
INSERT INTO `company_settings` (`tenant_id`, `company_name`, `tax_code`, `address`, `phone`, `email`, `accounting_standard`) VALUES
('tenant-demo-01', 'CÔNG TY TNHH GIẢI PHÁP SỐ KẾ TOÁN AI VIỆT NAM', '0109887766', 'Tầng 12, Tòa nhà Landmark 81, TP. Hồ Chí Minh', '0988.123.456', 'contact@ketoanai.vn', 'TT133');

SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================================
-- KẾT THÚC KHỞI TẠO CƠ SỞ DỮ LIỆU
-- ==============================================================================
