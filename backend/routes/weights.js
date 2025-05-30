import express from "express";
import pool from "../config/database.js";
const router = express.Router({ mergeParams: true });

// router: /weights

// POST a new weight data log for a specific pet (and stat id)
// -- /pets/:petId/weights
// we also need to update stats date_updated field.
router.post("/", async (req, res, next) => {
  try{
    const { petId } = req.params;
    const { stat_id, weight_id, weight } = req.body;

    const statCheck = await pool.query("UPDATE stat SET date_updated = NOW() WHERE id = $1 RETURNING pet_id", [stat_id]);
    
    if(statCheck.rows[0].pet_id !== petId) throw Object.assign(new Error(`cannot add to a stat not found, the stat_id record you gave is connected to petId ${statCheck.rows[0].pet_id}`), { status: 404 });

    const result = await pool.query(
      `
      INSERT INTO weight_stat (stat_id, weight_id, weight)
        VALUES ($1, $2, $3)
        RETURNING id
      `,
      [stat_id, weight_id, weight]
    );
    res.json({ message: `id ${result.rows[0].id}, weight log added for statId ${stat_id} on petId ${statCheck.rows[0].pet_id}` });
  }
  catch(err){
    console.error(err);
    next(err);
  }
})

// GET all weight data logs for a specific pet (when no query parameters are given)
// -- /pets/:petId/weights

// GET all weights data logs by weight type or weight id for a specific pet 
// -- /pets/:petId/weights/?type={weightTypeOrId}

// GET graph: graphing x(weight) and y(stat_date) units for a specific pet by weight unit type
// -- /pets/:petId/weights/?graph={boolean} ; default is false

// GET all weight data logs and whether to include archived logs for a specific pet
// -- /pets/:petId/weights/?archived={boolean} ; default is false

// GET activity data logs sorted by column and direction for a specific pet
// -- /pets/:petId/activities/?sort={column}&direction={asc|desc}

router.get("/", async (req, res, next) => {
	try {
		const { petId} = req.params;
    const { type, graph, archived, sort, direction} = req.query;

    /* -------------------- IF GRAPH IS PROVIDED AND TRUE ------------------- */
    const columns = graph?.toLowerCase() == "true" 
    ? "weight, stat_date"
    : "weight_stat.id, weight_stat.weight_id, weight.unit, weight, stat.description, stat.stat_date, stat.date_created, stat.date_updated";

    let baseQuery = 
    `
    SELECT ${columns} FROM weight_stat 
    JOIN stat ON weight_stat.stat_id = stat.id 
    JOIN weight ON weight.id = weight_stat.weight_id 
    WHERE stat.pet_id = $1
    `;

    const values = [petId];

    /* ------------------------ IF A TYPE IS PROVIDED ----------------------- */
    if(type){ 
      const isId = !isNaN(type);
      const col = isId ? "weight_id" : "LOWER(unit)";
      const val = isId ? type : type.toLowerCase();

      const {rows} = await pool.query(`SELECT unit FROM weight_stat JOIN weightON weight.id = weight_stat.weight_id WHERE ${col} = $1`, [val]);
      if(!rows[0]) throw Object.assign(new Error("type not found"), { status: 404 });
      
      
      baseQuery += ` AND ${col} = $${values.length + 1}`;
      values.push(val);
    }

    /* ------------------ IF ARCHIVED IS PROVIDED AND TRUE ------------------ */
    baseQuery += archived?.toLowerCase() == "true" ? "" : " AND weight_stat.date_archived IS NULL";

    /* ------------------ IF SORT AND DIRECTION ARE PROVIDED ------------------ */
    if((sort && !direction) || (!sort && direction)) throw Object.assign(new Error("Both 'sort' and 'direction' query parameters must be provided together."), { status: 400 });
    if (sort && direction) {
      const dir = direction?.toLowerCase();
      if (dir !== "asc" && dir !== "desc") throw Object.assign(new Error("direction must be asc or desc"), { status: 400 });
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
});

// DELETE (soft delete) weight logs by id
// -- /pets/:petId/weights/:id
// we need to archive both the stat and the weight_stat since they're connected
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
// -- /pets/:petId/weights/deleted
router.get("/deleted", async (req, res, next) => {
	try {
		const { petId } = req.params;
		const result = await pool.query(
			`
      SELECT weight_stat.id, weight_stat.weight_id, weight.unit, weight, stat.description, stat.stat_date, stat.date_created, stat.date_updated, stat.date_archived FROM weight_stat
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
