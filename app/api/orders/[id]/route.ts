import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const order = await queryOne<any>("SELECT * FROM orders WHERE id=?", [id]);
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    order.items = await query("SELECT * FROM order_items WHERE order_id=?", [id]);
    return NextResponse.json({ order });
}
