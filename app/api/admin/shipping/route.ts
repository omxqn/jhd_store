import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
    try {
        const rates = await query<{country: string, rate_per_kg: number}>("SELECT country, rate_per_kg FROM shipping_rates");
        const ratesMap = rates.reduce((acc, row) => ({ ...acc, [row.country]: Number(row.rate_per_kg) }), {} as Record<string, number>);
        return NextResponse.json({ rates: ratesMap });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const { rates } = await req.json();
        for (const [country, rate] of Object.entries(rates)) {
            await query("INSERT INTO shipping_rates (country, rate_per_kg) VALUES (?, ?) ON DUPLICATE KEY UPDATE rate_per_kg = VALUES(rate_per_kg)", [country, rate]);
        }
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
