-- Date a score was achieved (settable; defaults to now). Backfill from created_at.
ALTER TABLE "scores" ADD COLUMN "scored_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
UPDATE "scores" SET "scored_at" = "created_at";
