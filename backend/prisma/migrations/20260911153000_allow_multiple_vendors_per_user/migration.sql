-- DropIndex
DROP INDEX "Vendor_userId_key";

-- CreateIndex
CREATE INDEX "Vendor_userId_idx" ON "Vendor"("userId");
