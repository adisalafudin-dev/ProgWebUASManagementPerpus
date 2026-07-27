import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // WAJIB di atas @Get(':id') — kalau di bawah, "unread-count" ketangkep sebagai id.
  @Get('unread-count')
  getUnreadCount(@CurrentUser() user: { sub: string }) {
    return this.notificationService.getUnreadCount(user.sub);
  }

  @Get()
  findAll(@CurrentUser() user: { sub: string }) {
    return this.notificationService.findAll(user.sub);
  }

  @Get(':id')
  findOne(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.notificationService.findOne(user.sub, id);
  }

  @Patch('read-all')
  markAllAsRead(@CurrentUser() user: { sub: string }) {
    return this.notificationService.markAllAsRead(user.sub);
  }

  @Patch(':id/read')
  markAsRead(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.notificationService.markAsRead(user.sub, id);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.notificationService.remove(user.sub, id);
  }
}
