const { query } = require('./lib/db');

async function debug() {
    try {
        const tickets = await query("SELECT * FROM support_tickets LIMIT 10");
        console.log("Support Tickets (Recent):", JSON.stringify(tickets, null, 2));
        
        const count = await query("SELECT COUNT(*) as total FROM support_tickets");
        console.log("Total tickets count:", count[0].total);
    } catch (e) {
        console.error("DB Error:", e);
    }
    process.exit();
}

debug();
