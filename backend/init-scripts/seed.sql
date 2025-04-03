INSERT INTO "user" (email, username, password_hashed, profile_picture) VALUES
('Toney_Williamson47@hotmail.com', 'Maynard32','QDZW25oXTTHGUOW', 'https://picsum.photos/seed/Sld9Wsk/374/3958'),
('Kurtis84@yahoo.com', 'Avis_Littel1','Na4eBKlk6Ej8lzc', 'https://picsum.photos/seed/GhzDg6t/776/454'),
('Finn.Zboncak@gmail.com', 'Orval_Weissnat','ADJH0TEwsp0dByN', 'https://picsum.photos/seed/BEt6jUhJ/735/778'),
('Fabiola37@gmail.com', 'Georgianna24','ojfzqDfJhsYMj2L', 'https://loremflickr.com/1718/3097?lock=512418866364375'),
('Mavis_Kutch-Walter36@gmail.com', 'Alexandria0','w1TejrhgYy5RjWA', 'https://picsum.photos/seed/hoTBMUp/3813/3679'),
('Lennie.Wilderman-Walsh@gmail.com', 'Mya_Altenwerth','4Bq6HFGg0BUua2Y', 'https://loremflickr.com/1628/3620?lock=5295391417798079');
INSERT INTO "pet" (pet_breed_id, sex_id, "name", birthday, "description", profile_picture) VALUES
('76', '2', 'Louie', '2020-03-24','This is my pet.', 'https://loremflickr.com/1346/2104?lock=4683547019442736'),
('40', '3', 'Maggie', '2020-03-24','This is my pet.', 'https://picsum.photos/seed/BJ0wlvCp/2576/692'),
('63', '4', 'Louie', '2020-03-24','This is my pet.', 'https://loremflickr.com/2871/3417?lock=8534741151727107'),
('42', '2', 'Nova', '2020-03-24','This is my pet.', 'https://loremflickr.com/559/2493?lock=5077963554422452'),
('88', '2', 'Dixie', '2020-03-24','This is my pet.', 'https://loremflickr.com/1194/3836?lock=3668709958509343'),
('113', '4', 'Louie', '2020-03-24','This is my pet.', 'https://loremflickr.com/968/1209?lock=2897463250794992');
INSERT INTO symptom (pet_id, symptom_type_id, symptom_description, symptom_date) VALUES
('5', '4', 'This is the symptom description.', '2025-06-09 17:21:16'),
('2', '7', 'This is the symptom description.', '2025-11-12 01:07:27'),
('4', '7', 'This is the symptom description.', '2025-09-13 21:04:54'),
('4', '7', 'This is the symptom description.', '2025-04-13 10:44:32'),
('5', '6', 'This is the symptom description.', '2025-06-09 14:32:28'),
('5', '3', 'This is the symptom description.', '2025-07-28 15:42:30');
INSERT INTO stat (pet_id, "description", stat_date) VALUES
('1', 'This is the stat description', '2025-09-19 18:12:35'),
('1', 'This is the stat description', '2025-05-20 07:22:56'),
('3', 'This is the stat description', '2025-06-10 15:32:08'),
('1', 'This is the stat description', '2025-08-02 22:30:08'),
('4', 'This is the stat description', '2025-10-19 05:13:08'),
('2', 'This is the stat description', '2025-05-09 07:23:38');