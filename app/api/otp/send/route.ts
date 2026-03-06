import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { sendOTPEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();
        if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

        // Generate 6-digit OTP
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

        // Upsert user (Passwordless behavior: auto-register if new)
        const user = await queryOne("SELECT id FROM users WHERE email = ?", [email]);
        if (user) {
            await query(
                "UPDATE users SET otp = ?, otp_expires = ? WHERE email = ?",
                [code, expiresAt, email]
            );
        } else {
            // Auto-register new user
            await query(
                "INSERT INTO users (name, email, otp, otp_expires, role, password) VALUES (?, ?, ?, ?, 'customer', 'passwordless')",
                [email.split("@")[0], email, code, expiresAt]
            );
        }

        // Send Email using common utility
        await sendOTPEmail(email, code);

        return NextResponse.json({ success: true, message: "OTP sent to your email" });
    } catch (err) {
        console.error("[otp/send]", err);
        return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
    }
}
