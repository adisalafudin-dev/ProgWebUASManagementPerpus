// src/borrowings/borrowings.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Borrowing, BorrowingStatus } from './entities/borrowing.entity';
import { Book } from 'src/book/entities/book.entity';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/notification/entities/notification.entity';

@Injectable()
export class BorrowingsService {
  constructor(
    @InjectRepository(Borrowing) private borrowingRepo: Repository<Borrowing>,
    private dataSource: DataSource, // dipakai khusus untuk transaction
    private notificationService: NotificationService,
  ) {}

  async borrowBook(userId: string, bookId: string) {
    return this.dataSource.transaction(async (manager) => {
      // 1. Ambil buku DENGAN LOCK supaya tidak ada request lain yang baca stok
      //    bersamaan sebelum kita selesai update (mencegah race condition)
      const book = await manager
        .createQueryBuilder(Book, 'book')
        .setLock('pessimistic_write')
        .where('book.id = :bookId', { bookId })
        .getOne();

      if (!book) throw new NotFoundException('Buku tidak ditemukan');
      if (book.stock <= 0) throw new BadRequestException('Stok buku habis');

      // 2. Kurangi stok
      book.stock -= 1;
      await manager.save(book);

      // 3. Catat peminjaman
      const borrowing = manager.create(Borrowing, {
        user: { id: userId } as any,
        book: { id: bookId } as any,
        status: BorrowingStatus.DIPINJAM,
      });
      const saved = await manager.save(borrowing);

      // 4. Kirim notifikasi ke user
      await this.notificationService.createForUser(
        userId,
        'Peminjaman Berhasil',
        `Anda berhasil meminjam buku "${book.title}". Selamat membaca!`,
        NotificationType.SUCCESS,
      );

      return saved;
    });
  }

  async returnBook(borrowingId: string, userId: string) {
    return this.dataSource.transaction(async (manager) => {
      const borrowing = await manager.findOne(Borrowing, {
        where: { id: borrowingId },
        relations: {
          book: true,
          user: true,
        },
      });

      if (!borrowing)
        throw new NotFoundException('Data peminjaman tidak ditemukan');
      if (borrowing.user.id !== userId) {
        throw new BadRequestException('Ini bukan peminjaman milik Anda');
      }
      if (borrowing.status === BorrowingStatus.DIKEMBALIKAN) {
        throw new BadRequestException('Buku ini sudah dikembalikan sebelumnya');
      }

      borrowing.status = BorrowingStatus.DIKEMBALIKAN;
      borrowing.returnDate = new Date();
      await manager.save(borrowing);

      borrowing.book.stock += 1;
      await manager.save(borrowing.book);

      // Kirim notifikasi ke user
      await this.notificationService.createForUser(
        userId,
        'Pengembalian Berhasil',
        `Buku "${borrowing.book.title}" berhasil dikembalikan. Terima kasih!`,
        NotificationType.INFO,
      );

      return borrowing;
    });
  }

  findMyBorrowings(userId: string) {
    return this.borrowingRepo.find({
      where: { user: { id: userId } },
      relations: {
        book: true,
      },
      order: { borrowDate: 'DESC' },
    });
  }

  findAll() {
    return this.borrowingRepo.find({
      relations: {
        book: true,
        user: true,
      },
      order: { borrowDate: 'DESC' },
    });
  }
}
