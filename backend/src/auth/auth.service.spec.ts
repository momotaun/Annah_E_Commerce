import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import { AuthService, MAILER } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Mailer } from './mailer/mailer.interface';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: {
      findUnique: ReturnType<typeof jest.fn>;
      create: ReturnType<typeof jest.fn>;
      update: ReturnType<typeof jest.fn>;
      findUniqueOrThrow: ReturnType<typeof jest.fn>;
    };
    refreshToken: {
      create: ReturnType<typeof jest.fn>;
      findUnique: ReturnType<typeof jest.fn>;
      update: ReturnType<typeof jest.fn>;
      updateMany: ReturnType<typeof jest.fn>;
    };
    passwordResetToken: {
      create: ReturnType<typeof jest.fn>;
      findUnique: ReturnType<typeof jest.fn>;
      update: ReturnType<typeof jest.fn>;
      deleteMany: ReturnType<typeof jest.fn>;
    };
    $transaction: ReturnType<typeof jest.fn>;
  };
  let jwtService: {
    signAsync: ReturnType<typeof jest.fn>;
    verifyAsync: ReturnType<typeof jest.fn>;
  };
  let mailer: jest.Mocked<Mailer>;

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findUniqueOrThrow: jest.fn(),
      },
      refreshToken: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      passwordResetToken: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        deleteMany: jest.fn(),
      },
      $transaction: jest.fn(),
    };
    prisma.$transaction.mockImplementation(
      (callback: (tx: unknown) => unknown) => callback(prisma),
    );
    jwtService = {
      signAsync: jest.fn().mockResolvedValue('signed.jwt.token'),
      verifyAsync: jest.fn(),
    };
    mailer = {
      sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
        { provide: MAILER, useValue: mailer },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.FRONTEND_URL = 'http://localhost:3000';
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
      expect(
        await bcrypt.compare(
          'plaintext-password',
          createCallArgs.data.passwordHash,
        ),
      ).toBe(true);
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
        service.login({
          email: 'jane@example.co.za',
          password: 'wrong-password',
        }),
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

      const result = await service.login({
        email: 'jane@example.co.za',
        password: 'correct-password',
      });

      expect(result.accessToken).toBeDefined();
      expect(result.user.email).toBe('jane@example.co.za');
    });
  });

  describe('refresh', () => {
    it('rejects a refresh token that has already been revoked', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        sub: 'user-1',
        email: 'jane@example.co.za',
      });
      prisma.refreshToken.findUnique.mockResolvedValue({
        id: 'token-1',
        revokedAt: new Date(), // already used once — rotation should block reuse
        expiresAt: new Date(Date.now() + 100000),
      });

      await expect(service.refresh('some.refresh.token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('rejects an expired refresh token', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        sub: 'user-1',
        email: 'jane@example.co.za',
      });
      prisma.refreshToken.findUnique.mockResolvedValue({
        id: 'token-1',
        revokedAt: null,
        expiresAt: new Date(Date.now() - 1000), // already expired
      });

      await expect(service.refresh('some.refresh.token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('rejects if the JWT itself fails verification', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('invalid signature'));

      await expect(service.refresh('tampered.token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('initiatePasswordReset', () => {
    it('returns the same generic message whether or not the account exists', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await service.initiatePasswordReset(
        'nobody@example.co.za',
      );

      expect(result.message).toMatch(/if an account exists/i);
      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.fn() mock, no `this` binding involved
      expect(mailer.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it('generates a token, persists only its hash, and emails the raw token in the reset link', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'jane@example.co.za',
      });
      prisma.passwordResetToken.deleteMany.mockResolvedValue({});
      prisma.passwordResetToken.create.mockResolvedValue({});

      await service.initiatePasswordReset('jane@example.co.za');

      expect(prisma.passwordResetToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', usedAt: null },
      });
      expect(prisma.passwordResetToken.create).toHaveBeenCalledTimes(1);
      const persisted = (
        prisma.passwordResetToken.create.mock.calls[0][0] as {
          data: { userId: string; tokenHash: string; expiresAt: Date };
        }
      ).data;
      expect(persisted.userId).toBe('user-1');

      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.fn() mock, no `this` binding involved
      expect(mailer.sendPasswordResetEmail).toHaveBeenCalledTimes(1);
      const { to, resetUrl } = mailer.sendPasswordResetEmail.mock.calls[0][0];
      expect(to).toBe('jane@example.co.za');
      expect(resetUrl).toMatch(
        /^http:\/\/localhost:3000\/reset-password\?token=/,
      );

      const rawToken = new URL(resetUrl).searchParams.get('token')!;
      const hashedRaw = createHash('sha256').update(rawToken).digest('hex');
      expect(persisted.tokenHash).toBe(hashedRaw);
    });
  });

  describe('confirmPasswordReset', () => {
    it('rejects an unknown token', async () => {
      prisma.passwordResetToken.findUnique.mockResolvedValue(null);

      await expect(
        service.confirmPasswordReset('bogus-token', 'newPassword123'),
      ).rejects.toThrow(UnauthorizedException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('rejects an already-used token', async () => {
      prisma.passwordResetToken.findUnique.mockResolvedValue({
        id: 'reset-1',
        userId: 'user-1',
        usedAt: new Date(),
        expiresAt: new Date(Date.now() + 100000),
      });

      await expect(
        service.confirmPasswordReset('used-token', 'newPassword123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rejects an expired token', async () => {
      prisma.passwordResetToken.findUnique.mockResolvedValue({
        id: 'reset-1',
        userId: 'user-1',
        usedAt: null,
        expiresAt: new Date(Date.now() - 1000),
      });

      await expect(
        service.confirmPasswordReset('expired-token', 'newPassword123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('updates the password, marks the token used, and revokes existing sessions', async () => {
      prisma.passwordResetToken.findUnique.mockResolvedValue({
        id: 'reset-1',
        userId: 'user-1',
        usedAt: null,
        expiresAt: new Date(Date.now() + 100000),
      });
      prisma.user.update.mockResolvedValue({});
      prisma.passwordResetToken.update.mockResolvedValue({});
      prisma.refreshToken.updateMany.mockResolvedValue({});

      const result = await service.confirmPasswordReset(
        'good-token',
        'newPassword123',
      );

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'user-1' } }),
      );
      const newHash = (
        prisma.user.update.mock.calls[0][0] as {
          data: { passwordHash: string };
        }
      ).data.passwordHash;
      expect(await bcrypt.compare('newPassword123', newHash)).toBe(true);

      expect(prisma.passwordResetToken.update).toHaveBeenCalledWith({
        where: { id: 'reset-1' },
        data: { usedAt: expect.any(Date) as Date },
      });
      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', revokedAt: null },
        data: { revokedAt: expect.any(Date) as Date },
      });
      expect(result).toEqual({ message: 'Your password has been reset.' });
    });
  });
});
