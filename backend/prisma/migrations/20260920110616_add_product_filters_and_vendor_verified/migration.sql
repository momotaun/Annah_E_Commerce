-- CreateEnum
CREATE TYPE "DeliveryOption" AS ENUM ('NEXT_DAY', 'TWO_DAY', 'COLLECTION');

-- CreateEnum
CREATE TYPE "ProductSegment" AS ENUM ('WOMEN', 'MEN', 'KIDS', 'ACCESSORIES');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "averageRating" DECIMAL(2,1),
ADD COLUMN     "deliveryOption" "DeliveryOption",
ADD COLUMN     "segment" "ProductSegment";

-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;
