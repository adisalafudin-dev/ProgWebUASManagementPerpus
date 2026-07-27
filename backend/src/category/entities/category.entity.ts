// src/categories/entities/category.entity.ts
import { Book } from 'src/book/entities/book.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  name: string;

  @OneToMany(() => Book, (book) => book.category)
  books: Book[];
}
