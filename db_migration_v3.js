const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Manually load .env.local
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
    });
}

async function run() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "3306"),
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASS || "",
        database: process.env.DB_NAME || "jihad_store",
    });

    try {
        console.log("Running Support System Migrations (V3)...");

        // support_tickets fixes
        const supportCols = [
            "target VARCHAR(20) DEFAULT 'general'",
            "label VARCHAR(255) DEFAULT NULL",
            "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ];
        for (const col of supportCols) {
            try {
                await pool.query(`ALTER TABLE support_tickets ADD COLUMN ${col}`);
                console.log(`Added column to support_tickets: ${col}`);
            } catch (e) {
                console.log(`Column might exist in support_tickets: ${col}`);
            }
        }

        // ticket_messages fixes
        const messageCols = [
            "sender_id INT DEFAULT NULL"
        ];
        for (const col of messageCols) {
            try {
                await pool.query(`ALTER TABLE ticket_messages ADD COLUMN ${col}`);
                console.log(`Added column to ticket_messages: ${col}`);
            } catch (e) {
                console.log(`Column might exist in ticket_messages: ${col}`);
            }
        }

        console.log("Migration complete!");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await pool.end();
    }
}
run();
