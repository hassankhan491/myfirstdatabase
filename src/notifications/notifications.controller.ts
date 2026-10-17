import { Controller, Get, Patch, Param, Body, Delete, UseGuards, UsePipes, ValidationPipe, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.notificationsService.findAll(req.user.id);
  }

  @Patch(':id/read')
  @UsePipes(new ValidationPipe({ transform: true }))
  markAsRead(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto) {
    return this.notificationsService.update(id, { isRead: true });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(id);
  }
}