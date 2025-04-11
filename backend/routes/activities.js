import express from "express";
import pool from "../config/database.js";
const router = express.Router();

// router: /activities

// GET all activity types
router.get(/^\/(types)?$/, async (req, res, next) => {
	try {
		const result = await pool.query("SELECT * FROM activity_type");
		res.json(result.rows.map((row) => row.name));
	} catch (err) {
		console.error(err);
		next(err);
	}
});

// GET all activity data logs
router.get("/all", async (req, res, next) => {
	try {
		const result = await pool.query(
			"SELECT duration_in_hours, note, activity_date, name FROM active_activity JOIN activity_type ON active_activity.activity_type_id = activity_type.id"
		);
		res.json(result.rows);
	} catch (err) {
		console.error(err);
		next(err);
	}
});

// GET all activity data logs by activity type or id
router.get("/all/:activityTypeOrId", async (req, res, next) => {
	try {
    const { activityTypeOrId } = req.params;
    let result; 
    if (!isNaN(activityTypeOrId)) {
      result = await pool.query(
        "SELECT duration_in_hours, note, activity_date, name FROM active_activity JOIN activity_type ON active_activity.activity_type_id = activity_type.id WHERE activity_type_id = $1",
        [activityTypeOrId]
      );

    }
    else{
      const nameResult = await pool.query(
        `SELECT name FROM activity_type WHERE LOWER(name) = LOWER($1)`,
        [activityTypeOrId]
      )
      const properName = nameResult.rows[0].name;
      if(properName !== activityTypeOrId) return res.redirect(`/activities/all/${properName}`); //redirect to the correct case

      result = await pool.query(
        "SELECT duration_in_hours, note, activity_date, name FROM active_activity JOIN activity_type ON active_activity.activity_type_id = activity_type.id WHERE LOWER(name) = LOWER($1)",
        [activityTypeOrId]
      );
    }
		res.json(result.rows);
	} catch (err) {
		console.error(err);
		next(err);
	}
});


// GET grab duration_in_hours vs activity_date by activity type for graphing
router.get("/all/:activityTypeOrId/graph", async (req, res, next) => {
	try {
    const { activityTypeOrId } = req.params;
    let result; 
    if (!isNaN(activityTypeOrId)) {
      result = await pool.query(
        "SELECT duration_in_hours, activity_date FROM active_activity JOIN activity_type ON active_activity.activity_type_id = activity_type.id WHERE activity_type_id = $1",
        [activityTypeOrId]
      );

    }
    else{
      const nameResult = await pool.query(
        `SELECT name FROM activity_type WHERE LOWER(name) = LOWER($1)`,
        [activityTypeOrId]
      )
      const properName = nameResult.rows[0].name;
      if(properName !== activityTypeOrId) return res.redirect(`/activities/all/${properName}`); //redirect to the correct case

      result = await pool.query(
        "SELECT duration_in_hours, activity_date FROM active_activity JOIN activity_type ON active_activity.activity_type_id = activity_type.id WHERE LOWER(name) = LOWER($1)",
        [activityTypeOrId]
      );
    }
		res.json(result.rows);
	} catch (err) {
		console.error(err);
		next(err);
	}
});

// DELETE activity data log by id; since data logs is a soft delete then a hard delete after a certain time, we will follow through with a delete route and it makes the most sense with the user action. 

// we always update the table not the view 

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query("UPDATE activity SET date_archived = NOW() WHERE id = $1", [id]);
    res.json({ message: result + ", Activity log deleted" });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// GET all deleted activity data logs (users who want to recover their data logs)
router.get("/deleted", async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM activity WHERE date_archived IS NOT NULL");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    next(err);
  }
});



export default router;
