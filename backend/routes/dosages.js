import express from 'express';
import pool from '../config/database.js';
const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM dosage");
    res.json(result.rows.map((row) => row.unit));
  } catch (err) {
    console.error(err);
    next(err);
  }
});

export default router;