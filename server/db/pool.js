var mysql = require('mysql2');
var pool = mysql.createPool({

    // process.env. injected from docker compose
    // - assign the MYSQL server built by docker image
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'pass123',
    password: process.env.MYSQL_PASSWORD || 'pass123',
    database: 'jobsdb',
    dateStrings: true
});

module.exports = pool;