-- AlterTable: Add Google Places import fields to Hotel
ALTER TABLE "Hotel" ADD COLUMN "phone" TEXT;
ALTER TABLE "Hotel" ADD COLUMN "address" TEXT;
ALTER TABLE "Hotel" ADD COLUMN "googlePlaceId" TEXT;
ALTER TABLE "Hotel" ADD COLUMN "importSource" TEXT;
ALTER TABLE "Hotel" ADD COLUMN "isPartner" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Hotel" ADD COLUMN "partnerDiscountPercent" INTEGER;
ALTER TABLE "Hotel" ADD COLUMN "importedAt" TIMESTAMP(3);

-- Make descriptionShort and descriptionLong optional (default empty)
ALTER TABLE "Hotel" ALTER COLUMN "descriptionShort" SET DEFAULT '';
ALTER TABLE "Hotel" ALTER COLUMN "descriptionLong" SET DEFAULT '';

-- Create unique index on googlePlaceId
CREATE UNIQUE INDEX "Hotel_googlePlaceId_key" ON "Hotel"("googlePlaceId");
