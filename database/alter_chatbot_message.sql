-- Alter chatbot_message table to add new columns
-- Run this on your database to update the existing table

ALTER TABLE chatbot_message
    ADD COLUMN content TEXT NOT NULL AFTER id_chatbot,
    MODIFY COLUMN is_user TINYINT(1) NOT NULL,
    ADD COLUMN is_analyzed TINYINT(1) DEFAULT 0 NOT NULL AFTER is_user,
    ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER is_analyzed,
    DROP COLUMN date;

-- Add ON DELETE CASCADE if not already present
ALTER TABLE chatbot_message
    DROP FOREIGN KEY chatbot_message_ibfk_1;

ALTER TABLE chatbot_message
    ADD CONSTRAINT chatbot_message_ibfk_1
        FOREIGN KEY (id_chatbot) REFERENCES chatbot (id_chatbot)
            ON DELETE CASCADE;

-- Add index for finding unanalyzed messages
CREATE INDEX idx_chatbot_message_unanalyzed 
    ON chatbot_message (is_analyzed, id_chatbot);
