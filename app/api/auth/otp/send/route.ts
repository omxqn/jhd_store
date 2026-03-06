import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { sendOTPEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
    try {
        const { email, name } = await req.json();
        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        // Upsert user (Passwordless behavior: auto-register if new)
        const user = await queryOne("SELECT id FROM users WHERE email = ?", [email]);
        if (user) {
            await query(
                "UPDATE users SET otp = ?, otp_expires = ? WHERE email = ?",
                [otp, expires, email]
            );
        } else {
            // Auto-register new user
            await query(
                "INSERT INTO users (name, email, otp, otp_expires, role, password) VALUES (?, ?, ?, ?, 'customer', 'passwordless')",
                [name || email.split("@")[0], email, otp, expires]
            );
        }

        // Send Email
        await sendOTPEmail(email, otp);

        return NextResponse.json({ success: true, message: "OTP sent successfully" });
    } catch (err) {
        console.error("[OTP Send Error]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
