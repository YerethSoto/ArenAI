-- Migration for Multi-Quiz Assignments
-- Allows an assignment to have multiple quizzes

-- Create junction table for assignment-quiz many-to-many relationship
CREATE TABLE IF NOT EXISTS `assignment_quiz` (
    `id_assignment_quiz` INT AUTO_INCREMENT PRIMARY KEY,
    `id_assignment` INT NOT NULL,
    `id_quiz` INT NOT NULL,
    `quiz_order` INT DEFAULT 0,  -- Order of quiz in the assignment
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_aq_assignment` FOREIGN KEY (`id_assignment`) REFERENCES `assignment`(`id_assignment`) ON DELETE CASCADE,
    CONSTRAINT `fk_aq_quiz` FOREIGN KEY (`id_quiz`) REFERENCES `quiz`(`id_quiz`) ON DELETE CASCADE,
    UNIQUE KEY `unique_assignment_quiz` (`id_assignment`, `id_quiz`)
);

-- Add indexes for performance
CREATE INDEX `idx_aq_assignment` ON `assignment_quiz` (`id_assignment`);
CREATE INDEX `idx_aq_quiz` ON `assignment_quiz` (`id_quiz`);

-- Add title and description to assignment table for better organization
ALTER TABLE `assignment` ADD COLUMN `title` VARCHAR(255) NULL AFTER `id_assignment`;
ALTER TABLE `assignment` ADD COLUMN `description` TEXT NULL AFTER `title`;
ALTER TABLE `assignment` ADD COLUMN `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER `id_subject`;
ALTER TABLE `assignment` ADD COLUMN `id_professor` INT NULL AFTER `id_section`;
ALTER TABLE `assignment` ADD CONSTRAINT `fk_assignment_professor` FOREIGN KEY (`id_professor`) REFERENCES `user`(`id_user`);

-- Note: We keep the old id_quiz column for backward compatibility
-- New assignments should use the assignment_quiz junction table
-- Old assignments with id_quiz set can still work
