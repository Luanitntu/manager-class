-- Per-user IANA timezone for tz-aware scheduling display
ALTER TABLE "users" ADD COLUMN "timezone" TEXT;
