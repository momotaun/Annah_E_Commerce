import { ArchiveReason, ProductOptionType, ProductStatus } from '@prisma/client';

export class VendorProductResponseDto {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  price: string;
  compareAtPrice: string | null;
  quantity: number;
  imageUrl: string | null;
  images: string[];
  status: ProductStatus;
  archivedReason: ArchiveReason | null;
  archivedDescription: string | null;
  categoryId: string;
  options: { type: ProductOptionType; values: string[] }[];
  createdAt: Date;
}
