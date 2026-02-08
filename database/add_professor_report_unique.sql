-- Add unique constraint to professor_class_report to enable UPSERT
-- This ensures only one report per class exists (overwrites instead of duplicates)

ALTER TABLE professor_class_report 
ADD CONSTRAINT unique_class_report UNIQUE (id_class);
