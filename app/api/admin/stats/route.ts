import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

// GET /api/admin/stats
export const GET = requireAuth(async (_req: NextRequest) => {
    const [totalRevenue] = await query<{ total: number }>("SELECT COALESCE(SUM(total),0) as total FROM orders") as any[];
    const [totalOrders] = await query<{ count: number }>("SELECT COUNT(*) as count FROM orders") as any[];
    const [totalUsers] = await query<{ count: number }>("SELECT COUNT(*) as count FROM users WHERE role='customer'") as any[];
    const [totalProducts] = await query<{ count: number }>("SELECT COUNT(*) as count FROM products") as any[];
    const recentOrders = await query("SELECT o.*, COUNT(oi.id) as item_count FROM orders o LEFT JOIN order_items oi ON oi.order_id=o.id GROUP BY o.id ORDER BY o.created_at DESC LIMIT 10");
    const topProducts = await query("SELECT p.id, p.name, p.sold, p.price FROM products p ORDER BY p.sold DESC LIMIT 5");

    return NextResponse.json({
        revenue: (totalRevenue as any).total,
        orders: (totalOrders as any).count,
        users: (totalUsers as any).count,
        products: (totalProducts as any).count,
        recentOrders,
        topProducts,
    });
}, true);
