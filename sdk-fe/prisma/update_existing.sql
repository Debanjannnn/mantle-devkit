-- Update existing projects to set createdBy = payTo as a fallback
UPDATE projects SET "createdBy" = "payTo" WHERE "createdBy" IS NULL;
