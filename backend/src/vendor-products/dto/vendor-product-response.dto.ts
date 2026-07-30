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
