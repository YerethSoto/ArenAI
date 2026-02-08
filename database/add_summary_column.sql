-- Add summary column to student_insights table
ALTER TABLE student_insights 
ADD COLUMN summary TEXT NULL AFTER study_tips;
