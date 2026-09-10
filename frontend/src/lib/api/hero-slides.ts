import { apiClient } from '../api-client';

export interface HeroSlide {
  id: string;
  order: number;
  eyebrow: string;
  headlineBefore: string;
  highlight: string;
  headlineAfter: string;
  subheading: string;
  imageUrl: string;
  ctaLabel: string;
  ctaHref: string;
  badgeValue: string;
  badgeCaption: string;
  categorySlug: string | null;
}

export interface HeroSlideInput {
  eyebrow: string;
  headlineBefore: string;
  highlight: string;
  headlineAfter: string;
  subheading: string;
  imageUrl: string;
  ctaLabel: string;
  ctaHref: string;
  badgeValue: string;
  badgeCaption: string;
  categorySlug?: string | null;
}

export function getHeroSlides() {
  return apiClient.get<HeroSlide[]>('/hero-slides');
}

export function createHeroSlide(data: HeroSlideInput) {
  return apiClient.post<HeroSlide>('/hero-slides', data);
}

export function updateHeroSlide(id: string, data: HeroSlideInput) {
  return apiClient.patch<HeroSlide>(`/hero-slides/${id}`, data);
}

export function deleteHeroSlide(id: string) {
  return apiClient.delete<void>(`/hero-slides/${id}`);
}

export function reorderHeroSlides(orderedIds: string[]) {
  return apiClient.patch<HeroSlide[]>('/hero-slides/reorder', { orderedIds });
}

export function uploadHeroSlideImage(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.postForm<{ url: string }>('/hero-slides/images', formData);
}
