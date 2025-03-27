import express from 'express';
import pool from '../config/database.js';
const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query("SELECT sex FROM pet_sex");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    next(err);
  }
});


export default router;