import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService, MAILER } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConsoleMailer } from './mailer/console.mailer';

@Module({
  imports: [PassportModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    { provide: MAILER, useClass: ConsoleMailer },
  ],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
