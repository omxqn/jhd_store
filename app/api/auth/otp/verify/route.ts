import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { signJWT, setAuthCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const { email, otp } = await req.json();
        if (!email || !otp) {
            return NextResponse.json({ error: "Email and OTP required" }, { status: 400 });
        }

        const user = await queryOne<{ id: number; name: string; email: string; role: string; otp: string; otp_expires: Date }>(
            "SELECT id, name, email, role, otp, otp_expires FROM users WHERE email = ?",
            [email]
        );

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Validate OTP
        if (user.otp !== otp) {
            return NextResponse.json({ error: "Invalid OTP code" }, { status: 401 });
        }

        // Check Expiry
        if (new Date() > new Date(user.otp_expires)) {
            return NextResponse.json({ error: "OTP has expired" }, { status: 401 });
        }

        // Clear OTP
        await query("UPDATE users SET otp = NULL, otp_expires = NULL WHERE id = ?", [user.id]);

        // Issue JWT
        const token = signJWT({ userId: user.id, email: user.email, role: user.role as any, name: user.name });
        const res = NextResponse.json({
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
        setAuthCookie(res, token);
        return res;

    } catch (err) {
        console.error("[OTP Verify Error]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
