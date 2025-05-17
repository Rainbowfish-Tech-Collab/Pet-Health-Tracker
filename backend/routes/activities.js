import express from "express";
import pool from "../config/database.js";
import { checkPetExists } from "./pets.js";
const router = express.Router();

// router: /activities 

// be aware only this route is using a pg view: `active_activity` (keeping it for possible optimization purposes in the future)

// GET all activity types at / or /types
router.get(/^\/(types)?$/, async (req, res, next) => {
	try {
		const result = await pool.query("SELECT id, name FROM activity_type");
		res.json(result.rows);
	} catch (err) {
		console.error(err);
		next(err);
	}
});

// GET all activity data logs for a specific pet
router.get("/:petId/all", checkPetExists, async (req, res, next) => {
	try {
    const { petId } = req.params;
		const result = await pool.query(
			"SELECT active_activity.id, name, note, duration_in_hours, activity_date, date_updated FROM active_activity JOIN activity_type ON active_activity.activity_type_id = activity_type.id WHERE pet_id = $1",
      [petId]
		);
    if(result.rows.length === 0) return res.json({ message: "No logs found" });
		res.json(result.rows);
	} catch (err) {
		console.error(err);
		next(err);
	}
});

// GET all activity data logs by activity type or activity type id for a specific pet
router.get("/:petId/all/:activityTypeOrId", checkPetExists, async (req, res, next) => {
	try {
    const { activityTypeOrId, petId } = req.params;
    const isId = !isNaN(activityTypeOrId);
    const filterColumn = isId ? "activity_type_id" : "LOWER(name)";
    const filterValue = isId ? activityTypeOrId : activityTypeOrId.toLowerCase();
    const result = await pool.query(
      `
      SELECT active_activity.id, name, note, duration_in_hours, activity_date, date_updated FROM active_activity 
      JOIN activity_type ON active_activity.activity_type_id = activity_type.id 
      WHERE ${filterColumn} = $1 AND pet_id = $2 AND date_archived IS NULL
      `,
      [filterValue, petId]
    );
    if(result.rows.length === 0) return res.json({ message: "No logs found" });
		res.json(result.rows);
	} catch (err) {
		console.error(err);
		next(err);
	}
});


// GET duration_in_hours vs activity_date by activity type for graphing x and y units for a specific pet
router.get("/:petId/all/:activityTypeOrId/graph", checkPetExists, async (req, res, next) => {
	try {
    const { activityTypeOrId, petId } = req.params;
    const isId = !isNaN(activityTypeOrId);
    const filterColumn = isId ? "activity_type_id" : "LOWER(name)";
    const filterValue = isId ? activityTypeOrId : activityTypeOrId.toLowerCase();
    const result = await pool.query(
      `
      SELECT duration_in_hours, activity_date FROM active_activity 
      JOIN activity_type ON active_activity.activity_type_id = activity_type.id 
      WHERE ${filterColumn} = $1 AND pet_id = $2 AND date_archived IS NULL
      `,
      [filterValue, petId]
    );
    if(result.rows.length === 0) return res.json({ error: "No logs found" });
		res.json(result.rows);
	} catch (err) {
		console.error(err);
		next(err);
	}
});

// DELETE activity data log by id; since data logs is a soft delete then a hard delete after a certain time (30 days), we will follow through with a delete route and it makes the most sense with the user action. 

// we always update the table not the view 

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

// GET all deleted activity data logs (users who want to recover their data logs)
// Only date_created, pet_id, date_updated and activity_type_id seems useless to show to the user and frontend
router.get("/:petId/deleted", checkPetExists, async (req, res, next) => {
  try {
    const { petId } = req.params;
    const result = await pool.query("SELECT activity.id, duration_in_hours, note, date_archived, activity_date, name FROM activity JOIN activity_type ON activity.activity_type_id = activity_type.id WHERE date_archived IS NOT NULL AND pet_id = $1", [petId]);
    if(result.rows.length === 0) return res.json({ message: "No logs found" });
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// POST a new activity data entry for a specific pet at /:petId
router.post("/:petId", checkPetExists, async (req, res, next) => {
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
export default router;

// PATCH a activity data entry for a specific pet and id at /:petId/:id

router.patch("/:petId/:id", checkPetExists, async (req, res, next) => {
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