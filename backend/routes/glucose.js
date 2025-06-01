import express from 'express';
import pool from '../config/database.js';
const router = express.Router({ mergeParams: true });

//router: /glucose

// GET all glucose logs for a specific pet
// -- /pets/:petId/all
router.get('/all', async (req, res, next) => {
  try {
    const { petId } = req.params;
    const { stat_id, glucose_id, glucose_level } = req.body;

    const statCheck = await pool.query("UPDATE stat SET date_updated = NOW() WHERE id = $1 RETURNING pet_id", [stat_id]);

    if(statCheck.rows[0].pet_id !== petId) throw Object.assign(new Error(`cannot add to a stat not found, the stat_id record you gave is connected to petId ${statCheck.rows[0].pet_id}`), { status: 404 });

    const result = await pool.query(
      `
      SELECT glucose_stat.id, glucose_stat.glucose_id, glucose.unit, glucose_level, stat.description, stat.stat_date, stat.date_created, stat.date_updated FROM glucose_stat 
      JOIN stat ON glucose_stat.stat_id = stat.id 
      JOIN glucose ON glucose.id = glucose_stat.glucose_id 
      WHERE glucose_stat.date_archived IS NULL AND stat.pet_id = $1`,
      [petId]
    );
    if (result.rows.length === 0) return res.json({ message: "No logs found" });
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    next(err);
  }
})

// GET all glucose data logs for a specific pet (when no query parameters are given)
// -- /pets/:petId/glucose

// GET all glucose data logs by glucose type or glucose id for a specific pet 
// -- /pets/:petId/glucose/?type={glucoseTypeOrId}

// GET graphing x (glucose level) and y (stat_date) units for a specific pet by glucose unit type
// -- /pets/:petId/glucose/?graph={boolean} ; default is false

// GET all glucose data logs and whether to include archived logs for a specific pet
// -- /pets/:petId/glucose/?archived={boolean} ; default is false

// GET glucose data logs sorted by column and direction for a specific pet
// -- /pets/:petId/glucose/?sort={column}&direction={asc|desc}



router.get('/', async (req, res, next) => {
  try {
    const { petId } = req.params;
    const { type, graph, archived, sort, direction} = req.query;

    /* -------------------- IF GRAPH IS PROVIDED AND TRUE ------------------- */
    const columns = graph?.toLowerCase() == "true" 
    ? "glucose_level, stat_date"
    : "glucose_stat.id, glucose_stat.glucose_id, glucose.unit, glucose_level, stat.description, stat.stat_date, stat.date_created, stat.date_updated";

    let baseQuery = 
    `
    SELECT ${columns} FROM glucose_stat 
    JOIN stat ON glucose_stat.stat_id = stat.id 
    JOIN glucose ON glucose.id = glucose_stat.glucose_id 
    WHERE stat.pet_id = $1
    `;

    const values = [petId];

    /* ------------------------ IF A TYPE IS PROVIDED ----------------------- */
    if(type){ 
      const isId = !isNaN(type);
      const col = isId ? "glucose_id" : "LOWER(unit)";
      const val = isId ? type : type.toLowerCase();

      const {rows} = await pool.query(`SELECT unit FROM glucose_stat JOIN glucose ON glucose.id = glucose_stat.glucose_id WHERE ${col} = $1`, [val]);
      if(!rows[0]) throw Object.assign(new Error("type not found"), { status: 404 });
      
      
      baseQuery += ` AND ${col} = $${values.length + 1}`;
      values.push(val);
    }

    /* ----------------- IF ARCHIVED IS PROVIDED AND TRUE ------------------ */
    baseQuery += archived?.toLowerCase() == "true" ? "" : " AND glucose_stat.date_archived IS NULL";

    /* ------------------ IF SORT IS PROVIDED AND DIRECTION IS PROVIDED ------------------ */
    if((sort && !direction) || (!sort && direction)) throw Object.assign(new Error("Both 'sort' and 'direction' query parameters must be provided together."), { status: 400 });
    if(sort && direction){
      const dir = direction?.toLowerCase();
      if(!["asc", "desc"].includes(dir)) throw Object.assign(new Error("Invalid direction. Use 'asc' or 'desc'."), { status: 400 });
      if(!columns.includes(sort)) throw Object.assign(new Error(`Cannot sort by '${sort}'. It is not a valid column.`), { status: 400 });
      baseQuery += ` ORDER BY ${sort} ${dir}`;
    }

    console.log(baseQuery);
    const result = await pool.query(baseQuery, values);
    if(result.rows.length === 0) return res.json({ message: "No logs found" });
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    next(err);
  }
})

// DELETE (soft delete) glucose log by id 
// -- /pets/:petId/glucose/:id
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
// -- /pets/:petId/glucose/deleted

router.get('/deleted', async (req, res, next) => {
  try {
    const { petId } = req.params;
    const result = await pool.query(
      `
      SELECT glucose_stat.id, glucose_stat.glucose_id, glucose.unit, glucose_stat.glucose_level, stat.description, stat.stat_date, stat.date_created, stat.date_updated, stat.date_archived FROM glucose_stat 
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
