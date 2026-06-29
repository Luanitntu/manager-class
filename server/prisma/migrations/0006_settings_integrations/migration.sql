-- Integration credentials for the platform (managed by Super Admin)
ALTER TABLE "system_settings"
  ADD COLUMN "resend_api_key" TEXT,
  ADD COLUMN "email_from" TEXT,
  ADD COLUMN "r2_account_id" TEXT,
  ADD COLUMN "r2_access_key_id" TEXT,
  ADD COLUMN "r2_secret_access_key" TEXT,
  ADD COLUMN "r2_bucket" TEXT,
  ADD COLUMN "r2_public_url" TEXT;
