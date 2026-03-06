import { query } from "./lib/db";

async function migrate() {
    try {
        console.log("Starting Admin Overhaul Migration (Phase 33)...");

        // 1. Update roles in users
        // Note: Using MODIFY COLUMN to add 'super_admin'
        await query(`
            ALTER TABLE users 
            MODIFY COLUMN role ENUM('customer', 'admin', 'super_admin') DEFAULT 'customer'
        `);
        console.log("Updated users roles.");

        // 2. Update vouchers
        await query(`
            ALTER TABLE vouchers 
            ADD COLUMN IF NOT EXISTS discount_type ENUM('fixed', 'percentage') DEFAULT 'fixed'
        `);
        console.log("Updated vouchers schema.");

        // 3. Update orders for refunds
        await query(`
            ALTER TABLE orders 
            ADD COLUMN IF NOT EXISTS refunded_amount DECIMAL(10,3) DEFAULT 0.000
        `);
        console.log("Updated orders schema for refunds.");

        console.log("Phase 33 Database migration successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
