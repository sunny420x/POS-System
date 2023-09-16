var mysql = require('mysql2')

var db = mysql.createPool({
    connectionLimit: 10,
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
})

db.getConnection((err, connection) => {
    if (connection) connection.release()
})

module.exports = db