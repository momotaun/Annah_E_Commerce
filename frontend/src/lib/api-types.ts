export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  children: Category[];
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  categoryId: string;
  vendorId: string | null;
}

export interface PaginatedProducts {
  data: Product[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface CartItemResponse {
  id: string;
  productId: string;
  quantity: number;
  product: { id: string; name: string; price: string; imageUrl: string | null };
  lineTotal: string;
}

export interface CartResponse {
  id: string;
  sessionId: string;
  items: CartItemResponse[];
  subtotal: string;
}