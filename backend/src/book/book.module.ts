// src/books/books.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { BooksService } from './book.service';
import { BooksController } from './book.controller';
import { CategoriesModule } from 'src/category/category.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Book]),
    CategoriesModule, // supaya BooksService bisa @InjectRepository(Category)
  ],
  controllers: [BooksController],
  providers: [BooksService],
  exports: [TypeOrmModule],
})
export class BooksModule {}
