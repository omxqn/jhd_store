const mysql = require("mysql2/promise");

async function run() {
    const config = {
        host: "localhost",
        port: 3306,
        user: "root",
        password: "",
        database: "jihad_store",
    };

    try {
        const connection = await mysql.createConnection(config);
        console.log("Checking products table for shipping_cost column...");
        const [columns] = await connection.execute("SHOW COLUMNS FROM products LIKE 'shipping_cost'");
        
        if (columns.length === 0) {
            console.log("Adding shipping_cost column to products table...");
            await connection.execute("ALTER TABLE products ADD COLUMN shipping_cost DECIMAL(10,3) DEFAULT 2.000");
            console.log("Column added successfully.");
        } else {
            console.log("shipping_cost column already exists.");
        }
        await connection.end();
        process.exit(0);
    } catch (err) {
        console.error("Error updating database:", err);
        process.exit(1);
    }
}

run();
