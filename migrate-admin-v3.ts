import { query } from "./lib/db";

async function migrate_v3() {
    try {
        console.log("Starting Advanced Voucher Migration (Phase 38)...");

        // 1. Update vouchers schema
        const columns = await query("SHOW COLUMNS FROM vouchers");
        const columnNames = (columns as any[]).map(c => c.Field);

        if (!columnNames.includes("new_user_only")) {
            await query("ALTER TABLE vouchers ADD COLUMN new_user_only BOOLEAN DEFAULT FALSE");
            console.log("Added new_user_only column.");
        }
        if (!columnNames.includes("is_public")) {
            await query("ALTER TABLE vouchers ADD COLUMN is_public BOOLEAN DEFAULT TRUE");
            console.log("Added is_public column.");
        }

        // 2. Create redemptions table
        await query(`
            CREATE TABLE IF NOT EXISTS voucher_redemptions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                voucher_id INT,
                user_id INT,
                order_id INT,
                redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (voucher_id) REFERENCES vouchers(id),
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (order_id) REFERENCES orders(id)
            )
        `);
        console.log("Created voucher_redemptions table.");

        console.log("Phase 38 Database migration successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate_v3();
