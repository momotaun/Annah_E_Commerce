export class CategoryResponseDto {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  createdAt: Date;
  children: CategoryResponseDto[];
}
