const mysql = require('mysql2/promise');

async function check() {
    const conn = await mysql.createConnection({
        host: "localhost",
        port: 3306,
        user: "root",
        password: "",
        database: "jihad_store",
    });

    console.log("Connected to DB.");

    try {
        const [users] = await conn.query("SELECT COUNT(*) as count FROM users");
        console.log("Users count:", users[0].count);
        
        const [products] = await conn.query("SELECT COUNT(*) as count FROM products");
        console.log("Products count:", products[0].count);
        
        await conn.query("UPDATE users SET role = 'super_admin'");
        console.log("All users made super_admin!");
        
        const [adminUsers] = await conn.query("SELECT id, email, role FROM users");
        console.log("Users in DB:", adminUsers);
    } catch (e) {
        console.error("Query Error", e);
    }

    await conn.end();
}

check();
