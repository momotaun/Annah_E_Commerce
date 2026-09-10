export class VendorListItemDto {
  id: string;
  businessName: string;
  contactEmail: string;
  logoUrl: string | null;
  status: string;
  approvedAt: Date | null;
}
