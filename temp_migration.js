const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

async function run() {
    console.log("Connecting to DB:", process.env.DB_HOST, process.env.DB_USER, process.env.DB_NAME);
    const pool = mysql.createPool({
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "3306"),
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASS || "",
        database: process.env.DB_NAME || "jihad_store",
    });

    try {
        console.log("Running migrations...");
        try {
            await pool.query("ALTER TABLE products ADD COLUMN weight DECIMAL(10,3) DEFAULT 0;");
            console.log("Added weight column.");
        } catch (e) {
            console.log("Weight col might already exist:", e.message);
        }

        await pool.query("CREATE TABLE IF NOT EXISTS shipping_rates (id INT AUTO_INCREMENT PRIMARY KEY, country VARCHAR(50) UNIQUE, rate_per_kg DECIMAL(10,3) DEFAULT 0);");
        console.log("Ensured shipping_rates table.");

        await pool.query("CREATE TABLE IF NOT EXISTS support_tickets (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT, subject VARCHAR(255), status VARCHAR(20) DEFAULT 'open', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);");
        console.log("Ensured support_tickets table.");

        await pool.query("CREATE TABLE IF NOT EXISTS ticket_messages (id INT AUTO_INCREMENT PRIMARY KEY, ticket_id INT, sender_type VARCHAR(10), message TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);");
        console.log("Ensured ticket_messages table.");

    } catch (err) {
        console.error("Migration failed", err);
    } finally {
        await pool.end();
    }
}
run();
