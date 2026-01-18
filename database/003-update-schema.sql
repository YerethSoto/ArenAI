-- Migration: Add text column to message table for storing message content
-- This enables persistence of chat messages that were previously only in localStorage

ALTER TABLE `message` ADD COLUMN `text` TEXT NOT NULL AFTER `id_user`;
ALTER TABLE `message` MODIFY COLUMN `date` DATETIME DEFAULT CURRENT_TIMESTAMP;

-- Similarly for chatbot_message table
ALTER TABLE `chatbot_message` ADD COLUMN `text` TEXT NOT NULL AFTER `id_chatbot`;
ALTER TABLE `chatbot_message` MODIFY COLUMN `date` DATETIME DEFAULT CURRENT_TIMESTAMP;
