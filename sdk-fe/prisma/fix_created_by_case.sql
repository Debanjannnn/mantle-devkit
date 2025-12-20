-- Fix existing records: normalize createdBy to lowercase
UPDATE projects 
SET "createdBy" = LOWER("createdBy") 
WHERE "createdBy" IS NOT NULL;
