import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerModule, LoggerErrorInterceptor } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PrismaModule } from '../prisma/prisma.module';
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
import { VendorProductsModule } from './vendor-products/vendor-products.module';
import { VendorOrdersModule } from './vendor-orders/vendor-orders.module';
import { AdminModule } from './admin/admin.module';
import { LegalPagesModule } from './legal-pages/legal-pages.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info',
        // The Docker/Compose HEALTHCHECK and any uptime monitor poll this
        // every few seconds — logging each one would drown out real
        // request traffic.
        autoLogging: {
          ignore: (req) => req.url === '/api/health',
        },
        redact: {
          paths: [
            'req.headers.authorization',
            'req.headers.cookie',
            'res.headers["set-cookie"]',
            'req.body.password',
            'req.body.currentPassword',
            'req.body.newPassword',
          ],
          censor: '[REDACTED]',
        },
        // Plain JSON in production (what a log aggregator expects);
        // pino-pretty's human-readable formatting everywhere else.
        transport:
          process.env.NODE_ENV === 'production'
            ? undefined
            : {
                target: 'pino-pretty',
                options: { colorize: true, singleLine: true },
              },
      },
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 100,
        },
      ],
    }),
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
    VendorProductsModule,
    VendorOrdersModule,
    AdminModule,
    LegalPagesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    // Attaches a thrown error to the response so pino-http's own
    // request-completion log line includes the full error/stack, instead
    // of just knowing the request failed. AllExceptionsFilter separately
    // logs and reports each error — this only enriches the access log.
    { provide: APP_INTERCEPTOR, useClass: LoggerErrorInterceptor },
  ],
})
export class AppModule {}
