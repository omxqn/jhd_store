import { NextRequest, NextResponse } from "next/server";
import { queryOne, query } from "@/lib/db";
import { signJWT, setAuthCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const { email, code, name, phone, address } = await req.json();
        if (!email || !code) return NextResponse.json({ error: "Email and code required" }, { status: 400 });

        // 1. Validate OTP from users table
        const user = await queryOne<{ id: number; name: string; email: string; role: string; otp: string; otp_expires: Date; phone: string; address: string }>(
            "SELECT id, name, email, role, otp, otp_expires, phone, address FROM users WHERE email = ?",
            [email]
        );

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (user.otp !== code) {
            return NextResponse.json({ error: "Invalid code" }, { status: 401 });
        }

        if (new Date() > new Date(user.otp_expires)) {
            return NextResponse.json({ error: "Code expired" }, { status: 401 });
        }

        // 2. Clear OTP and potentially update profile info if provided (guest flow)
        if (name || phone || address) {
            await query(
                "UPDATE users SET otp = NULL, otp_expires = NULL, name = COALESCE(?, name), phone = COALESCE(?, phone), address = COALESCE(?, address) WHERE id = ?",
                [name || null, phone || null, address || null, user.id]
            );
        } else {
            await query("UPDATE users SET otp = NULL, otp_expires = NULL WHERE id = ?", [user.id]);
        }

        // 3. Issue JWT and set cookie
        const token = signJWT({
            userId: user.id,
            email: user.email,
            role: user.role as "customer" | "admin" | "super_admin",
            name: name || user.name,
        });

        const res = NextResponse.json({
            success: true,
            verified: true,
            token,
            user: {
                id: user.id,
                name: name || user.name,
                email: user.email,
                role: user.role,
                phone: phone || user.phone,
                address: address || user.address,
            },
        });

        setAuthCookie(res, token);
        return res;

    } catch (err) {
        console.error("[otp/verify]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
