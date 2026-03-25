const mysql = require('mysql2/promise');
const fs = require('fs');

async function run(conn, sql, label) {
    try {
        await conn.execute(sql);
        console.log('OK:', label);
    } catch (e) {
        console.log('Skip (exists):', label, '-', e.code || e.message);
    }
}

async function main() {
    const conn = await mysql.createConnection({
        host: 'serverless-europe-west2.sysp0000.db2.skysql.com',
        port: 4017,
        user: 'dbpgf42349276',
        password: 'XoKggXc^z3hcUvVI7kLGn',
        database: 'jihad_store',
        ssl: { ca: fs.readFileSync('./globalsignrootca.pem') }
    });

    await run(conn, "ALTER TABLE users MODIFY COLUMN role ENUM('customer','admin','super_admin') DEFAULT 'customer'", 'users.role super_admin');
    await run(conn, "ALTER TABLE products ADD COLUMN stock INT DEFAULT NULL", 'products.stock');
    await run(conn, "ALTER TABLE products ADD COLUMN options JSON", 'products.options');
    await run(conn, "ALTER TABLE products ADD COLUMN neckline_ids JSON", 'products.neckline_ids');
    await run(conn, "ALTER TABLE orders ADD COLUMN shipping_fee DECIMAL(10,3) DEFAULT 0", 'orders.shipping_fee');
    await run(conn, "ALTER TABLE orders ADD COLUMN voucher_code VARCHAR(50)", 'orders.voucher_code');
    await run(conn, "ALTER TABLE order_items ADD COLUMN shipping_cost DECIMAL(10,3) DEFAULT 0", 'order_items.shipping_cost');
    await run(conn, "ALTER TABLE vouchers ADD COLUMN is_percentage TINYINT(1) DEFAULT 0", 'vouchers.is_percentage');
    await run(conn, "ALTER TABLE vouchers ADD COLUMN max_uses INT DEFAULT NULL", 'vouchers.max_uses');
    await run(conn, "ALTER TABLE vouchers ADD COLUMN used_count INT DEFAULT 0", 'vouchers.used_count');
    await run(conn, "ALTER TABLE vouchers ADD COLUMN expires_at DATETIME DEFAULT NULL", 'vouchers.expires_at');
    await run(conn, "ALTER TABLE vouchers ADD COLUMN min_order DECIMAL(10,3) DEFAULT 0", 'vouchers.min_order');

    await run(conn, `CREATE TABLE IF NOT EXISTS voucher_redemptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        voucher_id INT NOT NULL,
        user_id INT,
        order_id INT,
        redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`, 'voucher_redemptions table');

    await run(conn, `CREATE TABLE IF NOT EXISTS shipping_rules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        country_code VARCHAR(10) NOT NULL,
        country_name VARCHAR(100) NOT NULL,
        base_cost DECIMAL(10,3) DEFAULT 0,
        free_threshold DECIMAL(10,3) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`, 'shipping_rules table');

    await run(conn, `CREATE TABLE IF NOT EXISTS necklines (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        name_ar VARCHAR(100),
        image VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`, 'necklines table');

    await run(conn, `CREATE TABLE IF NOT EXISTS support_tickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        guest_email VARCHAR(200),
        subject VARCHAR(300),
        status ENUM('open','closed') DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`, 'support_tickets table');

    await run(conn, `CREATE TABLE IF NOT EXISTS ticket_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ticket_id INT NOT NULL,
        sender ENUM('customer','admin') NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`, 'ticket_messages table');

    console.log('\nAll migrations done!');
    const [tables] = await conn.query('SHOW TABLES');
    console.log('Tables:', tables.map(t => Object.values(t)[0]));
    await conn.end();
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
