import express from "express";
import pool from "../config/database.js";
const router = express.Router();

// GET all weight units
router.get("/", async (req, res, next) => {
	try {
		const result = await pool.query("SELECT * FROM weight");
		res.json(result.rows.map((row) => row.unit));
	} catch (err) {
		console.error(err);
		next(err);
	}
});

// GET all weight data entries for a specific pet at /:petId/all
router.get("/:petId/all", async (req, res, next) => {
	try {
		const { petId } = req.params;
		const result = await pool.query(
			`
      SELECT weight.unit, weight, weight_stat.date_updated FROM weight_stat 
      JOIN stat ON weight_stat.stat_id = stat.id 
      JOIN weight ON weight.id = weight_stat.weight_id 
      WHERE weight_stat.date_archived IS NULL AND stat.pet_id = ($1)`,
			[petId]
		);
		if (!result) return res.status(404).json({ error: "Pet not found" });
		res.json(result.rows);
	} catch (err) {
		console.error(err);
		next(err);
	}
});

// GET graph: graphing x(weight) and y(stat_date) units for a specific pet by weight type

router.get("/:petId/all/:weightType/graph", async (req, res, next) => {
	try {
		const { petId, weightType } = req.params;
		const result = await pool.query(
			`
      SELECT weight, stat.stat_date 
      FROM weight_stat 
      JOIN stat ON weight_stat.stat_id = stat.id 
      JOIN weight ON weight.id = weight_stat.weight_id 
      WHERE weight_stat.date_archived IS NULL AND weight.unit = ($1) AND stat.pet_id = ($2)`,
			[weightType, petId]
		);
		if (!result) return res.status(404).json({ error: "Pet not found" });
		res.json(result.rows);
	} catch (err) {
		console.error(err);
		next(err);
	}
});

// DELETE (soft delete) weight data entry by id at /:id
// we need to archive both the stat and the weight_stat since theyre connected
router.delete("/:id", async (req, res, next) => {
	try {
		const { id } = req.params;
    await pool.query("BEGIN");
    await pool.query(`
      UPDATE weight_stat 
      SET date_archived = NOW(), date_updated = NOW()
      WHERE id = $1
    `, [id]);
  
    const result = await pool.query(`
      UPDATE stat 
      SET date_archived = NOW(), date_updated = NOW()
      WHERE id = (SELECT stat_id FROM weight_stat WHERE id = $1)
    `, [id]);
    console.log(result.rows)
    await pool.query("COMMIT");
		res.json({ message: `id ${id}, stat log deleted` });
	} catch (err) {
		console.error(err);
    await pool.query("ROLLBACK");
		next(err);
	}
});

// GET all soft deleted weight data entries by pet id at /:petId/deleted

router.get("/:petId/deleted", async (req, res, next) => {
	try {
		const { petId } = req.params;
		const result = await pool.query(`
      SELECT stat.description, stat.stat_date, weight.unit, weight_stat.weight, weight_stat.date_archived FROM weight_stat
      JOIN stat ON weight_stat.stat_id = stat.id
      JOIN weight ON weight.id = weight_stat.weight_id
      WHERE weight_stat.date_archived IS NOT NULL AND stat.pet_id = $1`,
			[petId]
		);
		res.json(result.rows);
	} catch (err) {
		console.error(err);
		next(err);
	}
});

export default router;
