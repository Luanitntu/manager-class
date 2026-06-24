-- Class location: offline room or online meeting link.
CREATE TYPE "LocationType" AS ENUM ('OFFLINE', 'ONLINE');
CREATE TYPE "MeetingProvider" AS ENUM ('GOOGLE_MEET', 'ZOOM', 'OTHER');

ALTER TABLE "classes"
  ADD COLUMN "location_type" "LocationType" NOT NULL DEFAULT 'OFFLINE',
  ADD COLUMN "room" TEXT,
  ADD COLUMN "meeting_provider" "MeetingProvider",
  ADD COLUMN "meeting_url" TEXT;
