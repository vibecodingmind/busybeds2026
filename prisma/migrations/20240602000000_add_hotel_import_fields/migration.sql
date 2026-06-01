-- AlterTable: Add Google Places import fields to Hotel
-- phone, address, googlePlaceId already exist from previous migration
-- Add only the new fields

ALTER TABLE "Hotel" ADD COLUMN "importSource" TEXT;
ALTER TABLE "Hotel" ADD COLUMN "isPartner" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Hotel" ADD COLUMN "partnerDiscountPercent" INTEGER;
ALTER TABLE "Hotel" ADD COLUMN "importedAt" TIMESTAMP(3);

-- Make descriptionShort and descriptionLong optional (default empty)
ALTER TABLE "Hotel" ALTER COLUMN "descriptionShort" SET DEFAULT '';
ALTER TABLE "Hotel" ALTER COLUMN "descriptionLong" SET DEFAULT '';

-- Add unique index on googlePlaceId if not already exists
CREATE UNIQUE INDEX IF NOT EXISTS "Hotel_googlePlaceId_key" ON "Hotel"("googlePlaceId");
