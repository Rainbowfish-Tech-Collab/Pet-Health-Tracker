import express from "express";
import pool from "../config/database.js";
const router = express.Router();

// GET all pet sexes
// -- /db/petSex
router.get('/', async (req, res, next) => {
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
router.get('/', async (req, res, next) => {
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
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query("SELECT id, species FROM pet_species");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// GET all weight units
router.get("/", async (req, res, next) => {
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
router.get('/', async (req, res, next) => {
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
router.get('/', async (req, res, next) => {
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
// router.get('/medications', async (req, res, next) => {
//   try {
//     const result = await pool.query("SELECT id, name FROM medication_type");
//     res.json(result.rows);
//   } catch (err) {
//     console.error(err);
//     next(err);
//   }
// });

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
router.get("/bodilyFunctions", async (req, res, next) => {
	try {
		const result = await pool.query("SELECT id, name FROM function");
		res.json(result.rows);
	} catch (err) {
		console.error(err);
		next(err);
	}
});

// GET all log related tables associated with the database
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