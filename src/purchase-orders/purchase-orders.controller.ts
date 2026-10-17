import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UsePipes, ValidationPipe, Request } from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';

@Controller('purchase-orders')
@UseGuards(JwtAuthGuard, RolesGuard) // Protect ALL routes
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @Post()
  @Roles('Admin', 'Manager') 
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createPurchaseOrderDto: CreatePurchaseOrderDto) {
    return this.purchaseOrdersService.create(createPurchaseOrderDto);
  }

  @Get()
  findAll() {
    return this.purchaseOrdersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.purchaseOrdersService.findOne(id);
  }

  @Patch(':id')
  @Roles('Admin', 'Manager')
  @UsePipes(new ValidationPipe({ transform: true }))
  update(@Param('id') id: string, @Body() updatePurchaseOrderDto: UpdatePurchaseOrderDto) {
    return this.purchaseOrdersService.update(id, updatePurchaseOrderDto);
  }

  @Patch(':id/receive')
  @Roles('Admin', 'Manager')
  @UsePipes(new ValidationPipe({ transform: true }))
  receive(
    @Param('id') id: string, 
    @Body() body: { storeId: string },
    @Request() req: any // We get the userId from the JWT payload attached by the guard
  ) {
    return this.purchaseOrdersService.receivePurchaseOrder(id, body.storeId, req.user.id);
  }

  @Delete(':id')
  @Roles('Admin')
  remove(@Param('id') id: string) {
    return this.purchaseOrdersService.remove(id);
  }
}