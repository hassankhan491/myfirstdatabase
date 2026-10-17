import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

import { AuthModule } from './auth/auth.module';
import { ClientsModule } from './clients/clients.module';
import { StoresModule } from './stores/stores.module';
import { ProductsModule } from './products/products.module';
import { VariantsModule } from './variants/variants.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';
import { OrdersModule } from './orders/orders.module';
import { TransactionsModule } from './transactions/transactions.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    AuthModule,
    ClientsModule,
    StoresModule,
    ProductsModule,
    VariantsModule,
    SuppliersModule,
    PurchaseOrdersModule,
    OrdersModule,
    TransactionsModule,
    AnalyticsModule,
    AuditLogsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}