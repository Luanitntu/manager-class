-- Avatar storage key + refresh-token device/session metadata
ALTER TABLE "users" ADD COLUMN "avatar_key" TEXT;
ALTER TABLE "refresh_tokens"
  ADD COLUMN "ip_address" TEXT,
  ADD COLUMN "user_agent" TEXT;
