import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryProductsDto } from './dto/query-products.dto';
import {
  PaginatedProductsResponseDto,
  ProductResponseDto,
} from './dto/product-response.dto';
import { getProductOrderBy } from '../common/product-sort';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  private toResponseDto(product: any): ProductResponseDto {
    return {
      ...product,
      price: product.price.toString(),
    };
  }

  async findAll(
    query: QueryProductsDto,
  ): Promise<PaginatedProductsResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const hasPriceFilter =
      query.minPrice !== undefined || query.maxPrice !== undefined;

    const where = {
      ...(query.category && { category: { slug: query.category } }),
      ...(query.vendorId && { vendorId: query.vendorId }),
      ...(hasPriceFilter && {
        price: {
          ...(query.minPrice !== undefined && { gte: query.minPrice }),
          ...(query.maxPrice !== undefined && { lte: query.maxPrice }),
        },
      }),
    };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: getProductOrderBy(query.sort),
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products.map((p) => this.toResponseDto(p)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(idOrSlug: string): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
    });

    if (!product) {
      throw new NotFoundException(`Product "${idOrSlug}" not found`);
    }

    return this.toResponseDto(product);
  }
}
