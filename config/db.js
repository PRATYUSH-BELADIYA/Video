// const mysql = require('mysql2');
// const connection = mysql.createConnection({
  //   host: process.env.MYSQL_HOST,
  //   user: process.env.MYSQL_USER,
  //   password: process.env.MYSQL_PASSWORD,
  //   port: process.env.MYSQL_PORT || 2715,
  //   database: process.env.MYSQL_DATABASE
  // });
  
  // connection.connect((err) => {
  //   if (err) throw err;
  //   console.log('🐱‍👤Connected to MySQL Database!');
  // });
  
  // module.exports = connection;

const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT),
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  max: 10,
  idleTimeoutMillis: 30000,
   ssl: {
    rejectUnauthorized: false, 
  },
});

pool.connect()
  .then(client => {
    console.log("🐘 Connected to PostgreSQL Database!");
    client.release();
  })
  .catch(err => {
    console.error("❌ Connection error:", err.stack);
  });

module.exports = pool;  
