export class VendorProductResponseDto {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  categoryId: string;
  createdAt: Date;
}

export class ProductResponseDto {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  categoryId: string;
  vendorId: string | null;
  createdAt: Date;
}