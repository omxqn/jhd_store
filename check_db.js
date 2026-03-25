const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Manually load .env.local
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
    });
}

async function check() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "jihad_store",
    });

    try {
        const [rows] = await pool.execute("DESCRIBE support_tickets");
        console.log("support_tickets:", rows);
        const [rows2] = await pool.execute("DESCRIBE ticket_messages");
        console.log("ticket_messages:", rows2);
    } catch(e) {
        console.error("error", e);
    } finally {
        pool.end();
    }
}
check();
