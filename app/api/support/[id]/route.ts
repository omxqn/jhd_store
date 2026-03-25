import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { requireAuth, JWTPayload } from "@/lib/auth";

async function getTicketDetails(req: NextRequest, auth: JWTPayload, ticketId: string) {
    console.log(`[support API] GET ticket ${ticketId} for user ${auth.userId}`);
    const idNum = Number(ticketId);
    if (isNaN(idNum)) {
        console.warn(`[support API] Invalid ticketId: ${ticketId}`);
        return NextResponse.json({ error: "Invalid ticket ID" }, { status: 400 });
    }

    const ticket = await queryOne<any>(`
        SELECT t.*, 
        (SELECT COUNT(*) FROM ticket_messages WHERE ticket_id = t.id AND sender_type = 'admin') as admin_reply_count
        FROM support_tickets t WHERE t.id=? AND t.user_id=?
    `, [idNum, auth.userId]);
    
    if (!ticket) {
        console.warn(`[support API] Ticket ${ticketId} not found or unauthorized for user ${auth.userId}`);
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const messages = await query("SELECT * FROM ticket_messages WHERE ticket_id=? ORDER BY created_at ASC", [idNum]);
    console.log(`[support API] Found ${messages.length} messages for ticket ${ticketId}`);
    return NextResponse.json({ ticket, messages });
}

// Reply to ticket
async function replyToTicket(req: NextRequest, auth: JWTPayload, ticketId: string) {
    try {
        const ticket = await queryOne<any>("SELECT status FROM support_tickets WHERE id=? AND user_id=?", [ticketId, auth.userId]);
        if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });
        if (ticket.status === "closed") return NextResponse.json({ error: "Ticket is closed" }, { status: 403 });

        const { message } = await req.json();
        if (!message) return NextResponse.json({ error: "Message is required" }, { status: 400 });

        await query(
            "INSERT INTO ticket_messages (ticket_id, sender_id, sender_type, message) VALUES (?, ?, 'user', ?)",
            [ticketId, auth.userId, message]
        );
        
        // Update ticket updated_at and status
        await query("UPDATE support_tickets SET updated_at=NOW(), status='open' WHERE id=?", [ticketId]);

        return NextResponse.json({ success: true }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }
}

export const GET = requireAuth(async (req, auth, context) => {
    const { id } = await context.params;
    return getTicketDetails(req, auth, id);
});

export const POST = requireAuth(async (req, auth, context) => {
    const { id } = await context.params;
    return replyToTicket(req, auth, id);
});
