-- Per-teacher branding (logo + name + contact) shown on exported PDFs.
CREATE TABLE "teacher_profiles" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "brand_name" TEXT,
  "logo_key" TEXT,
  "address" TEXT,
  "phone" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "teacher_profiles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "teacher_profiles_user_id_key" ON "teacher_profiles" ("user_id");

ALTER TABLE "teacher_profiles"
  ADD CONSTRAINT "teacher_profiles_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
