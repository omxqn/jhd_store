import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { requireAuth, JWTPayload } from "@/lib/auth";

async function updateProduct(req: NextRequest, _auth: JWTPayload, id: string) {
    try {
        const data = await req.json();
        const fields = ["name", "category", "price", "old_price", "images", "badges", "availability", "description", "details",
            "fabric_types", "neckline_shapes", "stitch_price", "accessories", "shipping_note", "most_selling", "specs", "stock", "shipping_cost", "sizes", "colors", "is_premade", "options"];
        const jsonFields = new Set(["images", "badges", "fabric_types", "neckline_shapes", "accessories", "specs", "sizes", "colors", "options"]);
        const boolFields = new Set(["most_selling", "is_premade"]);

        const setClauses = fields.map(f => `${f}=?`).join(", ");
        const values = fields.map(f => {
            if (!(f in data)) return null;
            let val = data[f];
            if (boolFields.has(f)) return val ? 1 : 0;
            return jsonFields.has(f) ? JSON.stringify(val || (f === "options" ? [] : [])) : val;
        });
        values.push(id);

        await query(`UPDATE products SET ${setClauses}, updated_at=NOW() WHERE id=?`, values);
        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("Update error:", err);
        return NextResponse.json({ error: err.message || "Failed to update product" }, { status: 500 });
    }
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

export const PUT = requireAuth(async (req, auth, context) => {
    const { id } = await context.params;
    return updateProduct(req, auth, id);
}, true);

export const DELETE = requireAuth(async (req, auth, context) => {
    const { id } = await context.params;
    return deleteProduct(req, auth, id);
}, true);
