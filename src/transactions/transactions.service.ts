import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  create(createTransactionDto: CreateTransactionDto) {
    return this.prisma.transaction.create({
      data: createTransactionDto,
      include: { order: true },
    });
  }

  findAll() {
    return this.prisma.transaction.findMany({
      include: { order: true },
      orderBy: { date: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.transaction.findUnique({
      where: { id },
      include: { order: true },
    });
  }

  update(id: string, updateTransactionDto: UpdateTransactionDto) {
    // Filter out undefined values for Prisma
    const dataToUpdate: any = {};
    if (updateTransactionDto.type !== undefined) dataToUpdate.type = updateTransactionDto.type;
    if (updateTransactionDto.amount !== undefined) dataToUpdate.amount = updateTransactionDto.amount;
    if (updateTransactionDto.description !== undefined) dataToUpdate.description = updateTransactionDto.description;
    if (updateTransactionDto.date !== undefined) dataToUpdate.date = updateTransactionDto.date;
    if (updateTransactionDto.orderId !== undefined) dataToUpdate.orderId = updateTransactionDto.orderId;

    return this.prisma.transaction.update({
      where: { id },
      data: dataToUpdate,
      include: { order: true },
    });
  }

  remove(id: string) {
    return this.prisma.transaction.delete({
      where: { id },
    });
  }
}