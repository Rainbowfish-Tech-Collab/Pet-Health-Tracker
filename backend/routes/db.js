import express from "express";
import pool from "../config/database.js";
const router = express.Router();

// GET all enum table data with the database 
// -- /db/enum
router.get('/enum', async(req, res, next) => {
  try{
    const [
      petSex,
      petSpecies,
      petBreeds,
      weights,
      glucose,
      dosages,
      medications,
      activities,
      bodilyFunctions
    ] = await Promise.all([
      pool.query("SELECT id, sex FROM pet_sex"),
      pool.query("SELECT id, species FROM pet_species"),
      pool.query("SELECT id, pet_species_id, pet_breed FROM pet_breed"),
      pool.query("SELECT id, unit FROM weight"),
      pool.query("SELECT id, unit FROM glucose"),
      pool.query("SELECT id, unit FROM dosage"),
      pool.query("SELECT id, name FROM medication_type"),
      pool.query("SELECT id, name FROM activity_type"),
      pool.query("SELECT id, name FROM function"),
      pool.query("SELECT id, name FROM symptom_type")
    ]);

    res.json({
      petSex: petSex.rows,
      petSpecies: petSpecies.rows,
      petBreeds: petBreeds.rows,
      weights: weights.rows,
      glucose: glucose.rows,
      dosages: dosages.rows,
      medications: medications.rows,
      activities: activities.rows,
      bodilyFunctions: bodilyFunctions.rows
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
})

// GET all pet sexes
// -- /db/petSex
router.get('/petSex', async (req, res, next) => {
  try {
    const result = await pool.query("SELECT id, sex FROM pet_sex");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// GET all pet breeds
// -- /db/petBreeds
router.get('/petBreeds', async (req, res, next) => {
  try {
    const result = await pool.query("SELECT id, pet_species_id, pet_breed FROM pet_breed");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// GET all pet species
// -- /db/petSpecies
router.get('/petSpecies', async (req, res, next) => {
  try {
    const result = await pool.query("SELECT id, species FROM pet_species");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// GET all weight units
// -- /db/weights
router.get("/weights", async (req, res, next) => {
	try {
		const result = await pool.query("SELECT id, unit FROM weight");
		res.json(result.rows);
	} catch (err) {
		console.error(err);
		next(err);
	}
});

// GET all glucose units
// -- /db/glucose
router.get('/glucose', async (req, res, next) => {
  try {
    const result = await pool.query("SELECT id, unit FROM glucose");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// GET all dosage units
// -- /db/dosages
router.get('/dosages', async (req, res, next) => {
  try {
    const result = await pool.query("SELECT id, unit FROM dosage");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// GET all medication types
// -- /db/medications
router.get('/medications', async (req, res, next) => {
  try {
    const result = await pool.query("SELECT id, name FROM medication_type");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// GET all activity types 
// -- /db/activities
router.get('/activities', async (req, res, next) => {
	try {
		const result = await pool.query("SELECT id, name FROM activity_type");
		res.json(result.rows);
	} catch (err) {
		console.error(err);
		next(err);
	}
});

// GET all bodily function types
// -- /db/bodilyFunctions
router.get("/bodilyFunctions", async (req, res, next) => {
	try {
		const result = await pool.query("SELECT id, name FROM function");
		res.json(result.rows);
	} catch (err) {
		console.error(err);
		next(err);
	}
});

// GET all symptom types
// -- /db/symptoms
router.get('/symptoms', async (req, res, next) => {
  try {
    const result = await pool.query("SELECT id, name FROM symptom_type");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// GET all log related tables associated with the database
// -- /db/logs
router.get('/logs', async(req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT table_name
      FROM information_schema.columns
      WHERE column_name IN ('pet_id', 'stat_id')
        AND table_schema = 'public'
        AND table_name NOT IN ('user_pet', 'active_activity');
      `);
    res.json(result.rows.map((row) => row.table_name));
  } catch (err) {
    console.error(err);
    next(err);
  }
});

export default router;