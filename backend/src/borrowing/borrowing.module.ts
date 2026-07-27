// src/borrowings/borrowings.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Borrowing } from './entities/borrowing.entity';
import { Book } from 'src/book/entities/book.entity';
import { BorrowingsController } from './borrowing.controller';
import { BorrowingsService } from './borrowing.service';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Borrowing, Book]), // butuh akses ke keduanya
    NotificationModule, // supaya BorrowingsService bisa inject NotificationService
  ],
  controllers: [BorrowingsController],
  providers: [BorrowingsService],
})
export class BorrowingModule {}
