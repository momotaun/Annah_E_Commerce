export class VendorResponseDto {
  id: string;
  businessName: string;
  contactEmail: string;
  bio: string | null;
  status: string;
  approvedAt: Date | null;
}
