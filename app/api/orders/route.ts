import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import pool from "@/lib/db";
import { getAuthFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
    // Use the shared SSL-enabled pool from lib/db
    const conn = await pool.getConnection();

    try {
        const body = await req.json();
        const auth = getAuthFromRequest(req);

        const {
            items, subtotal, discount, total, name, email, phone,
            address, city, paymentMethod, guestVerified,
            shippingTotal,
        } = body;

        if (!items?.length || total === undefined || total === null || !email) {
            conn.release();
            return NextResponse.json({ error: "Missing required order fields" }, { status: 400 });
        }

        const userId = auth?.userId ?? null;
        const guestEmail = !auth ? email : null;

        // === BEGIN TRANSACTION ===
        await conn.beginTransaction();

        // 1. Check stock for each item with row-level locking
        for (const item of items) {
            if (!item.productId) continue;
            const [rows]: any = await conn.execute(
                "SELECT stock FROM products WHERE id = ? FOR UPDATE",
                [item.productId]
            );
            const product = rows[0];
            if (!product) {
                await conn.rollback();
                conn.release();
                return NextResponse.json({ error: `Product "${item.name}" not found` }, { status: 404 });
            }
            if (product.stock !== null && product.stock < (item.quantity || 1)) {
                await conn.rollback();
                conn.release();
                return NextResponse.json({
                    error: `Sorry, "${item.name}" only has ${product.stock} unit(s) left in stock`
                }, { status: 409 });
            }
        }

        // 2. Insert the order
        const [result]: any = await conn.execute(
            `INSERT INTO orders (user_id, guest_email, status, subtotal, discount, total, name, email, phone, address, city, payment_method, shipping_fee, voucher_code)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, guestEmail, "processing", subtotal, discount, total, name, email, phone, address, city, paymentMethod || "thawani", shippingTotal || 0, body.voucherCode || null]
        );
        const orderId = result.insertId;

        // 3. Insert items & deduct stock
        for (const item of items) {
            await conn.execute(
                `INSERT INTO order_items (order_id, product_id, name, price, quantity, fabric_type, fabric_length, neck_size, neckline, stitch, stitch_price, accessories, accessories_price, tailor_measurements, image, shipping_cost)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    orderId, item.productId, item.name, item.price, item.quantity,
                    item.fabricType, item.fabricLength || null, item.neckSize || null,
                    item.neckline, item.stitch ? 1 : 0, item.stitchPrice || 0,
                    JSON.stringify(item.accessories || []), item.accessoriesPrice || 0,
                    JSON.stringify(item.tailorMeasurements || {}), item.image || null,
                    item.shippingCost || 0,
                ]
            );
            // Deduct stock atomically
            if (item.productId) {
                await conn.execute(
                    "UPDATE products SET stock = GREATEST(0, stock - ?) WHERE id = ?",
                    [item.quantity || 1, item.productId]
                );
            }
        }

        // 4. Record Voucher Redemption
        if (body.voucherCode && discount > 0) {
            const v = await queryOne<any>("SELECT id FROM vouchers WHERE code = ?", [body.voucherCode.toUpperCase()]);
            if (v) {
                await conn.execute(
                    "INSERT INTO voucher_redemptions (voucher_id, user_id, order_id) VALUES (?, ?, ?)",
                    [v.id, userId, orderId]
                );
            }
        }

        // === COMMIT ===
        await conn.commit();
        conn.release();

        // 5. Send notifications (best-effort, outside transaction)
        try {
            const { sendOrderConfirmationEmail, sendAdminOrderAlert } = await import("@/lib/email");
            await sendOrderConfirmationEmail({ orderId, customerName: name, customerEmail: email, total, currency: "ر.ع", status: "paid", items });
            const staff = await query("SELECT id, email, role FROM users WHERE role IN ('admin', 'super_admin')") as any[];
            if (staff?.length) {
                for (const member of staff) {
                    await sendAdminOrderAlert({ orderId, customerName: name, customerEmail: email, total, currency: "ر.ع", status: "paid", items }, member.email);
                    await query("INSERT INTO notifications (user_id, type, message, order_id) VALUES (?, 'order', ?, ?)",
                        [member.id, `New Premium Order #${orderId} from ${name}`, orderId]);
                }
            }
        } catch (emailErr) {
            console.error("[Order Notification Error]", emailErr);
        }

        return NextResponse.json({ orderId, success: true }, { status: 201 });
    } catch (err) {
        try { await conn.rollback(); } catch { }
        conn.release();
        console.error("[orders POST]", err);
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const auth = getAuthFromRequest(req);
    if (!auth) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    const orders = await query("SELECT * FROM orders WHERE user_id=? ORDER BY created_at DESC", [auth.userId]);

    // Attach items
    for (const order of orders as any[]) {
        order.items = await query("SELECT * FROM order_items WHERE order_id=?", [order.id]);
    }

    return NextResponse.json({ orders });
}
