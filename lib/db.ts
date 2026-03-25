import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

// SSL Certificate: prefer base64 env var (Vercel), fall back to file path (local dev)
function getSSLCert(): Buffer | undefined {
    if (process.env.DB_SSL_CERT_B64) {
        return Buffer.from(process.env.DB_SSL_CERT_B64, 'base64');
    }
    if (process.env.DB_SSL_CA) {
        const filePath = path.resolve(process.cwd(), process.env.DB_SSL_CA);
        if (fs.existsSync(filePath)) {
            return fs.readFileSync(filePath);
        }
    }
    return undefined;
}

const sslCert = getSSLCert();

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "",
    database: process.env.DB_NAME || "jihad_store",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: "+00:00",
    ssl: sslCert ? { ca: sslCert } : undefined,
});

export default pool;

// Helper: execute a query and return typed rows
export async function query<T = unknown>(sql: string, values?: unknown[]): Promise<T[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [rows] = await pool.execute(sql, values as any);
    return rows as T[];
}

// Helper: execute and return single row or null
export async function queryOne<T = unknown>(sql: string, values?: unknown[]): Promise<T | null> {
    const rows = await query<T>(sql, values);
    return rows[0] ?? null;
}
