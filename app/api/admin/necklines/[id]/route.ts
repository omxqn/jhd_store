import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAuth, JWTPayload } from "@/lib/auth";

// PUT update
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return requireAuth(async (r: NextRequest, _auth: JWTPayload) => {
        const { name, image_url, sort_order } = await r.json();
        await query(
            "UPDATE neckline_shapes SET name = ?, image_url = ?, sort_order = ? WHERE id = ?",
            [name, image_url || null, sort_order || 0, id]
        );
        return NextResponse.json({ success: true });
    }, true)(req);
}

// DELETE
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return requireAuth(async (_r: NextRequest, _auth: JWTPayload) => {
        await query("DELETE FROM neckline_shapes WHERE id = ?", [id]);
        return NextResponse.json({ success: true });
    }, true)(req);
}
