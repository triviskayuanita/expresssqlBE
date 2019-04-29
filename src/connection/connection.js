const mysql = require('mysql')

const conn = mysql.createConnection({
    user: 'yuanita',
    password: 'yuanita07',
    host: 'db4free.net',
    database: 'expressmysqlyua',
    port: '3306'
})

module.exports = conn