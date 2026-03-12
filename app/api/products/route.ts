import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get("category");
        const sort = searchParams.get("sort") || "selling";
        const search = searchParams.get("search") || "";

        let sql = "SELECT * FROM products WHERE 1=1";
        const params: unknown[] = [];

        if (category) { sql += " AND category = ?"; params.push(category); }
        if (searchParams.get("featured") === "1") { sql += " AND most_selling = 1"; }
        if (searchParams.get("limited") === "1") { sql += " AND badges LIKE '%\"limited\"%'"; }
        if (searchParams.get("new") === "1") { sql += " AND badges LIKE '%\"new\"%'"; }
        if (searchParams.get("discounted") === "1") { sql += " AND old_price > price AND old_price IS NOT NULL"; }

        if (search) {
            const cleanSearch = search.replace("#", "");
            const numericSearch = cleanSearch.replace(/^0+/, "");

            sql += " AND (name LIKE ? OR id LIKE ? OR (id REGEXP '^[0]*' AND TRIM(LEADING '0' FROM id) = ?))";
            params.push(`%${search}%`, `%${cleanSearch}%`, numericSearch || "0");
        }

        const orderMap: Record<string, string> = {
            selling: "sold DESC",
            cheapest: "price ASC",
            expensive: "price DESC",
            rating: "rating DESC",
            newest: "created_at DESC",
        };
        sql += ` ORDER BY ${orderMap[sort] || "sold DESC"}`;

        const products = await query(sql, params);
        return NextResponse.json({ products });
    } catch (err) {
        console.error("[products GET]", err);
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}
