import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: {
      findUnique: ReturnType<typeof jest.fn>;
      create: ReturnType<typeof jest.fn>;
      findUniqueOrThrow: ReturnType<typeof jest.fn>;
    };
    refreshToken: {
      create: ReturnType<typeof jest.fn>;
      findUnique: ReturnType<typeof jest.fn>;
      update: ReturnType<typeof jest.fn>;
    };
  };
  let jwtService: {
    signAsync: ReturnType<typeof jest.fn>;
    verifyAsync: ReturnType<typeof jest.fn>;
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findUniqueOrThrow: jest.fn(),
      },
      refreshToken: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };
    jwtService = {
      signAsync: jest.fn().mockResolvedValue('signed.jwt.token'),
      verifyAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
  });

  describe('register', () => {
    it('throws ConflictException if email already exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'existing-user' });

      await expect(
        service.register({
          email: 'jane@example.co.za',
          password: 'password123',
          firstName: 'Jane',
          lastName: 'Dlamini',
        }),
      ).rejects.toThrow(ConflictException);

      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('hashes the password before storing it, never stores plaintext', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'new-user',
        email: 'jane@example.co.za',
        firstName: 'Jane',
        lastName: 'Dlamini',
      });
      prisma.refreshToken.create.mockResolvedValue({});

      await service.register({
        email: 'jane@example.co.za',
        password: 'plaintext-password',
        firstName: 'Jane',
        lastName: 'Dlamini',
      });

      const createCallArgs = prisma.user.create.mock.calls[0][0];
      expect(createCallArgs.data.passwordHash).not.toBe('plaintext-password');
      expect(await bcrypt.compare('plaintext-password', createCallArgs.data.passwordHash)).toBe(true);
    });

    it('returns access and refresh tokens on successful registration', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'new-user',
        email: 'jane@example.co.za',
        firstName: 'Jane',
        lastName: 'Dlamini',
      });
      prisma.refreshToken.create.mockResolvedValue({});

      const result = await service.register({
        email: 'jane@example.co.za',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Dlamini',
      });

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user.email).toBe('jane@example.co.za');
    });
  });

  describe('login', () => {
    it('throws UnauthorizedException for a nonexistent email', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nobody@example.co.za', password: 'anything' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException for an incorrect password', async () => {
      const correctHash = await bcrypt.hash('correct-password', 12);
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'jane@example.co.za',
        passwordHash: correctHash,
      });

      await expect(
        service.login({ email: 'jane@example.co.za', password: 'wrong-password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('succeeds and issues tokens for correct credentials', async () => {
      const correctHash = await bcrypt.hash('correct-password', 12);
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'jane@example.co.za',
        passwordHash: correctHash,
        firstName: 'Jane',
        lastName: 'Dlamini',
      });
      prisma.refreshToken.create.mockResolvedValue({});

      const result = await service.login({ email: 'jane@example.co.za', password: 'correct-password' });

      expect(result.accessToken).toBeDefined();
      expect(result.user.email).toBe('jane@example.co.za');
    });
  });

  describe('refresh', () => {
    it('rejects a refresh token that has already been revoked', async () => {
      jwtService.verifyAsync.mockResolvedValue({ sub: 'user-1', email: 'jane@example.co.za' });
      prisma.refreshToken.findUnique.mockResolvedValue({
        id: 'token-1',
        revokedAt: new Date(), // already used once — rotation should block reuse
        expiresAt: new Date(Date.now() + 100000),
      });

      await expect(service.refresh('some.refresh.token')).rejects.toThrow(UnauthorizedException);
    });

    it('rejects an expired refresh token', async () => {
      jwtService.verifyAsync.mockResolvedValue({ sub: 'user-1', email: 'jane@example.co.za' });
      prisma.refreshToken.findUnique.mockResolvedValue({
        id: 'token-1',
        revokedAt: null,
        expiresAt: new Date(Date.now() - 1000), // already expired
      });

      await expect(service.refresh('some.refresh.token')).rejects.toThrow(UnauthorizedException);
    });

    it('rejects if the JWT itself fails verification', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('invalid signature'));

      await expect(service.refresh('tampered.token')).rejects.toThrow(UnauthorizedException);
    });
  });
});