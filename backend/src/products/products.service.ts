import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryProductsDto } from './dto/query-products.dto';
import {
  PaginatedProductsResponseDto,
  ProductResponseDto,
} from './dto/product-response.dto';
import { getProductOrderBy } from '../common/product-sort';
import {
  PRODUCT_VENDOR_INCLUDE,
  toProductResponseDto,
} from '../common/product-response';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: QueryProductsDto,
  ): Promise<PaginatedProductsResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const hasPriceFilter =
      query.minPrice !== undefined || query.maxPrice !== undefined;

    const where = {
      // Drafts are only ever visible to their own vendor, via
      // VendorProductsService.findAllForVendor — never in any
      // customer-facing listing.
      status: 'PUBLISHED' as const,
      ...(query.category?.length && {
        category: { slug: { in: query.category } },
      }),
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

  async findOne(idOrSlug: string): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findFirst({
      where: {
        status: 'PUBLISHED',
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: PRODUCT_VENDOR_INCLUDE,
    });

    if (!product) {
      throw new NotFoundException(`Product "${idOrSlug}" not found`);
    }

    return toProductResponseDto(product);
  }
}
