import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
    let results: string[] = [];
    try {
        await query(`
            ALTER TABLE support_tickets 
            ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        `).catch(e => results.push("ticket updated_at: " + e.message));

        await query(`
            ALTER TABLE support_tickets 
            ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        `).catch(e => results.push("ticket created_at: " + e.message));

        await query(`
            ALTER TABLE ticket_messages
            ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        `).catch(e => results.push("msg created_at: " + e.message));

        return NextResponse.json({ success: true, results });
    } catch(e: any) {
        return NextResponse.json({ error: e.message, results });
    }
}
