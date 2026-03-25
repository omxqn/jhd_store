const mysql = require('mysql2/promise');

async function debug() {
    const config = {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'jihad_store'
    };

    try {
        const connection = await mysql.createConnection(config);
        console.log("Connected to DB.");

        const [tickets] = await connection.execute("SELECT * FROM support_tickets");
        console.log(`Total Tickets: ${tickets.length}`);
        console.log("Sample Ticket:", tickets[0]);

        const [messages] = await connection.execute("SELECT * FROM ticket_messages LIMIT 5");
        console.log(`Sample Messages: ${messages.length}`);
        
        await connection.end();
    } catch (e) {
        console.error("DB Error:", e);
    }
}

debug();
