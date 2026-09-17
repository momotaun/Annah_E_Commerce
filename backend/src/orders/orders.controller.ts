import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { OrdersService } from './orders.service';
import { RequestReturnDto } from './dto/request-return.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll(@CurrentUser() user: CurrentUserPayload) {
    return this.ordersService.findAllForUser(user.userId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.ordersService.findOneForUser(user.userId, id);
  }

  @Get(':id/invoice.pdf')
  async downloadInvoice(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
  ): Promise<StreamableFile> {
    const pdf = await this.ordersService.getInvoicePdf(user.userId, id);
    return new StreamableFile(pdf, {
      type: 'application/pdf',
      disposition: `attachment; filename="invoice-${id}.pdf"`,
    });
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  cancel(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.ordersService.cancelOrder(user.userId, id);
  }

  @Post(':id/return-request')
  @HttpCode(HttpStatus.OK)
  requestReturn(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: RequestReturnDto,
  ) {
    return this.ordersService.requestReturn(user.userId, id, dto.reason);
  }
}
