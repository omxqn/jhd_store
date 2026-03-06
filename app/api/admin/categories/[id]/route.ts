import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAuth, JWTPayload } from "@/lib/auth";

// PUT update
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return requireAuth(async (r: NextRequest, _auth: JWTPayload) => {
        const { name, name_ar, image_url, sort_order } = await r.json();
        if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
        await query(
            "UPDATE categories SET name = ?, name_ar = ?, image_url = ?, sort_order = ? WHERE id = ?",
            [name.trim(), name_ar?.trim() || null, image_url || null, sort_order || 0, id]
        );
        return NextResponse.json({ success: true });
    }, true)(req);
}

// DELETE
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return requireAuth(async (_r: NextRequest, _auth: JWTPayload) => {
        await query("DELETE FROM categories WHERE id = ?", [id]);
        return NextResponse.json({ success: true });
    }, true)(req);
}
