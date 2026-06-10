-- AlterTable
ALTER TABLE "Otp" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'login';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "username" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Otp_userId_idx" ON "Otp"("userId");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
