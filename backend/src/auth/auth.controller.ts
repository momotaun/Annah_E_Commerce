import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { PasswordResetDto } from './dto/password-reset.dto';
import { ConfirmPasswordResetDto } from './dto/confirm-password-reset.dto';
import { ConfirmEmailVerificationDto } from './dto/confirm-email-verification.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';

import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute per IP
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('password-reset')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // tightest — prevents email-bombing
  initiatePasswordReset(@Body() dto: PasswordResetDto) {
    return this.authService.initiatePasswordReset(dto.email);
  }

  @Post('password-reset/confirm')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  confirmPasswordReset(@Body() dto: ConfirmPasswordResetDto) {
    return this.authService.confirmPasswordReset(dto.token, dto.newPassword);
  }

  @Post('verify-email/resend')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // tightest — prevents email-bombing
  resendVerificationEmail(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerificationEmail(dto.email);
  }

  @Post('verify-email/confirm')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  confirmEmailVerification(@Body() dto: ConfirmEmailVerificationDto) {
    return this.authService.confirmEmailVerification(dto.token);
  }
}
