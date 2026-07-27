import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Book } from './entities/book.entity';
import { Category } from 'src/category/entities/category.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { FindBooksQueryDto } from './dto/find-books-query.dto';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book) private bookRepo: Repository<Book>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
  ) {}

  private async resolveCategories(categoryIds: string[]) {
    const categories = await this.categoryRepo.findBy({ id: In(categoryIds) });
    if (categories.length !== categoryIds.length) {
      throw new NotFoundException(
        'Salah satu atau lebih kategori tidak ditemukan',
      );
    }
    return categories;
  }

  async create(dto: CreateBookDto) {
    const existingIsbn = await this.bookRepo.findOneBy({ isbn: dto.isbn });
    if (existingIsbn) throw new ConflictException('ISBN sudah terdaftar');

    const categories = await this.resolveCategories(dto.categoryIds);

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
      categories,
    });

    return this.bookRepo.save(book);
  }

  async findAll(query: FindBooksQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    // Step 1: cari ID + hitung total pakai JOIN tanpa SELECT kolom kategori
    // (leftJoin biasa, BUKAN leftJoinAndSelect) — supaya baris gak duplikat
    // kalau ada buku dengan 2+ kategori, jadi paginasi tetap akurat.
    const qb = this.bookRepo
      .createQueryBuilder('book')
      .leftJoin('book.categories', 'category');

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

    const [books, total] = await qb.getManyAndCount();

    // Step 2: baru load relasi categories penuh, KHUSUS untuk buku di halaman
    // ini saja (bukan semua buku) — supaya response lengkap tanpa merusak
    // paginasi di step 1.
    const bookIds = books.map((book) => book.id);
    const booksWithCategories = bookIds.length
      ? await this.bookRepo.find({
          where: { id: In(bookIds) },
          relations: {
            categories: true,
          },
        })
      : [];

    // find() tidak menjamin urutan sesuai input, jadi urutkan ulang sesuai
    // urutan hasil step 1 (yang sudah benar secara paginasi/sorting).
    const orderedBooks = bookIds
      .map((id) => booksWithCategories.find((book) => book.id === id))
      .filter((book): book is Book => Boolean(book));

    return {
      data: orderedBooks,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  async findOne(id: string) {
    const book = await this.bookRepo.findOne({
      where: { id },
      relations: {
        categories: true,
      },
    });
    if (!book) throw new NotFoundException('Buku tidak ditemukan');
    return book;
  }

  async update(id: string, dto: UpdateBookDto) {
    const book = await this.findOne(id);

    if (dto.categoryIds) {
      book.categories = await this.resolveCategories(dto.categoryIds);
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

  async remove(id: string) {
    const book = await this.findOne(id);
    await this.bookRepo.remove(book);
    return { message: 'Buku berhasil dihapus' };
  }
}
