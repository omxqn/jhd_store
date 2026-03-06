import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    // Support both exact string IDs ("009") and numeric IDs (2 → matches "002")
    const product = await queryOne(
        "SELECT * FROM products WHERE id = ? OR CAST(id AS UNSIGNED) = ?",
        [id, parseInt(id, 10) || 0]
    );
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json({ product });
}
