INSERT INTO "user" (email, username, password_hashed, profile_picture) VALUES
('Eldon.Kunze@gmail.com', 'Joshuah.Williamson','BjqQ5g6uMcA2wHA', 'https://loremflickr.com/525/3955?lock=1542668287071202'),
('Bryce.Klocko@yahoo.com', 'Vicky_Legros-Emmerich','iRk9vnUGMWnHHm4', 'https://picsum.photos/seed/CDGG5ZtS/677/678'),
('Kenna.Prosacco77@gmail.com', 'Briana.Lindgren','3T2qCwt4Q0IHFWL', 'https://picsum.photos/seed/OFaMXV8L/512/826'),
('Jacey.Vandervort@yahoo.com', 'Jerrold.Champlin83','PITxBmSLvrjKUQm', 'https://loremflickr.com/1057/1801?lock=5879768786296642'),
('Lera57@yahoo.com', 'Stanton53','YfLxl7bQRNlReXn', 'https://picsum.photos/seed/bM0Pew6k6/1505/1035'),
('Jakob67@gmail.com', 'Rosa95','0zuaRnXDzVk7FPh', 'https://loremflickr.com/2091/2093?lock=851698575537381');
INSERT INTO "pet" (pet_breed_id, sex_id, "name", birthday, "description", profile_picture) VALUES
('55', '1', 'Leo', '2020-03-24','This is my pet.', 'https://picsum.photos/seed/8ZlMnwVTQ8/1268/1797'),
('40', '2', 'Hank', '2020-03-24','This is my pet.', 'https://picsum.photos/seed/5KjFY3PvNg/1058/1740'),
('48', '3', 'Louie', '2020-03-24','This is my pet.', 'https://picsum.photos/seed/DbtjvRH/2898/1274'),
('3', '3', 'Cookie', '2020-03-24','This is my pet.', 'https://loremflickr.com/3130/2973?lock=3368940665821221'),
('25', '1', 'Murphey', '2020-03-24','This is my pet.', 'https://loremflickr.com/2279/1902?lock=3397382938472976'),
('22', '2', 'Ace', '2020-03-24','This is my pet.', 'https://loremflickr.com/124/3506?lock=3200695612101825');
INSERT INTO symptom (pet_id, symptom_type_id, symptom_description, symptom_date) VALUES
('2', '7', 'This is the symptom description.', '2025-05-13 07:34:12'),
('1', '2', 'This is the symptom description.', '2025-11-28 22:58:13'),
('3', '4', 'This is the symptom description.', '2025-10-15 06:22:10'),
('1', '3', 'This is the symptom description.', '2025-11-25 01:19:00'),
('6', '6', 'This is the symptom description.', '2025-09-12 19:39:19'),
('3', '5', 'This is the symptom description.', '2025-11-30 19:22:27');
INSERT INTO stat (pet_id, "description", stat_date) VALUES
('6', 'This is the stat description', '2025-12-27 07:40:58'),
('1', 'This is the stat description', '2025-08-23 11:12:15'),
('2', 'This is the stat description', '2025-05-12 18:24:07'),
('4', 'This is the stat description', '2025-04-08 20:10:32'),
('2', 'This is the stat description', '2025-07-04 10:14:01'),
('2', 'This is the stat description', '2025-08-15 08:29:13');
INSERT INTO weight_stat (stat_id, weight_id, "weight") VALUES
('5', '4', '34'),
('6', '5', '31'),
('6', '2', '33'),
('1', '3', '31'),
('4', '1', '33'),
('2', '5', '35');
INSERT INTO glucose_stat (stat_id, glucose_id, glucose_level) VALUES
('1', '2', '132'),
('2', '3', '130'),
('6', '1', '113'),
('6', '2', '66'),
('6', '2', '48'),
('2', '1', '71');
INSERT INTO heart_rate_stat (stat_id, beats_per_minute) VALUES
('3', '183'),
('6', '185'),
('4', '200'),
('5', '191'),
('2', '119'),
('3', '59');
INSERT INTO respiratory_rate_stat (stat_id, breaths_per_minute) VALUES
('2', '28'),
('5', '16'),
('5', '30'),
('5', '26'),
('5', '27'),
('4', '24');
INSERT INTO other_stat (stat_id, note) VALUES
('1', 'This is the other symptom description.'),
('6', 'This is the other symptom description.'),
('4', 'This is the other symptom description.'),
('1', 'This is the other symptom description.'),
('3', 'This is the other symptom description.'),
('6', 'This is the other symptom description.');
INSERT INTO bodily_function (pet_id, function_id, note, bodily_function_date) VALUES
('1','2', 'This is the bodily function description.', '2025-09-07 00:41:56'),
('2','2', 'This is the bodily function description.', '2025-06-16 18:21:21'),
('3','2', 'This is the bodily function description.', '2025-05-30 10:58:59'),
('2','2', 'This is the bodily function description.', '2025-07-23 14:16:12'),
('3','2', 'This is the bodily function description.', '2025-08-03 14:15:36'),
('3','1', 'This is the bodily function description.', '2025-06-02 07:39:22');
INSERT INTO medication (pet_id, dosage_id, dosage, note, medication_date) VALUES
('2', '4', '5.9', 'This is the medication description.', '2025-05-05 19:01:43'),
('4', '4', '15.4', 'This is the medication description.', '2025-10-20 03:07:19'),
('3', '4', '5.4', 'This is the medication description.', '2025-06-09 04:34:58'),
('1', '6', '9.3', 'This is the medication description.', '2025-04-26 22:15:35'),
('2', '1', '16.5', 'This is the medication description.', '2025-10-26 22:33:18'),
('1', '4', '8.0', 'This is the medication description.', '2025-07-09 12:30:10');
INSERT INTO activity (pet_id, activity_type_id, duration_in_hours, note, activity_date) VALUES
('5', '1', '2.1', 'This is the activity description.', '2025-07-17 04:37:06'),
('1', '1', '3.2', 'This is the activity description.', '2025-11-01 14:36:01'),
('6', '5', '1.9', 'This is the activity description.', '2025-04-07 11:06:14'),
('2', '4', '2.2', 'This is the activity description.', '2025-12-21 03:27:50'),
('5', '1', '1.0', 'This is the activity description.', '2025-07-30 13:26:48'),
('4', '3', '2.6', 'This is the activity description.', '2025-11-11 22:51:08');