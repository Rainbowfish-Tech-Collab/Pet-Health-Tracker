import express from 'express';
import pool from '../config/database.js';
const router = express.Router();

// POST add a new pet
router.post("/", async (req, res, next) => {
  try {
    const { pet_breed_id, sex_id, name, birthday, description, profile_picture } = req.body;
    const result = await pool.query(
      "INSERT INTO pet (pet_breed_id, sex_id, name, birthday, description, profile_picture) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [pet_breed_id, sex_id, name, birthday, description, profile_picture]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// GET all pets
router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM pet");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// GET a pet by id
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM pet WHERE id = $1", [id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// PATCH update a pet by id
router.patch("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const fields = Object.keys(req.body);
    const values = Object.values(req.body);

    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const result = await pool.query(
      `
        UPDATE pet SET ${fields.map((field, index) => `${field} = $${index + 1}`).join(", ")} 
        WHERE id = $${fields.length + 1} 
        RETURNING *
      `, [...values, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    next(err);
  }
})
export default router;