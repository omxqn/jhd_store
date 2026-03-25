import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { requireAuth, JWTPayload } from "@/lib/auth";

// Get user tickets
async function getTickets(_req: NextRequest, auth: JWTPayload) {
    try {
        const tickets = await query(`
            SELECT t.*, 
            CAST((SELECT COUNT(*) FROM ticket_messages WHERE ticket_id = t.id AND sender_type = 'admin') AS SIGNED) as admin_reply_count
            FROM support_tickets t WHERE user_id=? ORDER BY updated_at DESC
        `, [auth.userId]);
        return NextResponse.json({ tickets });
    } catch (err: any) {
        console.error("Support List API Error:", err);
        return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
    }
}

// Create new ticket
async function createTicket(req: NextRequest, auth: JWTPayload) {
    try {
        const body = await req.json();
        const { target, label, subject, message } = body;
        if (!target || !subject || !message) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        if ((target === "order" || target === "product") && !label) {
            return NextResponse.json({ error: `Please provide a ${target === "order" ? "Order ID" : "Product Name"}` }, { status: 400 });
        }

        const result: any = await query(
            "INSERT INTO support_tickets (user_id, target, label, subject, status) VALUES (?, ?, ?, ?, 'open')",
            [auth.userId, target, label, subject || null]
        );
        const ticketId = result.insertId;

        // Add first message
        await query(
            "INSERT INTO ticket_messages (ticket_id, sender_id, sender_type, message) VALUES (?, ?, 'user', ?)",
            [ticketId, auth.userId, message]
        );

        // Notify admins
        try {
            const { sendAdminTicketAlert } = await import("@/lib/email");
            const staff = await query("SELECT email FROM users WHERE role IN ('admin', 'super_admin')") as any[];
            const customer = await queryOne<any>("SELECT name FROM users WHERE id = ?", [auth.userId]);
            const customerName = customer?.name || `Customer #${auth.userId}`;
            
            for (const admin of staff) {
                await sendAdminTicketAlert(admin.email, { ticketId, customerName, subject });
            }
        } catch(e) { console.error("email alert fail", e); }

        return NextResponse.json({ success: true, ticketId }, { status: 201 });
    } catch (err: any) {
        console.error("Support API Error:", err);
        return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
    }
}

export const GET = requireAuth(getTickets);
export const POST = requireAuth(createTicket);
