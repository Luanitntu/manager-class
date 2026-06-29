-- Default course tuition per class (copied onto a student's Tuition on enrolment).
ALTER TABLE "classes" ADD COLUMN "tuition_fee" DECIMAL(12,2);
