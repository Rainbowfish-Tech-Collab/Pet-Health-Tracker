import express from "express";
import pool from "../config/database.js";
import { checkPetExists } from "./pets.js";
const router = express.Router();

// router: /weights

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

// GET all weight logs for a specific pet at /:petId/all
router.get("/:petId/all", checkPetExists, async (req, res, next) => {
	try {
		const { petId } = req.params;
		const result = await pool.query(
			`
      SELECT weight_stat.id, weight.unit, weight, weight_stat.date_updated FROM weight_stat 
      JOIN stat ON weight_stat.stat_id = stat.id 
      JOIN weight ON weight.id = weight_stat.weight_id 
      WHERE weight_stat.date_archived IS NULL AND stat.pet_id = ($1)`,
			[petId]
		);
		if (result.rows.length === 0) return res.json({ message: "No logs found" });
		res.json(result.rows);
	} catch (err) {
		console.error(err);
		next(err);
	}
});

// GET graph: graphing x(weight) and y(stat_date) units for a specific pet by weight unit type

router.get("/:petId/all/:weightTypeOrId/graph", checkPetExists, async (req, res, next) => {
	try {
		const { petId, weightTypeOrId } = req.params;
    const isId = !isNaN(weightTypeOrId);
    const filterColumn = isId ? "weight_id" : "LOWER(unit)";
    const filterValue = isId ? weightTypeOrId : weightTypeOrId.toLowerCase();
    const result = await pool.query(
      `
      SELECT weight.unit, weight_stat.weight, stat.stat_date FROM weight_stat 
      JOIN stat ON weight_stat.stat_id = stat.id 
      JOIN weight ON weight.id = weight_stat.weight_id 
      WHERE ${filterColumn} = $1 AND stat.pet_id = $2 AND weight_stat.date_archived IS NULL`,
      [filterValue, petId]
    );
    if (result.rows.length === 0) return res.json({ message: "No logs found" });
		res.json(result.rows);
	} catch (err) {
		console.error(err);
		next(err);
	}
});

// DELETE (soft delete) weight logs by id at /:id
// we need to archive both the stat and the weight_stat since theyre connected
router.delete("/:id", async (req, res, next) => {
	try {
		const { id } = req.params;
		const result = await pool.query(
      `
      WITH updated_weight_stat AS (
        UPDATE weight_stat
        SET date_archived = NOW(), date_updated = NOW()
        WHERE id = $1
        RETURNING stat_id
      )
      UPDATE stat
      SET date_archived = NOW(), date_updated = NOW()
      WHERE id = (SELECT stat_id FROM updated_weight_stat)
      RETURNING stat.pet_id`,
      [id]
    );
    if(result.rows.length === 0) throw Object.assign(new Error("log not found"), { status: 404 });
		res.json({ message: `id ${id}, stat log deleted for petId ${result.rows[0].pet_id}` });
	} catch (err) {
		console.error(err);
		next(err);
	}
});

// GET all soft deleted weight logs by pet id at /:petId/deleted

router.get("/:petId/deleted", checkPetExists, async (req, res, next) => {
	try {
		const { petId } = req.params;
		const result = await pool.query(
			`
      SELECT stat.description, stat.stat_date, weight.unit, weight_stat.weight, weight_stat.date_archived FROM weight_stat
      JOIN stat ON weight_stat.stat_id = stat.id
      JOIN weight ON weight.id = weight_stat.weight_id
      WHERE weight_stat.date_archived IS NOT NULL AND stat.pet_id = $1`,
			[petId]
		);
    if(result.rows.length === 0) return res.json({ message: "No logs found" });
		res.json(result.rows);
	} catch (err) {
		console.error(err);
		next(err);
	}
});

export default router;
