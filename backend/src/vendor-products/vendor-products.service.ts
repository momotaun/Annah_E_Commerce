import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { requireOwnedVendor } from '../vendors/require-owned-vendor';
import { CreateVendorProductDto } from './dto/create-vendor-product.dto';
import { UpdateVendorProductDto } from './dto/update-vendor-product.dto';
import { ArchiveVendorProductDto } from './dto/archive-vendor-product.dto';
import { VendorProductResponseDto } from './dto/vendor-product-response.dto';
import { ProductResponseDto } from 'src/products/dto/product-response.dto';
import { ObjectStorageService } from '../uploads/object-storage.service';

@Injectable()
export class VendorProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly objectStorageService: ObjectStorageService,
  ) {}

  private toResponseDto(product: any): VendorProductResponseDto {
    return { ...product, price: product.price.toString() };
  }

  private toProductResponseDto(product: any): ProductResponseDto {
    return { ...product, price: product.price.toString() };
  }

  // Ownership + this specific store being APPROVED — managing products
  // requires an approved store, not just "the user is a VENDOR somewhere."
  private async requireApprovedVendor(userId: string, vendorId: string) {
    const vendor = await requireOwnedVendor(this.prisma, userId, vendorId);
    if (vendor.status !== 'APPROVED') {
      throw new ForbiddenException('Your vendor account is not approved');
    }
    return vendor;
  }

  async findAllForVendor(
    userId: string,
    vendorId: string,
  ): Promise<VendorProductResponseDto[]> {
    const vendor = await this.requireApprovedVendor(userId, vendorId);
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
    vendorId: string,
    dto: CreateVendorProductDto,
  ): Promise<VendorProductResponseDto> {
    const vendor = await this.requireApprovedVendor(userId, vendorId);

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
      data: {
        ...dto,
        slug,
        vendorId: vendor.id,
        // imageUrl is the primary/thumbnail image everywhere outside the
        // product detail gallery (cards, cart, order line items) — derive
        // it from the uploaded gallery unless the caller set it directly.
        imageUrl: dto.imageUrl ?? dto.images?.[0],
        status: dto.status ?? 'PUBLISHED',
      },
    });

    return this.toResponseDto(product);
  }

  private async requireOwnedProduct(vendorId: string, productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException(`Product "${productId}" not found`);
    }
    if (product.vendorId !== vendorId) {
      throw new ForbiddenException(
        'You do not have permission to modify this product',
      );
    }
    return product;
  }

  async update(
    userId: string,
    vendorId: string,
    productId: string,
    dto: UpdateVendorProductDto,
  ): Promise<VendorProductResponseDto> {
    const vendor = await this.requireApprovedVendor(userId, vendorId);
    await this.requireOwnedProduct(vendor.id, productId);

    const updated = await this.prisma.product.update({
      where: { id: productId },
      data: dto,
    });

    return this.toResponseDto(updated);
  }

  async archive(
    userId: string,
    vendorId: string,
    productId: string,
    dto: ArchiveVendorProductDto,
  ): Promise<VendorProductResponseDto> {
    const vendor = await this.requireApprovedVendor(userId, vendorId);
    await this.requireOwnedProduct(vendor.id, productId);

    const updated = await this.prisma.product.update({
      where: { id: productId },
      data: {
        status: 'ARCHIVED',
        archivedReason: dto.reason,
        archivedDescription: dto.description ?? null,
        archivedAt: new Date(),
      },
    });

    return this.toResponseDto(updated);
  }

  async uploadProductImage(
    userId: string,
    vendorId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    await this.requireApprovedVendor(userId, vendorId);
    return this.objectStorageService.uploadProductImage(file);
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
