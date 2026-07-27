import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Book } from 'src/book/entities/book.entity';

@Entity('favorites')
@Unique(['user', 'book']) // 1 user gak bisa favorite buku yang sama 2x
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Book, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'book_id' })
  book: Book;

  @CreateDateColumn()
  createdAt: Date;
}
