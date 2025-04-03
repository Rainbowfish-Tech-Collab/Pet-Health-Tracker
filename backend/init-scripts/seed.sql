INSERT INTO "user" (email, username, password_hashed, profile_picture) VALUES
('Lilliana_Kling@yahoo.com', 'Scot56','tvZBZF5QcO2bOnb', 'https://loremflickr.com/1309/547?lock=2440555419256329'),
('Oran_OKeefe@yahoo.com', 'Aileen75','sVJNidxGY9pVtvk', 'https://loremflickr.com/1930/1451?lock=5130149132209379'),
('Jo_Wyman@hotmail.com', 'Austyn2','ui07w757ZgXzjhR', 'https://loremflickr.com/3829/2451?lock=2582409443510544'),
('Lurline.Balistreri62@gmail.com', 'Reanna50','PfnFHMISRRgNqZI', 'https://loremflickr.com/2654/3703?lock=5090313401872614'),
('Ashlynn_Hane46@gmail.com', 'Guy_Bogisich1','CoRlFs7MUQndt0Q', 'https://loremflickr.com/2613/1120?lock=7632073790586738'),
('Winifred73@hotmail.com', 'Bradford_Prohaska','U1NBeavqgAMecqY', 'https://loremflickr.com/357/3004?lock=5371661975903719');
INSERT INTO "pet" (pet_breed_id, sex_id, "name", birthday, "description", profile_picture) VALUES
('49', '2', 'Kobe', '2020-03-24','This is my pet.', 'https://picsum.photos/seed/WDHVxi/3135/1124'),
('73', '1', 'Coco', '2020-03-24','This is my pet.', 'https://loremflickr.com/956/1625?lock=1877321952288312'),
('47', '1', 'Murphey', '2020-03-24','This is my pet.', 'https://loremflickr.com/2647/2298?lock=2577055392251207'),
('38', '1', 'Joey', '2020-03-24','This is my pet.', 'https://loremflickr.com/1934/1904?lock=4788298641167715'),
('98', '4', 'Mia', '2020-03-24','This is my pet.', 'https://loremflickr.com/1857/2566?lock=3112362144666549'),
('70', '1', 'Archie', '2020-03-24','This is my pet.', 'https://picsum.photos/seed/FBt76BUF/1464/3841');
INSERT INTO symptom (pet_id, symptom_type_id, symptom_description, symptom_date) VALUES
('6', '2', 'This is the symptom description.', '2025-12-12 19:08:00'),
('2', '2', 'This is the symptom description.', '2025-04-04 04:33:43'),
('5', '1', 'This is the symptom description.', '2025-12-03 04:10:57'),
('6', '1', 'This is the symptom description.', '2025-11-16 14:20:33'),
('5', '1', 'This is the symptom description.', '2025-09-18 15:39:06'),
('6', '1', 'This is the symptom description.', '2025-12-04 16:07:33');
INSERT INTO stat (pet_id, "description", stat_date) VALUES
('5', 'This is the stat description', '2025-04-17 12:14:59'),
('6', 'This is the stat description', '2025-05-08 12:08:07'),
('4', 'This is the stat description', '2025-11-21 16:57:51'),
('2', 'This is the stat description', '2025-08-13 22:51:38'),
('4', 'This is the stat description', '2025-08-04 17:10:44'),
('2', 'This is the stat description', '2025-11-28 11:08:22');
INSERT INTO weight_stat (stat_id, weight_id, "weight") VALUES
('6', '3', '35'),
('5', '1', '34'),
('2', '4', '32'),
('4', '2', '33'),
('3', '3', '32'),
('5', '5', '35');
INSERT INTO glucose_stat (stat_id, glucose_id, glucose_level) VALUES
('2', '1', '25'),
('4', '1', '25'),
('5', '1', '26'),
('6', '2', '45'),
('5', '3', '15'),
('5', '3', '67');
INSERT INTO heart_rate_stat (stat_id, beats_per_minute) VALUES
('6', '145'),
('3', '44'),
('2', '59'),
('2', '142'),
('6', '201'),
('5', '86');
INSERT INTO respiratory_rate_stat (stat_id, beats_per_minute) VALUES
('6', '15'),
('4', '11'),
('6', '23'),
('3', '21'),
('4', '14'),
('5', '30');
INSERT INTO other_stat (stat_id, note) VALUES
('1', 'This is the other symptom description.'),
('4', 'This is the other symptom description.'),
('5', 'This is the other symptom description.'),
('6', 'This is the other symptom description.'),
('2', 'This is the other symptom description.'),
('2', 'This is the other symptom description.');