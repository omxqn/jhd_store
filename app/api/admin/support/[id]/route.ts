import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { requireAuth, JWTPayload } from "@/lib/auth";
import { sendTicketReplyEmail } from "@/lib/email";

async function getAdminTicket(req: NextRequest, auth: JWTPayload, ticketId: string) {
    const ticket = await queryOne<any>(`
        SELECT t.*, u.name as user_name, u.email as user_email
        FROM support_tickets t
        LEFT JOIN users u ON t.user_id = u.id
        WHERE t.id = ?
    `, [ticketId]);
    
    if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const messages = await query(`
        SELECT m.*, u.name as admin_name 
        FROM ticket_messages m
        LEFT JOIN users u ON m.sender_id = u.id
        WHERE m.ticket_id = ? 
        ORDER BY m.created_at ASC
    `, [ticketId]);
    
    return NextResponse.json({ ticket, messages });
}

async function adminReplyTicket(req: NextRequest, auth: JWTPayload, ticketId: string) {
    try {
        const ticket = await queryOne<any>(`
            SELECT t.*, u.email as user_email, u.name as user_name 
            FROM support_tickets t
            LEFT JOIN users u ON t.user_id = u.id 
            WHERE t.id = ?
        `, [ticketId]);
        if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });

        const { message, status } = await req.json();

        if (message) {
            await query(
                "INSERT INTO ticket_messages (ticket_id, sender_id, sender_type, message) VALUES (?, ?, 'admin', ?)",
                [ticketId, auth.userId, message]
            );
            
            // Notify user
            await query(
                "INSERT INTO notifications (user_id, type, message) VALUES (?, 'support', ?)",
                [ticket.user_id, `Staff replied to your support ticket #${ticketId}: ${ticket.subject}`]
            );

            // Send Email best-effort
            if (ticket.user_email) {
                try {
                    await sendTicketReplyEmail({
                        ticketId,
                        customerName: ticket.user_name,
                        customerEmail: ticket.user_email,
                        subject: ticket.subject,
                        replyMessage: message
                    });
                } catch(e) { console.error("Email failed", e); }
            }
        }

        const newStatus = status || 'awaiting';
        if (newStatus !== ticket.status) {
            await query("UPDATE support_tickets SET status=?, updated_at=NOW() WHERE id=?", [newStatus, ticketId]);
        } else {
            await query("UPDATE support_tickets SET updated_at=NOW() WHERE id=?", [ticketId]);
        }

        return NextResponse.json({ success: true }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: "Failed to process reply" }, { status: 500 });
    }
}

export const GET = requireAuth(async (req, auth, context) => {
    const { id } = await context.params;
    return getAdminTicket(req, auth, id);
}, true);

export const POST = requireAuth(async (req, auth, context) => {
    const { id } = await context.params;
    return adminReplyTicket(req, auth, id);
}, true);
