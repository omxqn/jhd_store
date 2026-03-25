const mysql = require('mysql2/promise');
const fs = require('fs');

async function main() {
    const conn = await mysql.createConnection({
        host: 'serverless-europe-west2.sysp0000.db2.skysql.com',
        port: 4017,
        user: 'dbpgf42349276',
        password: 'XoKggXc^z3hcUvVI7kLGn',
        database: 'jihad_store',
        ssl: { ca: fs.readFileSync('./globalsignrootca.pem') },
        multipleStatements: true
    });

    // Drop all existing tables first
    console.log('Dropping existing tables...');
    await conn.query("SET FOREIGN_KEY_CHECKS = 0");
    const [tables] = await conn.query("SHOW TABLES");
    for (const t of tables) {
        const name = Object.values(t)[0];
        await conn.query(`DROP TABLE IF EXISTS \`${name}\``);
        console.log(`  Dropped: ${name}`);
    }
    await conn.query("SET FOREIGN_KEY_CHECKS = 1");

    // Read dump
    console.log('\nImporting jihad_store (2).sql...');
    let sql = fs.readFileSync('./jihad_store (2).sql', 'utf8');

    // Remove phpMyAdmin-specific directives
    sql = sql.replace(/\/\*![\d]+ [^*]*\*\/;?\s*/g, '');
    sql = sql.replace(/^SET SQL_MODE.*$/gm, '');
    sql = sql.replace(/^SET time_zone.*$/gm, '');
    sql = sql.replace(/^START TRANSACTION;$/gm, '');

    // Fix the notifications rows where type='' (empty string violates ENUM)
    // The bad rows look like: (51, 3, '', 'Staff replied...
    // Pattern: (id, user_id, '', 'message...) — replace '' with 'announcement'
    sql = sql.replace(
        /\((\d+, \d+), '', ('Staff replied[^)]*?)\)/g,
        "($1, 'announcement', $2)"
    );

    await conn.query(sql);

    const [finalTables] = await conn.query("SHOW TABLES");
    console.log('\nImport complete! Tables:');
    finalTables.forEach(t => console.log('  -', Object.values(t)[0]));

    const [[uCount]] = await conn.query("SELECT COUNT(*) as c FROM users");
    const [[pCount]] = await conn.query("SELECT COUNT(*) as c FROM products");
    const [[oCount]] = await conn.query("SELECT COUNT(*) as c FROM orders");
    console.log(`\nData: ${uCount.c} users, ${pCount.c} products, ${oCount.c} orders`);

    await conn.end();
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
