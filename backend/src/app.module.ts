import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PrismaModule } from './prisma/prisma.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { SearchModule } from './search/search.module';
import { CartModule } from './cart/cart.module';
import { OrderRequestsModule } from './order-requests/order-requests.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CheckoutModule } from './checkout/checkout.module';
import { PaymentsModule } from './payments/payments.module';
import { OrdersModule } from './orders/orders.module';
import { VendorsModule } from './vendors/vendors.module';

@Module({
  imports: [
    PrismaModule,
    CategoriesModule,
    ProductsModule,
    SearchModule,
    CartModule,
    OrderRequestsModule,
    AuthModule,
    UsersModule,
    CheckoutModule,
    PaymentsModule,
    OrdersModule,
    VendorsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
