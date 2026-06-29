-- Per-session instructor (the owner teacher or one of their assistants).
ALTER TABLE "teaching_sessions" ADD COLUMN "instructor_id" UUID;

-- Backfill: existing sessions are taught by the owning teacher.
UPDATE "teaching_sessions" SET "instructor_id" = "teacher_id" WHERE "instructor_id" IS NULL;

-- Enforce presence + FK + index.
ALTER TABLE "teaching_sessions" ALTER COLUMN "instructor_id" SET NOT NULL;
ALTER TABLE "teaching_sessions"
  ADD CONSTRAINT "teaching_sessions_instructor_id_fkey"
  FOREIGN KEY ("instructor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "teaching_sessions_instructor_id_start_time_idx"
  ON "teaching_sessions"("instructor_id", "start_time");
