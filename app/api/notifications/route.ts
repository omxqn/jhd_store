import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/auth";

// GET /api/notifications — returns notifications for the logged-in user
export async function GET(req: NextRequest) {
    const auth = getAuthFromRequest(req);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const notifications = await query(
        "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC",
        [auth.userId]
    );
    return NextResponse.json({ notifications });
}

// PATCH /api/notifications — mark all as read
export async function PATCH(req: NextRequest) {
    const auth = getAuthFromRequest(req);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await query("UPDATE notifications SET `read` = 1 WHERE user_id = ?", [auth.userId]);
    return NextResponse.json({ success: true });
}

// PATCH with body { id } — mark single notification as read
export async function PUT(req: NextRequest) {
    const auth = getAuthFromRequest(req);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await req.json();
    await query("UPDATE notifications SET `read` = 1 WHERE id = ? AND user_id = ?", [id, auth.userId]);
    return NextResponse.json({ success: true });
}
