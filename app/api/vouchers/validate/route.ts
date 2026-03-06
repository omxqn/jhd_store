import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/auth";

// POST /api/vouchers/validate
export async function POST(req: NextRequest) {
    try {
        const { code, subtotal, email: providedEmail } = await req.json();
        if (!code) return NextResponse.json({ error: "Voucher code required" }, { status: 400 });

        const auth = getAuthFromRequest(req);
        const userEmail = auth?.email || providedEmail;
        const userId = auth?.userId;

        const voucher = await queryOne<any>(
            "SELECT * FROM vouchers WHERE code = ? AND active = 1",
            [code.toUpperCase()]
        );

        if (!voucher) {
            return NextResponse.json({ error: "Invalid or inactive voucher code" }, { status: 404 });
        }

        // 1. Check expiration
        if (voucher.expires_at && new Date(voucher.expires_at) < new Date()) {
            return NextResponse.json({ error: "This voucher has expired" }, { status: 400 });
        }

        // 2. Check "New User Only"
        if (voucher.new_user_only && userEmail) {
            const previousOrder = await queryOne(
                "SELECT id FROM orders WHERE email = ? OR user_id = ?",
                [userEmail, userId || -1]
            );
            if (previousOrder) {
                return NextResponse.json({ error: "This voucher is for new customers only" }, { status: 400 });
            }
        }

        // 3. Check Usage Limits
        if (!voucher.is_public) {
            // Private voucher: Total 1 usage ever
            const totalRedemptions = await queryOne<any>(
                "SELECT COUNT(*) as count FROM voucher_redemptions WHERE voucher_id = ?",
                [voucher.id]
            );
            if (totalRedemptions.count > 0) {
                return NextResponse.json({ error: "This voucher has already been used" }, { status: 400 });
            }
        } else if (userEmail || userId) {
            // Public voucher: check per-user usage against max_uses_per_user
            const maxUses = voucher.max_uses_per_user ?? 1;
            const userRedemptions = await queryOne<any>(
                "SELECT COUNT(*) as count FROM voucher_redemptions vr JOIN orders o ON vr.order_id = o.id WHERE vr.voucher_id = ? AND (o.email = ? OR o.user_id = ?)",
                [voucher.id, userEmail, userId || -1]
            );
            if (userRedemptions.count >= maxUses) {
                const msg = maxUses === 1
                    ? "You have already used this voucher"
                    : `You have reached the maximum use limit (${maxUses}x) for this voucher`;
                return NextResponse.json({ error: msg }, { status: 400 });
            }
        }

        let discountAmount = 0;
        if (voucher.discount_type === "percentage") {
            discountAmount = (subtotal * voucher.discount_amount) / 100;
        } else {
            discountAmount = voucher.discount_amount;
        }

        return NextResponse.json({
            success: true,
            code: voucher.code,
            discountType: voucher.discount_type,
            discountAmount: voucher.discount_amount,
            appliedDiscount: discountAmount
        });
    } catch (err) {
        console.error("[Voucher Validation API Error]", err);
        return NextResponse.json({ error: "Failed to validate voucher" }, { status: 500 });
    }
}
