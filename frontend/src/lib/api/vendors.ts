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

// The caller's own vendor record, in any status — works during onboarding
// (still PENDING) as well as after approval.
export function getMyVendorProfile() {
  return apiClient.get<VendorProfile>('/vendors/me');
}

export function updateMyVendorProfile(data: {
  businessName?: string;
  contactEmail?: string;
  bio?: string | null;
  logoUrl?: string | null;
}) {
  return apiClient.patch<VendorProfile>('/vendors/me', data);
}

export function uploadVendorLogo(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.postForm<{ url: string }>('/vendors/me/logo', formData);
}
