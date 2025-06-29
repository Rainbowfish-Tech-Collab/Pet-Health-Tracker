import express from 'express';
import pool from '../config/database.js';
// Scoped to a specific pet — mounted at /pets/:petId/symptoms
const router = express.Router({ mergeParams: true });

// Global — mounted at /symptoms
const globalRouter = express.Router();

// POST a new symptom data log for a specific pet
// -- /pets/:petId/symptoms
router.post("/", async (req, res, next) => {
  try {
    const { petId } = req.params;
    const { symptom_type_id, symptom_other, symptom_description, symptom_date } = req.body;
    // Always required fields
    const columns = ['pet_id', 'symptom_type_id', 'symptom_date'];
    const values = [petId, symptom_type_id, symptom_date];

    // Optional fields
    if (symptom_other !== undefined) {
      columns.push('symptom_other');
      values.push(symptom_other);
    }

    if (symptom_description !== undefined) {
      columns.push('symptom_description');
      values.push(symptom_description);
    }

    const result = await pool.query(
      `
      INSERT INTO symptom (${columns.join(",")}) 
      VALUES (${values.map((_, i) => `$${i + 1}`).join(",")}) 
      RETURNING id`,
      values
    );
    
    res.json({ message: `id: ${result.rows[0].id}, Symptom log created` });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// POST a new symptom type for symptom_type for a specific pet 
// normally this should go in the db endpoint, but since types are user entered, they should be locked under a pet. 
// Most likely will need to implement some sort of cache to save this medication type list in the future. 
// -- /pets/:petId/symptoms/types 

router.post("/types", async (req, res, next) => {
  try {
    const { petId } = req.params;
    const { name } = req.body;
    const result = await pool.query(
      "INSERT INTO symptom_type (pet_id, name) VALUES ($1, $2) RETURNING id, pet_id",
      [petId, name]
    );
    res.json({ message: `id: ${result.rows[0].id}, Symptom type created for petId: ${result.rows[0].pet_id}.`});
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// GET all symptom data logs for a specific pet (when no query parameters are given)
// -- /pets/:petId/symptoms

// GET all symptom data logs by symptom type or symptom type id for a specific pet 
// -- /pets/:petId/symptoms/?type={symptomTypeOrId}

// GET frequency vs symptom_date by symptom type for graphing x and y units for a specific pet
// -- /pets/:petId/symptoms/?graph={boolean} ; default is false

// GET all symptom data logs and whether to include archived logs for a specific pet
// -- /pets/:petId/symptoms/?archived={true|false|only} ; default is false

// GET symptom data logs sorted by column and direction for a specific pet
// -- /pets/:petId/symptoms/?sort={column}&direction={asc|desc}

router.get("/", async (req, res, next) => {
  try {
    const { petId } = req.params;
    const { type, archived, sort, direction, graph } = req.query;
    
    /* -------------------- IF GRAPH IS PROVIDED AND TRUE ------------------- */
    let columns = graph?.toLowerCase() == "true" 
    ? "name, symptom_date"
    : "symptom.id, symptom_type_id, name, symptom_other, symptom_description, symptom_date, date_created, date_updated";

    columns += archived?.toLowerCase() == "true" || archived?.toLowerCase() == "only" ? ", symptom.date_archived" : "";

    let baseQuery = 
    `
    SELECT ${columns} FROM symptom 
    JOIN symptom_type ON symptom.symptom_type_id = symptom_type.id 
    WHERE symptom.pet_id = $1
    `;

    const values = [petId];

    /* ------------------------ IF A TYPE IS PROVIDED ----------------------- */
    if(type){ 
      const isId = !isNaN(type);
      const col = isId ? "symptom_type.id" : "LOWER(name)";
      const val = isId ? type : type.toLowerCase();

      const typeCheck = await pool.query(`SELECT name FROM symptom_type WHERE ${col} = $1`, [val]);
      if(typeCheck.rows.length === 0) throw Object.assign(new Error("type not found"), { status: 404 });

      const { rows } = await pool.query(`SELECT name FROM symptom_type JOIN symptom ON symptom_type.id = symptom.symptom_type_id WHERE ${col} = $1`, [val]);
      if(rows.length === 0) return res.json({ message: "No logs found" });
      
      baseQuery += ` AND ${col} = $${values.length + 1}`;
      values.push(val);
    }

    /* ----------------------- IF ARCHIVED ID PROVIDED ---------------------- */
    baseQuery += archived?.toLowerCase() == "true" ? "" : archived?.toLowerCase() == "only" ? " AND symptom.date_archived IS NOT NULL" : " AND symptom.date_archived IS NULL";

    /* ----------------------- IF SORT AND DIRECTION ARE PROVIDED ---------------------- */
    if((sort && !direction) || (!sort && direction)) throw Object.assign(new Error("Both 'sort' and 'direction' query parameters must be provided together."), { status: 400 });
    if (sort && direction) {
      const dir = direction?.toLowerCase();
      if (!["asc", "desc"].includes(dir)) throw Object.assign(new Error("Invalid direction. Use 'asc' or 'desc'."), { status: 400 });
      if (!columns.includes(sort)) throw Object.assign(new Error(`Cannot sort by '${sort}'. It is not a valid column.`), { status: 400 });
      baseQuery += ` ORDER BY ${sort} ${dir}`;
    }
    
    const { rows } = await pool.query(baseQuery, values);
    if(rows.length === 0) return res.json({ message: "No logs found" });
    res.json(rows);
  } catch (err) {
    console.error(err);
    next(err);
  }
})

// GET all symptom data logs for a specific pet 
// GET all soft deleted symptom data logs for a specific pet
// GET all symptom types for a specific pet
// -- /pets/:petId/symptoms/(all|deleted|types) w/ query parameter for archived types
router.get(/^\/(all|deleted|types)$/, async (req, res, next) => {
  try {
    const { petId } = req.params;
    const { archived } = req.query;
    const showDeleted = req.path.endsWith("/deleted");
    const showTypes = req.path.endsWith("/types");

    // types will show user inputted types first, then default symptom types at the very bottom. 
    if(showTypes){
      const result = await pool.query(`
        SELECT id, name, pet_id, date_archived
        FROM symptom_type
        WHERE (pet_id = $1 OR pet_id IS NULL) ${archived?.toLowerCase() == "true" ? "" : archived?.toLowerCase() == "only" ? "AND date_archived IS NOT NULL" : "AND date_archived IS NULL"}
        ORDER BY pet_id, id
        `, 
        [petId]
      );
      if(result.rows.length === 0) return res.json({ message: "No medication types found" });
      res.json(result.rows);
    }
    else{
      const result = await pool.query(
        `
        SELECT symptom.id, symptom_type_id, name, symptom_other, symptom_description, symptom_date, date_created, date_updated ${showDeleted ? ", symptom.date_archived" : ""} 
        FROM symptom 
        JOIN symptom_type ON symptom.symptom_type_id = symptom_type.id 
        WHERE ${showDeleted ? "symptom.date_archived IS NOT NULL" : "symptom.date_archived IS NULL"} AND symptom.pet_id = $1
      `, [petId]);
      if(result.rows.length === 0) return res.json({ message: "No logs found" });
      res.json(result.rows);
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
})

// PATCH a symptom type for a specific pet
// -- /pets/:petId/symptoms/types/:id
router.patch("/types/:id", async (req, res, next) => {
  try {
    const { petId, id } = req.params;
    const { name } = req.body;
    console.log(id);
    const result = await pool.query(
      "UPDATE symptom_type SET name = $1 WHERE id = $2 AND pet_id = $3 RETURNING id, pet_id",
      [name, id, petId]
    );

    if(result.rows.length === 0) throw Object.assign(new Error("log not found"), { status: 404 });
    res.json({ message: `id: ${result.rows[0].id}, Symptom type updated for petId: ${result.rows[0].pet_id}.`});
  } catch (err) {
    console.error(err);
    next(err);
  }
})

// PATCH a symptom data log by id. You cannot patch soft deleted logs from this endpoint
// -- /symptoms/:id
globalRouter.patch("/:id", async (req, res, next) => {
  try{
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
      UPDATE symptom 
      SET ${fields
        .map((field, index) => `${field} = $${index + 1}`)
        .join(", ")}, date_updated = NOW()
      WHERE id = $${fields.length + 1} 
      AND date_archived IS NULL 
      RETURNING * 
      `,
      [...values, id]
    );
    if(result.rows.length === 0) throw Object.assign(new Error("Log not found"), { status: 404 });
    res.json(
      { 
        message: `id: ${id}, Symptom log updated for petId: ${result.rows[0].pet_id}`,
        'updated log': result.rows[0]
      }
    );
  } catch (err){
    console.log(err);
    next(err);
  }
})

// PATCH symptom data log by id; endpoint is intended to move soft deleted logs back to active status. 
// -- /symptoms/:id/restore
globalRouter.patch("/:id/restore", async (req, res, next) => {
  try{
    const { id } = req.params;
    const result = await pool.query("UPDATE symptom SET date_archived = NULL, date_updated = NOW() WHERE id = $1 AND date_archived IS NOT NULL RETURNING id, pet_id", [id]);
    if(result.rows.length === 0) throw Object.assign(new Error("log not found or already exists"), { status: 404 });
    res.json({ message: `id: ${id}, Symptom log restored for petId: ${result.rows[0].pet_id}` });
  } catch (err){
    console.log(err);
    next(err);
  }
}) 

// DELETE a symptom type by a specific pet (soft delete)
// -- /pets/:petId/symptoms/types/:id
router.delete("/types/:id", async (req, res, next) => {
  try{
    const { petId, id } = req.params;
    const result = await pool.query("UPDATE symptom_type SET date_archived = NOW() WHERE id = $1 AND pet_id = $2 RETURNING id, pet_id", [id, petId]);
    if(result.rows.length === 0) throw Object.assign(new Error("log not found"), { status: 404 });
    res.json({ message: `id: ${id}, Symptom type soft deleted for petId: ${result.rows[0].pet_id}` });
  } catch (err){
    console.log(err);
    next(err);
  }
})

// DELETE symptom data log by id, either a soft or hard delete
// -- /symptoms/:id/:deleteType(soft|hard)
globalRouter.delete("/:id/:deleteType(soft|hard)", async (req, res, next) => {
  try{
    const { id, deleteType } = req.params;
    let result;
    if(deleteType === "soft") result = await pool.query("UPDATE symptom SET date_archived = NOW(), date_updated = NOW() WHERE id = $1 AND date_archived IS NULL RETURNING id, pet_id", [id]);
    else if (deleteType === "hard") result = await pool.query("DELETE FROM symptom WHERE id = $1 AND date_archived IS NOT NULL RETURNING id, pet_id", [id]);
    if(result.rows.length === 0) throw Object.assign(new Error("log not found"), { status: 404 });
    res.json({ message: `id: ${id}, Symptom log ${deleteType === "soft" ? "soft" : "hard"} deleted for petId: ${result.rows[0].pet_id}` });
  } catch (err){
    console.log(err);
    next(err);
  }
})

export { router, globalRouter };
