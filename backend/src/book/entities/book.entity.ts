// src/books/entities/book.entity.ts
import { Borrowing } from 'src/borrowing/entities/borrowing.entity';
import { Category } from 'src/category/entities/category.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

@Entity('books')
export class Book {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  title: string;

  @Column({ length: 100 })
  author: string;

  @Column({ unique: true })
  isbn: string;

  @Column({ type: 'int', default: 0 })
  stock: number; // jumlah eksemplar tersedia

  @Column({ type: 'int', nullable: true })
  publishedYear: number | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  publisher: string | null;

  @Column({ type: 'text', nullable: true })
  synopsis: string | null;

  @Column({ type: 'int', nullable: true })
  pages: number | null;

  @Column({ type: 'varchar',length: 255, nullable: true })
  cover: string | null; // URL gambar sampul, admin paste link

  @ManyToOne(() => Category, (category) => category.books, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => Borrowing, (borrowing) => borrowing.book)
  borrowings: Borrowing[];
}
