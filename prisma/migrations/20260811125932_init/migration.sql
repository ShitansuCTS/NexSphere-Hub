/*
  Warnings:

  - You are about to drop the `ContactImportBatch` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ImportStatus" AS ENUM ('PROCESSING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "importId" TEXT,
ADD COLUMN     "profilePicture" TEXT;

-- DropTable
DROP TABLE "ContactImportBatch";

-- CreateTable
CREATE TABLE "ContactImport" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "totalRows" INTEGER NOT NULL,
    "successRows" INTEGER NOT NULL DEFAULT 0,
    "failedRows" INTEGER NOT NULL DEFAULT 0,
    "failedFile" TEXT,
    "status" "ImportStatus" NOT NULL DEFAULT 'PROCESSING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactImport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactImportError" (
    "id" TEXT NOT NULL,
    "importId" TEXT NOT NULL,
    "rowNumber" INTEGER NOT NULL,
    "errorMessage" TEXT NOT NULL,
    "rawData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactImportError_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContactImportError_importId_idx" ON "ContactImportError"("importId");

-- CreateIndex
CREATE INDEX "Contact_importId_idx" ON "Contact"("importId");

-- AddForeignKey
ALTER TABLE "ContactImportError" ADD CONSTRAINT "ContactImportError_importId_fkey" FOREIGN KEY ("importId") REFERENCES "ContactImport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_importId_fkey" FOREIGN KEY ("importId") REFERENCES "ContactImport"("id") ON DELETE SET NULL ON UPDATE CASCADE;
