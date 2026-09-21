import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';

@Controller('products/:productId/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  findAll(@Param('productId') productId: string) {
    return this.reviewsService.findAllForProduct(productId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @CurrentUser() user: CurrentUserPayload,
    @Param('productId') productId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.upsert(user.userId, productId, dto);
  }
}
