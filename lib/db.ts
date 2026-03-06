import mysql from "mysql2/promise";

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
});

export default pool;

// Helper: execute a query and return typed rows
export async function query<T = unknown>(sql: string, values?: unknown[]): Promise<T[]> {
    const [rows] = await pool.execute(sql, values);
    return rows as T[];
}

// Helper: execute and return single row or null
export async function queryOne<T = unknown>(sql: string, values?: unknown[]): Promise<T | null> {
    const rows = await query<T>(sql, values);
    return rows[0] ?? null;
}
