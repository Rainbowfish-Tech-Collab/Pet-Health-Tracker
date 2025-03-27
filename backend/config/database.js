import pkg from 'pg';
const { Pool } = pkg;
import 'dotenv/config';
console.log('Database URL:', process.env.DATABASE_URL);
const pool = new Pool({
  
  connectionString: process.env.DATABASE_URL
});

export default pool;