import express from 'express';
import pool from '../config/database.js';
const router = express.Router();

// GET all pet sexes
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM pet_sex");
    res.json(result.rows.map((row) => row.sex));
  } catch (err) {
    console.error(err);
    next(err);
  }
});


export default router;