import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { OrderRequestsService } from './order-requests.service';
import { CreateOrderRequestDto } from './dto/create-order-request.dto';

@Controller('order-requests')
export class OrderRequestsController {
  constructor(private readonly orderRequestsService: OrderRequestsService) {}

  @Post()
  create(@Body() dto: CreateOrderRequestDto) {
    return this.orderRequestsService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderRequestsService.findOne(id);
  }
}
