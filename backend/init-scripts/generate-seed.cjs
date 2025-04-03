const fs = require('fs');
const path = require('path');
const { faker } = require('@faker-js/faker');

// Generates SQL INSERT statements for the "user" table
const generateUsers = (count) => {
  let sql = 'INSERT INTO "user" (email, username, password_hashed, profile_picture) VALUES\n';
  const values = [];

  for (let i = 0; i < count; i++) {
    const email = faker.internet.email(); // need to make an escapeString function in case faker passes in a value with ' in it (that would break the SQL)
    const username = faker.internet.username();
    const passwordHashed = faker.internet.password();
    const profilePicture = faker.image.url();
  
    values.push(`('${email}', '${username}','${passwordHashed}', '${profilePicture}')`)
  }

  sql+= values.join(',\n') + ';';

  return sql;
};

// Generates SQL INSERT statements for the pet table
const generatePets = (count) => {
  let sql = 'INSERT INTO "pet" (pet_breed_id, sex_id, "name", birthday, "description", profile_picture) VALUES\n';
  const values = [];

  for (let i = 0; i < count; i++) {
    const petBreedId = Math.ceil(Math.random()*130);
    const sexId = Math.ceil(Math.random()*4);
    const name = faker.animal.petName();
    const birthday = '2020-03-24';
    const description = 'This is my pet.';
    const profilePicture = faker.image.url();
  
    values.push(`('${petBreedId}', '${sexId}', '${name}', '${birthday}','${description}', '${profilePicture}')`)
  }

  sql+= values.join(',\n') + ';';

  return sql;
};

// Generates SQL INSERT statements for the symptom table
const generateSymptoms = (count) => {
  let sql = 'INSERT INTO symptom (pet_id, symptom_type_id, symptom_description, symptom_date) VALUES\n';
  const values = [];

  for (let i = 0; i < count; i++) {
    const petId = Math.ceil(Math.random()*6);
    const symptomTypeId = Math.ceil(Math.random()*7);
    const symptomDate = faker.date.between({ from: '2025-04-01', to: '2025-12-31' }).toISOString().slice(0, 19).replace('T', ' ');
    const symptomDescription = "This is the symptom description.";
    values.push(`('${petId}', '${symptomTypeId}', '${symptomDescription}', '${symptomDate}')`)
  }

  sql+= values.join(',\n') + ';';

  return sql;
};

// Generates SQL INSERT statements for the stat table (description should be nullable)
const generateStats = (count) => {
  let sql = 'INSERT INTO stat (pet_id, "description", stat_date) VALUES\n';
  const values = [];

  for (let i = 0; i < count; i++) {
    const petId = Math.ceil(Math.random()*6);
    const description = "This is the stat description";
    const symptomDate = faker.date.between({ from: '2025-04-01', to: '2025-12-31' }).toISOString().slice(0, 19).replace('T', ' ');
  
    values.push(`('${petId}', '${description}', '${symptomDate}')`)
  }

  sql+= values.join(',\n') + ';';

  return sql;
};

// Generates SQL INSERT statements for the weight_stat table
const generateWeightStats = (count) => {
  let sql = 'INSERT INTO weight_stat (stat_id, weight_id, "weight") VALUES\n';
  const values = [];

  for (let i = 0; i < count; i++) {
    const statId = Math.ceil(Math.random()*6);
    const weightId = Math.ceil(Math.random()*5);
    const weight = 30 + Math.ceil(Math.random()*5);

    values.push(`('${statId}', '${weightId}', '${weight}')`)
  }

  sql+= values.join(',\n') + ';';

  return sql;
};

// Generates SQL INSERT statements for the glucose_stat table
const generateGlucoseStats = (count) => {
  let sql = 'INSERT INTO glucose_stat (stat_id, glucose_id, glucose_level) VALUES\n';
  const values = [];

  for (let i = 0; i < count; i++) {
    const statId = Math.ceil(Math.random()*6); // can the stat_id in weight_stat and glucose_stat tables both be equal to 1? 
    const glucoseID = Math.ceil(Math.random()*3);
    const glucoseLevel = 6 + Math.ceil(Math.random()*131);

    values.push(`('${statId}', '${glucoseID}', '${glucoseLevel}')`)
  }

  sql+= values.join(',\n') + ';';

  return sql;
};

// Generates SQL INSERT statements for the heart_rate_stat table
const generateHeartRateStats = (count) => {
  let sql = 'INSERT INTO heart_rate_stat (stat_id, beats_per_minute) VALUES\n';
  const values = [];

  for (let i = 0; i < count; i++) {
    const statId = Math.ceil(Math.random()*6);
    const beatsPerMinute = 40 + Math.ceil(Math.random()*180);

    values.push(`('${statId}', '${beatsPerMinute}')`)
  }

  sql+= values.join(',\n') + ';';

  return sql;
};

// Generates SQL INSERT statements for the respiratory_rate_stat table
const generateRespiratoryRateStats = (count) => {
  let sql = 'INSERT INTO respiratory_rate_stat (stat_id, beats_per_minute) VALUES\n';
  const values = [];

  for (let i = 0; i < count; i++) {
    const statId = Math.ceil(Math.random()*6);
    const breathsPerMinute = 10 + Math.ceil(Math.random()*20);

    values.push(`('${statId}', '${breathsPerMinute}')`)
  }

  sql+= values.join(',\n') + ';';

  return sql;
};

// Generates SQL INSERT statements for the other_stat table
const generateOtherStats = (count) => {
  let sql = 'INSERT INTO other_stat (stat_id, note) VALUES\n';
  const values = [];

  for (let i = 0; i < count; i++) {
    const statId = Math.ceil(Math.random()*6);
    const note = "This is the other symptom description."

    values.push(`('${statId}', '${note}')`)
  }

  sql+= values.join(',\n') + ';';

  return sql;
};

// Generates SQL INSERT statements for the bodily_function table

// Generates SQL INSERT statements for the medication table

// Generates SQL INSERT statements for the activity table

// Define the seed.sql file path inside /backend/init-scripts/
const seedFilePath = path.join(__dirname, 'seed.sql');

// Write the seed data to seed.sql
fs.writeFileSync(
  seedFilePath,
  [
    generateUsers(6), 
    generatePets(6), 
    generateSymptoms(6), 
    generateStats(6), 
    generateWeightStats(6), 
    generateGlucoseStats(6), 
    generateHeartRateStats(6),
    generateRespiratoryRateStats(6),
    generateOtherStats(6)
  ].join('\n'),
  'utf8'
);

console.log(`seed.sql generated successfully at ${seedFilePath}`);