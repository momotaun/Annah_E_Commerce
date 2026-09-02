import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: {
    user: { findUnique: jest.Mock; update: jest.Mock };
    address: { findMany: jest.Mock; updateMany: jest.Mock; create: jest.Mock };
    $transaction: jest.Mock;
  };
  let tx: {
    user: { update: jest.Mock };
    refreshToken: { updateMany: jest.Mock };
  };

  beforeEach(async () => {
    tx = {
      user: { update: jest.fn() },
      refreshToken: { updateMany: jest.fn() },
    };

    prisma = {
      user: { findUnique: jest.fn(), update: jest.fn() },
      address: {
        findMany: jest.fn(),
        updateMany: jest.fn(),
        create: jest.fn(),
      },
      $transaction: jest.fn((callback: (tx: unknown) => unknown) =>
        callback(tx),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('getProfile', () => {
    it('never includes passwordHash in the returned object', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'jane@example.co.za',
        passwordHash: 'super-secret-hash',
        firstName: 'Jane',
        lastName: 'Dlamini',
        createdAt: new Date(),
      });

      const result = await service.getProfile('user-1');

      expect(result).not.toHaveProperty('passwordHash');
      expect(JSON.stringify(result)).not.toContain('super-secret-hash');
    });
  });

  describe('addAddress', () => {
    it('unsets any existing default address before creating a new default one', async () => {
      prisma.address.create.mockResolvedValue({
        id: 'addr-2',
        isDefault: true,
      });

      await service.addAddress('user-1', {
        line1: '123 Main St',
        city: 'Cape Town',
        province: 'Western Cape',
        postalCode: '8001',
        isDefault: true,
      });

      expect(prisma.address.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', isDefault: true },
        data: { isDefault: false },
      });
    });

    it('does not touch existing defaults when the new address is not marked default', async () => {
      prisma.address.create.mockResolvedValue({
        id: 'addr-2',
        isDefault: false,
      });

      await service.addAddress('user-1', {
        line1: '456 Second St',
        city: 'Cape Town',
        province: 'Western Cape',
        postalCode: '8001',
        isDefault: false,
      });

      expect(prisma.address.updateMany).not.toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    it('rejects an incorrect current password without touching the database', async () => {
      const realHash = await bcrypt.hash('correct-password', 12);
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        passwordHash: realHash,
      });

      await expect(
        service.changePassword('user-1', {
          currentPassword: 'wrong-password',
          newPassword: 'newPassword123',
        }),
      ).rejects.toThrow(UnauthorizedException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('updates the password hash and revokes every refresh token when the current password is correct', async () => {
      const realHash = await bcrypt.hash('correct-password', 12);
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        passwordHash: realHash,
      });

      const result = await service.changePassword('user-1', {
        currentPassword: 'correct-password',
        newPassword: 'newPassword123',
      });

      const [updateCall] = tx.user.update.mock.calls[0] as [
        { where: { id: string }; data: { passwordHash: string } },
      ];
      expect(updateCall.where).toEqual({ id: 'user-1' });
      expect(
        await bcrypt.compare('newPassword123', updateCall.data.passwordHash),
      ).toBe(true);

      const [revokeCall] = tx.refreshToken.updateMany.mock.calls[0] as [
        {
          where: { userId: string; revokedAt: null };
          data: { revokedAt: Date };
        },
      ];
      expect(revokeCall.where).toEqual({ userId: 'user-1', revokedAt: null });
      expect(revokeCall.data.revokedAt).toBeInstanceOf(Date);
      expect(result).toEqual({ message: 'Your password has been updated.' });
    });
  });
});
