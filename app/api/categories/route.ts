import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// Ensure the categories table exists and has all needed columns
async function ensureTable() {
    await query(`CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(200) NOT NULL UNIQUE,
        name_ar VARCHAR(200) DEFAULT NULL,
        image_url VARCHAR(500) DEFAULT NULL,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    // Add columns that may be missing from earlier migrations
    const cols = ["is_active TINYINT(1) DEFAULT 1", "name_ar VARCHAR(200) DEFAULT NULL", "image_url VARCHAR(500) DEFAULT NULL", "sort_order INT DEFAULT 0"];
    for (const col of cols) {
        try { await query(`ALTER TABLE categories ADD COLUMN ${col}`); } catch { }
    }
}

// Seed all categories on first run
async function seedIfEmpty() {
    const rows = await query("SELECT COUNT(*) as cnt FROM categories") as any[];
    if (rows[0]?.cnt > 0) return;

    const cats: [string, string | null, string | null, number][] = [
        ["Thobes", "ثياب", null, 1],
        ["Abayas", "عبايات", null, 2],
        ["Bishts", "بشوت", null, 3],
        ["Kids", "أطفال", null, 4],
        ["Accessories", "إكسسوارات", null, 5],
        ["كولكشن العيد", null, "https://cdn.files.salla.network/homepage/345024266/24602d38-7121-45a4-b1e1-91e89b524705.webp", 10],
        ["حـُب", null, "https://cdn.files.salla.network/homepage/345024266/97a10aa2-e8f9-46f7-8232-2f9d6a7399a4.webp", 11],
        ["هدايا رمضانية", null, "https://cdn.files.salla.network/homepage/345024266/f85a03ec-b725-4b8b-9415-7f40d93dca04.webp", 12],
        ["بوكيهات", null, "https://cdn.files.salla.network/homepage/345024266/ef720203-7e8d-4bf5-9613-bf59af0f421a.webp", 13],
        ["الباقات الكبيرة", null, "https://cdn.files.salla.network/homepage/345024266/abba7411-42ed-42ee-8bad-da80bbf00c20.webp", 14],
        ["هدايا التخرج", null, "https://cdn.files.salla.network/homepage/345024266/536e9dc3-7306-48ab-8294-9368603bceef.webp", 15],
        ["مـــريلة", null, "https://cdn.files.salla.network/homepage/345024266/3813a63c-e971-483b-b3b8-cdce0375af45.webp", 16],
        ["كروت الإهداء", null, "https://cdn.files.salla.network/homepage/345024266/88bec2c5-1af2-49a1-80c0-2322306d2518.webp", 17],
        ["تشوكلت", null, "https://cdn.files.salla.network/homepage/345024266/47f1b2ff-776e-44eb-9e2f-41b4ec17016e.webp", 18],
        ["مق وأكواب", null, "https://cdn.files.salla.network/homepage/345024266/3d480338-3a60-475f-a76a-eaf4083d82a1.webp", 19],
        ["فايبي", null, "https://cdn.files.salla.network/homepage/345024266/0478f71f-e122-462c-956a-4d4ccee3a275.webp", 20],
        ["فازات", null, "https://cdn.files.salla.network/homepage/345024266/f9893909-8bee-445f-a57b-e700122fe80d.webp", 21],
    ];

    for (const [name, name_ar, image_url, sort_order] of cats) {
        await query(
            "INSERT IGNORE INTO categories (name, name_ar, image_url, sort_order) VALUES (?, ?, ?, ?)",
            [name, name_ar, image_url, sort_order]
        );
    }
}

let initialized = false;

export async function GET() {
    if (!initialized) {
        try { await ensureTable(); await seedIfEmpty(); initialized = true; } catch (e) { console.error("[categories init]", e); }
    }
    const categories = await query(
        "SELECT * FROM categories ORDER BY sort_order ASC, name ASC"
    );
    return NextResponse.json({ categories });
}
