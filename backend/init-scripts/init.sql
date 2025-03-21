CREATE TABLE "user"(
    "id" bigserial NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "date_created" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    "date_updated" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    "date_archived" TIMESTAMP(0) WITHOUT TIME ZONE NULL,
    "profile_picture" TEXT NULL
);
ALTER TABLE
    "user" ADD PRIMARY KEY("id");
ALTER TABLE
    "user" ADD CONSTRAINT "user_email_unique" UNIQUE("email");
ALTER TABLE
    "user" ADD CONSTRAINT "user_username_unique" UNIQUE("username");
CREATE TABLE "user_pet"(
    "user_id" BIGINT NOT NULL,
    "pet_id" BIGINT NOT NULL
);
ALTER TABLE
    "user_pet" ADD PRIMARY KEY("user_id");
CREATE TABLE "pet"(
    "id" bigserial NOT NULL,
    "pet_breed_id" INTEGER NOT NULL,
    "sex_id" INTEGER NOT NULL,
    "birthday" DATE NULL,
    "description" TEXT NOT NULL,
    "date_created" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    "date_updated" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    "date_archived" TIMESTAMP(0) WITHOUT TIME ZONE NULL,
    "profile_picture" TEXT NULL
);
ALTER TABLE
    "pet" ADD PRIMARY KEY("id");
CREATE TABLE "pet_breed"(
    "id" SERIAL NOT NULL,
    "pet_species_id" INTEGER NOT NULL,
    "pet_breed" TEXT NOT NULL
);
ALTER TABLE
    "pet_breed" ADD PRIMARY KEY("id");
CREATE TABLE "pet_species"(
    "id" SERIAL NOT NULL,
    "species" TEXT NOT NULL
);
ALTER TABLE
    "pet_species" ADD PRIMARY KEY("id");
CREATE TABLE "pet_sex"(
    "id" smallserial NOT NULL,
    "sex" TEXT NOT NULL
);
ALTER TABLE
    "pet_sex" ADD PRIMARY KEY("id");
CREATE TABLE "symptom"(
    "id" bigserial NOT NULL,
    "pet_id" BIGINT NOT NULL,
    "symptom_type_id" INTEGER NOT NULL,
    "date_created" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    "date_updated" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    "date_archived" TIMESTAMP(0) WITHOUT TIME ZONE NULL,
    "symptom_other" TEXT NOT NULL,
    "symptom_description" TEXT NOT NULL,
    "symptom_date" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL
);
ALTER TABLE
    "symptom" ADD PRIMARY KEY("id");
CREATE TABLE "symptom_type"(
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL
);
ALTER TABLE
    "symptom_type" ADD PRIMARY KEY("id");
CREATE TABLE "stat"(
    "id" bigserial NOT NULL,
    "pet_id" BIGINT NOT NULL,
    "description" TEXT NOT NULL,
    "date_created" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    "date_updated" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    "date_archived" TIMESTAMP(0) WITHOUT TIME ZONE NULL,
    "stat_date" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL
);
ALTER TABLE
    "stat" ADD PRIMARY KEY("id");
CREATE TABLE "weight_stat"(
    "id" bigserial NOT NULL,
    "stat_id" BIGINT NOT NULL,
    "weight_id" INTEGER NOT NULL,
    "weight" REAL NOT NULL,
    "date_created" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    "date_updated" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    "date_archived" TIMESTAMP(0) WITHOUT TIME ZONE NULL
);
ALTER TABLE
    "weight_stat" ADD PRIMARY KEY("id");
CREATE TABLE "weight"(
    "id" INTEGER NOT NULL,
    "unit" TEXT NOT NULL
);
ALTER TABLE
    "weight" ADD PRIMARY KEY("id");
CREATE TABLE "glucose_stat"(
    "id" bigserial NOT NULL,
    "stat_id" BIGINT NOT NULL,
    "glucose_id" INTEGER NOT NULL,
    "glucose_level" REAL NOT NULL,
    "date_created" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    "date_updated" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    "date_archived" TIMESTAMP(0) WITHOUT TIME ZONE NULL
);
ALTER TABLE
    "glucose_stat" ADD PRIMARY KEY("id");
CREATE TABLE "glucose"(
    "id" INTEGER NOT NULL,
    "unit" TEXT NOT NULL
);
ALTER TABLE
    "glucose" ADD PRIMARY KEY("id");
CREATE TABLE "heart_rate_stat"(
    "id" bigserial NOT NULL,
    "stat_id" BIGINT NOT NULL,
    "beats_per_minute" INTEGER NOT NULL,
    "date_created" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    "date_updated" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    "date_archived" TIMESTAMP(0) WITHOUT TIME ZONE NULL
);
ALTER TABLE
    "heart_rate_stat" ADD PRIMARY KEY("id");
CREATE TABLE "respiratory_rate_stat"(
    "id" bigserial NOT NULL,
    "stat_id" BIGINT NOT NULL,
    "breaths_per_minute" INTEGER NOT NULL,
    "date_created" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    "date_updated" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    "date_archived" TIMESTAMP(0) WITHOUT TIME ZONE NULL
);
ALTER TABLE
    "respiratory_rate_stat" ADD PRIMARY KEY("id");
CREATE TABLE "other_stat"(
    "id" bigserial NOT NULL,
    "stat_id" BIGINT NOT NULL,
    "note" TEXT NOT NULL,
    "date_created" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    "date_updated" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    "date_archived" TIMESTAMP(0) WITHOUT TIME ZONE NULL
);
ALTER TABLE
    "other_stat" ADD PRIMARY KEY("id");
CREATE TABLE "bodily_function"(
    "id" bigserial NOT NULL,
    "pet_id" BIGINT NOT NULL,
    "function_id" INTEGER NOT NULL,
    "note" TEXT NOT NULL,
    "date_created" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    "date_updated" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    "date_archived" TIMESTAMP(0) WITHOUT TIME ZONE NULL,
    "bodily_function_date" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL
);
ALTER TABLE
    "bodily_function" ADD PRIMARY KEY("id");
CREATE TABLE "function"(
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL
);
ALTER TABLE
    "function" ADD PRIMARY KEY("id");
CREATE TABLE "medication"(
    "id" bigserial NOT NULL,
    "pet_id" BIGINT NOT NULL,
    "dosage_id" INTEGER NOT NULL,
    "dosage" REAL NOT NULL,
    "note" TEXT NOT NULL,
    "date_created" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    "date_updated" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    "date_archived" TIMESTAMP(0) WITHOUT TIME ZONE NULL,
    "medication_date" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL
);
ALTER TABLE
    "medication" ADD PRIMARY KEY("id");
CREATE TABLE "dosage"(
    "id" SERIAL NOT NULL,
    "unit" TEXT NOT NULL
);
ALTER TABLE
    "dosage" ADD PRIMARY KEY("id");
CREATE TABLE "activity"(
    "id" bigserial NOT NULL,
    "pet_id" BIGINT NOT NULL,
    "activity_type_id" INTEGER NOT NULL,
    "duration_in_hours" REAL NOT NULL,
    "note" TEXT NOT NULL,
    "date_created" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    "date_updated" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    "date_archived" TIMESTAMP(0) WITHOUT TIME ZONE NULL,
    "activity_date" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL
);
ALTER TABLE
    "activity" ADD PRIMARY KEY("id");
CREATE TABLE "activity_type"(
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL
);
ALTER TABLE
    "activity_type" ADD PRIMARY KEY("id");
ALTER TABLE
    "respiratory_rate_stat" ADD CONSTRAINT "respiratory_rate_stat_stat_id_foreign" FOREIGN KEY("stat_id") REFERENCES "stat"("id");
ALTER TABLE
    "medication" ADD CONSTRAINT "medication_id_foreign" FOREIGN KEY("id") REFERENCES "pet"("id");
ALTER TABLE
    "bodily_function" ADD CONSTRAINT "bodily_function_id_foreign" FOREIGN KEY("id") REFERENCES "pet"("id");
ALTER TABLE
    "heart_rate_stat" ADD CONSTRAINT "heart_rate_stat_stat_id_foreign" FOREIGN KEY("stat_id") REFERENCES "stat"("id");
ALTER TABLE
    "activity" ADD CONSTRAINT "activity_activity_type_id_foreign" FOREIGN KEY("activity_type_id") REFERENCES "activity_type"("id");
ALTER TABLE
    "medication" ADD CONSTRAINT "medication_dosage_id_foreign" FOREIGN KEY("dosage_id") REFERENCES "dosage"("id");
ALTER TABLE
    "activity" ADD CONSTRAINT "activity_id_foreign" FOREIGN KEY("id") REFERENCES "pet"("id");
ALTER TABLE
    "other_stat" ADD CONSTRAINT "other_stat_stat_id_foreign" FOREIGN KEY("stat_id") REFERENCES "stat"("id");
ALTER TABLE
    "bodily_function" ADD CONSTRAINT "bodily_function_function_id_foreign" FOREIGN KEY("function_id") REFERENCES "function"("id");
ALTER TABLE
    "pet_breed" ADD CONSTRAINT "pet_breed_pet_species_id_foreign" FOREIGN KEY("pet_species_id") REFERENCES "pet_species"("id");
ALTER TABLE
    "user_pet" ADD CONSTRAINT "user_pet_user_id_foreign" FOREIGN KEY("user_id") REFERENCES "user"("id");
ALTER TABLE
    "symptom" ADD CONSTRAINT "symptom_symptom_type_id_foreign" FOREIGN KEY("symptom_type_id") REFERENCES "symptom_type"("id");
ALTER TABLE
    "glucose_stat" ADD CONSTRAINT "glucose_stat_glucose_id_foreign" FOREIGN KEY("glucose_id") REFERENCES "glucose"("id");
ALTER TABLE
    "pet" ADD CONSTRAINT "pet_pet_breed_id_foreign" FOREIGN KEY("pet_breed_id") REFERENCES "pet_breed"("id");
ALTER TABLE
    "stat" ADD CONSTRAINT "stat_id_foreign" FOREIGN KEY("id") REFERENCES "pet"("id");
ALTER TABLE
    "symptom" ADD CONSTRAINT "symptom_id_foreign" FOREIGN KEY("id") REFERENCES "pet"("id");
ALTER TABLE
    "user_pet" ADD CONSTRAINT "user_pet_pet_id_foreign" FOREIGN KEY("pet_id") REFERENCES "pet"("id");
ALTER TABLE
    "pet" ADD CONSTRAINT "pet_sex_id_foreign" FOREIGN KEY("sex_id") REFERENCES "pet_sex"("id");
ALTER TABLE
    "weight_stat" ADD CONSTRAINT "weight_stat_stat_id_foreign" FOREIGN KEY("stat_id") REFERENCES "stat"("id");
ALTER TABLE
    "weight_stat" ADD CONSTRAINT "weight_stat_weight_id_foreign" FOREIGN KEY("weight_id") REFERENCES "weight"("id");
ALTER TABLE
    "glucose_stat" ADD CONSTRAINT "glucose_stat_stat_id_foreign" FOREIGN KEY("stat_id") REFERENCES "stat"("id");