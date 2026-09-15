import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import {
  PRODUCT_VENDOR_INCLUDE,
  toProductResponseDto,
} from '../common/product-response';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RegisterPushTokenDto } from './dto/register-push-token.dto';
import { AddWishlistItemDto } from './dto/add-wishlist-item.dto';
import { UserResponseDto, AddressResponseDto } from './dto/user-response.dto';
import { WishlistItemResponseDto } from './dto/wishlist-item-response.dto';

const SALT_ROUNDS = 12;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  async updateProfile(
    userId: string,
    dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  async listAddresses(userId: string): Promise<AddressResponseDto[]> {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' },
    });
  }

  async addAddress(
    userId: string,
    dto: CreateAddressDto,
  ): Promise<AddressResponseDto> {
    // If this new address is marked default, unset any existing default first
    // so exactly one address is ever the default at a time.
    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.create({
      data: { ...dto, userId },
    });
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const currentValid = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!currentValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: userId }, data: { passwordHash } });

      // Matches AuthService's password-reset behavior: changing the
      // password invalidates every other session, since it's often
      // prompted by a compromised account. The current session's access
      // token keeps working until it naturally expires (it's stateless
      // and can't be individually revoked), but every refresh token stops
      // working immediately.
      await tx.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    });

    return { message: 'Your password has been updated.' };
  }

  async registerPushToken(
    userId: string,
    dto: RegisterPushTokenDto,
  ): Promise<{ message: string }> {
    // Upsert on the token, not (userId, token): the same device can end up
    // logged in as a different user later (shared device, or a re-login
    // after logout), and the token should follow whoever is current.
    await this.prisma.pushToken.upsert({
      where: { token: dto.token },
      create: { userId, token: dto.token },
      update: { userId },
    });
    return { message: 'Push token registered.' };
  }

  async listWishlist(userId: string): Promise<WishlistItemResponseDto[]> {
    const items = await this.prisma.wishlistItem.findMany({
      where: { userId },
      include: { product: { include: PRODUCT_VENDOR_INCLUDE } },
      orderBy: { createdAt: 'desc' },
    });

    return items.map((item) => ({
      id: item.id,
      productId: item.productId,
      product: toProductResponseDto(item.product),
      createdAt: item.createdAt,
    }));
  }

  async addWishlistItem(
    userId: string,
    dto: AddWishlistItemDto,
  ): Promise<{ id: string; productId: string; createdAt: Date }> {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product) {
      throw new NotFoundException(`Product "${dto.productId}" not found`);
    }

    // Idempotent: saving an already-saved product just returns the
    // existing row instead of erroring, since the client can't always
    // know in advance whether it's already there.
    return this.prisma.wishlistItem.upsert({
      where: { userId_productId: { userId, productId: dto.productId } },
      create: { userId, productId: dto.productId },
      update: {},
      select: { id: true, productId: true, createdAt: true },
    });
  }

  async removeWishlistItem(userId: string, productId: string): Promise<void> {
    await this.prisma.wishlistItem.deleteMany({
      where: { userId, productId },
    });
  }

  async unregisterPushToken(
    userId: string,
    dto: RegisterPushTokenDto,
  ): Promise<{ message: string }> {
    // Scoped to this user too, not just the token, so one user can't
    // unregister a token that has since started following another user
    // (see the shared-device note above).
    await this.prisma.pushToken.deleteMany({
      where: { userId, token: dto.token },
    });
    return { message: 'Push token unregistered.' };
  }
}
