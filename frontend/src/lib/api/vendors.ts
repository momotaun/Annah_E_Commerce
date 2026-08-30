import { apiClient } from '../api-client';

export interface VendorProfile {
  id: string;
  businessName: string;
  contactEmail: string;
  bio: string | null;
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