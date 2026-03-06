import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAuth, JWTPayload } from "@/lib/auth";

// GET all categories — public
export async function GET() {
    const categories = await query(
        "SELECT * FROM categories ORDER BY sort_order ASC, name ASC"
    );
    return NextResponse.json({ categories });
}

// POST create — admin only
export const POST = requireAuth(async (req: NextRequest, _auth: JWTPayload) => {
    const { name, name_ar, image_url, sort_order } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    await query(
        "INSERT INTO categories (name, name_ar, image_url, sort_order) VALUES (?, ?, ?, ?)",
        [name.trim(), name_ar?.trim() || null, image_url || null, sort_order || 0]
    );
    return NextResponse.json({ success: true }, { status: 201 });
}, true);
