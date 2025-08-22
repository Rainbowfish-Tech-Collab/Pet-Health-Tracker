import express from 'express';
import pool from '../config/database.js';
import passport from '../config/passport.js';
import bcrypt from 'bcrypt';

//Global - mounted at /users
const router = express.Router();

// PATCH a user by id 
// -- /users/:id
router.patch('/:id', passport.authenticate('session'), async (req, res, next) => {
  try{
    const { id } = req.params;

    if (req.body.length === 0) throw Object.assign(new Error("No fields to update"), { status: 400 });

    const immutables = ["id", "date_created", "date_updated", "date_archived"];

    let immutableErrors = "the following fields are immutable: ";
    let immutableFields = [];
    for (const key of Object.keys(req.body)) {
      if (immutables.includes(key)) {
        immutableFields.push(key);
        delete req.body[key];
      }
      if(key === "password"){
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
        req.body.password_hashed = hashedPassword;
        delete req.body.password;
      }
    }

    if (immutableFields.length > 0) throw Object.assign(new Error(immutableErrors + immutableFields.join(", ")), { status: 400 });

    const fields = Object.keys(req.body);
    const values = Object.values(req.body);

    const result = await pool.query(
      `UPDATE "user"
      SET ${fields
        .map((field, index) => `${field} = $${index + 1}`)
        .join(", ")}, date_updated = NOW()
      WHERE id = $${fields.length + 1} 
      AND date_archived IS NULL 
      RETURNING *`,
      [...values, id]
    );

    if(result.rows.length === 0) throw Object.assign(new Error("user not found"), { status: 404 });
    res.json({ message: `id: ${id}, User updated` });
  } catch (err){
    console.log(err);
    next(err);
  }
})

// DELETE a user by id (hard delete at the moment)
// -- /users/:id
router.delete('/:id', passport.authenticate('session'), async (req, res, next) => {
  try{
    const { id } = req.params;
    const result = await pool.query(`DELETE FROM "user" WHERE id = $1 AND date_archived IS NULL RETURNING id`, [id]);
    console.log(result.rows);
    if(result.rows.length === 0) throw Object.assign(new Error("user not found"), { status: 404 });
    res.json({ message: `id: ${id}, User deleted` });
  } catch (err){
    console.log(err);
    next(err);
  }
})
export default router;