export class RevenueDataPointDto {
  date: string;
  revenue: number;
  orders: number;
}

export class OrderStatusCountDto {
  status: string;
  count: number;
}

export class TopProductDto {
  productId: string;
  productName: string;
  quantitySold: number;
  revenue: number;
}

export class VendorDashboardResponseDto {
  totalOrders: number;
  totalItemsSold: number;
  totalRevenue: string;
  totalCommission: string;
  netEarnings: string;

  // Daily buckets for the last 30 days, oldest first — zero-filled so the
  // chart always has a continuous 30-point series even on quiet days.
  revenueOverTime: RevenueDataPointDto[];

  // Counts distinct orders (not line items) per current order status.
  ordersByStatus: OrderStatusCountDto[];

  // Top 5 products by revenue, across this vendor's full order history.
  topProducts: TopProductDto[];
}
