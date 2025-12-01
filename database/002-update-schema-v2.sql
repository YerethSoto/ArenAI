-- Migration to V2 Schema

-- 1. Update existing tables
-- Add profile_picture_name to user
-- ALTER TABLE `user` ADD COLUMN `profile_picture_name` varchar(50);

-- Add quiz_streak to student_profile
-- ALTER TABLE `student_profile` ADD COLUMN `quiz_streak` int;

-- Add attendance to class_student
-- ALTER TABLE `class_student` ADD COLUMN `attendance` bool DEFAULT false;

-- Note: The new schema removes id_professor from class table.
-- We are keeping it for now to avoid data loss until confirmed.
-- ALTER TABLE `class` DROP FOREIGN KEY `fk_class_professor`;
-- ALTER TABLE `class` DROP COLUMN `id_professor`;

-- 2. Create new tables

CREATE TABLE IF NOT EXISTS `quiz` (
  `id_quiz` int PRIMARY KEY AUTO_INCREMENT,
  `id_professor` int,
  `quiz_name` varchar(50),
  `id_subject` int NOT NULL,
  `id_section` int NOT NULL,
  `id_class` int NOT NULL,
  FOREIGN KEY (`id_class`) REFERENCES `class` (`id_class`),
  FOREIGN KEY (`id_professor`) REFERENCES `user` (`id_user`),
  FOREIGN KEY (`id_section`) REFERENCES `section` (`id_section`),
  FOREIGN KEY (`id_subject`) REFERENCES `subject` (`id_subject`)
);

CREATE TABLE IF NOT EXISTS `quiz_topic` (
  `id_quiz_topic` int PRIMARY KEY AUTO_INCREMENT,
  `id_quiz` int,
  `id_topic` int,
  FOREIGN KEY (`id_topic`) REFERENCES `topic` (`id_topic`),
  FOREIGN KEY (`id_quiz`) REFERENCES `quiz` (`id_quiz`)
);

CREATE TABLE IF NOT EXISTS `quiz_question` (
  `id_quiz_question` int PRIMARY KEY AUTO_INCREMENT,
  `id_quiz` int NOT NULL,
  `id_topic` int,
  `question` varchar(500) NOT NULL,
  `answer1` varchar(50),
  `answer2` varchar(50),
  `answer3` varchar(50),
  `answer4` varchar(50),
  FOREIGN KEY (`id_quiz`) REFERENCES `quiz` (`id_quiz`),
  FOREIGN KEY (`id_topic`) REFERENCES `topic` (`id_topic`)
);

CREATE TABLE IF NOT EXISTS `quiz_student` (
  `id_quiz_student` int PRIMARY KEY AUTO_INCREMENT,
  `id_quiz` int,
  `id_student` int,
  `score` int,
  FOREIGN KEY (`id_quiz`) REFERENCES `quiz` (`id_quiz`),
  FOREIGN KEY (`id_student`) REFERENCES `user` (`id_user`)
);

CREATE TABLE IF NOT EXISTS `battle_minigame` (
  `id_battle_minigame` int PRIMARY KEY AUTO_INCREMENT,
  `id_user_1` int DEFAULT 100,
  `id_user_2` int DEFAULT 100,
  `id_class` int,
  `user_1_health` int,
  `user_2_health` int,
  `winner` bit,
  `id_subject` int,
  FOREIGN KEY (`id_subject`) REFERENCES `subject` (`id_subject`),
  FOREIGN KEY (`id_user_2`) REFERENCES `user` (`id_user`),
  FOREIGN KEY (`id_class`) REFERENCES `class` (`id_class`),
  FOREIGN KEY (`id_user_1`) REFERENCES `user` (`id_user`)
);

CREATE TABLE IF NOT EXISTS `battle_minigame_question` (
  `id_battle_minigame_question` int PRIMARY KEY AUTO_INCREMENT,
  `id_battle_minigame` int,
  `id_topic` int,
  `question` varchar(500), -- Fixed typo varchat -> varchar
  `answer1` varchar(50),
  `answer2` varchar(50),
  `answer3` varchar(50),
  `answer4` varchar(50),
  FOREIGN KEY (`id_battle_minigame`) REFERENCES `battle_minigame` (`id_battle_minigame`),
  FOREIGN KEY (`id_topic`) REFERENCES `topic` (`id_topic`)
);

CREATE TABLE IF NOT EXISTS `chat` (
  `id_chat` int PRIMARY KEY AUTO_INCREMENT,
  `id_user_1` int,
  `id_user_2` int,
  `friendship` bool,
  FOREIGN KEY (`id_user_1`) REFERENCES `user` (`id_user`),
  FOREIGN KEY (`id_user_2`) REFERENCES `user` (`id_user`)
);

CREATE TABLE IF NOT EXISTS `message` (
  `id_message` int PRIMARY KEY AUTO_INCREMENT,
  `id_chat` int,
  `id_user` int,
  `date` date,
  FOREIGN KEY (`id_chat`) REFERENCES `chat` (`id_chat`),
  FOREIGN KEY (`id_user`) REFERENCES `user` (`id_user`)
);

CREATE TABLE IF NOT EXISTS `chatbot` (
  `id_chatbot` int PRIMARY KEY AUTO_INCREMENT,
  `id_subject` int,
  `id_student` int,
  FOREIGN KEY (`id_student`) REFERENCES `user` (`id_user`),
  FOREIGN KEY (`id_subject`) REFERENCES `subject` (`id_subject`)
);

CREATE TABLE IF NOT EXISTS `chatbot_message` (
  `id_chatbot_message` int PRIMARY KEY AUTO_INCREMENT,
  `id_chatbot` int,
  `date` date,
  `is_user` bool,
  FOREIGN KEY (`id_chatbot`) REFERENCES `chatbot` (`id_chatbot`)
);

CREATE TABLE IF NOT EXISTS `assignment` (
  `id_assignment` int PRIMARY KEY AUTO_INCREMENT,
  `id_section` int,
  `due_time` date,
  `id_quiz` int,
  `win_battle_requirement` smallint,
  `id_subject` int,
  FOREIGN KEY (`id_subject`) REFERENCES `subject` (`id_subject`),
  FOREIGN KEY (`id_quiz`) REFERENCES `quiz` (`id_quiz`),
  FOREIGN KEY (`id_section`) REFERENCES `section` (`id_section`)
);

CREATE TABLE IF NOT EXISTS `assignment_student` (
  `id_assignment_student` int PRIMARY KEY AUTO_INCREMENT,
  `id_assignment` int,
  `id_student` int,
  `complete` bool DEFAULT false,
  `id_quiz_student` int,
  FOREIGN KEY (`id_quiz_student`) REFERENCES `quiz_student` (`id_quiz_student`),
  FOREIGN KEY (`id_student`) REFERENCES `user` (`id_user`),
  FOREIGN KEY (`id_assignment`) REFERENCES `assignment` (`id_assignment`)
);

CREATE TABLE IF NOT EXISTS `assignment_student_battle` (
  `id_assignment_student_battle` int PRIMARY KEY AUTO_INCREMENT,
  `id_assignment_student` int,
  `id_battle_minigame` int,
  FOREIGN KEY (`id_battle_minigame`) REFERENCES `battle_minigame` (`id_battle_minigame`),
  FOREIGN KEY (`id_assignment_student`) REFERENCES `assignment_student` (`id_assignment`)
);
