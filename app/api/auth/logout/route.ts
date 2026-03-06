import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";

export async function POST(_req: NextRequest) {
    const res = NextResponse.json({ success: true });
    clearAuthCookie(res);
    return res;
}
