import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    
    // Support both exact string IDs ("009") and numeric IDs (2 → matches "002")
    let product: any = await queryOne(
        "SELECT * FROM products WHERE id = ? OR CAST(id AS UNSIGNED) = ?",
        [id, parseInt(id, 10) || 0]
    );

    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    // Enrich neckline_shapes with images if they are just strings
    if (product.neckline_shapes) {
        try {
            let names = JSON.parse(product.neckline_shapes);
            if (Array.isArray(names) && names.length > 0) {
                const masterShapes: any[] = await query("SELECT name, image_url FROM neckline_shapes");
                product.neckline_shapes = JSON.stringify(names.map(n => {
                    const name = typeof n === "string" ? n : n?.name;
                    const match = masterShapes.find(ms => ms.name === name);
                    return { name, image: match?.image_url || "" };
                }));
            }
        } catch (e) {
            console.error("Error enriching necklines:", e);
        }
    }

    return NextResponse.json({ product });
}
