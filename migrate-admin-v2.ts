import { query } from "./lib/db";

async function migrate() {
    try {
        console.log("Starting Admin Overhaul Migration (Phase 33 - Voucher Expiry)...");

        // 2. Add expires_at to vouchers
        await query(`
            ALTER TABLE vouchers 
            ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP NULL
        `);
        console.log("Updated vouchers schema with expires_at.");

        console.log("Phase 33 (Part 2) Database migration successful!");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
