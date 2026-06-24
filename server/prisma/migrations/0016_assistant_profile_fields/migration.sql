-- Assistant personal info + salary effective date.
ALTER TABLE "assistant_profiles"
  ADD COLUMN "level" TEXT,
  ADD COLUMN "hometown" TEXT,
  ADD COLUMN "salary_effective_from" TIMESTAMP(3);
