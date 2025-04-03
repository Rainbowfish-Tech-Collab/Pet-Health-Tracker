# Table of Contents

- [Table of Contents](#table-of-contents)
- [Overview 🐟](#overview-)
	- [Project Description](#project-description)
	- [About Us](#about-us)
		- [Why is it called "Rainbowfish"?](#why-is-it-called-rainbowfish)
		- [Our Contributers](#our-contributers)
- [Tech Stack 💻](#tech-stack-)
- [Getting Started 🚀](#getting-started-)
	- [Requirements](#requirements)
	- [Installation](#installation)
	- [Configuration](#configuration)
	- [Usage](#usage)
- [Contributing ✍️](#contributing-️)
- [License 📃](#license-)
- [Contact 💬](#contact-)

# Overview 🐟

## Project Description

Thank you for visiting the Pet Health Tracker project! This project is a collaborative, open-source effort built by a diverse team of developers, designers, and other creatives looking to grow their technical skills and contribute to the pet care community. Whether you're a developer, a pet enthusiast, or someone passionate about health tech, you're in the right place!

The goal of the Pet Health Tracker is to help pet owners log, monitor, and manage their pet's health and well-being. It would allow users to enter pet information, log important health data, view health changes and trends, and more. By providing a simple and centralized platform to track and review these details, pet owners can ensure their beloved animal companions receive the best care possible.

## About Us

The rainbowfish-tech-collab, created by [Char](https://github.com/charburton18) and [Robin](https://github.com/robinallenaz), is a community of tech creatives focused on growing their knowledge of modern technologies, improving their skills with real-world projects, and fostering a positive and supportive learning environment.

### Why is it called "Rainbowfish"?

The Rainbow Fish is a children's book by Marcus Pfister that promotes generosity, kindness, and friendship. Read the story [here](https://milldamschool.org/wp-content/uploads/sites/4/2022/09/The_rainbow_fish.pdf). Like the Rainbow Fish, we believe we are all better when we share our unique qualities with each other.

### Our Contributors
- Ken
- Robin
- Jacky
- Char
- Kayla
- Kim
- Jonathan 

# Tech Stack 💻

- PostgreSQL
- Express
- React
- Node

# Getting Started 🚀
├── [Requirements](#requirements)  
├── [Installation](#installation)  
├── [Running the Database](#running-the-database)  
└── [Setting Up Express Server](#server-setup)

## Requirements

- Node.js v22+
- PostgreSQL v15+
- Docker

## Installation

1. Clone the repository.
2. Pull latest changes from the `main` branch into your local environment.
3. Run `cd backend` to navigate into the `backend` directory.
4. Run `npm install` to install dependencies.
5. Create a `.env` file in the `backend` directory and populate it with the variables from `example.env`.

### Running the Database
1. Make sure you have Docker at least v27 installed (tested on v27.5.1)
2. Navigate into the `backend` directory.
3. Start the database by running:
```
docker compose up -d
```
4. Connect to the PostgreSQL database:
```
docker exec -it postgres_container psql -U <POSTGRES_USER> -d <POSTGRES_DB>
```
(Replace `<POSTGRES_USER>` and `<POSTGRES_DB>` with the values you set them to in your .env file.)

5. Verify the database exists by running:
```
\l
```
You should see a database named whatever you set `<POSTGRES_DB>` to in your `.env` file. Check that its tables were created:
```
\c <POSTGRES_DB>
\d
```
This should return a list of tables, which should match the `init.sql` file.

6. When you're done using the database, stop and remove the containers with:
```
docker compose down -v
```

### Server Setup
1. Make sure you have an `DATABASE_URL` set in your `.env` file.  
The format should be:  
```
postgres://<POSTGRES_USER>:<POSTGRES_PASSWORD>@localhost:5432/<POSTGRES_DB>
```

2. To run your express server run: 

```
npm run dev
```
3. You can then access the server at 
```
http://localhost:3000
```

## Configuration

TBD

## Usage

TBD

# Contributing ✍️

Join us in creating something meaningful while sharpening your development skills! Please read the [contribution guidelines](https://github.com/Rainbowfish-Tech-Collab/Pet-Health-Tracker/blob/main/CONTRIBUTING.md) first.

# License 📃

This open-source project is licensed under [Apache License v2.0](https://www.apache.org/licenses/LICENSE-2.0).

# Contact 💬
