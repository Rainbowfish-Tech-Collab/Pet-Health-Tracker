import express from "express";
import pool from "../config/database.js";
const router = express.Router();

// GET all stat data entries for a specific pet at /:petId/all
router.get("/:petId/all", async (req, res, next) => {
	try {
		const { petId } = req.params;
		const result = await pool.query(
			`
      SELECT 
        stat.id,
        stat.pet_id,
        stat.description,
        stat.date_updated,
        stat.stat_date,
        CASE
          WHEN weight_stat.id IS NOT NULL THEN 'Weight'
          WHEN glucose_stat.id IS NOT NULL THEN 'Glucose'
          WHEN heart_rate_stat.id IS NOT NULL THEN 'Heart Rate'
          WHEN respiratory_rate_stat.id IS NOT NULL THEN 'Respiratory'
          WHEN other_stat.id IS NOT NULL THEN 'Other'
          ELSE 'Stat'
        END AS category
      FROM stat
        LEFT JOIN weight_stat ON stat.id = weight_stat.stat_id
        LEFT JOIN glucose_stat ON stat.id = glucose_stat.stat_id
        LEFT JOIN heart_rate_stat ON stat.id = heart_rate_stat.stat_id
        LEFT JOIN respiratory_rate_stat ON stat.id = respiratory_rate_stat.stat_id
        LEFT JOIN other_stat ON stat.id = other_stat.stat_id
      WHERE stat.pet_id = $1 
      ORDER BY stat.date_updated DESC`,
			[petId]
		);
		if (!result) return res.status(404).json({ error: "Pet not found" });
		res.json(result.rows);
	} catch (err) {
		console.error(err);
		next(err);
	}
});

export default router;
