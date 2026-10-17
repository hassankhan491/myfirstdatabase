import { Injectable } from '@nestjs/common';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  findAll(userId: string) {
    // Fetch notifications specifically for this user, or global ones (where userId is null)
    return this.prisma.notification.findMany({
      where: {
        OR: [
          { userId: userId },
          { userId: null } // Global notifications
        ]
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  update(id: string, updateNotificationDto: UpdateNotificationDto) {
    return this.prisma.notification.update({
      where: { id },
      data: updateNotificationDto,
    });
  }

  remove(id: string) {
    return this.prisma.notification.delete({
      where: { id },
    });
  }
}