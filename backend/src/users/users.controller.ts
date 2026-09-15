import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RegisterPushTokenDto } from './dto/register-push-token.dto';
import { AddWishlistItemDto } from './dto/add-wishlist-item.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getProfile(@CurrentUser() user: CurrentUserPayload) {
    return this.usersService.getProfile(user.userId);
  }

  @Patch('me')
  updateProfile(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateProfile(user.userId, dto);
  }

  @Get('me/addresses')
  listAddresses(@CurrentUser() user: CurrentUserPayload) {
    return this.usersService.listAddresses(user.userId);
  }

  @Post('me/addresses')
  addAddress(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateAddressDto,
  ) {
    return this.usersService.addAddress(user.userId, dto);
  }

  @Patch('me/password')
  @HttpCode(HttpStatus.OK)
  changePassword(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(user.userId, dto);
  }

  @Get('me/wishlist')
  listWishlist(@CurrentUser() user: CurrentUserPayload) {
    return this.usersService.listWishlist(user.userId);
  }

  @Post('me/wishlist')
  addWishlistItem(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: AddWishlistItemDto,
  ) {
    return this.usersService.addWishlistItem(user.userId, dto);
  }

  @Delete('me/wishlist/:productId')
  @HttpCode(HttpStatus.OK)
  removeWishlistItem(
    @CurrentUser() user: CurrentUserPayload,
    @Param('productId') productId: string,
  ) {
    return this.usersService.removeWishlistItem(user.userId, productId);
  }

  @Post('me/push-tokens')
  registerPushToken(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: RegisterPushTokenDto,
  ) {
    return this.usersService.registerPushToken(user.userId, dto);
  }

  @Delete('me/push-tokens')
  @HttpCode(HttpStatus.OK)
  unregisterPushToken(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: RegisterPushTokenDto,
  ) {
    return this.usersService.unregisterPushToken(user.userId, dto);
  }
}
