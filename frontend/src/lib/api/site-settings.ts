import { apiClient } from '../api-client';

export interface SiteSettings {
  siteName: string;
  logoUrl: string | null;
  announcementText: string | null;
  updatedAt: string;
}

export function getSiteSettings() {
  return apiClient.get<SiteSettings>('/site-settings');
}

export function updateSiteSettings(data: {
  siteName: string;
  logoUrl?: string | null;
  announcementText?: string | null;
}) {
  return apiClient.patch<SiteSettings>('/site-settings', data);
}

export function uploadSiteLogo(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.postForm<{ url: string }>('/site-settings/logo', formData);
}
