import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { VariantsService } from './variants.service';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';

@Controller('variants')
@UseGuards(JwtAuthGuard, RolesGuard) // Protect ALL routes
export class VariantsController {
  constructor(private readonly variantsService: VariantsService) {}

  @Post()
  @Roles('Admin', 'Manager') 
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createVariantDto: CreateVariantDto) {
    return this.variantsService.create(createVariantDto);
  }

  @Get()
  findAll() {
    return this.variantsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.variantsService.findOne(id);
  }

  @Patch(':id')
  @Roles('Admin', 'Manager')
  @UsePipes(new ValidationPipe({ transform: true }))
  update(@Param('id') id: string, @Body() updateVariantDto: UpdateVariantDto) {
    return this.variantsService.update(id, updateVariantDto);
  }

  @Delete(':id')
  @Roles('Admin')
  remove(@Param('id') id: string) {
    return this.variantsService.remove(id);
  }
}