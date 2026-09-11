import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

// Shared by VendorsService, VendorProductsService, and VendorOrdersService —
// every place that needs "this specific store, and only if the caller owns
// it." Deliberately does NOT check status: PENDING vendors still need this
// to finish onboarding (VendorsService.updateMine et al). Callers that need
// an approved store additionally check status themselves, locally.
export async function requireOwnedVendor(
  prisma: PrismaService,
  userId: string,
  vendorId: string,
) {
  const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
  if (!vendor) {
    throw new NotFoundException(`Vendor "${vendorId}" not found`);
  }
  if (vendor.userId !== userId) {
    throw new ForbiddenException('You do not have access to this store');
  }
  return vendor;
}
