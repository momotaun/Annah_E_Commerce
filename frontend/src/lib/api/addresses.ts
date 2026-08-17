import { apiClient } from '../api-client';

export interface Address {
  id: string;
  line1: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

export function getMyAddresses() {
  return apiClient.get<Address[]>('/users/me/addresses');
}

export function addMyAddress(data: {
  line1: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault?: boolean;
}) {
  return apiClient.post<Address>('/users/me/addresses', data);
}