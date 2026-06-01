-- AlterTable: Add linkedinId to User
ALTER TABLE "User" ADD COLUMN "linkedinId" TEXT;
CREATE UNIQUE INDEX "User_linkedinId_key" ON "User"("linkedinId");

-- AlterTable: Add phone and address to Hotel
ALTER TABLE "Hotel" ADD COLUMN "phone" TEXT;
ALTER TABLE "Hotel" ADD COLUMN "address" TEXT;
