import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { requireAuth, JWTPayload } from "@/lib/auth";

async function getAll(req: NextRequest, _auth: JWTPayload) {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const suggestId = searchParams.get("suggest_id");

    if (suggestId) {
        // Return next suggested product ID
        const row = await queryOne<any>("SELECT MAX(CAST(id AS UNSIGNED)) as max_id FROM products WHERE id REGEXP '^[0-9]+$'");
        const nextNum = (parseInt(row?.max_id || "0") + 1);
        return NextResponse.json({ next_id: String(nextNum).padStart(3, "0") });
    }

    let sql = "SELECT * FROM products WHERE 1=1";
    const params: unknown[] = [];
    if (category) { sql += " AND category=?"; params.push(category); }
    if (search) { sql += " AND name LIKE ?"; params.push(`%${search}%`); }
    sql += " ORDER BY created_at DESC";
    const products = await query(sql, params);
    return NextResponse.json({ products });
}

async function createProduct(req: NextRequest, _auth: JWTPayload) {
    const data = await req.json();
    const { id, name, category, price, old_price, images, badges, availability, description, details,
        fabric_types, neckline_shapes, stitch_price, accessories, shipping_note, most_selling, specs, stock, shipping_cost,
        sizes, colors, is_premade, options, weight } = data;

    await query(
        `INSERT INTO products (id, name, category, price, old_price, images, badges, availability, description, details,
         fabric_types, neckline_shapes, stitch_price, accessories, shipping_note, most_selling, specs, stock, shipping_cost,
         sizes, colors, is_premade, options, weight)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [id, name, category, price, old_price || null,
            JSON.stringify(images), JSON.stringify(badges), availability, description, details,
            JSON.stringify(fabric_types), JSON.stringify(neckline_shapes), stitch_price,
            JSON.stringify(accessories), shipping_note, most_selling ? 1 : 0, JSON.stringify(specs),
            stock ?? 100, shipping_cost ?? 2.000,
            JSON.stringify(sizes || []), JSON.stringify(colors || []), is_premade ? 1 : 0, JSON.stringify(options || []), weight ?? 0.5]
    );
    return NextResponse.json({ success: true, id }, { status: 201 });
}

export const GET = requireAuth(getAll, true);
export const POST = requireAuth(createProduct, true);
