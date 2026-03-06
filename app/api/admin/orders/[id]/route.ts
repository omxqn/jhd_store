import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { requireAuth, JWTPayload } from "@/lib/auth";

async function updateOrder(req: NextRequest, _auth: JWTPayload) {
    const url = new URL(req.url);
    const id = url.pathname.split("/").at(-1);
    const body = await req.json();
    const {
        status, subtotal, discount, total, refunded_amount,
        name, email, phone, address, city
    } = body;

    const financialFields = ["subtotal", "discount", "total"]; // Strictly super_admin
    const superOnlyChanges = financialFields.filter(f => body[f] !== undefined);

    if (superOnlyChanges.length > 0 && _auth.role !== "super_admin") {
        return NextResponse.json({ error: "Only Super Admins can adjust core pricing (subtotal/total/discount)" }, { status: 403 });
    }

    // Admins and Super Admins can both issue refunds
    if (body.refunded_amount !== undefined && _auth.role === "customer") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // 2. Validate status if provided
    if (status) {
        const valid = ["paid", "processing", "shipped", "delivered", "refunded"];
        if (!valid.includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // 3. Automated Refund Status
    let finalStatus = status;
    // If a refund is being issued (body has refunded_amount) and no status is provided, force "refunded"
    if (body.refunded_amount !== undefined && !status) {
        finalStatus = "refunded";
    }

    // 4. Build update query dynamically
    const fields: string[] = [];
    const values: any[] = [];

    const addField = (name: string, value: any) => {
        if (value !== undefined) {
            fields.push(`${name} = ?`);
            values.push(value);
        }
    };

    addField("status", finalStatus);
    addField("subtotal", subtotal);
    addField("discount", discount);
    addField("total", total);
    addField("refunded_amount", refunded_amount);
    addField("name", name);
    addField("email", email);
    addField("phone", phone);
    addField("address", address);
    addField("city", city);

    if (fields.length === 0) return NextResponse.json({ error: "No changes provided" }, { status: 400 });

    values.push(id);
    await query(`UPDATE orders SET ${fields.join(", ")}, updated_at=NOW() WHERE id=?`, values);

    // 3. Handle notifications if status changed
    if (status) {
        const fullOrder = await queryOne<any>("SELECT * FROM orders WHERE id=?", [id]);
        if (fullOrder) {
            if (fullOrder.user_id) {
                const msgMap: Record<string, string> = {
                    processing: `Your Order #${id} is being processed`,
                    shipped: `Your Order #${id} has been shipped`,
                    delivered: `Your Order #${id} has been received`,
                    refunded: `Your Order #${id} has been refunded`,
                };
                if (msgMap[status]) {
                    await query("INSERT INTO notifications (user_id, type, message, order_id) VALUES (?, 'order', ?, ?)",
                        [fullOrder.user_id, msgMap[status], id]);
                }
            }

            // Email notification
            try {
                const { sendOrderStatusUpdateEmail } = await import("@/lib/email");
                const orderItems = await query("SELECT * FROM order_items WHERE order_id=?", [id]);
                await sendOrderStatusUpdateEmail({
                    orderId: id as string,
                    customerName: fullOrder.name,
                    customerEmail: fullOrder.email,
                    total: fullOrder.total,
                    currency: "ر.ع",
                    status,
                    items: orderItems as any[]
                });
            } catch (emailErr) {
                console.error("[Status Update Email Error]", emailErr);
            }
        }
    }

    return NextResponse.json({ success: true });
}

async function getOrder(req: NextRequest, _auth: JWTPayload) {
    const url = new URL(req.url);
    const id = url.pathname.split("/").at(-1);
    const order = await queryOne<any>("SELECT * FROM orders WHERE id=?", [id]);
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
    order.items = await query("SELECT * FROM order_items WHERE order_id=?", [id]);
    return NextResponse.json({ order });
}

export const GET = requireAuth(getOrder, true);
export const PATCH = requireAuth(updateOrder, true);
