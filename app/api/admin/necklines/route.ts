import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAuth, JWTPayload } from "@/lib/auth";

async function ensureTable() {
    await query(`CREATE TABLE IF NOT EXISTS neckline_shapes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(200) NOT NULL UNIQUE,
        image_url VARCHAR(500) DEFAULT NULL,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
}

// GET all — public
export async function GET() {
    await ensureTable();
    const shapes = await query("SELECT * FROM neckline_shapes ORDER BY sort_order ASC, name ASC");
    return NextResponse.json({ shapes });
}

// POST create — admin only (requireAuth wraps the handler)
export const POST = requireAuth(async (req: NextRequest, _auth: JWTPayload) => {
    await ensureTable();
    const { name, image_url, sort_order } = await req.json();
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    await query(
        "INSERT INTO neckline_shapes (name, image_url, sort_order) VALUES (?, ?, ?)",
        [name.trim(), image_url || null, sort_order || 0]
    );
    return NextResponse.json({ success: true }, { status: 201 });
}, true);
