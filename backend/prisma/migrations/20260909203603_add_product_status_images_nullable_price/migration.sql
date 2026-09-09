-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "status" "ProductStatus" NOT NULL DEFAULT 'PUBLISHED',
ALTER COLUMN "price" DROP NOT NULL;
