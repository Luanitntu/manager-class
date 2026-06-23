-- System-wide announcement banner
ALTER TABLE "system_settings"
  ADD COLUMN "announcement" TEXT,
  ADD COLUMN "announcement_active" BOOLEAN NOT NULL DEFAULT false;
