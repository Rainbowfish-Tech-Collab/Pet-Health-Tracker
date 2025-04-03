INSERT INTO "user" (email, username, password_hashed, profile_picture) VALUES
('Berniece.Walter81@gmail.com', 'Norberto_Heaney5','PicGOsuAU8Rmmyl', 'https://loremflickr.com/544/3334?lock=1346554997767468'),
('Julianne_Weber@gmail.com', 'Vernon_Koelpin','gLAWEaSUjoM3PwS', 'https://loremflickr.com/1175/418?lock=3500415817542484'),
('Esteban.Bode@hotmail.com', 'Nicholas_Greenfelder','oZYQvpcIed2eHBQ', 'https://loremflickr.com/930/3465?lock=1737272185565247'),
('Justus12@hotmail.com', 'Jadon64','tJhxOlHAUsR_Mb_', 'https://loremflickr.com/999/2359?lock=8368351539936914'),
('Ike_Borer@yahoo.com', 'Mohamed81','y9nygTOkAKHxRSj', 'https://picsum.photos/seed/RdLND/1693/3503'),
('Jude.Bayer@gmail.com', 'Delaney.Stokes','ZvnM7kZaSpDEe_7', 'https://loremflickr.com/1678/1318?lock=8763774499447287');
INSERT INTO "pet" (pet_breed_id, sex_id, "name", birthday, "description", profile_picture) VALUES
('63', '2', 'Rosie', '2020-03-24','This is my pet.', 'https://picsum.photos/seed/RXKe2edFGy/735/34'),
('65', '3', 'Leo', '2020-03-24','This is my pet.', 'https://loremflickr.com/3758/2742?lock=8078260386487234'),
('29', '1', 'Nova', '2020-03-24','This is my pet.', 'https://loremflickr.com/390/3974?lock=5413281684938669'),
('64', '1', 'Daisy', '2020-03-24','This is my pet.', 'https://picsum.photos/seed/tvBnKW/1538/1786'),
('108', '2', 'Bentley', '2020-03-24','This is my pet.', 'https://loremflickr.com/2086/990?lock=4733685798941587'),
('96', '2', 'Kobe', '2020-03-24','This is my pet.', 'https://loremflickr.com/216/3850?lock=2830497956734523');
INSERT INTO symptom (pet_id, symptom_type_id, symptom_description, symptom_date) VALUES
('3', '1', 'This is the symptom description.', '2025-05-28 16:39:11'),
('6', '3', 'This is the symptom description.', '2025-09-29 02:31:37'),
('4', '4', 'This is the symptom description.', '2025-12-20 21:12:52'),
('5', '4', 'This is the symptom description.', '2025-12-15 02:47:44'),
('1', '7', 'This is the symptom description.', '2025-12-28 20:53:07'),
('6', '7', 'This is the symptom description.', '2025-05-14 08:18:18');
INSERT INTO stat (pet_id, "description", stat_date) VALUES
('2', 'This is the stat description', '2025-07-30 21:36:02'),
('2', 'This is the stat description', '2025-04-02 16:59:02'),
('3', 'This is the stat description', '2025-11-21 09:33:12'),
('3', 'This is the stat description', '2025-06-15 02:03:23'),
('5', 'This is the stat description', '2025-12-02 05:08:22'),
('6', 'This is the stat description', '2025-12-08 17:58:15');
INSERT INTO weight_stat (stat_id, weight_id, "weight") VALUES
('5', '1', '31'),
('1', '4', '33'),
('6', '2', '32'),
('5', '5', '35'),
('5', '5', '35'),
('2', '5', '32');
INSERT INTO glucose_stat (stat_id, glucose_id, glucose_level) VALUES
('3', '1', '33'),
('6', '3', '62'),
('4', '1', '137'),
('3', '2', '103'),
('5', '3', '123'),
('3', '3', '29');
INSERT INTO heart_rate_stat (stat_id, beats_per_minute) VALUES
('1', '126'),
('3', '108'),
('3', '80'),
('1', '151'),
('6', '178'),
('1', '52');
INSERT INTO respiratory_rate_stat (stat_id, breaths_per_minute) VALUES
('5', '23'),
('4', '14'),
('4', '15'),
('3', '17'),
('3', '14'),
('3', '28');
INSERT INTO other_stat (stat_id, note) VALUES
('5', 'This is the other symptom description.'),
('2', 'This is the other symptom description.'),
('1', 'This is the other symptom description.'),
('2', 'This is the other symptom description.'),
('2', 'This is the other symptom description.'),
('4', 'This is the other symptom description.');
INSERT INTO bodily_function (pet_id, function_id, note, bodily_function_date) VALUES
('6','2', 'This is the bodily function description.', '2025-09-27 15:40:03'),
('5','2', 'This is the bodily function description.', '2025-06-17 08:14:24'),
('3','1', 'This is the bodily function description.', '2025-05-12 01:13:25'),
('4','2', 'This is the bodily function description.', '2025-06-06 03:49:22'),
('2','2', 'This is the bodily function description.', '2025-05-29 06:27:45'),
('2','2', 'This is the bodily function description.', '2025-08-20 15:34:16');
INSERT INTO medication (pet_id, dosage_id, dosage, note, medication_date) VALUES
('3', '6', '8.7', 'This is the medication description.', '2025-09-26 11:20:05'),
('2', '3', '12.4', 'This is the medication description.', '2025-07-26 19:53:00'),
('6', '7', '12.0', 'This is the medication description.', '2025-11-14 04:14:08'),
('1', '7', '5.7', 'This is the medication description.', '2025-08-03 05:08:41'),
('6', '7', '17.6', 'This is the medication description.', '2025-09-28 05:59:06'),
('2', '6', '6.6', 'This is the medication description.', '2025-07-01 10:13:12');
INSERT INTO activity (pet_id, activity_type_id, duration_in_hours, note, activity_date) VALUES
('4', '5', '3.0', 'This is the activity description.', '2025-07-07 08:34:54'),
('5', '4', '1.0', 'This is the activity description.', '2025-04-17 13:44:11'),
('1', '2', '3.4', 'This is the activity description.', '2025-05-07 11:01:44'),
('5', '4', '3.1', 'This is the activity description.', '2025-05-14 10:35:51'),
('5', '1', '2.9', 'This is the activity description.', '2025-07-16 08:54:40'),
('4', '2', '1.3', 'This is the activity description.', '2025-09-15 18:22:15');