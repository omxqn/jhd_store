const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'c:/Users/OMXQN/Desktop/Jihad_website/jihad-store/.env.local' });

async function checkOrder() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "3306"),
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASS || "",
        database: process.env.DB_NAME || "jihad_store",
    });

    try {
        const [rows] = await pool.execute('SELECT * FROM orders WHERE id = 15');
        console.log('Order 15 data:', JSON.stringify(rows[0], null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

checkOrder();
