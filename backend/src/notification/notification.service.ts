import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification) private notifRepo: Repository<Notification>,
  ) {}

  // Dipanggil dari modul lain (mis. borrowing) untuk generate notifikasi — bukan lewat HTTP.
  createForUser(
    userId: string,
    title: string,
    message: string,
    type: NotificationType = NotificationType.INFO,
  ) {
    const notif = this.notifRepo.create({
      user: { id: userId } as any,
      title,
      message,
      type,
    });
    return this.notifRepo.save(notif);
  }

  findAll(userId: string) {
    return this.notifRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(userId: string, id: string) {
    const notif = await this.notifRepo.findOne({
      where: { id },
      relations: {
        user: true,
      },
    });
    if (!notif) throw new NotFoundException('Notifikasi tidak ditemukan');
    if (notif.user.id !== userId) {
      throw new ForbiddenException('Bukan notifikasi milik Anda');
    }
    return notif;
  }

  async getUnreadCount(userId: string) {
    const count = await this.notifRepo.count({
      where: { user: { id: userId }, isRead: false },
    });
    return { count };
  }

  async markAsRead(userId: string, id: string) {
    const notif = await this.findOne(userId, id);
    notif.isRead = true;
    return this.notifRepo.save(notif);
  }

  async markAllAsRead(userId: string) {
    await this.notifRepo.update(
      { user: { id: userId }, isRead: false },
      { isRead: true },
    );
    return { message: 'Semua notifikasi ditandai sudah dibaca' };
  }

  async remove(userId: string, id: string) {
    const notif = await this.findOne(userId, id);
    await this.notifRepo.remove(notif);
    return { message: 'Notifikasi berhasil dihapus' };
  }
}
