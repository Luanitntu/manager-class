-- Platform settings (single-row table managed by Super Admin)
CREATE TABLE "system_settings" (
  "id" TEXT NOT NULL DEFAULT 'singleton',
  "platform_name" TEXT NOT NULL DEFAULT 'Schedule Teacher',
  "support_email" TEXT,
  "allow_registration" BOOLEAN NOT NULL DEFAULT true,
  "default_timezone" TEXT NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);
