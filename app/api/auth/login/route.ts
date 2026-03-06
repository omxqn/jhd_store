import { NextResponse } from "next/server";

export async function POST() {
    return NextResponse.json(
        { error: "Password-based login is deprecated. Please use the OTP system." },
        { status: 410 }
    );
}
