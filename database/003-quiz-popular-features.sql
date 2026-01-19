-- Migration for Popular Quizzes Feature
-- Add columns to quiz table for sharing, downloads, and ratings

-- Add is_public flag - all quizzes are public by default
ALTER TABLE `quiz` ADD COLUMN `is_public` TINYINT(1) DEFAULT 1;

-- Add download count for tracking popularity
ALTER TABLE `quiz` ADD COLUMN `downloads` INT DEFAULT 0;

-- Add average rating (calculated from quiz_rating table)
ALTER TABLE `quiz` ADD COLUMN `avg_rating` DECIMAL(2,1) DEFAULT 0.0;

-- Add total rating count
ALTER TABLE `quiz` ADD COLUMN `rating_count` INT DEFAULT 0;

-- Add description field (longer than current)
ALTER TABLE `quiz` MODIFY COLUMN `description` VARCHAR(500);

-- Add level/grade (e.g., "7", "8", "9")
ALTER TABLE `quiz` ADD COLUMN `level` VARCHAR(20);

-- Add language (no default - must be set when creating quiz)
ALTER TABLE `quiz` ADD COLUMN `language` VARCHAR(10);

-- Add created_at timestamp
ALTER TABLE `quiz` ADD COLUMN `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create quiz_rating table for user ratings
CREATE TABLE IF NOT EXISTS `quiz_rating` (
  `id_rating` INT PRIMARY KEY AUTO_INCREMENT,
  `id_quiz` INT NOT NULL,
  `id_user` INT NOT NULL,
  `rating` TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_quiz`) REFERENCES `quiz` (`id_quiz`) ON DELETE CASCADE,
  FOREIGN KEY (`id_user`) REFERENCES `user` (`id_user`),
  UNIQUE KEY `unique_quiz_user_rating` (`id_quiz`, `id_user`)
);
