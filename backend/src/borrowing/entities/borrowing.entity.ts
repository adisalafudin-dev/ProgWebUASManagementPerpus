// src/borrowings/entities/borrowing.entity.ts
import { Book } from 'src/book/entities/book.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';

export enum BorrowingStatus {
  DIPINJAM = 'dipinjam',
  DIKEMBALIKAN = 'dikembalikan',
}

@Entity('borrowings')
export class Borrowing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.borrowings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Book, (book) => book.borrowings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'book_id' })
  book: Book;

  @Column({
    type: 'enum',
    enum: BorrowingStatus,
    default: BorrowingStatus.DIPINJAM,
  })
  status: BorrowingStatus;

  @CreateDateColumn()
  borrowDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  returnDate: Date | null;
}
