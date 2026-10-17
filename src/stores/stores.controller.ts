import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';

@Controller('stores')
@UseGuards(JwtAuthGuard, RolesGuard) // Protect ALL routes in this controller
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  @Roles('Admin') // Only Admins can create stores
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createStoreDto: CreateStoreDto) {
    return this.storesService.create(createStoreDto);
  }

  @Get()
  findAll() {
    return this.storesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.storesService.findOne(id);
  }

  @Patch(':id')
  @Roles('Admin') // Only Admins can update stores
  @UsePipes(new ValidationPipe({ transform: true }))
  update(@Param('id') id: string, @Body() updateStoreDto: UpdateStoreDto) {
    return this.storesService.update(id, updateStoreDto);
  }

  @Delete(':id')
  @Roles('Admin') // Only Admins can delete stores
  remove(@Param('id') id: string) {
    return this.storesService.remove(id);
  }
}