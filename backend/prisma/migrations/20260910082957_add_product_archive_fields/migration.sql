-- CreateEnum
CREATE TYPE "ArchiveReason" AS ENUM ('TEMPORARY', 'OUT_OF_STOCK', 'PRODUCT_PROBLEM', 'DAMAGES');

-- AlterEnum
ALTER TYPE "ProductStatus" ADD VALUE 'ARCHIVED';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "archivedDescription" TEXT,
ADD COLUMN     "archivedReason" "ArchiveReason";
