-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "alternateMobile" TEXT,
    "email" TEXT,
    "designation" TEXT,
    "address" TEXT,
    "nacId" TEXT,
    "blockId" TEXT,
    "gpId" TEXT,
    "villageId" TEXT,
    "wardId" TEXT,
    "boothId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Contact_mobile_idx" ON "Contact"("mobile");

-- CreateIndex
CREATE INDEX "Contact_name_idx" ON "Contact"("name");

-- CreateIndex
CREATE INDEX "Contact_nacId_idx" ON "Contact"("nacId");

-- CreateIndex
CREATE INDEX "Contact_blockId_idx" ON "Contact"("blockId");

-- CreateIndex
CREATE INDEX "Contact_gpId_idx" ON "Contact"("gpId");

-- CreateIndex
CREATE INDEX "Contact_villageId_idx" ON "Contact"("villageId");

-- CreateIndex
CREATE INDEX "Contact_wardId_idx" ON "Contact"("wardId");

-- CreateIndex
CREATE INDEX "Contact_boothId_idx" ON "Contact"("boothId");

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_nacId_fkey" FOREIGN KEY ("nacId") REFERENCES "NAC"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_gpId_fkey" FOREIGN KEY ("gpId") REFERENCES "GP"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_wardId_fkey" FOREIGN KEY ("wardId") REFERENCES "Ward"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_boothId_fkey" FOREIGN KEY ("boothId") REFERENCES "Booth"("id") ON DELETE SET NULL ON UPDATE CASCADE;
