import express from "express";
import pool from "../config/database.js";

// Scoped to a specific pet — mounted at /pets/:petId/stats
const router = express.Router({ mergeParams: true });

// Global — mounted at /stats
const globalRouter = express.Router(); 

// POST a new stat data log for a specific pet
// -- /pets/:petId/stats

router.post("/", async (req, res, next) => {
	try {
		const { petId } = req.params;
		const { stat_date } = req.body;
		const result = await pool.query(
			`
      INSERT INTO stat (pet_id, stat_date) VALUES ($1, $2) RETURNING id`,
			[petId, stat_date]
		);
		//error will be thrown by not null constraints
		res.json({ message: `id: ${result.rows[0].id}, Stat log created` });
	} catch (err) {
		console.error(err);
		next(err);
	}
});

// GET all stat data logs and the subcategory associated with it for a specific pet
// -- /pets/:petId/stats
router.get("/", async (req, res, next) => {
	try {
		const { petId } = req.params;
		const [weights, glucose, heartRate, respiratoryRate, other ] = await Promise.all([
			pool.query(
				`
        SELECT weight_stat.stat_id, stat.description, 'Weight' AS subcategory, weight_stat.id AS weight_stat_id, weight_stat.weight_id, weight.unit, weight, stat.stat_date, stat.date_created, stat.date_updated FROM weight_stat 
        JOIN stat ON weight_stat.stat_id = stat.id 
        JOIN weight ON weight.id = weight_stat.weight_id 
        WHERE weight_stat.date_archived IS NULL AND stat.pet_id = $1`,
				[petId]
			),
			pool.query(
				`
        SELECT glucose_stat.stat_id, stat.description, 'Glucose' AS subcategory, glucose_stat.id AS glucose_stat_id, glucose_stat.glucose_id, glucose.unit, glucose_level, stat.stat_date, stat.date_created, stat.date_updated FROM glucose_stat 
        JOIN stat ON glucose_stat.stat_id = stat.id 
        JOIN glucose ON glucose.id = glucose_stat.glucose_id 
        WHERE glucose_stat.date_archived IS NULL AND stat.pet_id = $1`,
				[petId]
			),
      pool.query(
        `
        SELECT heart_rate_stat.stat_id, stat.description, 'Heart Rate' AS subcategory, heart_rate_stat.id AS heart_rate_stat_id, heart_rate_stat.beats_per_minute, stat.stat_date, stat.date_created, stat.date_updated FROM heart_rate_stat 
        JOIN stat ON heart_rate_stat.stat_id = stat.id 
        WHERE heart_rate_stat.date_archived IS NULL AND stat.pet_id = $1`,
        [petId]
      ),
      pool.query(
        `
        SELECT respiratory_rate_stat.stat_id, stat.description, 'Respiratory Rate' AS subcategory, respiratory_rate_stat.id AS respiratory_rate_stat_id, respiratory_rate_stat.breaths_per_minute, stat.stat_date, stat.date_created, stat.date_updated FROM respiratory_rate_stat 
        JOIN stat ON respiratory_rate_stat.stat_id = stat.id 
        WHERE respiratory_rate_stat.date_archived IS NULL AND stat.pet_id = $1`,
        [petId]
      ),
      pool.query(
        `
        SELECT other_stat.stat_id, stat.description, 'Other' AS subcategory, other_stat.id AS other_stat_id, other_stat.note, stat.stat_date, stat.date_created, stat.date_updated FROM other_stat 
        JOIN stat ON other_stat.stat_id = stat.id 
        WHERE other_stat.date_archived IS NULL AND stat.pet_id = $1`,
        [petId]
      )
		]);
		const result = [...weights.rows, ...glucose.rows, ...heartRate.rows, ...respiratoryRate.rows, ...other.rows];
		res.json(result);
	} catch (err) {
		console.error(err);
		next(err);
	}
});

// GET all stat data logs for a specific pet; used for testing purposes
// -- /pets/:petId/stats/only

router.get("/only", async (req, res, next) => {
  try {
    const { petId } = req.params;
    const result = await pool.query(
      `
      SELECT id, description, stat_date, date_created, date_updated FROM stat 
      WHERE pet_id = $1`,
      [petId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// PATCH a stat data log by id. You cannot patch soft deleted logs from this endpoint
// -- /stats/:id

globalRouter.patch("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const fields = Object.keys(req.body);
    const values = Object.values(req.body);

    if (fields.length === 0) throw Object.assign(new Error("No fields to update"), { status: 400 });

    const immutables = ["id", "pet_id","date_created", "date_updated", "date_archived"];
    let immutableErrors = "the following fields are immutable: ";
    let immutableFields = [];
    for (const key of Object.keys(req.body)) {
      if (immutables.includes(key)) {
        immutableFields.push(key);
        delete req.body[key];
      }
    }

    if (immutableFields.length > 0) throw Object.assign(new Error(immutableErrors + immutableFields.join(", ")), { status: 400 });

    const result = await pool.query(
      `
      UPDATE stat 
      SET ${fields
        .map((field, index) => `${field} = $${index + 1}`)
        .join(", ")}, date_updated = NOW()
      WHERE id = $${fields.length + 1} 
      AND date_archived IS NULL 
      RETURNING *`,
      [...values, id]
    );
    if (result.rows.length === 0) throw Object.assign(new Error("log not found"), { status: 404 });
    res.json({ 
      message: `id: ${id}, Stat log updated for petId: ${result.rows[0].pet_id}`,
      'updated log': result.rows[0]
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// PATCH stat data log by id; endpoint is intended to move soft deleted logs back to active status.
// -- /stats/:id/restore

globalRouter.patch("/:id/restore", async (req, res, next) => {
  try{
    const { id } = req.params;
    const result = await pool.query("UPDATE stat SET date_archived = NULL, date_updated = NOW() WHERE id = $1 AND date_archived IS NOT NULL RETURNING id, pet_id", [id]);
    if(result.rows.length === 0) throw Object.assign(new Error("log not found or already exists"), { status: 404 });
    res.json({ message: `id: ${id}, Stat log restored for petId: ${result.rows[0].pet_id}` });
  } catch (err){
    console.log(err);
    next(err);
  }
})

// DELETE a stat data log by id, either a soft or hard delete
// -- /stats/:id/:deleteType(soft|hard)
// Reminder if you are soft deleting stat, make sure to call (every) subcategory's (soft) delete endpoint as well 

globalRouter.delete("/:id/:deleteType(soft|hard)", async (req, res, next) => {
  try{
    const { id, deleteType } = req.params;
    let result;
    if(deleteType === "soft") result = await pool.query("UPDATE stat SET date_archived = NOW(), date_updated = NOW() WHERE id = $1 AND date_archived IS NULL RETURNING id, pet_id", [id]);
    else if (deleteType === "hard") result = await pool.query("DELETE FROM stat WHERE id = $1 AND date_archived IS NOT NULL RETURNING id, pet_id", [id]);
    
    if(result.rows.length === 0) throw Object.assign(new Error("log not found"), { status: 404 });
    
    res.json({ message: `id: ${id}, Stat log ${deleteType === "soft" ? "soft" : "hard"} deleted for petId: ${result.rows[0].pet_id}` });
  } catch (err) {
    console.error(err);
    next(err);
  }
})

// GET all stat data logs for a specific pet
// -- /pets/:petId/stats

// router.get("/", async (req, res, next) => {
// 	try {
// 		const { petId } = req.params;
// 		const result = await pool.query(
// 			`
//       SELECT
//         stat.id,
//         stat.pet_id,
//         stat.description,
//         CASE
//           WHEN weight_stat.id IS NOT NULL THEN weight_stat.id
//           WHEN glucose_stat.id IS NOT NULL THEN glucose_stat.id
//           WHEN heart_rate_stat.id IS NOT NULL THEN heart_rate_stat.id
//           WHEN respiratory_rate_stat.id IS NOT NULL THEN respiratory_rate_stat.id
//           WHEN other_stat.id IS NOT NULL THEN other_stat.id
//           ELSE NULL
//         END AS subcategory_id,
//         CASE
//           WHEN weight_stat.id IS NOT NULL THEN 'Weight'
//           WHEN glucose_stat.id IS NOT NULL THEN 'Glucose'
//           WHEN heart_rate_stat.id IS NOT NULL THEN 'Heart Rate'
//           WHEN respiratory_rate_stat.id IS NOT NULL THEN 'Respiratory'
//           WHEN other_stat.id IS NOT NULL THEN 'Other'
//           ELSE 'Stat'
//         END AS subcategory,
//         CASE
//           WHEN weight_stat.id IS NOT NULL THEN weight_stat.weight_id
//           WHEN glucose_stat.id IS NOT NULL THEN glucose_stat.glucose_id
//         END AS subcategory_type_id,
//         CASE
//           WHEN weight_stat.id IS NOT NULL THEN weight.unit
//           WHEN glucose_stat.id IS NOT NULL THEN glucose.unit
//         END AS subcategory_type,
//         CASE
//           WHEN weight_stat.id IS NOT NULL THEN weight_stat.weight
//           WHEN glucose_stat.id IS NOT NULL THEN glucose_stat.glucose_level
//           WHEN heart_rate_stat.id IS NOT NULL THEN heart_rate_stat.beats_per_minute
//           WHEN respiratory_rate_stat.id IS NOT NULL THEN respiratory_rate_stat.breaths_per_minute
//           WHEN other_stat.id IS NOT NULL THEN 0
//           ELSE NULL
//         END AS value,
//         stat.stat_date,
//         stat.date_created,
//         stat.date_updated
//       FROM stat
//         LEFT JOIN weight_stat ON stat.id = weight_stat.stat_id
//         FULL JOIN weight ON weight.id = weight_stat.weight_id
//         LEFT JOIN glucose_stat ON stat.id = glucose_stat.stat_id
//         FULL JOIN glucose ON glucose.id = glucose_stat.glucose_id
//         LEFT JOIN heart_rate_stat ON stat.id = heart_rate_stat.stat_id
//         LEFT JOIN respiratory_rate_stat ON stat.id = respiratory_rate_stat.stat_id
//         LEFT JOIN other_stat ON stat.id = other_stat.stat_id
//       WHERE stat.pet_id = $1
//       ORDER BY stat.date_updated DESC`,
// 			[petId]
// 		);
// 		if (!result) return res.status(404).json({ error: "Pet not found" });
// 		res.json(result.rows);
// 	} catch (err) {
// 		console.error(err);
// 		next(err);
// 	}
// });

export { router, globalRouter };
