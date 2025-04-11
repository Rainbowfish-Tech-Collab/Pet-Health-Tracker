import express from "express";
import pool from "../config/database.js";
const router = express.Router();

// router: /activities

// GET all activity types at / or /types
router.get(/^\/(types)?$/, async (req, res, next) => {
	try {
		const result = await pool.query("SELECT * FROM activity_type");
		res.json(result.rows.map((row) => row.name));
	} catch (err) {
		console.error(err);
		next(err);
	}
});

// GET all activity data logs for a specific pet
router.get("/:petId/all", async (req, res, next) => {
	try {
    const { petId } = req.params;
		const result = await pool.query(
			"SELECT duration_in_hours, note, activity_date, name FROM active_activity JOIN activity_type ON active_activity.activity_type_id = activity_type.id WHERE pet_id = $1",
      [petId]
		);
		res.json(result.rows);
	} catch (err) {
		console.error(err);
		next(err);
	}
});

// GET all activity data logs by activity type or activity type id for a specific pet
router.get("/:petId/all/:activityTypeOrId", async (req, res, next) => {
	try {
    const { activityTypeOrId, petId } = req.params;
    let result; 
    if (!isNaN(activityTypeOrId)) {
      result = await pool.query(
        "SELECT duration_in_hours, note, activity_date, name FROM active_activity JOIN activity_type ON active_activity.activity_type_id = activity_type.id WHERE activity_type_id = $1 AND pet_id = $2",
        [activityTypeOrId, petId]
      );

    }
    else{
      const nameResult = await pool.query(
        `SELECT name FROM activity_type WHERE LOWER(name) = LOWER($1)`,
        [activityTypeOrId]
      )
      const properName = nameResult.rows[0].name;
      if(properName !== activityTypeOrId) return res.redirect(`/activities/${petId}/all/${properName}`); //redirect to the correct case

      result = await pool.query(
        "SELECT duration_in_hours, note, activity_date, name FROM active_activity JOIN activity_type ON active_activity.activity_type_id = activity_type.id WHERE LOWER(name) = LOWER($1) AND pet_id = $2",
        [activityTypeOrId, petId]
      );
    }
		res.json(result.rows);
	} catch (err) {
		console.error(err);
		next(err);
	}
});


// GET duration_in_hours vs activity_date by activity type for graphing x and y units for a specific pet
router.get("/:petId/all/:activityTypeOrId/graph", async (req, res, next) => {
	try {
    const { activityTypeOrId, petId } = req.params;
    let result; 
    if (!isNaN(activityTypeOrId)) {
      result = await pool.query(
        "SELECT duration_in_hours, activity_date FROM active_activity JOIN activity_type ON active_activity.activity_type_id = activity_type.id WHERE activity_type_id = $1 AND pet_id = $2",
        [activityTypeOrId, petId]
      );

    }
    else{
      const nameResult = await pool.query(
        `SELECT name FROM activity_type WHERE LOWER(name) = LOWER($1)`,
        [activityTypeOrId]
      )
      const properName = nameResult.rows[0].name;
      if(properName !== activityTypeOrId) return res.redirect(`/activities/${petId}/all/${properName}`); //redirect to the correct case

      result = await pool.query(
        "SELECT duration_in_hours, activity_date FROM active_activity JOIN activity_type ON active_activity.activity_type_id = activity_type.id WHERE LOWER(name) = LOWER($1) AND pet_id = $2",
        [activityTypeOrId, petId]
      );
    }
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
    const result = await pool.query("UPDATE activity SET date_archived = NOW() AND date_updated = NOW() WHERE id = $1", [id]);
    res.json({ message: `id ${id}, Activity log deleted` });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// GET all deleted activity data logs (users who want to recover their data logs)
// Only date_created, pet_id, date_updated and activity_type_id seems useless to show to the user and frontend
router.get("/:petId/deleted", async (req, res, next) => {
  try {
    const { petId } = req.params;
    const result = await pool.query("SELECT activity.id, duration_in_hours, note, date_archived, activity_date, name FROM activity JOIN activity_type ON activity.activity_type_id = activity_type.id WHERE date_archived IS NOT NULL AND pet_id = $1", [petId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    next(err);
  }
});



export default router;
