-- Branding & SEO settings
ALTER TABLE "system_settings"
  ADD COLUMN "favicon_key" TEXT,
  ADD COLUMN "seo_title" TEXT,
  ADD COLUMN "seo_description" TEXT,
  ADD COLUMN "seo_keywords" TEXT;
