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
        console.log(`Connected to ${config.database}. Checking orders table...`);

        const [rows] = await connection.execute("SHOW COLUMNS FROM orders LIKE 'voucher_code'");
        if (rows.length === 0) {
            console.log("Adding column: voucher_code to orders...");
            await connection.execute("ALTER TABLE orders ADD COLUMN voucher_code VARCHAR(50) NULL AFTER shipping_fee");
        } else {
            console.log("Column voucher_code already exists.");
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
