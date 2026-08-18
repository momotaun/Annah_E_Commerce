import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { PrismaService } from '../../prisma/prisma.service';

function mockExecutionContext(userId: string): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user: { userId } }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: { getAllAndOverride: jest.Mock };
  let prisma: { user: { findUnique: jest.Mock } };

  beforeEach(async () => {
    reflector = { getAllAndOverride: jest.fn() };
    prisma = { user: { findUnique: jest.fn() } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        { provide: Reflector, useValue: reflector },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
  });

  it('allows access when no roles are required on the route', async () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    const result = await guard.canActivate(mockExecutionContext('user-1'));

    expect(result).toBe(true);
    expect(prisma.user.findUnique).not.toHaveBeenCalled(); // no DB call needed if nothing to check
  });

  it('allows access when the user currently has the required role', async () => {
    reflector.getAllAndOverride.mockReturnValue(['VENDOR']);
    prisma.user.findUnique.mockResolvedValue({ id: 'user-1', role: 'VENDOR' });

    const result = await guard.canActivate(mockExecutionContext('user-1'));

    expect(result).toBe(true);
  });

  it('denies access when the user does not have the required role', async () => {
    reflector.getAllAndOverride.mockReturnValue(['ADMIN']);
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      role: 'CUSTOMER',
    });

    await expect(
      guard.canActivate(mockExecutionContext('user-1')),
    ).rejects.toThrow(ForbiddenException);
  });

  it('denies access if the user no longer exists', async () => {
    reflector.getAllAndOverride.mockReturnValue(['VENDOR']);
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      guard.canActivate(mockExecutionContext('deleted-user')),
    ).rejects.toThrow(ForbiddenException);
  });

  it('re-checks the role from the database on every call, not from a cached/passed-in value', async () => {
    // This is the specific guarantee the guard was built for: if a vendor
    // gets SUSPENDED mid-session, their still-valid JWT should immediately
    // stop granting VENDOR-gated access, because the role is looked up
    // fresh rather than trusted from the token payload.
    reflector.getAllAndOverride.mockReturnValue(['VENDOR']);
    prisma.user.findUnique.mockResolvedValueOnce({
      id: 'user-1',
      role: 'VENDOR',
    });

    const firstCall = await guard.canActivate(mockExecutionContext('user-1'));
    expect(firstCall).toBe(true);

    // Simulate an admin suspending the vendor between requests
    prisma.user.findUnique.mockResolvedValueOnce({
      id: 'user-1',
      role: 'CUSTOMER',
    });

    await expect(
      guard.canActivate(mockExecutionContext('user-1')),
    ).rejects.toThrow(ForbiddenException);

    expect(prisma.user.findUnique).toHaveBeenCalledTimes(2); // confirms it queried both times, no caching
  });
});