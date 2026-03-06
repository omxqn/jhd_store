-- =====================================================
-- Jihad Store — MySQL Schema
-- Run once: mysql -u root -p < jihad-store.sql
-- =====================================================

CREATE DATABASE IF NOT EXISTS jihad_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE jihad_store;

-- Users
CREATE TABLE IF NOT EXISTS users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(120)        NOT NULL,
    email       VARCHAR(200)        NOT NULL UNIQUE,
    password    VARCHAR(255)        NOT NULL,
    role        ENUM('customer','admin') DEFAULT 'customer',
    phone       VARCHAR(30),
    address     TEXT,
    created_at  TIMESTAMP           DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP           DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Products
CREATE TABLE IF NOT EXISTS products (
    id              VARCHAR(20)   PRIMARY KEY,
    name            VARCHAR(200)  NOT NULL,
    category        VARCHAR(100)  NOT NULL,
    price           DECIMAL(10,3) NOT NULL,
    old_price       DECIMAL(10,3),
    images          JSON          NOT NULL COMMENT 'array of URLs',
    badges          JSON          NOT NULL COMMENT '["sale","norefund","oos","new"]',
    rating          DECIMAL(3,2)  DEFAULT 4.5,
    reviews         INT           DEFAULT 0,
    sold            INT           DEFAULT 0,
    availability    ENUM('available','out-of-stock','coming-soon') DEFAULT 'available',
    description     TEXT,
    details         TEXT,
    fabric_types    JSON          NOT NULL COMMENT 'array of strings',
    neckline_shapes JSON          NOT NULL COMMENT '[{name,image}]',
    stitch_price    DECIMAL(10,3) DEFAULT 0,
    accessories     JSON          NOT NULL COMMENT '[{name,price}]',
    shipping_note   VARCHAR(200),
    most_selling    TINYINT(1)    DEFAULT 0,
    specs           JSON          NOT NULL COMMENT '[{label,value}]',
    created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Categories
CREATE TABLE IF NOT EXISTS categories (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100) NOT NULL UNIQUE,
    sort_order INT          DEFAULT 0
) ENGINE=InnoDB;

-- Vouchers
CREATE TABLE IF NOT EXISTS vouchers (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    code            VARCHAR(50)   NOT NULL UNIQUE,
    discount_amount DECIMAL(10,3) NOT NULL,
    active          TINYINT(1)    DEFAULT 1,
    created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT          REFERENCES users(id) ON DELETE SET NULL,
    guest_email VARCHAR(200),
    status      ENUM('paid','processing','shipped','delivered') DEFAULT 'paid',
    subtotal    DECIMAL(10,3) NOT NULL,
    discount    DECIMAL(10,3) DEFAULT 0,
    total       DECIMAL(10,3) NOT NULL,
    name        VARCHAR(120)  NOT NULL,
    email       VARCHAR(200)  NOT NULL,
    phone       VARCHAR(30),
    address     TEXT,
    city        VARCHAR(100),
    payment_method VARCHAR(30) DEFAULT 'thawani',
    created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
    id                   INT AUTO_INCREMENT PRIMARY KEY,
    order_id             INT           NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id           VARCHAR(20),
    name                 VARCHAR(200)  NOT NULL,
    price                DECIMAL(10,3) NOT NULL,
    quantity             INT           NOT NULL,
    fabric_type          VARCHAR(100),
    fabric_length        VARCHAR(20),
    neck_size            VARCHAR(20),
    neckline             VARCHAR(100),
    stitch               TINYINT(1)    DEFAULT 0,
    stitch_price         DECIMAL(10,3) DEFAULT 0,
    accessories          JSON,
    accessories_price    DECIMAL(10,3) DEFAULT 0,
    tailor_measurements  JSON,
    image                VARCHAR(500)
) ENGINE=InnoDB;

-- OTP Codes (for guest checkout)
CREATE TABLE IF NOT EXISTS otp_codes (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    email      VARCHAR(200) NOT NULL,
    code       VARCHAR(10)  NOT NULL,
    expires_at DATETIME     NOT NULL,
    used       TINYINT(1)   DEFAULT 0,
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email_code (email, code)
) ENGINE=InnoDB;

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT,
    type       ENUM('order','announcement') NOT NULL,
    message    TEXT         NOT NULL,
    order_id   INT,
    `read`     TINYINT(1)   DEFAULT 0,
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── Seed Default Data ─────────────────────────────

-- Admin user (password: admin123 — CHANGE IN PRODUCTION)
INSERT IGNORE INTO users (name, email, password, role) VALUES
('Admin', 'admin@jihadstore.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Categories
INSERT IGNORE INTO categories (name, sort_order) VALUES
('Thobes', 1), ('Abayas', 2), ('Bishts', 3), ('Kids', 4);

-- Vouchers
INSERT IGNORE INTO vouchers (code, discount_amount) VALUES
('OMAN2024', 5.000), ('SAVE10', 10.000), ('WELCOME', 3.000), ('EID25', 25.000);

-- ── Seed Products ─────────────────────────────────
INSERT IGNORE INTO products (id, name, category, price, old_price, images, badges, rating, reviews, sold, availability, description, details, fabric_types, neckline_shapes, stitch_price, accessories, shipping_note, most_selling, specs) VALUES
('001', 'Royal Embroidered Thobe', 'Thobes', 28.500, 38.000,
 '["https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&q=80"]',
 '["sale"]', 4.8, 124, 890, 'available',
 'Crafted from premium Egyptian cotton with intricate hand-embroidered collar details.',
 'Tailored fit with reinforced stitching. Gold thread collar embroidery imported from Egypt.',
 '["Egyptian Cotton","Premium Linen","Silk Blend","Polyester"]',
 '[{"name":"Classic Round","image":"https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&q=70"},{"name":"Mandarin Collar","image":"https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=200&q=70"},{"name":"V-Neck","image":"https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200&q=70"}]',
 4.500,
 '[{"name":"None","price":0},{"name":"Embroidered Belt","price":3.5},{"name":"Cufflinks (Gold)","price":4.0},{"name":"Cufflinks (Silver)","price":2.5},{"name":"Traditional Cap","price":2.0}]',
 'Free shipping on orders above 10 OMR', 1,
 '[{"label":"Material","value":"Egyptian Cotton 100%"},{"label":"Care","value":"Dry clean only"},{"label":"Origin","value":"Made in Oman"},{"label":"Sizes","value":"XS – 3XL"}]'),

('002', 'Classic White Kandura', 'Thobes', 22.000, NULL,
 '["https://images.unsplash.com/photo-1607349913338-fca6f7fc42d0?w=600&q=80"]',
 '["new"]', 4.6, 87, 540, 'available',
 'A timeless white kandura with a modern slim fit.',
 'Hidden button placket and premium quality fabric.',
 '["Egyptian Cotton","Linen Mix","Polyester Cotton"]',
 '[{"name":"Classic Round","image":"https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&q=70"},{"name":"Mandarin Collar","image":"https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=200&q=70"}]',
 3.500,
 '[{"name":"None","price":0},{"name":"Embroidered Belt","price":3.5},{"name":"Traditional Cap","price":2.0},{"name":"Cufflinks (Gold)","price":4.0}]',
 'Ships within 2-3 business days', 1,
 '[{"label":"Material","value":"Linen Mix 60/40"},{"label":"Care","value":"Machine wash cold"},{"label":"Origin","value":"Made in UAE"},{"label":"Sizes","value":"S – 4XL"}]'),

('003', 'Premium Abaya — Midnight Blue', 'Abayas', 35.000, 45.000,
 '["https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80"]',
 '["sale","norefund"]', 4.9, 211, 1250, 'available',
 'Elegant midnight blue abaya with subtle shimmer thread.',
 'Wrinkle-resistant. Silver embroidery detailing along the cuffs.',
 '["Nida Fabric","Crepe","Chiffon","Velvet"]',
 '[{"name":"Classic Round","image":"https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&q=70"},{"name":"V-Neck","image":"https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200&q=70"}]',
 5.000,
 '[{"name":"None","price":0},{"name":"Matching Hijab","price":5.0},{"name":"Crystal Brooch","price":3.0},{"name":"Belt (Embroidered)","price":4.5},{"name":"Cuffs (Lace)","price":2.5}]',
 'Express delivery available', 1,
 '[{"label":"Material","value":"Nida + Chiffon"},{"label":"Care","value":"Dry clean recommended"},{"label":"Origin","value":"Made in Saudi Arabia"},{"label":"Sizes","value":"XS – 2XL"}]'),

('007', 'Luxury Bisht — Gold Trim', 'Bishts', 85.000, NULL,
 '["https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=600&q=80"]',
 '["norefund"]', 5.0, 34, 112, 'available',
 'An exquisite bisht with hand-stitched gold trim.',
 'Made-to-order by master craftsmen.',
 '["Wool Blend","Premium Cashmere"]',
 '[{"name":"Classic Round","image":"https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&q=70"}]',
 15.000,
 '[{"name":"None","price":0},{"name":"Gold Agal","price":12.0},{"name":"Silver Agal","price":8.0}]',
 'Custom made — 7 to 14 days delivery', 0,
 '[{"label":"Material","value":"Wool Blend 70/30"},{"label":"Care","value":"Dry clean only"},{"label":"Origin","value":"Made in Kuwait"},{"label":"Sizes","value":"S – 3XL (Custom)"}]');
