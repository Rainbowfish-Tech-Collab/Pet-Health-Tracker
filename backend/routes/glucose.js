import express from 'express';
import pool from '../config/database.js';
import { checkPetExists } from './pets.js';
const router = express.Router();

//router /glucose

// GET all glucose units
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query("SELECT unit FROM glucose");
    res.json(result.rows.map((row) => row.unit));
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// GET all glucose logs for a specific pet at /:petId/all
router.get('/:petId/all', checkPetExists, async (req, res, next) => {
  try {
    const { petId } = req.params;
    const result = await pool.query(
      `
      SELECT glucose_stat.id, glucose.unit, glucose_stat.glucose_level FROM glucose_stat 
      JOIN stat ON glucose_stat.stat_id = stat.id 
      JOIN glucose ON glucose.id = glucose_stat.glucose_id 
      WHERE glucose_stat.date_archived IS NULL AND stat.pet_id = ($1)`,
      [petId]
    );
    if (result.rows.length === 0) return res.json({ message: "No logs found" });
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    next(err);
  }
})

// GET graphing x (glucose level) and y (stat_date) units for a specific pet by glucose unit type

router.get('/:petId/all/:glucoseTypeOrId/graph', checkPetExists, async (req, res, next) => {
  try {
    const { petId, glucoseTypeOrId } = req.params;
    const isId = !isNaN(glucoseTypeOrId);
    const filterColumn = isId ? "glucose_id" : "LOWER(unit)";
    const filterValue = isId ? glucoseTypeOrId : glucoseTypeOrId.toLowerCase();
    const result = await pool.query(
      `
      SELECT glucose.unit, glucose_stat.glucose_level, stat.stat_date FROM glucose_stat 
      JOIN stat ON glucose_stat.stat_id = stat.id 
      JOIN glucose ON glucose.id = glucose_stat.glucose_id 
      WHERE ${filterColumn} = $1 AND stat.pet_id = $2 AND glucose_stat.date_archived IS NULL`,
      [filterValue, petId]
    );
    if (result.rows.length === 0) return res.json({ message: "No logs found" });
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    next(err);
  }
})

// DELETE (soft delete) glucose log by id at /:id
// we need to archive both the stat and the weight_stat since theyre connected

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `
      WITH updated_glucose_stat AS (
        UPDATE glucose_stat
        SET date_archived = NOW(), date_updated = NOW()
        WHERE id = $1
        RETURNING *
      )
      UPDATE stat
      SET date_updated = NOW(), date_archived = NOW()
      FROM updated_glucose_stat
      WHERE updated_glucose_stat.stat_id = stat.id
      RETURNING stat.pet_id`,
      [id]
    );
    if(result.rows.length === 0) throw Object.assign(new Error("log not found"), { status: 404 });
		res.json({ message: `id ${id}, stat log deleted for petId ${result.rows[0].pet_id}` });
  } catch (err) {
    console.error(err);
    next(err);
  }
})

// GET all soft deleted glucose logs by pet id at /:petId/deleted

router.get('/:petId/deleted', checkPetExists, async (req, res, next) => {
  try {
    const { petId } = req.params;
    const result = await pool.query(
      `
      SELECT stat.description, stat.stat_date, glucose.unit, glucose_stat.glucose_level, glucose_stat.date_archived FROM glucose_stat 
      JOIN stat ON glucose_stat.stat_id = stat.id 
      JOIN glucose ON glucose.id = glucose_stat.glucose_id 
      WHERE glucose_stat.date_archived IS NOT NULL AND stat.pet_id = $1`,
      [petId]
    );
    if (result.rows.length === 0) return res.json({ message: "No logs found" });
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    next(err);
  }
})

export default router;
