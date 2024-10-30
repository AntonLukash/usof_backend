const mysql = require('mysql2/promise');
const fs = require('fs');

const dbConfig = JSON.parse(fs.readFileSync('./config/config.json', 'utf-8'));

async function createConnection() {
    try {
        const connection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password,
            database: dbConfig.database,
        });
        return connection;
    } catch (err) {
        console.error('Error connecting to database:', err);
        throw err;
    }
}

module.exports = createConnection;
