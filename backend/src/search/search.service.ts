import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { PaginatedProductsResponseDto } from '../products/dto/product-response.dto';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(query: SearchQueryDto): Promise<PaginatedProductsResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where = {
      OR: [
        { name: { contains: query.q, mode: 'insensitive' as const } },
        { description: { contains: query.q, mode: 'insensitive' as const } },
      ],
    };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products.map((p) => ({ ...p, price: p.price.toString() })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
