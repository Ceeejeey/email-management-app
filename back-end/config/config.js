const sql = require("mysql2/promise");
const dotenv = require("dotenv").config();

const pool = sql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  port:process.env.DB_PORT,
});


const checkConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Connected to the database");
    connection.release();
  } catch (error) {
    console.log("Connection error: " + error);
    throw error;
    
  }
}

module.exports = { pool, checkConnection };