import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAuth, JWTPayload } from "@/lib/auth";

async function getAllOrders(req: NextRequest, _auth: JWTPayload) {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    let sql = "SELECT o.*, COUNT(oi.id) as item_count FROM orders o LEFT JOIN order_items oi ON oi.order_id=o.id";
    const params: unknown[] = [];
    if (status) { sql += " WHERE o.status=?"; params.push(status); }
    sql += " GROUP BY o.id ORDER BY o.created_at DESC";
    const orders = await query(sql, params);
    return NextResponse.json({ orders });
}

export const GET = requireAuth(getAllOrders, true);
