CREATE TABLE "user"(
    "id" bigserial NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password_hashed" TEXT NOT NULL,
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
    "name" TEXT NOT NULL,
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
    "id" SERIAL NOT NULL,
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
    "id" SERIAL NOT NULL,
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

----------------------------------------------------------------------------------------------------------------
--------------------------------------------- POPULATE ENUM TABLES ---------------------------------------------
----------------------------------------------------------------------------------------------------------------

INSERT INTO "pet_sex" (sex)
VALUES
    ('Male'),
    ('Female'),
    ('Other'),
    ('Unknown');

INSERT INTO "pet_species" (species)
VALUES
    ('Dog'),
    ('Cat'),
    ('Bird'),
    ('Small Animals'),
    ('Reptile'),
    ('Horse'),
    ('Fish'),
    ('Livestock'),
    ('Other');

INSERT INTO "pet_breed" (pet_species_id, pet_breed)
VALUES
(1, 'Cairn Terrier'),
(1, 'Border Terrier'),
(1, 'Siberian Husky'),
(1, 'Welsh Springer Spaniel'),
(1, 'English Cocker Spaniel'),
(1, 'Cocker Spaniel'),
(1, 'Lhasa Apso'),
(1, 'English Springer Spaniel'),
(1, 'Shetland Sheepdog'),
(1, 'West Highland White Terrier'),
(1, 'Brittany'),
(1, 'German Shorthaired Pointer'),
(1, 'Pointer'),
(1, 'Tibetan Spaniel'),
(1, 'Labrador Retriever'),
(1, 'Bichon Frise'),
(1, 'Irish Setter'),
(1, 'Samoyed'),
(1, 'Shih Tzu'),
(1, 'Golden Retriever'),
(1, 'Chesapeake Bay Retriever'),
(1, 'Papillon'),
(1, 'Gordon Setter'),
(1, 'English Setter'),
(1, 'Pug'),
(1, 'Affenpinscher'),
(1, 'Miniature Schnauzer'),
(1, 'Beagle'),
(1, 'Border Collie'),
(1, 'Australian Terrier'),
(1, 'Whippet'),
(1, 'Boston Terrier'),
(1, 'Briard'),
(1, 'Bedlington Terrier'),
(1, 'Cavalier King Charles Spaniel'),
(1, 'Dalmatian'),
(1, 'Flat-Coated Retriever'),
(1, 'Belgian Tervuren'),
(1, 'Basset Hound'),
(1, 'Poodle'),
(1, 'Staffordshire Bull Terrier'),
(1, 'Bouvier des Flandres'),
(1, 'Pembroke Welsh Corgi'),
(1, 'Clumber Spaniel'),
(1, 'Pomeranian'),
(1, 'Australian Shepherd'),
(1, 'Pharaoh Hound'),
(1, 'Dandie Dinmont Terrier'),
(1, 'Greyhound'),
(1, 'Saluki'),
(1, 'Australian Cattle Dog'),
(1, 'Tibetan Terrier'),
(1, 'Norfolk Terrier'),
(1, 'Dachshund'),
(1, 'Chihuahua'),
(1, 'Doberman Pinscher'),
(1, 'English Toy Spaniel'),
(1, 'Newfoundland'),
(1, 'Basenji'),
(1, 'Afghan Hound'),
(1, 'Old English Sheepdog'),
(1, 'French Bulldog'),
(1, 'Bernese Mountain Dog'),
(1, 'Boxer'),
(1, 'Brussels Griffon'),
(1, 'Maltese'),
(1, 'Giant Schnauzer'),
(1, 'Rottweiler'),
(1, 'Yorkshire Terrier'),
(1, 'Irish Wolfhound'),
(1, 'Scottish Terrier'),
(1, 'Bullmastiff'),
(1, 'German Shepherd'),
(1, 'Mastiff'),
(1, 'Great Dane'),
(1, 'Kerry Blue Terrier'),
(1, 'Italian Greyhound'),
(1, 'Pekingese'),
(1, 'Rhodesian Ridgeback'),
(1, 'Bull Terrier'),
(1, 'Saint Bernard'),
(1, 'Borzoi'),
(1, 'Alaskan Malamute'),
(1, 'Bloodhound'),
(1, 'Chow Chow'),
(1, 'Akita'),
(1, 'Bulldog'),
(1, 'Other');

INSERT INTO "pet_breed" (pet_species_id, pet_breed)
VALUES
(2, 'Abyssinian'),
(2, 'Chinchilla'),
(2, 'LaPerm'),
(2, 'Siamese'),
(2, 'American Bobtail'),
(2, 'Cornish Rex'),
(2, 'Maine Coon'),
(2, 'Siberian'),
(2, 'American Curl'),
(2, 'Cymric'),
(2, 'Manx'),
(2, 'Silver'),
(2, 'American Shorthair'),
(2, 'Devon Rex'),
(2, 'Munchkin'),
(2, 'Singapura'),
(2, 'American Wirehair'),
(2, 'Dilute Calico'),
(2, 'Nebelung'),
(2, 'Snowshoe'),
(2, 'Applehead Siamese'),
(2, 'Dilute Tortoiseshell'),
(2, 'Norwegian Forest Cat'),
(2, 'Somali'),
(2, 'Balinese'),
(2, 'Domestic Long Hair'),
(2, 'Ocicat'),
(2, 'Sphynx - Hairless Cat'),
(2, 'Bengal'),
(2, 'Domestic Medium Hair'),
(2, 'Oriental Long Hair'),
(2, 'Tabby'),
(2, 'Birman'),
(2, 'Domestic Short Hair'),
(2, 'Oriental Short Hair'),
(2, 'Tiger'),
(2, 'Bombay'),
(2, 'Egyptian Mau'),
(2, 'Oriental Tabby'),
(2, 'Tonkinese'),
(2, 'British Shorthair'),
(2, 'Exotic Shorthair'),
(2, 'Persian'),
(2, 'Torbie'),
(2, 'Burmese'),
(2, 'Extra-Toes Cat - Hemingway Polydactyl'),
(2, 'Pixiebob'),
(2, 'Tortoiseshell'),
(2, 'Burmilla'),
(2, 'Havana'),
(2, 'Ragamuffin'),
(2, 'Turkish Ango'),
(2, 'Calico'),
(2, 'Himalayan'),
(2, 'Ragdoll'),
(2, 'Turkish Van'),
(2, 'Canadian Hairless'),
(2, 'Japanese Bobtail'),
(2, 'Russian Blue'),
(2, 'Tuxedo'),
(2, 'Chartreux'),
(2, 'Javanese'),
(2, 'Scottish Fold'),
(2, 'York Chocolate'),
(2, 'Chausie'),
(2, 'Korat'),
(2, 'Selkirk Rex'),
(2, 'Other');

INSERT INTO "symptom_type" ("name")
VALUES
    ('Coughing'),
    ('Sneezing'),
    ('Vomiting'),
    ('Fainting'),
    ('Seizures'),
    ('Lethargy'),
    ('Other');

INSERT INTO "weight" (unit)
VALUES
  ('lb'),
  ('kg'),
  ('oz'),
  ('g'),
  ('other');

INSERT INTO "glucose" (unit)
VALUES
  ('mg/dL'),
  ('mmol/L'),
  ('other');

INSERT INTO "function" ("name")
VALUES
  ('Defecation'),
  ('Urination');

INSERT INTO "dosage" (unit)
VALUES
  ('mg'),
  ('mL'),
  ('tablet'),
  ('capsule'),
  ('tbsp'),
  ('tsp'),
  ('other');

INSERT INTO "activity_type" ("name")
VALUES
  ('Sleeping'),
  ('Exercise'),
  ('Eating'),
  ('Drinking'),
  ('Other'); 
