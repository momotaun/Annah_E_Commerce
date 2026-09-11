import { apiClient } from '../api-client';

export interface VendorProfile {
  id: string;
  businessName: string;
  contactEmail: string;
  bio: string | null;
  logoUrl: string | null;
  status: 'PENDING' | 'APPROVED' | 'SUSPENDED';
  approvedAt: string | null;
}

export interface PublicVendorProfile extends VendorProfile {
  productCount: number;
}

export function registerVendor(data: { businessName: string; contactEmail: string }) {
  return apiClient.post<VendorProfile>('/vendors/register', data);
}

export function getVendor(id: string) {
  return apiClient.get<PublicVendorProfile>(`/vendors/${id}`);
}

// Every store the caller owns, any status — powers the "My Stores" picker
// and the post-login redirect decision (one store vs. several).
export function listMyVendorProfiles() {
  return apiClient.get<VendorProfile[]>('/vendors/mine');
}

// A specific store the caller owns, in any status — works during onboarding
// (still PENDING) as well as after approval.
export function getMyVendorProfile(vendorId: string) {
  return apiClient.get<VendorProfile>(`/vendors/mine/${vendorId}`);
}

export function updateMyVendorProfile(
  vendorId: string,
  data: {
    businessName?: string;
    contactEmail?: string;
    bio?: string | null;
    logoUrl?: string | null;
  }
) {
  return apiClient.patch<VendorProfile>(`/vendors/mine/${vendorId}`, data);
}

export function uploadVendorLogo(vendorId: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.postForm<{ url: string }>(`/vendors/mine/${vendorId}/logo`, formData);
}
