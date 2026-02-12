const mysql = require('mysql');
const dotenv = require('dotenv');
const path = require('path');

// explicitly load .env from the parent directory
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log("Attempting DB Connection...");
console.log("DB Host:", process.env.DB_HOST);
console.log("DB User:", process.env.DB_USER); 
// We verify if variables are loaded. If these print "undefined", the .env file is still not found.

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL database successfully.');
});

module.exports = db;