const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function updateDb() {
    // Manually parse .env
    const envPath = path.resolve(__dirname, '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) env[key.trim()] = value.trim().replace(/^"(.*)"$/, '$1');
    });

    const connection = await mysql.createConnection({
        host: env.DB_HOST,
        port: parseInt(env.DB_PORT || '3306'),
        user: env.DB_USER,
        password: env.DB_PASS,
        database: env.DB_NAME,
    });

    try {
        console.log('Adding "options" column to "products" table...');
        await connection.query(`
            ALTER TABLE products 
            ADD COLUMN options JSON DEFAULT NULL AFTER colors
        `);
        console.log('Successfully added "options" column.');

    } catch (err) {
        if (err.code === 'ER_DUP_COLUMN_NAME') {
            console.log('Column "options" already exists. Skipping.');
        } else {
            console.error('Error updating database:', err);
        }
    } finally {
        await connection.end();
    }
}

updateDb();
