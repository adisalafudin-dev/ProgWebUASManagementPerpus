// src/books/books.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './entities/book.entity';

import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Category } from 'src/category/entities/category.entity';
import { FindBooksQueryDto } from './dto/find-books-query.dto';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book) private bookRepo: Repository<Book>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
  ) {}

  async create(dto: CreateBookDto) {
    const existingIsbn = await this.bookRepo.findOneBy({ isbn: dto.isbn });
    if (existingIsbn) throw new ConflictException('ISBN sudah terdaftar');

    const category = await this.categoryRepo.findOneBy({ id: dto.categoryId });
    if (!category) throw new NotFoundException('Kategori tidak ditemukan');

    const book = this.bookRepo.create({
      title: dto.title,
      author: dto.author,
      isbn: dto.isbn,
      stock: dto.stock,
      publishedYear: dto.publishedYear ?? null,
      publisher: dto.publisher ?? null,
      synopsis: dto.synopsis ?? null,
      pages: dto.pages ?? null,
      cover: dto.cover ?? null,
      category, // objek Category penuh, bukan cuma ID
    });

    return this.bookRepo.save(book);
  }

  async update(id: string, dto: UpdateBookDto) {
    const book = await this.findOne(id);

    if (dto.categoryId) {
      const category = await this.categoryRepo.findOneBy({
        id: dto.categoryId,
      });
      if (!category) throw new NotFoundException('Kategori tidak ditemukan');
      book.category = category;
    }

    Object.assign(book, {
      title: dto.title ?? book.title,
      author: dto.author ?? book.author,
      isbn: dto.isbn ?? book.isbn,
      stock: dto.stock ?? book.stock,
      publishedYear: dto.publishedYear ?? book.publishedYear,
      publisher: dto.publisher ?? book.publisher,
      synopsis: dto.synopsis ?? book.synopsis,
      pages: dto.pages ?? book.pages,
      cover: dto.cover ?? book.cover,
    });

    return this.bookRepo.save(book);
  }

  async findAll(query: FindBooksQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const qb = this.bookRepo
      .createQueryBuilder('book')
      .leftJoinAndSelect('book.category', 'category');

    if (query.search) {
      qb.andWhere(
        '(LOWER(book.title) LIKE :search OR LOWER(book.author) LIKE :search OR LOWER(book.isbn) LIKE :search)',
        { search: `%${query.search.toLowerCase()}%` },
      );
    }

    if (query.category) {
      qb.andWhere('category.id = :categoryId', { categoryId: query.category });
    }

    qb.orderBy('book.title', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  async findOne(id: string) {
    const book = await this.bookRepo.findOne({
      where: { id },
      relations: { category: true },
    });
    if (!book) throw new NotFoundException('Buku tidak ditemukan');
    return book;
  }

  async remove(id: string) {
    const book = await this.findOne(id);
    await this.bookRepo.remove(book);
    return { message: 'Buku berhasil dihapus' };
  }
}
