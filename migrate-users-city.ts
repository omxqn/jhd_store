import { query } from './lib/db';

async function migrate() {
    console.log("Adding 'city' column to 'users' table...");
    try {
        await query("ALTER TABLE users ADD COLUMN city VARCHAR(255) AFTER address");
        console.log("Success!");
    } catch (err: any) {
        if (err.code === 'ER_DUP_COLUMN_NAME') {
            console.log("Column 'city' already exists.");
        } else {
            console.error("Migration failed:", err);
        }
    }
    process.exit(0);
}

migrate();
