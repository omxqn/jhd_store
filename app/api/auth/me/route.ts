import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { queryOne } from "@/lib/db";

// GET /api/auth/me
// Returns the currently logged in user's profile verified by JWT and Database
export async function GET(req: NextRequest) {
    try {
        const auth = getAuthFromRequest(req);
        if (!auth) {
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        // Verify user still exists and get latest role from DB to be absolutely sure
        const user = await queryOne<any>(
            "SELECT id, name, email, role, phone, address, city FROM users WHERE id = ?",
            [auth.userId]
        );

        if (!user) {
            return NextResponse.json({ authenticated: false, error: "User not found" }, { status: 404 });
        }

        const response = NextResponse.json({
            authenticated: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role, // Verified role from DB
                phone: user.phone,
                address: user.address,
                city: user.city
            }
        });

        // Automatically refresh the JWT token if the role was upgraded in the DB
        if (user.role !== auth.role) {
            const { setAuthCookie, signJWT } = await import("@/lib/auth");
            auth.role = user.role;
            setAuthCookie(response, signJWT(auth));
        }

        return response;
    } catch (err) {
        console.error("[auth/me]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
