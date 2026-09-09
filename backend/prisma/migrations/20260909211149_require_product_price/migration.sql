/*
  Warnings:

  - Made the column `price` on table `Product` required. This step will fail if there are existing NULL values in that column.

*/
-- Products can no longer be created or saved without a price (see
-- VendorProductsService / CreateVendorProductDto). Any pre-existing rows
-- from before this rule — e.g. drafts saved while price was briefly
-- optional — are removed rather than left in an now-invalid state.
DELETE FROM "Product" WHERE "price" IS NULL;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "price" SET NOT NULL;
