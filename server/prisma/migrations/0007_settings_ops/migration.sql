-- Operational toggles for the platform
ALTER TABLE "system_settings"
  ADD COLUMN "maintenance_mode" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "storage_driver" TEXT NOT NULL DEFAULT 'local',
  ADD COLUMN "health_refresh_seconds" INTEGER NOT NULL DEFAULT 300;
