import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CategoryResponseDto } from './dto/category-response.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<CategoryResponseDto[]> {
    // Fetch every category flat, then assemble the parent/child tree in memory
    // rather than a recursive query — simpler and fine at this data volume.
    const categories = await this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    const byId = new Map<string, CategoryResponseDto>(
      categories.map((c) => [c.id, { ...c, children: [] }]),
    );

    const roots: CategoryResponseDto[] = [];

    for (const category of byId.values()) {
      if (category.parentId) {
        const parent = byId.get(category.parentId);
        parent?.children.push(category);
      } else {
        roots.push(category);
      }
    }

    return roots;
  }
}
