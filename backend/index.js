import express from 'express';
import 'dotenv/config';
import session from 'express-session';
import passport from './config/passport.js';
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
import authRouter from './routes/auth.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key', // secret key for session, fall back to 'your-secret-key' if not set
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // cookie set to expire in 24 hours ( day * mins in hour * seconds in minute * milliseconds in second )
    },
  })
);

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json()); // for parsing json data
app.use(express.urlencoded({ extended: true })); // for parsing form data

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Routers
app.use('/auth', authRouter);
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

// Serve login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

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
