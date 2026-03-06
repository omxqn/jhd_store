import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const SECRET = process.env.JWT_SECRET || "fallback_secret_change_me";
const COOKIE_NAME = "jihad_token";

export type JWTPayload = {
    userId: number;
    email: string;
    role: "customer" | "admin" | "super_admin";
    name: string;
};

// Sign a JWT (7-day expiry)
export function signJWT(payload: JWTPayload): string {
    return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

// Verify and decode JWT — returns null if invalid
export function verifyJWT(token: string): JWTPayload | null {
    try {
        return jwt.verify(token, SECRET) as JWTPayload;
    } catch {
        return null;
    }
}

// Extract JWT payload from request cookie
export function getAuthFromRequest(req: NextRequest): JWTPayload | null {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyJWT(token);
}

// Set auth cookie on a response
export function setAuthCookie(res: NextResponse, token: string): void {
    res.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
    });
}

// Clear auth cookie
export function clearAuthCookie(res: NextResponse): void {
    res.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
}

// Middleware: require auth (optionally require admin or super_admin role)
export function requireAuth(
    handler: (req: NextRequest, auth: JWTPayload) => Promise<NextResponse>,
    requireAdmin = false,
    requireSuperAdmin = false
) {
    return async (req: NextRequest) => {
        const auth = getAuthFromRequest(req);
        if (!auth) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (requireSuperAdmin && auth.role !== "super_admin") {
            return NextResponse.json({ error: "Forbidden — super admin only" }, { status: 403 });
        }

        if (requireAdmin && (auth.role !== "admin" && auth.role !== "super_admin")) {
            return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });
        }

        return handler(req, auth);
    };
}
