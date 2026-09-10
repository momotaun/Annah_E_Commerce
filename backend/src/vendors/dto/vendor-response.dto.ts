export class VendorResponseDto {
  id: string;
  businessName: string;
  contactEmail: string;
  bio: string | null;
  logoUrl: string | null;
  status: string;
  approvedAt: Date | null;
}
