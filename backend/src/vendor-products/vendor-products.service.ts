import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVendorProductDto } from './dto/create-vendor-product.dto';
import { UpdateVendorProductDto } from './dto/update-vendor-product.dto';
import { VendorProductResponseDto } from './dto/vendor-product-response.dto';
import { ProductResponseDto } from 'src/products/dto/product-response.dto';

@Injectable()
export class VendorProductsService {
  constructor(private readonly prisma: PrismaService) {}

  private toResponseDto(product: any): VendorProductResponseDto {
    return { ...product, price: product.price.toString() };
  }

  private toProductResponseDto(product: any): ProductResponseDto {
    return { ...product, price: product.price.toString() };
  }

  private async requireVendor(userId: string) {
    const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) {
      throw new NotFoundException('No vendor account found for this user');
    }
    if (vendor.status !== 'APPROVED') {
      throw new ForbiddenException('Your vendor account is not approved');
    }
    return vendor;
  }

  async findAllForVendor(userId: string): Promise<VendorProductResponseDto[]> {
    const vendor = await this.requireVendor(userId);
    const products = await this.prisma.product.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: 'desc' },
    });
    return products.map((p) => this.toResponseDto(p));
  }

  async findOne(idOrSlug: string): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
    });

    if (!product) {
      throw new NotFoundException(`Product "${idOrSlug}" not found`);
    }

    return this.toProductResponseDto(product);
  }

  async create(
    userId: string,
    dto: CreateVendorProductDto,
  ): Promise<VendorProductResponseDto> {
    const vendor = await this.requireVendor(userId);

    const existingSku = await this.prisma.product.findUnique({
      where: { sku: dto.sku },
    });
    if (existingSku) {
      throw new ConflictException(`SKU "${dto.sku}" is already in use`);
    }

    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category) {
      throw new NotFoundException(`Category "${dto.categoryId}" not found`);
    }

    const slug = await this.generateUniqueSlug(dto.name);

    const product = await this.prisma.product.create({
      data: { ...dto, slug, vendorId: vendor.id },
    });

    return this.toResponseDto(product);
  }

  async update(
    userId: string,
    productId: string,
    dto: UpdateVendorProductDto,
  ): Promise<VendorProductResponseDto> {
    const vendor = await this.requireVendor(userId);

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException(`Product "${productId}" not found`);
    }
    if (product.vendorId !== vendor.id) {
      throw new ForbiddenException(
        'You do not have permission to modify this product',
      );
    }

    const updated = await this.prisma.product.update({
      where: { id: productId },
      data: dto,
    });

    return this.toResponseDto(updated);
  }

  private slugify(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    const baseSlug = this.slugify(name);
    let slug = baseSlug;
    let attempt = 0;

    while (await this.prisma.product.findFirst({ where: { slug } })) {
      attempt += 1;
      slug = `${baseSlug}-${attempt}`;
    }

    return slug;
  }
}
