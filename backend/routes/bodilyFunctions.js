import express from "express";
import pool from "../config/database.js";
const router = express.Router({ mergeParams: true });

// router: /bodilyFunctions

// GET all bodily function data logs for a specific pet
// -- /pets/:petId/bodilyFunctions/all
router.get("/all", async (req, res, next) => {
	try {
		const { petId } = req.params;
		const result = await pool.query(
			`
      SELECT bodily_function.id, function.name, note, bodily_function_date, date_created, date_updated 
      FROM bodily_function 
      JOIN function ON bodily_function.function_id = function.id 
      WHERE pet_id = $1 AND date_archived IS NULL
      `,
			[petId]
		);
    if(result.rows.length === 0) return res.json({ message: "No logs found" });
		res.json(result.rows);
	} catch (err) {
		console.error(err);
		next(err);
	}
});

// GET all bodily function data logs for a specific pet (when no query parameters are given)
// -- /pets/:petId/bodilyFunctions/

// GET all bodily function data logs by bodily function name or bodily function id for a specific pet
// -- /pets/:petId/bodilyFunctions/?type={bodilyFunctionTypeOrId}

// GET bodily_function_date by frequency of bodily function type for graphing x and y units for a specific pet
// -- /pets/:petId/bodilyFunctions/?graph={boolean} ; default is false

// GET all bodily function data logs and whether to include archived logs for a specific pet
// -- /pets/:petId/bodilyFunctions/?archived={boolean} ; default is false

// GET bodily function data logs sorted by column and direction for a specific pet 
// -- /pets/:petId/bodilyFunctions/?sort={column}&direction={asc|desc}

router.get("/", async (req, res, next) => {
	try {
		const { petId } = req.params;
    const {type, graph, archived, sort, direction} = req.query;

    /* -------------------- IF GRAPH IS PROVIDED AND TRUE ------------------- */
    const columns = graph?.toLowerCase() == "true" 
    ? "function.name, date_updated, bodily_function_date "
    : "bodily_function.id, function.name, note, bodily_function_date, date_created, date_updated";

    let baseQuery = 
    `
    SELECT ${columns} FROM bodily_function 
    JOIN function ON bodily_function.function_id = function.id 
    WHERE pet_id = $1
    `;

    const values = [petId];

    /* ------------------------ IF A TYPE IS PROVIDED ----------------------- */
    if(type){ 
      const isId = !isNaN(type);
      const col = isId ? "function_id" : "LOWER(name)";
      const val = isId ? type : type.toLowerCase();

      const {rows} = await pool.query(`SELECT name FROM function JOIN bodily_function ON function.id = bodily_function.function_id WHERE ${col} = $1`, [val]);
      if(!rows[0]) throw Object.assign(new Error("type not found"), { status: 404 });
      
      
      baseQuery += ` AND ${col} = $${values.length + 1}`;
      values.push(val);
    }

    /* --------------------- IF ARCHIVED IS PROVIDED ------------------------ */
    baseQuery += archived?.toLowerCase() == "true" ? "" : " AND date_archived IS NULL";

    /* --------------------- IF SORT AND DIRECTION ARE PROVIDED ------------ */
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


// DELETE bodily function log by id;
// -- /pets/:petId/bodilyFunctions/:id
router.delete("/:id", async (req, res, next) => {
	try {
		const { id } = req.params;
		const result = await pool.query(
			"UPDATE bodily_function SET date_archived = NOW(), date_updated = NOW() WHERE id = $1 AND date_archived IS NULL RETURNING id, pet_id",
			[id]
		);
    if(result.rows.length === 0) throw Object.assign(new Error("log not found"), { status: 404 });
		res.json({ message: `id: ${id}, Bodily Function log deleted for petId: ${result.rows[0].pet_id}` });
	} catch (err) {
		console.error(err);
		next(err);
	}
});

// GET all soft deleted bodily function data logs for a specific pet
// -- /pets/:petId/bodilyFunctions/deleted
router.get("/deleted", async (req, res, next) => {
	try {
		const { petId } = req.params;
		const result = await pool.query(
			`
      SELECT bodily_function.id, function_id,function.name, note, bodily_function_date, date_archived 
      FROM bodily_function 
      JOIN function ON bodily_function.function_id = function.id 
      WHERE date_archived IS NOT NULL AND pet_id = $1
      `,
			[petId]
		);
    if(result.rows.length === 0) return res.json({ message: "No logs found" });
		res.json(result.rows);
	} catch (err) {
		console.error(err);
		next(err);
	}
});

// POST a new bodily function data entry for a specific pet
// -- /pets/:petId/bodilyFunctions
router.post("/", async (req, res, next) => {
	try {
		const { petId } = req.params;
		const { function_id, note, bodily_function_date } = req.body;
		const result = await pool.query(
			"INSERT INTO bodily_function (pet_id, function_id, note, bodily_function_date) VALUES ($1, $2, $3, $4) RETURNING id",
			[petId, function_id, note, bodily_function_date]
		);
    //error will be thrown by not null constraints
		res.json({
			message: `id: ${result.rows[0].id}, Bodily Function log created`,
		});
	} catch (err) {
		console.error(err);
		next(err);
	}
});

// PATCH a bodily function data entry for a specific pet and id
// -- /pets/:petId/bodilyFunctions/:id
router.patch("/:id", async (req, res, next) => {
	try {
		const { petId, id } = req.params;
		const immutables = ["id", "pet_id","date_created", "date_updated", "date_archived"];
		let immutableErrors = "the following fields are immutable: ";
		let immutableFields = [];
		for (const key of Object.keys(req.body)) {
			if (immutables.includes(key)) {
				immutableFields.push(key);
				delete req.body[key];
			}
		}
		const fields = Object.keys(req.body);
		const values = Object.values(req.body);

		if (fields.length === 0) throw Object.assign(new Error("No fields to update"), { status: 400 });
		
		const result = await pool.query(
			`
      UPDATE bodily_function 
      SET ${fields
				.map((field, index) => `${field} = $${index + 1}`)
				.join(", ")}, date_updated = NOW()
      WHERE pet_id = $${fields.length + 1} AND id = $${
				fields.length + 2
			} AND date_archived IS NULL 
      RETURNING * 
      `,
			[...values, petId, id]
		);
    
    if(result.rows.length === 0) throw Object.assign(new Error("log not found"), { status: 404 });

		res.json(
			immutableFields.length
				? {
						immutableErrors: immutableErrors + immutableFields.join(", "),
						result: result.rows[0],
				  }
				: result.rows[0]
		);
	} catch (err) {
		console.error(err);
		next(err);
	}
});

export default router;
