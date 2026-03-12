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
        
        console.log("Updating orders table...");
        const [oColumns] = await connection.execute("SHOW COLUMNS FROM orders LIKE 'shipping_fee'");
        if (oColumns.length === 0) {
            await connection.execute("ALTER TABLE orders ADD COLUMN shipping_fee DECIMAL(10,3) DEFAULT 0.000");
            console.log("shipping_fee added to orders.");
        }

        console.log("Updating order_items table...");
        const [oiColumns] = await connection.execute("SHOW COLUMNS FROM order_items LIKE 'shipping_cost'");
        if (oiColumns.length === 0) {
            await connection.execute("ALTER TABLE order_items ADD COLUMN shipping_cost DECIMAL(10,3) DEFAULT 0.000");
            console.log("shipping_cost added to order_items.");
        }

        await connection.end();
        process.exit(0);
    } catch (err) {
        console.error("Error updating database:", err);
        process.exit(1);
    }
}

run();
