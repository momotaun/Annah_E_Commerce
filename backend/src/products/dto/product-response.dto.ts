export class ProductResponseDto {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  price: string; // Decimal serialized as string to avoid float precision issues
  imageUrl: string | null;
  categoryId: string;
  vendorId: string | null;
  createdAt: Date;
}

export class PaginatedProductsResponseDto {
  data: ProductResponseDto[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}