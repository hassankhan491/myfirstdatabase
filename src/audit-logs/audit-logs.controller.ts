import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @Roles('Admin') // Only Admins can view audit logs
  findAll() {
    return this.auditLogsService.findAll();
  }

  @Get(':id')
  @Roles('Admin')
  findOne(@Param('id') id: string) {
    return this.auditLogsService.findOne(id);
  }
}