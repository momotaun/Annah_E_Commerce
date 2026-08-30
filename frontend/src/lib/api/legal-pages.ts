import { apiClient } from '../api-client';

export interface LegalPageSection {
  title: string;
  body: string;
}

export interface LegalPage {
  slug: string;
  title: string;
  sections: LegalPageSection[];
  updatedAt: string;
}

export function getLegalPage(slug: string) {
  return apiClient.get<LegalPage>(`/legal-pages/${slug}`);
}

export function updateLegalPage(slug: string, data: { title: string; sections: LegalPageSection[] }) {
  return apiClient.patch<LegalPage>(`/legal-pages/${slug}`, data);
}
