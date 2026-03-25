/**
 * Run once to create the `jihad_store` database on SkySQL.
 * Usage: npx ts-node scripts/create-db.ts
 */
import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const sslCaPath = process.env.DB_SSL_CA
    ? path.resolve(process.cwd(), process.env.DB_SSL_CA)
    : null;

async function main() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || "3306"),
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        ssl: sslCaPath ? { ca: fs.readFileSync(sslCaPath) } : undefined,
        // No DB specified — we are creating it
    });

    const dbName = process.env.DB_NAME || "jihad_store";
    await conn.execute(
        `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log(`✅ Database '${dbName}' created (or already existed).`);
    await conn.end();
}

main().catch(e => { console.error("❌ Error:", e.message); process.exit(1); });
