import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { requireAuth, JWTPayload } from "@/lib/auth";

async function updateProduct(req: NextRequest, _auth: JWTPayload, id: string) {
    const data = await req.json();
    const fields = ["name", "category", "price", "old_price", "images", "badges", "availability", "description", "details",
        "fabric_types", "neckline_shapes", "stitch_price", "accessories", "shipping_note", "most_selling", "specs", "stock"];
    const jsonFields = new Set(["images", "badges", "fabric_types", "neckline_shapes", "accessories", "specs"]);

    const setClauses = fields.map(f => `${f}=?`).join(", ");
    const values = fields.map(f => {
        if (!(f in data)) return null;
        return jsonFields.has(f) ? JSON.stringify(data[f]) : data[f];
    });
    values.push(id);

    await query(`UPDATE products SET ${setClauses}, updated_at=NOW() WHERE id=?`, values);
    return NextResponse.json({ success: true });
}

async function deleteProduct(_req: NextRequest, _auth: JWTPayload, id: string) {
    await query("DELETE FROM products WHERE id=?", [id]);
    return NextResponse.json({ success: true });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const product = await queryOne("SELECT * FROM products WHERE id=?", [id]);
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ product });
}

export const PUT = requireAuth(async (req, auth, ...args) => updateProduct(req, auth, (args[0] as any)?.params?.id ?? ""), true);
export const DELETE = requireAuth(async (req, auth, ...args) => deleteProduct(req, auth, (args[0] as any)?.params?.id ?? ""), true);
