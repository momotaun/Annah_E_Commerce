import { apiClient } from '../api-client';

export interface VendorProfile {
  id: string;
  businessName: string;
  contactEmail: string;
  status: 'PENDING' | 'APPROVED' | 'SUSPENDED';
  approvedAt: string | null;
}

export function registerVendor(data: { businessName: string; contactEmail: string }) {
  return apiClient.post<VendorProfile>('/vendors/register', data);
}