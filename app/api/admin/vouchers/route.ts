import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAuth, JWTPayload } from "@/lib/auth";

async function getVouchers(_req: NextRequest, _auth: JWTPayload) {
    const vouchers = await query("SELECT * FROM vouchers ORDER BY created_at DESC");
    return NextResponse.json({ vouchers });
}

async function createVoucher(req: NextRequest, _auth: JWTPayload) {
    const { code, discount_amount, discount_type, expires_at, new_user_only, is_public, max_uses_per_user } = await req.json();
    if (!code || !discount_amount) return NextResponse.json({ error: "Code and amount required" }, { status: 400 });

    await query(
        "INSERT INTO vouchers (code, discount_amount, discount_type, expires_at, new_user_only, is_public, max_uses_per_user) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [code.toUpperCase(), discount_amount, discount_type || 'fixed', expires_at || null, new_user_only || false, is_public ?? true, max_uses_per_user ?? 1]
    );
    return NextResponse.json({ success: true }, { status: 201 });
}

async function deleteVoucher(req: NextRequest, _auth: JWTPayload) {
    const { code } = await req.json();
    await query("UPDATE vouchers SET active=0 WHERE code=?", [code]);
    return NextResponse.json({ success: true });
}

export const GET = requireAuth(getVouchers, true);
export const POST = requireAuth(createVoucher, true);
export const DELETE = requireAuth(deleteVoucher, true);
