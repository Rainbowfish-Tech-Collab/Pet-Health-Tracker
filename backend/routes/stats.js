import express from 'express';
import pool from '../config/database.js';
const router = express.Router();

// GET all stat data entries for a specific pet at /:petId/all
router.get('/:petId/all', async(req, res, next) => {
  try{
    const {petId} = req.params;  
    const result = await pool.query('SELECT pet_id, description, date_updated,stat_date FROM stat WHERE pet_id = ($1)', [petId]);
    if(!result) return res.status(404).json({error: 'Pet not found'});
    res.json(result.rows);
  }
  catch(err){
    console.error(err);
    next(err);
  }
})


export default router;