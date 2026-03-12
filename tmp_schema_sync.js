const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

async function syncSchema() {
    const envPath = path.resolve(process.cwd(), ".env");
    let config = {
        host: "localhost",
        port: 3306,
        user: "root",
        password: "",
        database: "jihad_store"
    };

    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, "utf8");
        envContent.split("\n").forEach(line => {
            const [key, value] = line.split("=");
            if (key && value) {
                const k = key.trim();
                const v = value.trim().replace(/^"(.*)"$/, "$1");
                if (k === "DB_HOST") config.host = v;
                if (k === "DB_PORT") config.port = parseInt(v);
                if (k === "DB_USER") config.user = v;
                if (k === "DB_PASS") config.password = v;
                if (k === "DB_NAME") config.database = v;
            }
        });
    }

    try {
        const connection = await mysql.createConnection(config);
        console.log(`Connected to ${config.database}. Checking products table...`);

        const columnsToAdd = [
            { name: "shipping_cost", type: "DECIMAL(10,3) DEFAULT 2.000" },
            { name: "is_premade", type: "TINYINT(1) DEFAULT 0" },
            { name: "sizes", type: "JSON", nullable: true },
            { name: "colors", type: "JSON", nullable: true },
            { name: "options", type: "JSON", nullable: true }
        ];

        for (const col of columnsToAdd) {
            const [rows] = await connection.execute(`SHOW COLUMNS FROM products LIKE '${col.name}'`);
            if (rows.length === 0) {
                console.log(`Adding column: ${col.name}...`);
                await connection.execute(`ALTER TABLE products ADD COLUMN ${col.name} ${col.type}`);
            } else {
                console.log(`Column ${col.name} already exists.`);
            }
        }

        console.log("Checking orders table for shipping_fee...");
        const [oColumns] = await connection.execute("SHOW COLUMNS FROM orders LIKE 'shipping_fee'");
        if (oColumns.length === 0) {
            await connection.execute("ALTER TABLE orders ADD COLUMN shipping_fee DECIMAL(10,3) DEFAULT 0.000");
            console.log("Added shipping_fee to orders.");
        }

        await connection.end();
        console.log("Schema sync complete.");
        process.exit(0);
    } catch (err) {
        console.error("Schema sync failed:", err);
        process.exit(1);
    }
}

syncSchema();
