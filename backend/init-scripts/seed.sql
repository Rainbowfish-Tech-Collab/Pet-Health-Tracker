INSERT INTO "user" (email, username, password_hashed, profile_picture) VALUES
('George_Nicolas@yahoo.com', 'Ova52','miTPpMp1tpK8uFC', 'https://picsum.photos/seed/shnRI0Gp/2282/1311'),
('Mozelle12@hotmail.com', 'Olga_Metz60','yZYmo_s8Hm9M61O', 'https://picsum.photos/seed/UAadC/1425/2785'),
('Golda.Oberbrunner94@gmail.com', 'Deron31','pQjTwgFlziCFuCT', 'https://picsum.photos/seed/lAGNMwJ/1667/2017'),
('Jeanie_Emmerich25@hotmail.com', 'Skye.Hackett','OeTxXOhXKuxFwoc', 'https://loremflickr.com/1742/2744?lock=4546749548612898'),
('Darius_Ziemann@gmail.com', 'Art54','5Lc_Yot6eNhq8HC', 'https://loremflickr.com/734/3268?lock=5323473281878450'),
('Loy41@hotmail.com', 'Maximillian_Boehm','q0esk5CkACFFuFs', 'https://loremflickr.com/1893/1531?lock=3843407080844371');
INSERT INTO "pet" (pet_breed_id, sex_id, "name", birthday, "description", profile_picture) VALUES
('29', '3', 'Finn', '2020-03-24','This is my pet.', 'https://picsum.photos/seed/hWk1qfUpu/1074/2847'),
('26', '2', 'Bailey', '2020-03-24','This is my pet.', 'https://picsum.photos/seed/f5guiwF6b/3745/2189'),
('78', '4', 'Bruno', '2020-03-24','This is my pet.', 'https://loremflickr.com/1312/1928?lock=3302959628615073'),
('10', '1', 'Molly', '2020-03-24','This is my pet.', 'https://picsum.photos/seed/GySbAmBwb9/872/2256'),
('46', '4', 'Joey', '2020-03-24','This is my pet.', 'https://loremflickr.com/3917/3485?lock=7075374453510812'),
('41', '1', 'Murphey', '2020-03-24','This is my pet.', 'https://loremflickr.com/524/998?lock=6462568711273737');
INSERT INTO symptom (pet_id, symptom_type_id, symptom_description, symptom_date) VALUES
('6', '7', 'This is the symptom description.', '2025-06-04 05:05:13'),
('3', '4', 'This is the symptom description.', '2025-07-28 21:55:03'),
('2', '2', 'This is the symptom description.', '2025-04-27 02:10:14'),
('3', '4', 'This is the symptom description.', '2025-05-05 20:33:36'),
('5', '5', 'This is the symptom description.', '2025-05-25 07:13:00'),
('3', '7', 'This is the symptom description.', '2025-05-07 10:29:45');
INSERT INTO stat (pet_id, "description", stat_date) VALUES
('3', 'This is the stat description', '2025-05-20 23:47:05'),
('6', 'This is the stat description', '2025-11-30 16:54:30'),
('3', 'This is the stat description', '2025-09-08 12:37:05'),
('2', 'This is the stat description', '2025-04-14 20:17:47'),
('2', 'This is the stat description', '2025-08-03 01:05:35'),
('5', 'This is the stat description', '2025-10-19 03:38:12');
INSERT INTO weight_stat (stat_id, weight_id, "weight") VALUES
('3', '3', '34'),
('5', '3', '35'),
('1', '4', '32'),
('2', '5', '31'),
('1', '4', '34'),
('2', '1', '33');
INSERT INTO glucose_stat (stat_id, glucose_id, glucose_level) VALUES
('3', '1', '101'),
('5', '2', '25'),
('5', '1', '30'),
('4', '3', '19'),
('3', '3', '108'),
('6', '3', '28');
INSERT INTO heart_rate_stat (stat_id, beats_per_minute) VALUES
('5', '53'),
('3', '131'),
('1', '155'),
('4', '122'),
('4', '185'),
('4', '95');
INSERT INTO respiratory_rate_stat (stat_id, breaths_per_minute) VALUES
('4', '12'),
('6', '13'),
('3', '13'),
('5', '17'),
('5', '16'),
('4', '30');
INSERT INTO other_stat (stat_id, note) VALUES
('1', 'This is the other symptom description.'),
('4', 'This is the other symptom description.'),
('5', 'This is the other symptom description.'),
('1', 'This is the other symptom description.'),
('1', 'This is the other symptom description.'),
('4', 'This is the other symptom description.');
INSERT INTO bodily_function (pet_id, function_id, note, bodily_function_date) VALUES
('4','2', 'This is the bodily function description.', '2025-07-21 08:35:41'),
('2','1', 'This is the bodily function description.', '2025-06-04 17:42:34'),
('6','1', 'This is the bodily function description.', '2025-08-22 21:30:37'),
('2','1', 'This is the bodily function description.', '2025-06-14 12:29:22'),
('4','1', 'This is the bodily function description.', '2025-07-23 22:03:22'),
('4','2', 'This is the bodily function description.', '2025-08-08 07:16:11');
INSERT INTO medication (pet_id, dosage_id, dosage, note, medication_date) VALUES
('2', '2', '7.7', 'This is the bodily function description.', '2025-05-22 04:34:58'),
('2', '1', '4.0', 'This is the bodily function description.', '2025-05-29 09:44:15'),
('4', '2', '3.6', 'This is the bodily function description.', '2025-12-13 18:25:48'),
('2', '1', '4.2', 'This is the bodily function description.', '2025-06-05 17:26:37'),
('6', '2', '7.7', 'This is the bodily function description.', '2025-07-05 15:37:24'),
('3', '2', '4.6', 'This is the bodily function description.', '2025-11-03 05:46:12');