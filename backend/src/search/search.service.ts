import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { PaginatedProductsResponseDto } from '../products/dto/product-response.dto';
import { getProductOrderBy } from '../common/product-sort';
import {
  PRODUCT_VENDOR_INCLUDE,
  toProductResponseDto,
} from '../common/product-response';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(query: SearchQueryDto): Promise<PaginatedProductsResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where = {
      status: 'PUBLISHED' as const,
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
        orderBy: getProductOrderBy(query.sort),
        include: PRODUCT_VENDOR_INCLUDE,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products.map(toProductResponseDto),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
