import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getSummary(startDate: Date, endDate: Date) {
    // Create a date filter for Prisma
    const dateFilter: Prisma.DateTimeFilter = {
      gte: startDate,
      lte: endDate,
    };

    // 1. Calculate Total Revenue (Sum of SALE transactions)
    const revenue = await this.prisma.transaction.aggregate({
      where: { type: 'SALE', date: dateFilter },
      _sum: { amount: true },
    });

    // 2. Calculate Total Expenses (Sum of FEE, AGENCY_FEE, PURCHASE transactions)
    const expenses = await this.prisma.transaction.aggregate({
      where: { type: { in: ['FEE', 'AGENCY_FEE', 'PURCHASE'] }, date: dateFilter },
      _sum: { amount: true },
    });

    // 3. Calculate Total Orders
    const totalOrders = await this.prisma.order.count({
      where: { createdAt: dateFilter },
    });

    // 4. Calculate Sales by Marketplace
    const salesByMarketplace = await this.prisma.order.groupBy({
      by: ['storeId'],
      where: { createdAt: dateFilter },
      _sum: { totalAmount: true },
    });
    
    // Map Store IDs to their Marketplace (Amazon/Walmart)
    const stores = await this.prisma.store.findMany({
        where: { id: { in: salesByMarketplace.map(s => s.storeId) } }
    });
    const storeMap = new Map(stores.map(s => [s.id, s.marketplace]));

    const formattedSalesByMarketplace = salesByMarketplace.map(s => ({
        marketplace: storeMap.get(s.storeId) || 'UNKNOWN',
        // FIX: Convert Decimal to Number
        totalSales: s._sum.totalAmount ? s._sum.totalAmount.toNumber() : 0 
    }));

    // FIX: Convert Prisma Decimals to standard Numbers for math operations
    const totalRevenue = revenue._sum.amount ? revenue._sum.amount.toNumber() : 0;
    const totalExpenses = expenses._sum.amount ? expenses._sum.amount.toNumber() : 0;

    return {
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses, // Now this works perfectly!
      totalOrders,
      salesByMarketplace: formattedSalesByMarketplace,
    };
  }
}