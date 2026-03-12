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
        
        console.log("Updating products table...");
        
        const [sizesCol] = await connection.execute("SHOW COLUMNS FROM products LIKE 'sizes'");
        if (sizesCol.length === 0) {
            await connection.execute("ALTER TABLE products ADD COLUMN sizes JSON NULL");
            console.log("Added 'sizes' column.");
        }

        const [colorsCol] = await connection.execute("SHOW COLUMNS FROM products LIKE 'colors'");
        if (colorsCol.length === 0) {
            await connection.execute("ALTER TABLE products ADD COLUMN colors JSON NULL");
            console.log("Added 'colors' column.");
        }

        const [isPremadeCol] = await connection.execute("SHOW COLUMNS FROM products LIKE 'is_premade'");
        if (isPremadeCol.length === 0) {
            await connection.execute("ALTER TABLE products ADD COLUMN is_premade BOOLEAN DEFAULT 0");
            console.log("Added 'is_premade' column.");
        }

        await connection.end();
        console.log("Database update complete.");
        process.exit(0);
    } catch (err) {
        console.error("Error updating database:", err);
        process.exit(1);
    }
}

run();
