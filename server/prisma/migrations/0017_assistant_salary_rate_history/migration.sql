-- Salary rate history per assistant (so changing the rate doesn't rewrite the past).
CREATE TABLE "assistant_salary_rates" (
  "id" UUID NOT NULL,
  "assistant_id" UUID NOT NULL,
  "method" "SalaryMethod" NOT NULL,
  "rate" DECIMAL(12,2) NOT NULL,
  "effective_from" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "assistant_salary_rates_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "assistant_salary_rates_assistant_id_effective_from_idx"
  ON "assistant_salary_rates" ("assistant_id", "effective_from");

ALTER TABLE "assistant_salary_rates"
  ADD CONSTRAINT "assistant_salary_rates_assistant_id_fkey"
  FOREIGN KEY ("assistant_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed history from existing assistant profiles (one record each).
INSERT INTO "assistant_salary_rates" ("id", "assistant_id", "method", "rate", "effective_from", "created_at")
SELECT gen_random_uuid(), ap."user_id", ap."salary_method", ap."salary_rate",
       COALESCE(ap."salary_effective_from", ap."created_at"), now()
FROM "assistant_profiles" ap;
