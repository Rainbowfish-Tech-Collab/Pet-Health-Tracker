import express from 'express';
import pool from '../config/database.js';

// Scoped to a specific pet — mounted at /pets/:petId/heartRates
const router = express.Router({ mergeParams: true });

// Global — mounted at /heartRates
const globalRouter = express.Router(); 

// POST a new heartRate data log for a specific pet (and stat id)
// -- /pets/:petId/heartRates
// we also need to update stats date_updated field.
router.post("/", async (req, res, next) => {
  try{
    const { petId } = req.params;
    const { stat_id, beats_per_minute } = req.body;

    const statCheck = await pool.query("UPDATE stat SET date_updated = NOW() WHERE id = $1 RETURNING pet_id", [stat_id]);

    if(statCheck.rows[0].petId !== petId) throw Object.assign(new Error(`cannot add to a stat not found, the stat_id record you gave is connected to petId ${statCheck.rows[0].pet_id}`), { status: 404 });

    const result = await pool.query(
      `
      INSERT INTO heart_rate_stat (stat_id, beats_per_minute)
        VALUES ($1, $2)
        RETURNING id
      `,
      [stat_id, beats_per_minute]
    );
    res.json({ message: `id ${result.rows[0].id}, heart rate log added for statId ${stat_id} on petId ${statCheck.rows[0].pet_id}` });

  } catch (err) {
    console.error(err);
    next(err);
  }
});

// GET all heartRate data logs for a specific pet (when no query parameters are given)
// -- /pets/:petId/heartRates

// GET all heartRate data logs by the stat id 
// -- /pets/:petId/heartRates/?stat={id}

// GET graph: graphing x(beats_per_minute) and y(stat_date) units for a specific pet 
// -- /pets/:petId/heartRates/?graph={boolean} ; default is false

// GET all heartRate data logs and whether to include archived logs for a specific pet
// -- /pets/:petId/heartRates/?archived={true|false|only} ; default is false

// GET heartRate data logs sorted by column and direction for a specific pet
// -- /pets/:petId/heartRates/?sort={column}&direction={asc|desc}

router.get("/", async (req, res, next) => {
  try{
    const { petId } = req.params;
    const { stat, graph, archived, sort, direction } = req.query;

    /* -------------------- IF GRAPH IS PROVIDED AND TRUE ------------------- */
    let columns = graph?.toLowerCase() == "true"
    ? "beats_per_minute, stat_date"
    : "heart_rate_stat.id, heart_rate_stat.stat_id, heart_rate_stat.beats_per_minute, stat.description, stat.stat_date, stat.date_created, stat.date_updated";

    columns += archived?.toLowerCase() == "true" || archived?.toLowerCase() == "only" ? ", heart_rate_stat.date_archived" : "";

    let baseQuery = 
    `
    SELECT ${columns} FROM heart_rate_stat 
    JOIN stat ON heart_rate_stat.stat_id = stat.id 
    WHERE stat.pet_id = $1
    `;

    const values = [petId];

    /* ------------------------ IF A STAT ID IS PROVIDED ----------------------- */
    if(stat){ 
      if(isNaN(stat)) throw Object.assign(new Error("stat id must be a number"), { status: 400 });
      baseQuery += ` AND heart_rate_stat.stat_id = $${values.length + 1}`;
      values.push(stat);
    }

    /* ----------------- IF ARCHIVED IS PROVIDED ------------------ */
    baseQuery += archived?.toLowerCase() == "true" ? "" : archived?.toLowerCase() == "only" ? " AND heart_rate_stat.date_archived IS NOT NULL" :" AND heart_rate_stat.date_archived IS NULL";

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
});

// GET all heartRate data logs for a specific pet 
// GET all soft deleted weight logs for a specific pet
// -- /pets/:petId/heartRates/(all|deleted)
router.get(/^\/(all|deleted)$/, async (req, res, next) => {
  try{
    const { petId } = req.params;
    const showDeleted = req.path.endsWith("/deleted");

    const result = await pool.query(
      `
      SELECT heart_rate_stat.id, heart_rate_stat.stat_id, heart_rate_stat.beats_per_minute, stat.description, stat.stat_date, stat.date_created, stat.date_updated, ${showDeleted ? "heart_rate_stat.date_archived" : ""} FROM heart_rate_stat 
      JOIN stat ON heart_rate_stat.stat_id = stat.id 
      WHERE ${showDeleted ? "heart_rate_stat.date_archived IS NOT NULL" : "heart_rate_stat.date_archived IS NULL"} AND stat.pet_id = $1
      `, 
      [petId]
    )

    if(result.rows.length === 0) return res.json({ message: "No logs found" });
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// PATCH a heartRate data log for a specific pet and id. You cannot patch soft deleted logs from this endpoint
// -- /heartRates/:id
globalRouter.patch("/:id", async (req, res, next) => {
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
        WHERE id = (SELECT stat_id FROM heart_rate_stat WHERE id = $${fields.length + 1})
      )
      UPDATE heart_rate_stat
      SET ${fields
        .map((field, index) => `${field} = $${index + 1}`)
        .join(", ")}, date_updated = NOW()
      FROM stat
      WHERE heart_rate_stat.id = $${fields.length + 1} 
      AND heart_rate_stat.date_archived IS NULL 
      AND stat.id = heart_rate_stat.stat_id
      RETURNING heart_rate_stat.*, stat.pet_id
      `, 
      [...values, id]

    );
    if(result.rows.length === 0) throw Object.assign(new Error("log not found"), { status: 404 });
    res.json(
      { 
        message: `id ${id}, stat log updated for petId ${result.rows[0].pet_id}`,
        'updated log': result.rows[0] 
      }
    );
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// PATCH heartRate data log by id, endpoint is intended to move soft deleted logs back to active status. 
// We have to update the stat_id log's date_updated field.
// -- /heartRates/:id/restore
globalRouter.patch("/:id/restore", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query("UPDATE heart_rate_stat SET date_archived = NULL, date_updated = NOW() WHERE id = $1 AND date_archived IS NOT NULL RETURNING id, stat_id", [id]);
    if(result.rows.length === 0) throw Object.assign(new Error("log not found or already exists"), { status: 404 });
    await pool.query("UPDATE stat SET date_updated = NOW() WHERE id = $1", [result.rows[0].stat_id]);
    res.json({ message: `id: ${id}, Stat log restored for statId: ${result.rows[0].stat_id}` });
  } catch (err) {
    console.error(err);
    next(err);
  }
})

// DELETE heartRate data log by id, either a soft or hard delete
// -- heartRate/:id/:deleteType(soft|hard)
// any DELETES regardless will update the stat_id log's date_updated field. 
// Frontend should call stats/:id/:deleteType(soft|hard) along with this endpoint, when categories checked is only one left. 
// Recall if were hard deleting and this is the only subcategory in that stat, calling the stats's delete endpoint alone will delete the subcategory as well, through `DELETE CASCADE`. 
globalRouter.delete("/:id/:deleteType(soft|hard)", async (req, res, next) => {
  try {
    const { id, deleteType } = req.params;
    let result;
    if(deleteType === "soft") result = await pool.query("UPDATE heart_rate_stat SET date_archived = NOW(), date_updated = NOW() WHERE id = $1 AND date_archived IS NULL RETURNING id, stat_id", [id]);
    else if (deleteType === "hard") result = await pool.query("DELETE FROM heart_rate_stat WHERE id = $1 AND date_archived IS NOT NULL RETURNING id, stat_id", [id]);
    if(result.rows.length === 0) throw Object.assign(new Error("log not found"), { status: 404 });
    await pool.query("UPDATE stat SET date_updated = NOW() WHERE id = $1", [result.rows[0].stat_id]);
    res.json({ message: `id: ${id}, Stat log ${deleteType === "soft" ? "soft" : "hard"} deleted for statId: ${result.rows[0].stat_id}` });
  } catch (err) {
    console.error(err);
    next(err);
  }
})

export { router, globalRouter };