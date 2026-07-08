-- CreateTable
CREATE TABLE "ContactImportBatch" (
    "id" TEXT NOT NULL,
    "totalRows" INTEGER NOT NULL,
    "validCount" INTEGER NOT NULL,
    "errorCount" INTEGER NOT NULL,
    "validRows" JSONB NOT NULL,
    "errorRows" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactImportBatch_pkey" PRIMARY KEY ("id")
);
