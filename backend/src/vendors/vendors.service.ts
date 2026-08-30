import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterVendorDto } from './dto/register-vendor.dto';
import { ApproveVendorDto } from './dto/approve-vendor.dto';
import { VendorResponseDto } from './dto/vendor-response.dto';
import { VendorListItemDto } from './dto/vendor-list-item.dto';

@Injectable()
export class VendorsService {
  constructor(private readonly prisma: PrismaService) {}

  async register(
    userId: string,
    dto: RegisterVendorDto,
  ): Promise<VendorResponseDto> {
    const existing = await this.prisma.vendor.findUnique({ where: { userId } });
    if (existing) {
      throw new ConflictException(
        'You have already submitted a vendor registration',
      );
    }

    // Business role remains CUSTOMER until an admin approves this
    // registration (Section 9.3 Admin Approval Gate) — registering alone
    // does not grant vendor access.
    return this.prisma.vendor.create({
      data: {
        userId,
        businessName: dto.businessName,
        contactEmail: dto.contactEmail,
      },
    });
  }

  async approve(
    vendorId: string,
    dto: ApproveVendorDto,
  ): Promise<VendorResponseDto> {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: vendorId },
    });
    if (!vendor) {
      throw new NotFoundException(`Vendor "${vendorId}" not found`);
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.vendor.update({
        where: { id: vendorId },
        data: {
          status: dto.status,
          approvedAt: dto.status === 'APPROVED' ? new Date() : null,
        },
      });

      // Role and Vendor.status move together deliberately: only an
      // APPROVED vendor's underlying user gains the VENDOR role and
      // therefore access to vendor-only routes. SUSPENDED reverts them
      // to CUSTOMER, immediately revoking vendor route access (RolesGuard
      // re-checks role fresh on every request, so this takes effect
      // without the user needing to log in again).
      await tx.user.update({
        where: { id: vendor.userId },
        data: { role: dto.status === 'APPROVED' ? 'VENDOR' : 'CUSTOMER' },
      });

      return updated;
    });
  }

  async findAll(
    status?: 'PENDING' | 'APPROVED' | 'SUSPENDED',
  ): Promise<VendorListItemDto[]> {
    return this.prisma.vendor.findMany({
      where: status ? { status } : undefined,
      orderBy: { businessName: 'asc' },
    });
  }

  async findPublic(
    id: string,
  ): Promise<VendorResponseDto & { productCount: number }> {
    const vendor = await this.prisma.vendor.findUnique({ where: { id } });
    // Only approved vendors have a public storefront — pending/suspended
    // vendors aren't ready for customer-facing visibility.
    if (!vendor || vendor.status !== 'APPROVED') {
      throw new NotFoundException(`Vendor "${id}" not found`);
    }

    const productCount = await this.prisma.product.count({
      where: { vendorId: vendor.id },
    });

    return { ...vendor, productCount };
  }
}
