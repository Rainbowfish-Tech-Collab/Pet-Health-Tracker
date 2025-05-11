import express from "express";
import pool from "../config/database.js";
const router = express.Router();

// router: /bodilyFunctions

// GET all bodily function types
router.get("/", async (req, res, next) => {
	try {
		const result = await pool.query("SELECT * FROM function");
		res.json(result.rows.map((row) => row.name));
	} catch (err) {
		console.error(err);
		next(err);
	}
});

// GET all bodily function data entries for a specific pet
router.get("/:petId/all", async (req, res, next) => {
	try {
		const { petId } = req.params;
		const result = await pool.query(
			`
      SELECT bodily_function.id, function.name, date_updated, note, bodily_function_date 
      FROM bodily_function 
      JOIN function ON bodily_function.function_id = function.id 
      WHERE pet_id = $1 AND date_archived IS NULL
      `,
			[petId]
		);
		res.json(result.rows);
	} catch (err) {
		console.error(err);
		next(err);
	}
});

// GET all bodily function data entries by bodily function name or bodily function id for a specific pet

router.get("/:petId/all/:bodilyFunctionTypeOrId", async (req, res, next) => {
	try {
		const { petId, bodilyFunctionTypeOrId } = req.params;

		const isId = !isNaN(bodilyFunctionTypeOrId);
		const filterColumn = isId ? "function_id" : "LOWER(name)";
		const filterValue = isId
			? bodilyFunctionTypeOrId
			: bodilyFunctionTypeOrId.toLowerCase();

		const result = await pool.query(
			`
      SELECT function.name, date_updated, note, bodily_function_date 
      FROM bodily_function
      JOIN function ON bodily_function.function_id = function.id
      WHERE ${filterColumn} = $1 AND pet_id = $2 AND date_archived IS NULL
    `,
			[filterValue, petId]
		);

		res.json(result.rows);
	} catch (err) {
		console.error(err);
		next(err);
	}
});

// GET bodily_function_date by frequency of bodily function type for graphing x and y units for a specific pet at /:petId/all/:bodilyFunctionTypeOrId/graph

router.get(
	"/:petId/all/:bodilyFunctionTypeOrId/graph",
	async (req, res, next) => {
		try {
			const { petId, bodilyFunctionTypeOrId } = req.params;

			const isId = !isNaN(bodilyFunctionTypeOrId);
			const filterColumn = isId ? "function_id" : "LOWER(name)";
			const filterValue = isId
				? bodilyFunctionTypeOrId
				: bodilyFunctionTypeOrId.toLowerCase();

			const result = await pool.query(
				`
      SELECT function.name, date_updated, bodily_function_date 
      FROM bodily_function
      JOIN function ON bodily_function.function_id = function.id
      WHERE ${filterColumn} = $1 AND pet_id = $2 AND date_archived IS NULL
      GROUP BY date_updated
    `,
				[filterValue, petId]
			);

			res.json(result.rows);
		} catch (err) {
			console.error(err);
			next(err);
		}
	}
);

// DELETE bodily function log by id;
router.delete("/:id", async (req, res, next) => {
	try {
		const { id } = req.params;
		await pool.query(
			"UPDATE bodily_function SET date_archived = NOW(), date_updated = NOW() WHERE id = $1 RETURNING id",
			[id]
		);
		res.json({ message: `id: ${id}, Bodily Function log deleted` });
	} catch (err) {
		console.error(err);
		next(err);
	}
});

// GET all soft deleted bodily function data entries by pet id at /:petId/deleted
router.get("/:petId/deleted", async (req, res, next) => {
	try {
		const { petId } = req.params;
		const result = await pool.query(
			`
      SELECT function.name, date_updated, note, bodily_function_date 
      FROM bodily_function 
      JOIN function ON bodily_function.function_id = function.id 
      WHERE date_archived IS NOT NULL AND pet_id = $1
      `,
			[petId]
		);
		res.json(result.rows);
	} catch (err) {
		console.error(err);
		next(err);
	}
});

// POST a new bodily function data entry for a specific pet at /:petId
router.post("/:petId", async (req, res, next) => {
	try {
		const { petId } = req.params;
		const { function_id, note, bodily_function_date } = req.body;
		const result = await pool.query(
			"INSERT INTO bodily_function (pet_id, function_id, note, bodily_function_date) VALUES ($1, $2, $3, $4) RETURNING id",
			[petId, function_id, note, bodily_function_date]
		);
		res.json({
			message: `id: ${result.rows[0].id}, Bodily Function log created`,
		});
	} catch (err) {
		console.error(err);
		next(err);
	}
});

// PATCH a bodily function data entry for a specific pet and id at /:petId/:id
router.patch("/:petId/:id", async (req, res, next) => {
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
		console.log(req.body);
		const fields = Object.keys(req.body);
		const values = Object.values(req.body);

		if (fields.length === 0) {
			return res.status(400).json({ error: "No fields to update" });
		}
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
