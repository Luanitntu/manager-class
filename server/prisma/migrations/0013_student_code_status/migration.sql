-- Student lifecycle status + per-teacher display code (STU0001).
CREATE TYPE "StudyStatus" AS ENUM ('STUDYING', 'RESERVED', 'GRADUATED');

ALTER TABLE "student_profiles"
  ADD COLUMN "study_status" "StudyStatus" NOT NULL DEFAULT 'STUDYING',
  ADD COLUMN "code" TEXT;

-- Backfill codes per teacher, ordered by the student's creation time.
WITH ranked AS (
  SELECT sp.id,
         'STU' || LPAD(
           (ROW_NUMBER() OVER (PARTITION BY u.teacher_id ORDER BY u.created_at, sp.id))::text,
           4, '0'
         ) AS code
  FROM "student_profiles" sp
  JOIN "users" u ON u.id = sp.user_id
)
UPDATE "student_profiles" sp
SET "code" = ranked.code
FROM ranked
WHERE ranked.id = sp.id;
