import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      user: { findUnique: jest.fn(), update: jest.fn() },
      address: {
        findMany: jest.fn(),
        updateMany: jest.fn(),
        create: jest.fn(),
      },
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
});