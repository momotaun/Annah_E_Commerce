import { ProductStatus } from '@prisma/client';

export class VendorProductResponseDto {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  price: string | null;
  imageUrl: string | null;
  images: string[];
  status: ProductStatus;
  categoryId: string;
  createdAt: Date;
}
