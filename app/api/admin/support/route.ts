import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAuth, JWTPayload } from "@/lib/auth";

async function getAllTickets(req: NextRequest, _auth: JWTPayload) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");
        
        let sql = `
            SELECT t.*, u.name as user_name, u.email as user_email,
            CAST((SELECT COUNT(*) FROM ticket_messages WHERE ticket_id = t.id AND sender_type = 'admin') AS SIGNED) as admin_reply_count
            FROM support_tickets t
            LEFT JOIN users u ON t.user_id = u.id
            WHERE 1=1
        `;
        const params: any[] = [];
        
        if (status) {
            if (status === "open") {
                sql += " AND (t.status = 'open' OR t.status = 'awaiting')";
            } else {
                sql += " AND t.status = ?";
                params.push(status);
            }
        }
        
        sql += " ORDER BY t.updated_at DESC";
        
        const tickets = await query(sql, params);
        return NextResponse.json({ tickets });
    } catch (err: any) {
        console.error("Admin Support List API Error:", err);
        return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
    }
}

export const GET = requireAuth(getAllTickets, true);
