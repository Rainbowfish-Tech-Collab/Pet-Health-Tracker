const fs = require('fs');
const path = require('path');
const { faker } = require('@faker-js/faker');

// Generates SQL INSERT statements for the "user" table
const generateUsers = (count) => {
  let sql = 'INSERT INTO "user" (email, username, password_hashed, date_created, date_updated, profile_picture) VALUES\n';
  const values = [];

  for (let i = 0; i < count; i++) {
    const email = faker.internet.email();
    const username = faker.internet.username();
    const passwordHashed = faker.internet.password();
    const dateCreated = '2025-03-24 14:30:00'; 
    const dateUpdated = '2025-03-24 14:30:00';
    const profilePicture = faker.image.url();
  
    values.push(`('${email}', '${username}','${passwordHashed}', '${dateCreated}', '${dateUpdated}', '${profilePicture}')`)
  }

  sql+= values.join(',\n') + ';';

  return sql;
};

// Generates SQL INSERT statements for the pet table
const generatePets = (count) => {
  let sql = 'INSERT INTO "pet" (pet_breed_id, sex_id, "name", birthday, "description", date_created, date_updated, profile_picture) VALUES\n';
  const values = [];

  for (let i = 0; i < count; i++) {
    const petBreedId = Math.ceil(Math.random()*130);
    const sexId = Math.ceil(Math.random()*4);
    const name = faker.animal.petName();
    const birthday = '2020-03-24';
    const description = 'This is my pet.';
    const dateCreated = '2025-03-24 14:30:00';
    const dateUpdated = '2025-03-24 14:30:00';
    const profilePicture = faker.image.url();
  
    values.push(`('${petBreedId}', '${sexId}', '${name}', '${birthday}','${description}', '${dateCreated}', '${dateUpdated}', '${profilePicture}')`)
  }

  sql+= values.join(',\n') + ';';

  return sql;
};

// Define the seed.sql file path inside /backend/init-scripts/
const seedFilePath = path.join(__dirname, 'seed.sql');

// Write the seed data to seed.sql
fs.writeFileSync(
  seedFilePath,
  [generateUsers(6), generatePets(6)].join('\n'),
  'utf8'
);

console.log(`seed.sql generated successfully at ${seedFilePath}`);