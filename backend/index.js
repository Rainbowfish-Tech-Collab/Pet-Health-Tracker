import express from 'express';
import 'dotenv/config';
import morgan from 'morgan';
import session from 'express-session';
import passport from './config/passport.js';
import cors from 'cors';
import usersRouter from './routes/users.js';
import petsRouter, { checkPetExists } from './routes/pets.js';

import { router as symptomsRouter, globalRouter as symptomsGlobalRouter} from './routes/symptoms.js';
import { router as bodilyFunctionsRouter, globalRouter as bodilyFunctionsGlobalRouter} from './routes/bodilyFunctions.js';
import { router as medicationsRouter, globalRouter as medicationsGlobalRouter} from './routes/medications.js';
import { router as activitiesRouter, globalRouter as activitiesGlobalRouter} from './routes/activities.js';

import { router as statsRouter, globalRouter as statsGlobalRouter} from './routes/stats.js';
import { router as weightsRouter, globalRouter as weightsGlobalRouter} from './routes/weights.js';
import { router as glucoseRouter, globalRouter as glucoseGlobalRouter} from './routes/glucose.js';
import { router as heartRatesRouter, globalRouter as heartRatesGlobalRouter} from './routes/heartRates.js';
import { router as respiratoryRatesRouter, globalRouter as respiratoryRatesGlobalRouter} from './routes/respiratoryRates.js';
import { router as otherRouter, globalRouter as otherGlobalRouter} from './routes/other.js';

import dbRouter from './routes/db.js';
import authRouter from './routes/auth.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

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

app.use(morgan('dev')); // for logging requests to the console
app.use(express.json()); // for parsing json data
app.use(express.urlencoded({ extended: true })); // for parsing form data

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Routers
app.use('/auth', authRouter);
app.use('/users', usersRouter);

//enum tables & database routes
app.use('/db', dbRouter);

// Top Level Mount Path for pets
app.use('/pets', petsRouter);
// Middleware to check if pet exists
app.use('/pets/:petId', checkPetExists);
// Mount sub-routers; petId params will be passed

app.use('/pets/:petId/symptoms', symptomsRouter);
app.use('/symptoms', symptomsGlobalRouter);

app.use('/pets/:petId/bodilyFunctions', bodilyFunctionsRouter);
app.use('/bodilyFunctions', bodilyFunctionsGlobalRouter);

app.use('/pets/:petId/medications', medicationsRouter);
app.use('/medications', medicationsGlobalRouter);

app.use('/pets/:petId/activities', activitiesRouter);
app.use('/activities', activitiesGlobalRouter);


app.use('/pets/:petId/stats', statsRouter);
app.use('/stats', statsGlobalRouter);

app.use('/pets/:petId/weights', weightsRouter);
app.use('/weights', weightsGlobalRouter);

app.use('/pets/:petId/glucose', glucoseRouter);
app.use('/glucose', glucoseGlobalRouter);

app.use('/pets/:petId/heartRates', heartRatesRouter);
app.use('/heartRates', heartRatesGlobalRouter);

app.use('/pets/:petId/respiratoryRates', respiratoryRatesRouter);
app.use('/respiratoryRates', respiratoryRatesGlobalRouter);

app.use('/pets/:petId/other', otherRouter);
app.use('/other', otherGlobalRouter);

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
