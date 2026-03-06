import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

// GET /api/admin/users
// Lists all users - Restricted to Super Admins
export const GET = requireAuth(async () => {
    try {
        const users = await query("SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC");
        return NextResponse.json({ users });
    } catch (err) {
        console.error("[User List API Error]", err);
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}, false, true); // Admin=false, SuperAdmin=true

// PATCH /api/admin/users
// Updates user details - Restricted to Super Admins
export const PATCH = requireAuth(async (req: NextRequest) => {
    try {
        const { id, name, email, phone, role } = await req.json();

        if (!id) return NextResponse.json({ error: "User ID required" }, { status: 400 });

        // Build dynamic update
        const fields: string[] = [];
        const values: any[] = [];

        if (name) { fields.push("name = ?"); values.push(name); }
        if (email) { fields.push("email = ?"); values.push(email); }
        if (phone) { fields.push("phone = ?"); values.push(phone); }
        if (role) {
            const validRoles = ["customer", "admin", "super_admin"];
            if (!validRoles.includes(role)) return NextResponse.json({ error: "Invalid role" }, { status: 400 });
            fields.push("role = ?");
            values.push(role);
        }

        if (fields.length === 0) return NextResponse.json({ error: "No changes provided" }, { status: 400 });

        values.push(id);
        const result: any = await query(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, values);

        if (result.affectedRows === 0) return NextResponse.json({ error: "User not found" }, { status: 404 });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[User Update API Error]", err);
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
}, false, true); // Admin=false, SuperAdmin=true
