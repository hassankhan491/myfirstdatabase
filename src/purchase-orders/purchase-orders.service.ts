import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { PrismaService } from '../prisma/prisma.service';
import { POStatus } from '@prisma/client';

@Injectable()
export class PurchaseOrdersService {
  constructor(private prisma: PrismaService) {}

  async create(createPurchaseOrderDto: CreatePurchaseOrderDto) {
    // Calculate total cost from items
    const totalCost = createPurchaseOrderDto.items.reduce(
      (sum, item) => sum + item.quantity * item.unitCost,
      0
    );

    return this.prisma.purchaseOrder.create({
      data: {
        supplierId: createPurchaseOrderDto.supplierId,
        notes: createPurchaseOrderDto.notes,
        totalCost: totalCost,
        items: {
          create: createPurchaseOrderDto.items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
            unitCost: item.unitCost,
          })),
        },
      },
      include: { items: true, supplier: true },
    });
  }

  findAll() {
    return this.prisma.purchaseOrder.findMany({
      include: { items: { include: { variant: true } }, supplier: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: { items: { include: { variant: true } }, supplier: true },
    });
  }

  update(id: string, updatePurchaseOrderDto: UpdatePurchaseOrderDto) {
    // Filter out undefined values so Prisma doesn't complain
    const dataToUpdate: any = {};
    if (updatePurchaseOrderDto.notes !== undefined) dataToUpdate.notes = updatePurchaseOrderDto.notes;
    if (updatePurchaseOrderDto.supplierId !== undefined) dataToUpdate.supplierId = updatePurchaseOrderDto.supplierId;

    return this.prisma.purchaseOrder.update({
      where: { id },
      data: dataToUpdate,
      include: { items: true, supplier: true },
    });
  }

  remove(id: string) {
    return this.prisma.purchaseOrder.delete({
      where: { id },
    });
  }

  async receivePurchaseOrder(id: string, storeId: string, userId: string) {
    return this.prisma.$transaction(async (prisma) => {
      // 1. Fetch the PO and its items
      const po = await prisma.purchaseOrder.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!po) throw new NotFoundException('Purchase Order not found');
      if (po.status === POStatus.RECEIVED) {
        throw new BadRequestException('This Purchase Order has already been received.');
      }

      // 2. Update PO Status to RECEIVED
      await prisma.purchaseOrder.update({
        where: { id },
        data: { status: POStatus.RECEIVED },
      });

      // 3. Process each item for Inventory and WAC Calculation
      for (const item of po.items) {
        const variant = await prisma.variant.findUnique({
          where: { id: item.variantId },
        });

        // CRUCIAL CHECK: Prevent error if variant doesn't exist
        if (!variant) {
          throw new NotFoundException(`Variant with ID ${item.variantId} not found.`);
        }

        const oldCost = variant.cost.toNumber();
        
        // Get current inventory for this specific store
        const currentInventory = await prisma.inventory.findUnique({
          where: { 
            variantId_storeId: { variantId: item.variantId, storeId } 
          },
        });

        const currentQty = currentInventory ? currentInventory.quantity : 0;
        const currentAvgCost = currentQty > 0 ? oldCost : 0;

        // WAC Formula: ((Current Qty * Current Avg Cost) + (New Qty * New Unit Cost)) / (Current Qty + New Qty)
        const newTotalQty = currentQty + item.quantity;
        const newTotalValue = (currentQty * currentAvgCost) + (item.quantity * item.unitCost.toNumber());
        const newAvgCost = newTotalQty > 0 ? newTotalValue / newTotalQty : item.unitCost.toNumber();

        // Update the Variant's base cost
        await prisma.variant.update({
          where: { id: item.variantId },
          data: { cost: newAvgCost },
        });

        // Log Price History if the cost actually changed
        if (Math.abs(oldCost - newAvgCost) > 0.001) {
          await prisma.priceHistoryEvent.create({
            data: {
              variantId: item.variantId,
              oldCost: oldCost,
              newCost: item.unitCost.toNumber(),
              averageCost: newAvgCost,
              reason: 'PO Received',
              referenceId: po.id,
            },
          });
        }

        // Update or Create Inventory Record for this store
        if (currentInventory) {
          await prisma.inventory.update({
            where: { id: currentInventory.id },
            data: { quantity: { increment: item.quantity } },
          });
        } else {
          await prisma.inventory.create({
            data: {
              variantId: item.variantId,
              storeId: storeId,
              quantity: item.quantity,
              reservedQuantity: 0,
            },
          });
        }
      }

      // 4. Create Notification for Managers (Phase 10)
      await prisma.notification.create({
        data: {
          title: 'Purchase Order Received',
          message: `A Purchase Order has been marked as received.`,
          targetRoleName: 'Manager',
        },
      });

      // 5. Create Audit Log (Phase 9)
      await prisma.auditLog.create({
        data: {
          userId: userId,
          action: 'RECEIVE',
          module: 'PurchaseOrder',
          targetId: po.id,
        },
      });

      // Return the updated PO
      return this.findOne(id);
    });
  }
}