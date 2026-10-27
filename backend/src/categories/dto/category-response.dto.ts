export class CategoryResponseDto {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  sortOrder: number;
  createdAt: Date;
  children: CategoryResponseDto[];
}
