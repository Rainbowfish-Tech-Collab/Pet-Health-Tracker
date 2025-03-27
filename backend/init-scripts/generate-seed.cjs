const fs = require('fs');
const path = require('path');
const { faker } = require('@faker-js/faker');

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

// Define the seed.sql file path inside /backend/init-scripts/
const seedFilePath = path.join(__dirname, 'seed.sql');

// Write the seed data to seed.sql
fs.writeFileSync(seedFilePath, generateUsers(6), 'utf8');

console.log(`seed.sql generated successfully at ${seedFilePath}`);