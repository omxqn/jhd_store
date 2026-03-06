import { NextResponse } from "next/server";

export async function POST() {
    return NextResponse.json(
        { error: "Direct registration is deprecated. Please use the OTP system for automatic registration." },
        { status: 410 }
    );
}
