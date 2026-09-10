import { ArchiveReason, ProductStatus } from '@prisma/client';

export class VendorProductResponseDto {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  price: string;
  quantity: number;
  imageUrl: string | null;
  images: string[];
  status: ProductStatus;
  archivedReason: ArchiveReason | null;
  archivedDescription: string | null;
  categoryId: string;
  createdAt: Date;
}
