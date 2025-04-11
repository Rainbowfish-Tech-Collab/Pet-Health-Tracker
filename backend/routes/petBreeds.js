import express from 'express';
import pool from '../config/database.js';
const router = express.Router();

// GET all pet breeds
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM pet_breed");
    res.json(result.rows.map((row) => row.pet_breed));
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// GET pet breeds by species name or ID
router.get('/:speciesOrId', async (req, res, next) => {
  try {
    const { speciesOrId } = req.params;
    let speciesId;
    if (!isNaN(speciesOrId)) speciesId = Number(speciesOrId);
    else {
      const speciesQuery = await pool.query(
        'SELECT * FROM pet_species WHERE LOWER(species) = LOWER($1)',
        [speciesOrId]
      );
      if (speciesQuery.rows.length === 0) return res.status(404).json({ error: 'Species not found' });
      speciesId = speciesQuery.rows[0].id;
      const speciesName = speciesQuery.rows[0].species;

      if(speciesName !== speciesOrId) return res.redirect(`/petBreeds/${speciesName}`); //redirect to the correct case
    }
    const result = await pool.query("SELECT * FROM pet_breed WHERE pet_species_id = $1", [speciesId]);
    res.json(result.rows.map((row) => row.pet_breed));
  } catch (err) {
    console.error(err);
    next(err);
  }
});

export default router;