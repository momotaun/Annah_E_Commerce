import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  addItem(@Body() dto: AddToCartDto) {
    return this.cartService.addItem(dto);
  }

  @Get(':sessionId')
  getCart(@Param('sessionId') sessionId: string) {
    return this.cartService.getCart(sessionId);
  }

  @Patch(':sessionId/items/:itemId')
  updateItem(
    @Param('sessionId') sessionId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItemQuantity(sessionId, itemId, dto);
  }

  @Delete(':sessionId/items/:itemId')
  removeItem(
    @Param('sessionId') sessionId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.cartService.removeItem(sessionId, itemId);
  }
}