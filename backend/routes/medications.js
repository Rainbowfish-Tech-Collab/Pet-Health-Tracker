import express from "express";
import pool from "../config/database.js";

// Scoped to a specific pet — mounted at /pets/:petId/medications
const router = express.Router({ mergeParams: true });

// Global - mounted at /medications
const globalRouter = express.Router();

// POST a new medication data log for a specific pet
// -- /pets/:petId/medications
router.post("/", async (req, res, next) => {
  try {
    const { petId } = req.params;
    const { medication_type_id, dosage_id, dosage, note, medication_date } = req.body;
    if(note == undefined) note = null;
    const result = await pool.query(
      "INSERT INTO medication (pet_id, medication_type_id, dosage_id, dosage, note, medication_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
      [petId, medication_type_id, dosage_id, dosage, note, medication_date]
    );
    //error will be thrown by not null constraints
    res.json({ message: `id: ${result.rows[0].id}, Medication log created`});
  } catch (err) {
    console.error(err);
    next(err);
  }
})


// POST a new medication type for medication_type for a specific pet 
// normally this should go in the db endpoint, but since types are user entered, they should be locked under a pet. 
// Most likely will need to implement some sort of cache to save this medication type list in the future. 
// -- /pets/:petId/medications/types 
router.post("/types", async (req, res, next) => {
  try {
    const { petId } = req.params;
    const { name } = req.body;
    const result = await pool.query(
      "INSERT INTO medication_type (name) VALUES ($1) RETURNING id",
      [name]
    );
    res.json({ message: `id: ${result.rows[0].id}, Medication type created. Please attach this medication type to a medication log for petId: ${req.params.petId} to save it.`});
  } catch (err) {
    console.error(err);
    next(err);
  }
})

// GET all medication data logs for a specific pet (when no query parameters are given)
// -- /pets/:petId/medications

// GET all medication data logs by medication type or medication type id for a specific pet 
// -- /pets/:petId/medications/?type={medicationTypeOrId}

// GET dosage vs medication_date by medication type for graphing x and y units for a specific pet (dosage, name, medication_date)
// -- /pets/:petId/medications/?graph={boolean} ; default is false

// GET all medication data logs and whether to include archived logs for a specific pet
// -- /pets/:petId/medications/?archived={true|false|only} ; default is false

// GET medication data logs sorted by column and direction for a specific pet
// -- /pets/:petId/medications/?sort={column}&direction={asc|desc}
router.get("/", async (req, res, next) => {
  try {
    const { petId } = req.params;
    const { type, graph, archived, sort, direction } = req.query;
    
    /* -------------------- IF GRAPH IS PROVIDED AND TRUE ------------------- */
    let columns = graph?.toLowerCase() == "true" 
    ? "dosage, name, medication_date"
    : "medication.id, medication_type_id, name, dosage_id,dosage, note, medication_date, date_created, date_updated";

    columns += archived?.toLowerCase() == "true" || archived?.toLowerCase() == "only" ? ", date_archived" : "";

    let baseQuery = 
    `
    SELECT ${columns} FROM medication 
    JOIN medication_type ON medication.medication_type_id = medication_type.id 
    WHERE pet_id = $1
    `;

    const values = [petId];

    /* ------------------------ IF A TYPE IS PROVIDED ----------------------- */
    if(type){ 
      const isId = !isNaN(type);
      const col = isId ? "medication_type_id" : "LOWER(name)";
      const val = isId ? type : type.toLowerCase();

      const {rows} = await pool.query(`SELECT name FROM medication_type JOIN medication ON medication_type.id = medication.medication_type_id WHERE ${col} = $1`, [val]);
      if(rows.length === 0) throw Object.assign(new Error("type not found"), { status: 404 });
      
      baseQuery += ` AND ${col} = $${values.length + 1}`;
      values.push(val);
    }

    /* ----------------------- IF ARCHIVED IS PROVIDED ---------------------- */
    baseQuery += archived?.toLowerCase() == "true" ? "" : archived?.toLowerCase() == "only" ? " AND date_archived IS NOT NULL" : " AND date_archived IS NULL";

    /* ----------------------- IF SORT AND DIRECTION ARE PROVIDED ---------------------- */
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
})


// GET all activity data logs for a specific pet 
// GET all soft deleted activity data logs for a specific pet
// GET all medication types for a specific pet
// -- /pets/:petId/medications/(all|deleted|types)
router.get(/^\/(all|deleted|types)$/, async (req, res, next) => {
  try {
    const { petId } = req.params;
    const showDeleted = req.path.endsWith("/deleted");
    const showTypes = req.path.endsWith("/types");

    if(showTypes){
      const result = await pool.query(`
        SELECT DISTINCT medication_type.id, name 
        FROM medication_type 
        JOIN medication ON medication_type.id = medication.medication_type_id 
        WHERE pet_id = $1`, 
        [petId]
      );
      if(result.rows.length === 0) return res.json({ message: "No medication types found" });
      res.json(result.rows);
    } else {
      const result = await pool.query(
        `
        SELECT medication.id, medication_type_id, name, dosage_id, dosage, note, medication_date, date_created, date_updated ${showDeleted ? ", date_archived" : ""} 
        FROM medication 
        JOIN medication_type ON medication.medication_type_id = medication_type.id 
        WHERE ${showDeleted ? "date_archived IS NOT NULL" : "date_archived IS NULL"} AND pet_id = $1
        `, [petId]
      );
      if(result.rows.length === 0) return res.json({ message: "No logs found" });
      res.json(result.rows);
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
})

// PATCH a medication data entry for a specific pet and id. You cannot patch soft deleted logs from this endpoint
// -- /medications/:id
globalRouter.patch("/:id", async (req, res, next) => {
  try{
    const { id } = req.params;
    const fields = Object.keys(req.body);
    const values = Object.values(req.body);

    if(fields.length === 0) throw Object.assign(new Error("No fields to update"), { status: 400 });

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
      UPDATE medication 
      SET ${fields
        .map((field, index) => `${field} = $${index + 1}`)
        .join(", ")}, date_updated = NOW()
      WHERE id = $${fields.length + 1} 
      AND date_archived IS NULL 
      RETURNING *
      `, [...values, id]
    );
    if(result.rows.length === 0) return res.json({ message: "No log found" });
    res.json(
      {
        message: `id: ${id}, medication log updated for petId: ${result.rows[0].pet_id}`,
        'updated log': result.rows[0]
      }
    );
  } catch (err) {
    console.error(err);
    next(err);
  }
})

// PATCH medication type by medication type id
// -- /medications/types/:id
globalRouter.patch("/types/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const result = await pool.query(
      `
      UPDATE medication_type SET name = $1
      FROM medication
      WHERE medication_type.id = $2 AND medication.medication_type_id = medication_type.id RETURNING medication_type.*, medication.pet_id
      `, 
      [name, id]
    );
    if(result.rows.length === 0) return res.json({ message: "No log found" });
    res.json({ message: `id: ${id}, medication type updated for petId: ${result.rows[0].pet_id}` });
  } catch (err) {
    console.error(err);
    next(err);
  }
})

// PATCH medication data log by id; endpoint is intended to move soft deleted logs back to active status.
// -- /medications/:id/restore
globalRouter.patch("/:id/restore", async (req, res, next) => {
  try{
    const { id } = req.params;
    const result = await pool.query("UPDATE medication SET date_archived = NULL, date_updated = NOW() WHERE id = $1 AND date_archived IS NOT NULL RETURNING id, pet_id", [id]);
    if(result.rows.length === 0) throw Object.assign(new Error("log not found or already exists"), { status: 404 });
    res.json({ message: `id: ${id}, Medication log restored for petId: ${result.rows[0].pet_id}` });
  } catch (err){
    console.log(err);
    next(err);
  }
})

// DELETE medication data log by id, either a soft or hard delete
// -- /medications/:id/:deleteType(soft|hard)

globalRouter.delete("/:id/:deleteType(soft|hard)", async (req, res, next) => {
  try {
    const { id, deleteType } = req.params;
    let result;
    if(deleteType === "soft") result = await pool.query("UPDATE medication SET date_archived = NOW(), date_updated = NOW() WHERE id = $1 AND date_archived IS NULL RETURNING id, pet_id", [id]);
    else if (deleteType === "hard") result = await pool.query("DELETE FROM medication WHERE id = $1 AND date_archived IS NOT NULL RETURNING id, pet_id", [id]);
    if(result.rows.length === 0) throw Object.assign(new Error("log not found"), { status: 404 });
    res.json({ message: `id ${id}, medication log deleted for petId ${result.rows[0].pet_id}` });
  } catch (err) {
    console.error(err);
    next(err);
  }
})

// DELETE medication type by medication type id
// -- /medications/types/:id

globalRouter.delete("/types/:id", async (req, res, next) => {
  try{
    const { id } = req.params;
    const result = await pool.query(`
      DELETE FROM medication_type
      USING medication
      WHERE medication_type.id = medication.medication_type_id
      AND medication_type.id = $1
      RETURNING medication.pet_id`, 
      [id]
    );
    if(result.rows.length === 0) throw Object.assign(new Error("log not found"), { status: 404 });
    res.json({ message: `id ${id}, medication type deleted for petId ${result.rows[0].pet_id}` });
  } catch (err){
    console.log(err);
    next(err);
  }
})

export { router, globalRouter };