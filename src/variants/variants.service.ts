import { Injectable } from '@nestjs/common';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VariantsService {
  constructor(private prisma: PrismaService) {}

  create(createVariantDto: CreateVariantDto) {
    return this.prisma.variant.create({
      data: createVariantDto,
      include: { product: true },
    });
  }

  findAll() {
    return this.prisma.variant.findMany({
      include: { product: true },
    });
  }

  findOne(id: string) {
    return this.prisma.variant.findUnique({
      where: { id },
      include: { product: true },
    });
  }

  update(id: string, updateVariantDto: UpdateVariantDto) {
    return this.prisma.variant.update({
      where: { id },
      data: updateVariantDto,
      include: { product: true },
    });
  }

  remove(id: string) {
    return this.prisma.variant.delete({
      where: { id },
    });
  }
}