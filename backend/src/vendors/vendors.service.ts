import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ObjectStorageService } from '../uploads/object-storage.service';
import { requireOwnedVendor } from './require-owned-vendor';
import { RegisterVendorDto } from './dto/register-vendor.dto';
import { ApproveVendorDto } from './dto/approve-vendor.dto';
import { UpdateVendorProfileDto } from './dto/update-vendor-profile.dto';
import { VendorResponseDto } from './dto/vendor-response.dto';
import { VendorListItemDto } from './dto/vendor-list-item.dto';

@Injectable()
export class VendorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly objectStorageService: ObjectStorageService,
  ) {}

  // Every store this user owns, any status — powers the "My Stores" picker
  // and the post-login redirect decision (one store vs. several).
  async findAllMine(userId: string): Promise<VendorResponseDto[]> {
    return this.prisma.vendor.findMany({
      where: { userId },
      orderBy: { businessName: 'asc' },
    });
  }

  // A specific store, only if the caller owns it — whatever its status. A
  // just-registered (PENDING) vendor still needs this to finish onboarding.
  async findMine(userId: string, vendorId: string): Promise<VendorResponseDto> {
    return requireOwnedVendor(this.prisma, userId, vendorId);
  }

  async updateMine(
    userId: string,
    vendorId: string,
    dto: UpdateVendorProfileDto,
  ): Promise<VendorResponseDto> {
    const vendor = await requireOwnedVendor(this.prisma, userId, vendorId);

    // contactEmail is unique — surface a clean 409 instead of letting
    // Prisma's P2002 bubble up as a 500.
    if (dto.contactEmail && dto.contactEmail !== vendor.contactEmail) {
      const taken = await this.prisma.vendor.findUnique({
        where: { contactEmail: dto.contactEmail },
      });
      if (taken) {
        throw new ConflictException(
          'That contact email is already used by another vendor',
        );
      }
    }

    return this.prisma.vendor.update({
      where: { id: vendor.id },
      data: {
        ...(dto.businessName !== undefined && {
          businessName: dto.businessName,
        }),
        ...(dto.contactEmail !== undefined && {
          contactEmail: dto.contactEmail,
        }),
        ...(dto.bio !== undefined && { bio: dto.bio }),
        ...(dto.logoUrl !== undefined && { logoUrl: dto.logoUrl }),
      },
    });
  }

  async uploadLogo(
    userId: string,
    vendorId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    // Must own this specific store — the logo belongs to one vendor record,
    // not to the user in general.
    await requireOwnedVendor(this.prisma, userId, vendorId);
    return this.objectStorageService.uploadVendorLogo(file);
  }

  async register(
    userId: string,
    dto: RegisterVendorDto,
  ): Promise<VendorResponseDto> {
    // No limit on how many stores (or concurrent PENDING applications) a
    // user can have — VendorStatus has no REJECTED state, so blocking a
    // second registration while an earlier one sits un-actioned would
    // permanently trap that user. contactEmail's own uniqueness constraint
    // still stops two stores from sharing a contact address.
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

      // Role tracks "owns at least one APPROVED store," not this one
      // store's status — a user with two stores must not be demoted to
      // CUSTOMER just because one of them was suspended while the other
      // stays approved. Recompute from the full set, including the row
      // just updated, rather than trusting the single before/after status.
      const hasApprovedVendor = await tx.vendor.count({
        where: { userId: vendor.userId, status: 'APPROVED' },
      });
      await tx.user.update({
        where: { id: vendor.userId },
        data: { role: hasApprovedVendor > 0 ? 'VENDOR' : 'CUSTOMER' },
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
