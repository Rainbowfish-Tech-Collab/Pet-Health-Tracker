import express from "express";
import pool from "../config/database.js";

// Scoped to a specific pet — mounted at /pets/:petId/activities
const router = express.Router({ mergeParams: true });

// Global — mounted at /activities
const globalRouter = express.Router(); 

// POST a new activity data log for a specific pet 
// -- /pets/:petId/activities/
router.post("/", async (req, res, next) => {
  try {
    const { petId } = req.params;
    const { activity_type_id, duration_in_hours, note, activity_date} = req.body;
    if(note == undefined) note = null;
    const result = await pool.query(
      "INSERT INTO activity (pet_id, activity_type_id, duration_in_hours, note, activity_date) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [petId, activity_type_id, duration_in_hours, note, activity_date]
    );
    //error will be thrown by not null constraints
    res.json({ message: `id: ${result.rows[0].id}, Activity log created` });
  } catch (err) {
    console.error(err);
    next(err);
  }
})

// GET all activity data logs for a specific pet (when no query parameters are given)
// -- /pets/:petId/activities/

// GET all activity data logs by activity type or activity type id for a specific pet 
// -- /pets/:petId/activities/?type={activityTypeOrId}

// GET duration_in_hours vs activity_date by activity type for graphing x and y units for a specific pet
// -- /pets/:petId/activities/?graph={boolean} ; default is false

// GET all activity data logs and whether to include archived logs for a specific pet
// -- /pets/:petId/activities/?archived={true|false|only} ; default is false

// GET activity data logs sorted by column and direction for a specific pet
// -- /pets/:petId/activities/?sort={column}&direction={asc|desc}
router.get("/", async (req, res, next) => {
  try{
    const {petId} = req.params;
    const {type, graph, archived, sort, direction} = req.query;

    /* -------------------- IF GRAPH IS PROVIDED AND TRUE ------------------- */
    let columns = graph?.toLowerCase() == "true" 
    ? "duration_in_hours, activity_date"
    : "activity.id, activity_type_id, name, duration_in_hours, note, activity_date, date_created, date_updated";

    columns += archived?.toLowerCase() == "true" || archived?.toLowerCase() == "only" ? ", date_archived" : "";

    let baseQuery = 
    `
    SELECT ${columns} FROM activity 
    JOIN activity_type ON activity.activity_type_id = activity_type.id 
    WHERE pet_id = $1
    `;

    const values = [petId];

    /* ------------------------ IF A TYPE IS PROVIDED ----------------------- */
    if(type){ 
      const isId = !isNaN(type);
      const col = isId ? "activity_type_id" : "LOWER(name)";
      const val = isId ? type : type.toLowerCase();

      const {rows} = await pool.query(`SELECT name FROM activity_type JOIN activity ON activity_type.id = activity.activity_type_id WHERE ${col} = $1`, [val]);
      if(rows.length === 0) throw Object.assign(new Error("type not found"), { status: 404 });
      
      baseQuery += ` AND ${col} = $${values.length + 1}`;
      values.push(val);
    }


    /* ----------------------- IF ARCHIVED IS PROVIDED ---------------------- */
    baseQuery += archived?.toLowerCase() == "true" ? "" : archived?.toLowerCase() == "only" ? " AND date_archived IS NOT NULL" : " AND date_archived IS NULL";

    /* ----------------- IF SORT AND DIRECTION ARE PROVIDED ----------------- */
    
    if((sort && !direction) || (!sort && direction)) throw Object.assign(new Error("Both 'sort' and 'direction' query parameters must be provided together."), { status: 400 });
    if (sort && direction) {
      const dir = direction?.toLowerCase();
      if (!["asc", "desc"].includes(dir)) throw Object.assign(new Error("Invalid direction. Use 'asc' or 'desc'."), { status: 400 });
      if (!columns.includes(sort)) throw Object.assign(new Error(`Cannot sort by '${sort}'. It is not a valid column.`), { status: 400 });
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

// GET all activity data logs for a specific pet 
// GET all soft deleted activity data logs for a specific pet
// -- /pets/:petId/activities/(all|deleted)
router.get(/^\/(all|deleted)$/, async (req, res, next) => {
  try {
    const { petId } = req.params;
    const showDeleted = req.path.endsWith("/deleted");

    const result = await pool.query(
      `
      SELECT activity.id, activity_type_id, name, duration_in_hours, note, activity_date, date_created, date_updated ${showDeleted ? ", date_archived" : ""} 
      FROM activity 
      JOIN activity_type ON activity.activity_type_id = activity_type.id 
      WHERE ${showDeleted ? "date_archived IS NOT NULL" : "date_archived IS NULL"} AND pet_id = $1
    `, [petId]);
    if(result.rows.length === 0) return res.json({ message: "No logs found" });
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// PATCH an activity data log by id. You cannot patch soft deleted logs from this endpoint
// -- /activities/:id
globalRouter.patch("/:id", async (req, res, next) => {
	try {
		const { id } = req.params;
    const fields = Object.keys(req.body);
		const values = Object.values(req.body);

		if (fields.length === 0) throw Object.assign(new Error("No fields to update"), { status: 400 });
    
		const immutables = ["id", "pet_id","date_created", "date_updated", "date_archived"];
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
      UPDATE activity
      SET ${fields
				.map((field, index) => `${field} = $${index + 1}`)
				.join(", ")}, date_updated = NOW()
      WHERE id = $${fields.length + 1} 
      AND date_archived IS NULL 
      RETURNING * 
      `,
			[...values, id]
		);

    if(result.rows.length === 0) throw Object.assign(new Error("log not found"), { status: 404 });
		res.json(
			{ 
        message: `id: ${id}, Activity log updated for petId: ${result.rows[0].pet_id}`,
        'updated log': result.rows[0] 
      }
		);
	} catch (err) {
		console.error(err);
		next(err);
	}
});

// PATCH activity data log by id; endpoint is intended to move soft deleted logs back to active status.
// -- /activities/:id/restore

globalRouter.patch("/:id/restore", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query("UPDATE activity SET date_archived = NULL, date_updated = NOW() WHERE id = $1 AND date_archived IS NOT NULL RETURNING id, pet_id", [id]);
    if(result.rows.length === 0) throw Object.assign(new Error("log not found or already exists"), { status: 404 });
    res.json({ message: `id: ${id}, Activity log restored for petId: ${result.rows[0].pet_id}` });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// DELETE activity data log by id, either a soft or hard delete; since data logs is a soft delete then a hard delete after a certain time (30 days), we will follow through with a delete route and it makes the most sense with the user action. 
// -- /activities/:id/:deleteType(soft|hard)

globalRouter.delete("/:id/:deleteType(soft|hard)", async (req, res, next) => {
  try {
    const { id, deleteType } = req.params;
    let result;
    if(deleteType === "soft") result = await pool.query("UPDATE activity SET date_archived = NOW(), date_updated = NOW() WHERE id = $1 AND date_archived IS NULL RETURNING id, pet_id", [id]);
    else if (deleteType === "hard") result = await pool.query("DELETE FROM activity WHERE id = $1 AND date_archived IS NOT NULL RETURNING id, pet_id", [id]);
    if(result.rows.length === 0) throw Object.assign(new Error("log not found"), { status: 404 });
    res.json({ message: `id: ${id}, Activity log ${deleteType === "soft" ? "soft" : "hard"} deleted for petId: ${result.rows[0].pet_id}` });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

export { router, globalRouter };