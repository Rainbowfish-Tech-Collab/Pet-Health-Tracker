import express from 'express';
import 'dotenv/config';
import morgan from 'morgan';
import usersRouter from './routes/users.js';
import petsRouter from './routes/pets.js';
import symptomsRouter from './routes/symptoms.js';
import statsRouter from './routes/stats.js';
import petSexRouter from './routes/petSex.js';
import petSpeciesRouter from './routes/petSpecies.js';
import petBreedsRouter from './routes/petBreeds.js';
import glucoseRouter from './routes/glucose.js';
import weightsRouter from './routes/weights.js';
import functionsRouter from './routes/functions.js';
import dosagesRouter from './routes/dosages.js';
import activitiesRouter from './routes/activities.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(morgan('dev')); // for logging requests to the console
app.use(express.json()); // for parsing json data
app.use(express.urlencoded({ extended: true })); // for parsing form data

// Routers
app.use('/users', usersRouter);
app.use('/pets', petsRouter);
app.use('/petSex', petSexRouter);
app.use('/petSpecies', petSpeciesRouter);
app.use('/petBreeds', petBreedsRouter);

app.use('/activities', activitiesRouter);

app.use('/symptoms', symptomsRouter);
app.use('/stats', statsRouter);
app.use('/glucose', glucoseRouter);
app.use('/weights', weightsRouter);
app.use('/functions', functionsRouter);
app.use('/dosages', dosagesRouter);


app.get("/", (req, res) => {
  res.send("Welcome to the database")
});

//404 error handler
app.use((req, res) => {
  res.status(404).json({ error: "Resource Not found" });
});

//default error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({ error: err.message });
})

app.listen(PORT, () => {
	console.log(`Server is running on port: http://localhost:${PORT}.`);
});