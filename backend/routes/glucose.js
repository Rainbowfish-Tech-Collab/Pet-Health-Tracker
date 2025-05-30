import express from 'express';
import pool from '../config/database.js';

// Scoped to a specific pet — mounted at /pets/:petId/glucose
const router = express.Router({ mergeParams: true });

// Global — mounted at /glucose
const globalRouter = express.Router(); 

// POST a glucose data log for a specific pet (and stat id)
// -- /pets/:petId/glucose
// We also need to update stats date_updated field.
router.post("/", async (req, res, next) => {
  try{
    const { petId } = req.params;
    const { stat_id, glucose_id, glucose_level } = req.body;

    const statCheck = await pool.query("UPDATE stat SET date_updated = NOW() WHERE id = $1 RETURNING pet_id", [stat_id]);

    if(statCheck.rows[0].petId !== petId) throw Object.assign(new Error(`cannot add to a stat not found, the stat_id record you gave is connected to petId ${statCheck.rows[0].pet_id}`), { status: 404 });

    const result = await pool.query(
      `
      INSERT INTO glucose_stat (stat_id, glucose_id, glucose_level)
        VALUES ($1, $2, $3)
        RETURNING id
      `,
      [stat_id, glucose_id, glucose_level]
    );
    res.json({ message: `id ${result.rows[0].id}, glucose log added for statId ${stat_id} on petId ${statCheck.rows[0].pet_id}` });
  } catch (err) {
    console.error(err);
    next(err);
  }
})

// GET all glucose data logs for a specific pet (when no query parameters are given)
// -- /pets/:petId/glucose

// GET glucose data logs by the stat id
// -- /pets/:petId/glucose/?stat={id}

// GET all glucose data logs by glucose type or glucose id for a specific pet 
// -- /pets/:petId/glucose/?type={glucoseTypeOrId}

// GET graphing x (glucose level) and y (stat_date) units for a specific pet by glucose unit type
// -- /pets/:petId/glucose/?graph={boolean} ; default is false

// GET all glucose data logs and whether to include archived logs for a specific pet
// -- /pets/:petId/glucose/?archived={true|false|only} ; default is false

// GET glucose data logs sorted by column and direction for a specific pet
// -- /pets/:petId/glucose/?sort={column}&direction={asc|desc}



router.get('/', async (req, res, next) => {
  try {
    const { petId } = req.params;
    const { type, stat, graph, archived, sort, direction} = req.query;

    /* -------------------- IF GRAPH IS PROVIDED AND TRUE ------------------- */
    let columns = graph?.toLowerCase() == "true" 
    ? "glucose_level, stat_date"
    : "glucose_stat.id, glucose_stat.glucose_id, glucose.unit, glucose_level, stat.description, stat.stat_date, stat.date_created, stat.date_updated";

    columns += archived?.toLowerCase() == "true" || archived?.toLowerCase() == "only" ? ", glucose_stat.date_archived" : "";

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

    /* ---------------------- IF A STAT ID IS PROVIDED ---------------------- */
    if(stat){
      if(isNaN(stat)) throw Object.assign(new Error("stat must be a number"), { status: 400 });
      baseQuery += ` AND glucose_stat.stat_id = $${values.length + 1}`;
      values.push(stat);
    }

    /* ----------------- IF ARCHIVED IS PROVIDED ------------------ */
    baseQuery += archived?.toLowerCase() == "true" ? "" : archived?.toLowerCase() == "only" ? " AND glucose_stat.date_archived IS NOT NULL" :" AND glucose_stat.date_archived IS NULL";

    /* ----------------- IF SORT AND DIRECTION ARE PROVIDED ----------------- */
    if((sort && !direction) || (!sort && direction)) throw Object.assign(new Error("Both 'sort' and 'direction' query parameters must be provided together."), { status: 400 });
    if(sort && direction){
      const dir = direction?.toLowerCase();
      if(!["asc", "desc"].includes(dir)) throw Object.assign(new Error("Invalid direction. Use 'asc' or 'desc'."), { status: 400 });
      if(!columns.includes(sort)) throw Object.assign(new Error(`Cannot sort by '${sort}'. It is not a valid column.`), { status: 400 });
      baseQuery += ` ORDER BY ${sort} ${dir}`;
    }

    const result = await pool.query(baseQuery, values);
    if(result.rows.length === 0) return res.json({ message: "No logs found" });
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    next(err);
  }
})

// GET all glucose logs for a specific pet
// GET all soft deleted glucose logs by pet id at /:petId/deleted
// -- /pets/:petId/glucose/(all|deleted)

router.get(/^\/(all|deleted)$/, async (req, res, next) => {
  try {
    const { petId } = req.params;
    const showDeleted = req.path.endsWith("/deleted");
    const result = await pool.query(
      `
      SELECT glucose_stat.id, glucose_stat.glucose_id, glucose.unit, glucose_stat.glucose_level, stat.description, stat.stat_date, stat.date_created, stat.date_updated ${showDeleted ? ", glucose_stat.date_archived" : ""} 
      FROM glucose_stat 
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

// PATCH a glucose data log for a specific pet and id. You cannot patch soft deleted logs from this endpoint
// -- /glucose/:id

globalRouter.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const fields = Object.keys(req.body);
    const values = Object.values(req.body);

    if (fields.length === 0) throw Object.assign(new Error("No fields to update"), { status: 400 });

    const immutables = ["id", "stat_id","date_created", "date_updated", "date_archived"];
    let immutableErrors = "the following fields are immutable: ";
    let immutableFields = [];
    let dateArchivedErr = "\nIf you want to archive this log, please use the DELETE endpoint. If you want to restore this log, use the PATCH endpoint with the /restore suffix.";
    let dateArchived = false;
    for (const key of Object.keys(req.body)) {
      if (immutables.includes(key)) {
        immutableFields.push(key);
        delete req.body[key];
      }
      if (key === "date_archived") dateArchived = true;
    }

    if (immutableFields.length > 0) throw Object.assign(new Error(immutableErrors + immutableFields.join(", ") + '. ' + (dateArchived ? dateArchivedErr : "")), { status: 400 });

    const result = await pool.query(
      `
      WITH update_stat AS (
        UPDATE stat
        SET date_updated = NOW()
        WHERE id = (SELECT stat_id FROM glucose_stat WHERE id = $${fields.length + 1})
      )
      UPDATE glucose_stat 
      SET ${fields.map((field, index) => `${field} = $${index + 1}`).join(", ")}, date_updated = NOW() 
      FROM stat
      WHERE glucose_stat.id = $${fields.length + 1} 
      AND glucose_stat.date_archived IS NULL 
      AND stat.id = glucose_stat.stat_id
      RETURNING glucose_stat.*, stat.pet_id`,
      [...values, id]
    );
    if(result.rows.length === 0) throw Object.assign(new Error("log not found"), { status: 404 });
    res.json({ message: `id ${id}, stat log updated for petId ${result.rows[0].pet_id}` });
  } catch (err) {
    console.error(err);
    next(err);
  }
})

// PATCH glucose stat log by id, endpoint is intended to move soft deleted logs back to active status
// We have to update the stat_id log's date_updated field.
// -- /glucose/:id/restore

globalRouter.patch("/:id/restore", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query("UPDATE glucose_stat SET date_archived = NULL, date_updated = NOW() WHERE id = $1 AND date_archived IS NOT NULL RETURNING id, stat_id", [id]);
    if(result.rows.length === 0) throw Object.assign(new Error("log not found or already exists"), { status: 404 });
    await pool.query("UPDATE stat SET date_updated = NOW() WHERE id = $1", [result.rows[0].stat_id]);
    res.json({ message: `id: ${id}, Stat log restored for statId: ${result.rows[0].stat_id}` });
  } catch (err) {
    console.error(err);
    next(err);
  }
})

// DELETE (soft delete) glucose log by id , either a soft or hard delete
// -- glucose/:id/:deleteType(soft|hard)
// any DELETES regardless will update the stat_id log's date_updated field. 
// Frontend should call stats/:id/:deleteType(soft|hard) along with this endpoint, when categories checked is only one left. 
// Recall if were hard deleting and this is the only subcategory in that stat, calling the stats's delete endpoint alone will delete the subcategory as well, through `DELETE CASCADE`. 
globalRouter.delete('/:id/:deleteType(soft|hard)', async (req, res, next) => {
  try {
    const { id, deleteType } = req.params;

    let result;
    if(deleteType === "soft") result = await pool.query("UPDATE glucose_stat SET date_archived = NOW(), date_updated = NOW() WHERE id = $1 AND date_archived IS NULL RETURNING id, stat_id", [id]);
    else if (deleteType === "hard") result = await pool.query("DELETE FROM glucose_stat WHERE id = $1 AND date_archived IS NOT NULL RETURNING id, stat_id", [id]);
    
    if(result.rows.length === 0) throw Object.assign(new Error("log not found"), { status: 404 });
    await pool.query("UPDATE stat SET date_updated = NOW() WHERE id = $1", [result.rows[0].stat_id]);
    res.json({ message: `id: ${id}, glucose log ${deleteType === "soft" ? "soft" : "hard"} deleted for statId: ${result.rows[0].stat_id}` });
  } catch (err) {
    console.error(err);
    next(err);
  }
})

export { router, globalRouter };
