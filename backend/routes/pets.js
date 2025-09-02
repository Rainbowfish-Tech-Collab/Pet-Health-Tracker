import express from 'express';
import pool from '../config/database.js';
const router = express.Router();

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
    const { species, sex, name, birthday, description, profile_picture, breed } = req.body;

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

    // Convert species to pet_breed_id (for now, use a default breed for the species)
    let pet_breed_id;
    if (species === 'Dog') {
      pet_breed_id = 1; // Use first dog breed as default
    } else if (species === 'Cat') {
      pet_breed_id = 23; // Use first cat breed as default
    } else {
      pet_breed_id = 1; // Default to dog breed
    }

    // Convert sex to sex_id
    let sex_id;
    if (sex === 'Male') {
      sex_id = 1;
    } else if (sex === 'Female') {
      sex_id = 2;
    } else {
      sex_id = 1; // Default to Male
    }

    console.log('Converted IDs:', { pet_breed_id, sex_id });

    const result = await pool.query(
      "INSERT INTO pet (pet_breed_id, sex_id, name, birthday, description, profile_picture) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [pet_breed_id, sex_id, name, birthday, description, profile_picture || null]
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
