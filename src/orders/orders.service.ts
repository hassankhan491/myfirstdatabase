import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto) {
    // Calculate total amount if not provided
    const totalAmount = createOrderDto.totalAmount || createOrderDto.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );

    return this.prisma.order.create({
      data: {
        orderNumber: createOrderDto.orderNumber,
        status: createOrderDto.status || 'PENDING',
        totalAmount: totalAmount,
        storeId: createOrderDto.storeId,
        statusHistory: [{ status: createOrderDto.status || 'PENDING', timestamp: new Date().toISOString() }],
        items: {
          create: createOrderDto.items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
      include: { items: { include: { variant: true } }, store: true },
    });
  }

  findAll() {
    return this.prisma.order.findMany({
      include: { items: { include: { variant: true } }, store: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { variant: true } }, store: true },
    });
  }

    async update(id: string, updateOrderDto: UpdateOrderDto) {
    // If status is changing, update the statusHistory JSON array
    if (updateOrderDto.status) {
      const order = await this.prisma.order.findUnique({ where: { id } });
      if (!order) throw new NotFoundException('Order not found');
      
      const history = order.statusHistory as any[];
      history.push({ status: updateOrderDto.status, timestamp: new Date().toISOString() });
      
      // We use the local 'history' variable directly here
      (updateOrderDto as any).statusHistory = history;
    }

    // Filter out undefined values for Prisma
    const dataToUpdate: any = {};
    if (updateOrderDto.status !== undefined) dataToUpdate.status = updateOrderDto.status;
    if (updateOrderDto.totalAmount !== undefined) dataToUpdate.totalAmount = updateOrderDto.totalAmount;
    
    // Use the local variable we set above
    if ((updateOrderDto as any).statusHistory !== undefined) {
      dataToUpdate.statusHistory = (updateOrderDto as any).statusHistory;
    }

    return this.prisma.order.update({
      where: { id },
      data: dataToUpdate,
      include: { items: { include: { variant: true } }, store: true },
    });
  }

  remove(id: string) {
    return this.prisma.order.delete({
      where: { id },
    });
  }
}