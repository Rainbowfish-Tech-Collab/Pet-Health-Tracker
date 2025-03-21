import fs from 'fs'
import { faker } from '@faker-js/faker'

const username = faker.person.fullName();

console.log(username);