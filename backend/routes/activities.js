import express from "express";
import pool from "../config/database.js";
const router = express.Router({ mergeParams: true });

// router: /pets/:petId/activities 

// GET all activity data logs for a specific pet 
// -- /pets/:petId/activities/all
router.get("/all", async (req, res, next) => {
	try {
    const { petId } = req.params;
		const result = await pool.query(
			`SELECT activity.id, name, note, duration_in_hours, activity_date, date_created, date_updated 
      FROM activity 
      JOIN activity_type ON activity.activity_type_id = activity_type.id 
      WHERE pet_id = $1 AND date_archived IS NULL`,
      [petId]
		);
    if(result.rows.length === 0) return res.json({ message: "No logs found" });
		res.json(result.rows);
	} catch (err) {
		console.error(err);
		next(err);
	}
});

// GET all activity data logs for a specific pet (when no query parameters are given)
// -- /pets/:petId/activities/

// GET all activity data logs by activity type or activity type id for a specific pet 
// -- /pets/:petId/activities/?type={activityTypeOrId}

// GET duration_in_hours vs activity_date by activity type for graphing x and y units for a specific pet
// -- /pets/:petId/activities/?graph={boolean} ; default is false

// GET all activity data logs and whether to include archived logs for a specific pet
// -- /pets/:petId/activities/?archived={boolean} ; default is false

// GET activity data logs sorted by column and direction for a specific pet
// -- /pets/:petId/activities/?sort={column}&direction={asc|desc}
router.get("/", async (req, res, next) => {
  try{
    const {petId} = req.params;
    const {type, graph, archived, sort, direction} = req.query;

    // Return mock data for graph view
    if (graph?.toLowerCase() === "true") {
      // Generate last 7 days of mock activity data
      const mockData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        mockData.push({
          duration_in_hours: Math.random() * 2 + 0.5, // Random duration between 0.5 and 2.5 hours
          activity_date: date.toISOString().split('T')[0],
          timestamp: date.toISOString(), // Add timestamp for frontend processing
          value: Math.random() * 2 + 0.5 // Add value field for frontend processing
        });
      }
      return res.json(mockData);
    }

    /* -------------------- REGULAR DATA RETRIEVAL ------------------- */
    const columns = graph?.toLowerCase() == "true" 
    ? "duration_in_hours, activity_date"
    : "activity.id, name, note, duration_in_hours, activity_date, date_created, date_updated";

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
      if(!rows[0]) throw Object.assign(new Error("type not found"), { status: 404 });
      
      
      baseQuery += ` AND ${col} = $${values.length + 1}`;
      values.push(val);
    }


    /* ------------------ IF ARCHIVED IS PROVIDED AND TRUE ------------------ */
    baseQuery += archived?.toLowerCase() == "true" ? "" : " AND date_archived IS NULL";

    /* ----------------- IF SORT AND DIRECTION ARE PROVIDED ----------------- */
    
    if((sort && !direction) || (!sort && direction)) throw Object.assign(new Error("Both 'sort' and 'direction' query parameters must be provided together."), { status: 400 });
    if (sort && direction) {
      const dir = direction?.toLowerCase();
      if (!["asc", "desc"].includes(dir)) throw Object.assign(new Error("Invalid direction. Use 'asc' or 'desc'."), { status: 400 });
      if (!columns.includes(sort)) throw Object.assign(new Error(`Cannot sort by '${sort}'. It is not a valid column.`), { status: 400 });
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

// DELETE activity data log by id; since data logs is a soft delete then a hard delete after a certain time (30 days), we will follow through with a delete route and it makes the most sense with the user action. 
// -- /pets/:petId/activities/:id

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query("UPDATE activity SET date_archived = NOW(), date_updated = NOW() WHERE id = $1 AND date_archived IS NULL RETURNING id, pet_id", [id]);
    if(result.rows.length === 0) throw Object.assign(new Error("log not found"), { status: 404 });
    res.json({ message: `id: ${id}, Activity log deleted for petId: ${result.rows[0].pet_id}` });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// GET all deleted activity data logs for a specific pet
// -- /pets/:petId/activities/deleted
router.get("/deleted", async (req, res, next) => {
  try {
    const { petId } = req.params;
    const result = await pool.query("SELECT activity.id, activity_type_id, name, duration_in_hours, note, activity_date, date_archived FROM activity JOIN activity_type ON activity.activity_type_id = activity_type.id WHERE date_archived IS NOT NULL AND pet_id = $1", [petId]);
    if(result.rows.length === 0) return res.json({ message: "No logs found" });
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// POST a new activity data entry for a specific pet 
// -- /pets/:petId/activities/
router.post("/", async (req, res, next) => {
  try {
    const { petId } = req.params;
    const { activity_type_id, duration_in_hours, note, activity_date} = req.body;
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

// PATCH a activity data entry for a specific pet and id
// -- /pets/:petId/activities/:id
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
      UPDATE activity
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