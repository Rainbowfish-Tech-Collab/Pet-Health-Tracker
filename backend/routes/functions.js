import express from 'express';
import pool from '../config/database.js';
const router = express.Router();

// GET all function types
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM function");
    res.json(result.rows.map((row) => row.name));
  } catch (err) {
    console.error(err);
    next(err);
  }
});

export default router;