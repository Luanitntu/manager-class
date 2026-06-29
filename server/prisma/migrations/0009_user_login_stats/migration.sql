-- Login tracking for users (shown in the Super Admin user detail)
ALTER TABLE "users"
  ADD COLUMN "last_login_at" TIMESTAMP(3),
  ADD COLUMN "last_login_ip" TEXT,
  ADD COLUMN "login_count" INTEGER NOT NULL DEFAULT 0;
