import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

// GET /api/admin/stats/advanced
// Returns daily revenue for the last 30 days and category performance
export const GET = requireAuth(async (_req: NextRequest) => {
    try {
        // 1. Daily Revenue (Last 30 Days)
        const dailyRevenue = await query(`
            SELECT 
                DATE(created_at) as date,
                SUM(total) as revenue,
                COUNT(id) as orders
            FROM orders
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `);

        // 2. Category Performance
        const categoryStats = await query(`
            SELECT 
                p.category,
                SUM(oi.quantity) as units_sold,
                SUM(oi.price * oi.quantity) as revenue
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            GROUP BY p.category
            ORDER BY revenue DESC
        `);

        // 3. Order Status Distribution
        const statusStats = await query(`
            SELECT 
                status,
                COUNT(*) as count
            FROM orders
            GROUP BY status
        `);

        return NextResponse.json({
            dailyRevenue,
            categoryStats,
            statusStats
        });
    } catch (err) {
        console.error("[Advanced Stats API Error]", err);
        return NextResponse.json({ error: "Failed to fetch advanced statistics" }, { status: 500 });
    }
}, true);
