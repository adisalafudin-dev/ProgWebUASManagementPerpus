// src/seeder/seeder.service.ts
// Seeder idempotent — cek dulu apakah data sudah ada sebelum insert.
// Dijalankan otomatis saat aplikasi start via OnApplicationBootstrap.
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hash } from 'bcrypt';
import { User, UserRole } from 'src/user/entities/user.entity';
import { Category } from 'src/category/entities/category.entity';
import { Book } from 'src/book/entities/book.entity';

@Injectable()
export class SeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    @InjectRepository(Book) private bookRepo: Repository<Book>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedAdmin();
    await this.seedCategories();
    await this.seedBooks();
  }

  private async seedAdmin() {
    const count = await this.userRepo.count();
    if (count > 0) {
      this.logger.log('Tabel users sudah ada data — skip seed admin.');
      return;
    }

    const admin = this.userRepo.create({
      name: 'Administrator',
      email: 'admin@perpustakaan.com',
      password: await hash('admin123', 10),
      role: UserRole.ADMIN,
    });
    await this.userRepo.save(admin);
    this.logger.log(
      'Admin seeded → email: admin@perpustakaan.com / password: admin123',
    );
  }

  private async seedCategories() {
    const count = await this.categoryRepo.count();
    if (count > 0) {
      this.logger.log('Tabel categories sudah ada data — skip seed kategori.');
      return;
    }

    const names = [
      'Fiksi',
      'Non-Fiksi',
      'Sains',
      'Sejarah',
      'Teknologi',
      'Sastra',
    ];
    const categories = names.map((name) => this.categoryRepo.create({ name }));
    await this.categoryRepo.save(categories);
    this.logger.log(`${categories.length} kategori seeded.`);
  }

  private async seedBooks() {
    const count = await this.bookRepo.count();
    if (count > 0) {
      this.logger.log('Tabel books sudah ada data — skip seed buku.');
      return;
    }

    // Ambil kategori yang sudah ada (bisa dari seed atau manual)
    const categories = await this.categoryRepo.find();
    if (categories.length === 0) {
      this.logger.warn('Tidak ada kategori — skip seed buku.');
      return;
    }

    const catMap = new Map(categories.map((c) => [c.name, c]));

    const booksData = [
      {
        title: 'Laskar Pelangi',
        author: 'Andrea Hirata',
        isbn: '978-602-241-801-4',
        stock: 5,
        publishedYear: 2005,
        publisher: 'Bentang Pustaka',
        synopsis:
          'Kisah inspiratif anak-anak Belitong yang berjuang mengejar pendidikan di tengah keterbatasan.',
        pages: 529,
        cover: 'https://images-na.ssl-images-amazon.com/images/I/51yjvTWs4bL.jpg',
        categoryName: 'Fiksi',
      },
      {
        title: 'Sapiens: A Brief History of Humankind',
        author: 'Yuval Noah Harari',
        isbn: '978-0-06-231609-7',
        stock: 3,
        publishedYear: 2014,
        publisher: 'Harper',
        synopsis:
          'Sebuah penelusuran sejarah manusia dari Zaman Batu sampai era Silicon.',
        pages: 443,
        cover: 'https://images-na.ssl-images-amazon.com/images/I/41yu2qXhXXL.jpg',
        categoryName: 'Sejarah',
      },
      {
        title: 'A Brief History of Time',
        author: 'Stephen Hawking',
        isbn: '978-0-553-38016-3',
        stock: 4,
        publishedYear: 1988,
        publisher: 'Bantam Books',
        synopsis:
          'Penjelasan populer tentang kosmologi, lubang hitam, dan asal-usul alam semesta.',
        pages: 256,
        cover: 'https://images-na.ssl-images-amazon.com/images/I/51+GySc8ExL.jpg',
        categoryName: 'Sains',
      },
      {
        title: 'Clean Code',
        author: 'Robert C. Martin',
        isbn: '978-0-13-235088-4',
        stock: 6,
        publishedYear: 2008,
        publisher: 'Prentice Hall',
        synopsis:
          'Panduan menulis kode yang bersih, mudah dibaca, dan mudah dipelihara.',
        pages: 464,
        cover: 'https://images-na.ssl-images-amazon.com/images/I/41xShlnTZTL.jpg',
        categoryName: 'Teknologi',
      },
      {
        title: 'Bumi Manusia',
        author: 'Pramoedya Ananta Toer',
        isbn: '978-979-9731-30-4',
        stock: 4,
        publishedYear: 1980,
        publisher: 'Hasta Mitra',
        synopsis:
          'Novel pertama dari Tetralogi Buru yang mengangkat kisah di era kolonial Hindia Belanda.',
        pages: 535,
        cover: 'https://images-na.ssl-images-amazon.com/images/I/51xDuWljS0L.jpg',
        categoryName: 'Sastra',
      },
      {
        title: 'Atomic Habits',
        author: 'James Clear',
        isbn: '978-0-7352-1129-2',
        stock: 7,
        publishedYear: 2018,
        publisher: 'Avery',
        synopsis:
          'Cara membangun kebiasaan baik dan menghilangkan kebiasaan buruk melalui perubahan kecil yang konsisten.',
        pages: 320,
        cover: 'https://images-na.ssl-images-amazon.com/images/I/51-nXsSRfZL.jpg',
        categoryName: 'Non-Fiksi',
      },
    ];

    const books = booksData.map((b) => {
      const { categoryName, ...rest } = b;
      return this.bookRepo.create({
        ...rest,
        categories: [catMap.get(categoryName) || categories[0]],
      });
    });

    await this.bookRepo.save(books);
    this.logger.log(`${books.length} buku seeded.`);
  }
}
