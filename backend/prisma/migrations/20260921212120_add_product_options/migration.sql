-- CreateEnum
CREATE TYPE "ProductOptionType" AS ENUM ('COLOR', 'SIZE', 'STORAGE_CAPACITY');

-- CreateTable
CREATE TABLE "ProductOption" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "type" "ProductOptionType" NOT NULL,
    "values" TEXT[],

    CONSTRAINT "ProductOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductOption_productId_type_key" ON "ProductOption"("productId", "type");

-- AddForeignKey
ALTER TABLE "ProductOption" ADD CONSTRAINT "ProductOption_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
