import express from 'express';
import pool from '../config/database.js';
const router = express.Router();

// do delete

// router: /pets

// Test database connection endpoint
router.get("/test", async (req, res) => {
  try {
    console.log('Testing database connection...');
    const result = await pool.query('SELECT 1 as test');
    console.log('Database connection successful:', result.rows[0]);
    res.json({
      status: 'success',
      message: 'Database connection working',
      result: result.rows[0]
    });
  } catch (err) {
    console.error('Database connection test failed:', err);
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: err.message,
      code: err.code
    });
  }
});

// POST add a new pet
router.post("/", async (req, res, next) => {
  try {
    const { species, sex, name, birthday, description, profile_picture, breed, breed_id, species_id } = req.body;

    console.log('Received pet data:', { species, sex, name, birthday, description, profile_picture, breed });

    // Test database connection first
    try {
      const testResult = await pool.query('SELECT 1 as test');
      console.log('Database connection test successful:', testResult.rows[0]);
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return res.status(500).json({
        error: "Database connection failed",
        details: dbError.message,
        code: dbError.code
      });
    }

    // Use the IDs directly from frontend (already converted)
    const pet_species_id = species_id;
    const pet_breed_id = breed_id;
    const sex_id = sex === 'Male' ? 1 : 2;

    console.log('Using IDs from frontend:', { pet_species_id, pet_breed_id, sex_id });

    const result = await pool.query(
      "INSERT INTO pet (name, profile_picture, pet_species_id, pet_breed_id, birthday, sex_id, description, date_created) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *",
      [name, profile_picture || null, pet_species_id, pet_breed_id, birthday, sex_id, description]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error in POST /pets:', err);
    console.error('Error details:', {
      message: err.message,
      stack: err.stack,
      code: err.code
    });
    res.status(500).json({
      error: "Failed to add pet",
      details: err.message,
      code: err.code
    });
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
    if(!result.rows[0]) return res.status(404).json({ error: "Pet not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// PUT update a pet by id
router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { species, sex, name, birthday, description, profile_picture, breed, breed_id, species_id } = req.body;

    console.log('Updating pet with ID:', id);
    console.log('Update data:', { species, sex, name, birthday, description, profile_picture, breed, breed_id, species_id });

    // Use the IDs directly from frontend (already converted)
    const pet_species_id = species_id;
    const pet_breed_id = breed_id;
    const sex_id = sex === 'Male' ? 1 : 2;

    console.log('Using IDs for update:', { pet_species_id, pet_breed_id, sex_id });

    const result = await pool.query(
      `UPDATE pet
       SET name = $1,
           profile_picture = COALESCE($2, profile_picture),
           pet_species_id = $3,
           pet_breed_id = $4,
           birthday = $5,
           sex_id = $6,
           description = $7,
           date_updated = NOW()
       WHERE id = $8
       RETURNING *`,
      [name, profile_picture, pet_species_id, pet_breed_id, birthday, sex_id, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Pet not found" });
    }

    console.log('Pet updated successfully:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    next(err);
  }
})

// DELETE a pet by id
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM pet WHERE id = $1 RETURNING *", [id]);
    if(!result.rows[0]) return res.status(404).json({ error: "Pet not found" });
    res.json(`Pet ${id}: ${result.rows[0].name} deleted`);
  } catch (err) {
    console.error(err);
    next(err);
  }
})

// middleware to check if pet exists
export const checkPetExists = async (req, res, next) => {
  try{
    const { petId } = req.params;
    const result = await pool.query('SELECT 1 FROM pet WHERE id = $1', [petId]);
    if (!result.rows[0]) {
      throw Object.assign(new Error(`Pet Id: ${petId} not found`), { status: 404 });
    }
    next();
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// helper function for our other route handlers to check if a pet exists; scrapped for now
// async function findPetById(id) {
//   const result = await pool.query('SELECT * FROM pet WHERE id = $1', [id]);
//   return result.rows[0] || null;
//   //recall result.rows will give an empty array if nothing is found,and accessing an index of an empty array will throw undefined
// }

export default router;
