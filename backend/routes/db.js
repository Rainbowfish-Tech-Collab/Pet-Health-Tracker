import express from "express";
import pool from "../config/database.js";
const router = express.Router();

// GET all users
// -- /db/users
router.get('/users', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM "user"');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

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
    const result = await pool.query("SELECT id, name, pet_id FROM symptom_type");
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
    const result = await pool.query("SELECT id, name, pet_id FROM medication_type");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// GET all log related table names associated with the database
// -- /db/logs/names
router.get('/logs/names', async(req, res, next) => {
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

// GET all logs associated with a petId
// -- /db/:petId/logs
// -- /db/:petId/logs/deleted
router.get('/:petId/logs/:deleted?', async (req, res, next) => {
  try {
    const { petId } = req.params;
    const showDeleted = req.params.deleted === "deleted";
    const showDeletedString = showDeleted ? "IS NOT NULL" : "IS NULL";
    const [activities, symptoms, bodilyFunctions, medications, weights, glucose, heartRate, respiratoryRate, other] = await Promise.all([
			pool.query(`
        SELECT activity.id, activity_type_id, 'Activity' AS subcategory, name, duration_in_hours, note, activity_date AS log_date, date_created, date_updated ${showDeleted ? ", activity.date_archived" : ""} 
        FROM activity 
        JOIN activity_type ON activity.activity_type_id = activity_type.id 
        WHERE date_archived ${showDeletedString}  AND pet_id = $1`, [petId]),
      pool.query(`
        SELECT symptom.id, symptom_type_id, 'Symptom' AS subcategory, name, symptom_other, symptom_description, symptom_date AS log_date, date_created, date_updated ${showDeleted ? ", symptom.date_archived" : ""} 
        FROM symptom 
        JOIN symptom_type ON symptom.symptom_type_id = symptom_type.id 
        WHERE symptom.date_archived ${showDeletedString}  AND symptom.pet_id = $1`, [petId]),
      pool.query(`
        SELECT bodily_function.id, function_id, 'Bodily Function' AS subcategory, name, note, bodily_function_date AS log_date, date_created, date_updated ${showDeleted ? ", bodily_function.date_archived" : ""}
        FROM bodily_function 
        JOIN function ON bodily_function.function_id = function.id 
        WHERE date_archived ${showDeletedString}  AND pet_id = $1`, [petId]),
      pool.query(`
        SELECT medication.id, medication_type_id, name, dosage_id, dosage.unit, dosage, medication_date AS log_date, date_created, date_updated ${showDeleted ? ", medication.date_archived" : ""}
        FROM medication 
        JOIN medication_type ON medication.medication_type_id = medication_type.id 
        JOIN dosage ON medication.dosage_id = dosage.id
        WHERE medication.date_archived ${showDeletedString}  AND medication.pet_id = $1`, [petId]),
      pool.query(`
				SELECT weight_stat.stat_id, stat.description, 'Weight' AS subcategory, weight_stat.id AS weight_stat_id, weight_stat.weight_id, weight.unit, weight, stat.stat_date AS log_date, stat.date_created, stat.date_updated FROM weight_stat
        JOIN stat ON weight_stat.stat_id = stat.id
        JOIN weight ON weight.id = weight_stat.weight_id
        WHERE weight_stat.date_archived ${showDeletedString}  AND stat.pet_id = $1`, [petId]),
			pool.query(`
				SELECT glucose_stat.stat_id, stat.description, 'Glucose' AS subcategory, glucose_stat.id AS glucose_stat_id, glucose_stat.glucose_id, glucose.unit, glucose_level, stat.stat_date AS log_date, stat.date_created, stat.date_updated FROM glucose_stat
        JOIN stat ON glucose_stat.stat_id = stat.id
        JOIN glucose ON glucose.id = glucose_stat.glucose_id
        WHERE glucose_stat.date_archived ${showDeletedString}  AND stat.pet_id = $1`, [petId]),
      pool.query(`
        SELECT heart_rate_stat.stat_id, stat.description, 'Heart Rate' AS subcategory, heart_rate_stat.id AS heart_rate_stat_id, heart_rate_stat.beats_per_minute, stat.stat_date AS log_date, stat.date_created, stat.date_updated FROM heart_rate_stat
        JOIN stat ON heart_rate_stat.stat_id = stat.id
        WHERE heart_rate_stat.date_archived ${showDeletedString}  AND stat.pet_id = $1`, [petId]),
      pool.query(`
        SELECT respiratory_rate_stat.stat_id, stat.description, 'Respiratory Rate' AS subcategory, respiratory_rate_stat.id AS respiratory_rate_stat_id, respiratory_rate_stat.breaths_per_minute, stat.stat_date AS log_date, stat.date_created, stat.date_updated FROM respiratory_rate_stat
        JOIN stat ON respiratory_rate_stat.stat_id = stat.id
        WHERE respiratory_rate_stat.date_archived ${showDeletedString}  AND stat.pet_id = $1`, [petId]),
      pool.query(`
        SELECT other_stat.stat_id, stat.description, 'Other' AS subcategory, other_stat.id AS other_stat_id, other_stat.note, stat.stat_date AS log_date, stat.date_created, stat.date_updated FROM other_stat
        JOIN stat ON other_stat.stat_id = stat.id
        WHERE other_stat.date_archived ${showDeletedString}  AND stat.pet_id = $1`, [petId])
    ]);
    const result = [
      ...activities.rows,
      ...symptoms.rows,
      ...bodilyFunctions.rows,
      ...medications.rows,
      ...weights.rows,
      ...glucose.rows,
      ...heartRate.rows,
      ...respiratoryRate.rows,
      ...other.rows
    ];

    result.sort((a, b) => b.log_date - a.log_date);
    res.json(result);
  } catch (err) {
    console.error(err);
    next(err);
  }
});


export default router;