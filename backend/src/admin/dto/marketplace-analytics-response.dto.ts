export class VendorBreakdownDto {
  vendorId: string;
  businessName: string;
  totalRevenue: string;
  totalCommission: string;
  totalOrders: number;
}

export class MarketplaceAnalyticsResponseDto {
  totalOrders: number;
  totalRevenue: string;
  totalCommissionEarned: string;
  activeVendorCount: number;
  vendorBreakdown: VendorBreakdownDto[];
}
