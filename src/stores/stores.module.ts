import { Module } from '@nestjs/common';
import { StoresService } from './stores.service';
import { StoresController } from './stores.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [StoresController],
  providers: [StoresService, PrismaService], // <-- Added PrismaService here
})
export class StoresModule {}