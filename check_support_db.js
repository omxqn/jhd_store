const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'jihad-store/.env.local' });
require('dotenv').config({ path: 'jihad-store/.env' });

async function check() {
    const config = {
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "3306"),
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASS || "",
        database: process.env.DB_NAME || "jihad_store",
    };
    console.log("Checking DB:", config.database, "at", config.host);
    const connection = await mysql.createConnection(config);
    try {
        const [tables] = await connection.query("SHOW TABLES");
        console.log("Tables:", tables.map(t => Object.values(t)[0]));
        
        try {
            const [cols] = await connection.query("DESCRIBE support_tickets");
            console.log("\nsupport_tickets columns:");
            cols.forEach(c => console.log(`- ${c.Field} (${c.Type})`));
        } catch(e) { console.log("support_tickets table missing!"); }

        try {
            const [cols] = await connection.query("DESCRIBE ticket_messages");
            console.log("\nticket_messages columns:");
            cols.forEach(c => console.log(`- ${c.Field} (${c.Type})`));
        } catch(e) { console.log("ticket_messages table missing!"); }

    } catch(err) {
        console.error("Check failed:", err.message);
    } finally {
        await connection.end();
    }
}
check();
