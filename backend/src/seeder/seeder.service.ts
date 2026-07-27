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

// Placeholder cover — selalu valid (tidak pernah broken image), tinggal
// diganti admin lewat form edit buku kalau mau pakai cover asli.
const coverFor = (isbn: string) =>
  `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;

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

  // Klasifikasi Dewey Decimal (DDC) — 10 kelas utama — ditambah 3 kategori
  // umum di luar klasifikasi ilmu (Fiksi/Nonfiksi/Referensi).
  private async seedCategories() {
    const count = await this.categoryRepo.count();
    if (count > 0) {
      this.logger.log('Tabel categories sudah ada data — skip seed kategori.');
      return;
    }

    const names = [
      'Karya Umum, Komputer, dan Informasi',
      'Filsafat dan Psikologi',
      'Agama',
      'Ilmu Sosial',
      'Bahasa',
      'Sains dan Matematika',
      'Teknologi dan Ilmu Terapan',
      'Seni, Musik, dan Olahraga',
      'Sastra dan Bahasa',
      'Sejarah dan Geografi',
      'Fiksi',
      'Nonfiksi',
      'Referensi',
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

    const categories = await this.categoryRepo.find();
    if (categories.length === 0) {
      this.logger.warn('Tidak ada kategori — skip seed buku.');
      return;
    }
    const catMap = new Map(categories.map((c) => [c.name, c]));
    const cat = (...names: string[]) =>
      names.map((n) => catMap.get(n)).filter((c): c is Category => Boolean(c));

    const KOM = 'Karya Umum, Komputer, dan Informasi';
    const FIL = 'Filsafat dan Psikologi';
    const AGM = 'Agama';
    const SOS = 'Ilmu Sosial';
    const BHS = 'Bahasa';
    const SNS = 'Sains dan Matematika';
    const TEK = 'Teknologi dan Ilmu Terapan';
    const SEN = 'Seni, Musik, dan Olahraga';
    const SAS = 'Sastra dan Bahasa';
    const SEJ = 'Sejarah dan Geografi';
    const FIK = 'Fiksi';
    const NON = 'Nonfiksi';
    const REF = 'Referensi';

    const booksData: Array<{
      title: string;
      author: string;
      isbn: string;
      stock: number;
      publishedYear: number;
      publisher: string;
      pages: number;
      cat: string[];
    }> = [
      {
        title: 'Clean Code',
        author: 'Robert C. Martin',
        isbn: '978-0-13-235088-4',
        stock: 6,
        publishedYear: 2008,
        publisher: 'Prentice Hall',
        pages: 464,
        cat: [KOM, TEK],
      },
      {
        title: 'Introduction to Algorithms',
        author: 'Cormen, Leiserson, Rivest, Stein',
        isbn: '978-0-262-03384-8',
        stock: 4,
        publishedYear: 2009,
        publisher: 'MIT Press',
        pages: 1312,
        cat: [KOM],
      },
      {
        title: 'The Pragmatic Programmer',
        author: 'Andrew Hunt & David Thomas',
        isbn: '978-0-13-595705-9',
        stock: 5,
        publishedYear: 1999,
        publisher: 'Addison-Wesley',
        pages: 352,
        cat: [KOM, TEK],
      },
      {
        title: 'Design Patterns',
        author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides',
        isbn: '978-0-201-63361-0',
        stock: 3,
        publishedYear: 1994,
        publisher: 'Addison-Wesley',
        pages: 395,
        cat: [KOM],
      },
      {
        title: 'Clean Architecture',
        author: 'Robert C. Martin',
        isbn: '978-0-13-449416-6',
        stock: 4,
        publishedYear: 2017,
        publisher: 'Prentice Hall',
        pages: 432,
        cat: [TEK, KOM],
      },
      {
        title: 'Meditations',
        author: 'Marcus Aurelius',
        isbn: '978-0-8129-8410-1',
        stock: 3,
        publishedYear: 180,
        publisher: 'Modern Library',
        pages: 254,
        cat: [FIL],
      },
      {
        title: 'Thinking, Fast and Slow',
        author: 'Daniel Kahneman',
        isbn: '978-0-374-27563-1',
        stock: 5,
        publishedYear: 2011,
        publisher: 'Farrar, Straus and Giroux',
        pages: 499,
        cat: [FIL, NON],
      },
      {
        title: "Man's Search for Meaning",
        author: 'Viktor E. Frankl',
        isbn: '978-0-8070-1427-1',
        stock: 4,
        publishedYear: 1946,
        publisher: 'Beacon Press',
        pages: 165,
        cat: [FIL, NON],
      },
      {
        title: 'Fiqih Sunnah',
        author: 'Sayyid Sabiq',
        isbn: '978-979-3653-01-2',
        stock: 5,
        publishedYear: 1946,
        publisher: 'Dar al-Fath',
        pages: 720,
        cat: [AGM],
      },
      {
        title: 'The Case for God',
        author: 'Karen Armstrong',
        isbn: '978-0-307-26918-8',
        stock: 2,
        publishedYear: 2009,
        publisher: 'Knopf',
        pages: 432,
        cat: [AGM],
      },
      {
        title: 'Sapiens: A Brief History of Humankind',
        author: 'Yuval Noah Harari',
        isbn: '978-0-06-231609-7',
        stock: 5,
        publishedYear: 2014,
        publisher: 'Harper',
        pages: 443,
        cat: [SOS, SEJ],
      },
      {
        title: 'Guns, Germs, and Steel',
        author: 'Jared Diamond',
        isbn: '978-0-393-31755-8',
        stock: 3,
        publishedYear: 1997,
        publisher: 'W. W. Norton',
        pages: 480,
        cat: [SOS, SEJ],
      },
      {
        title: 'The Wealth of Nations',
        author: 'Adam Smith',
        isbn: '978-0-486-42962-9',
        stock: 2,
        publishedYear: 1776,
        publisher: 'W. Strahan',
        pages: 1200,
        cat: [SOS],
      },
      {
        title: 'Tata Bahasa Baku Bahasa Indonesia',
        author: 'Hasan Alwi, dkk',
        isbn: '978-979-459-306-0',
        stock: 4,
        publishedYear: 2003,
        publisher: 'Balai Pustaka',
        pages: 483,
        cat: [BHS],
      },
      {
        title: 'English Grammar in Use',
        author: 'Raymond Murphy',
        isbn: '978-1-108-45765-2',
        stock: 6,
        publishedYear: 2019,
        publisher: 'Cambridge University Press',
        pages: 380,
        cat: [BHS, REF],
      },
      {
        title: 'Kamus Besar Bahasa Indonesia',
        author: 'Badan Pengembangan Bahasa',
        isbn: '978-602-437-166-9',
        stock: 3,
        publishedYear: 2016,
        publisher: 'Balai Pustaka',
        pages: 1600,
        cat: [BHS, REF],
      },
      {
        title: 'A Brief History of Time',
        author: 'Stephen Hawking',
        isbn: '978-0-553-38016-3',
        stock: 4,
        publishedYear: 1988,
        publisher: 'Bantam Books',
        pages: 256,
        cat: [SNS],
      },
      {
        title: 'Cosmos',
        author: 'Carl Sagan',
        isbn: '978-0-345-33135-9',
        stock: 3,
        publishedYear: 1980,
        publisher: 'Random House',
        pages: 384,
        cat: [SNS],
      },
      {
        title: 'The Selfish Gene',
        author: 'Richard Dawkins',
        isbn: '978-0-19-857519-1',
        stock: 3,
        publishedYear: 1976,
        publisher: 'Oxford University Press',
        pages: 360,
        cat: [SNS],
      },
      {
        title: 'A Short History of Nearly Everything',
        author: 'Bill Bryson',
        isbn: '978-0-7679-0818-4',
        stock: 4,
        publishedYear: 2003,
        publisher: 'Broadway Books',
        pages: 544,
        cat: [SNS, NON],
      },
      {
        title: 'The Innovators',
        author: 'Walter Isaacson',
        isbn: '978-1-4767-0869-0',
        stock: 3,
        publishedYear: 2014,
        publisher: 'Simon & Schuster',
        pages: 542,
        cat: [TEK, SEJ],
      },
      {
        title: 'The Story of Art',
        author: 'E. H. Gombrich',
        isbn: '978-0-7148-3355-1',
        stock: 2,
        publishedYear: 1950,
        publisher: 'Phaidon Press',
        pages: 688,
        cat: [SEN],
      },
      {
        title: 'Moneyball',
        author: 'Michael Lewis',
        isbn: '978-0-393-32481-5',
        stock: 3,
        publishedYear: 2003,
        publisher: 'W. W. Norton',
        pages: 317,
        cat: [SEN, NON],
      },
      {
        title: 'Bumi Manusia',
        author: 'Pramoedya Ananta Toer',
        isbn: '978-979-9731-30-4',
        stock: 5,
        publishedYear: 1980,
        publisher: 'Hasta Mitra',
        pages: 535,
        cat: [SAS, FIK],
      },
      {
        title: 'Laskar Pelangi',
        author: 'Andrea Hirata',
        isbn: '978-602-241-801-4',
        stock: 6,
        publishedYear: 2005,
        publisher: 'Bentang Pustaka',
        pages: 529,
        cat: [SAS, FIK],
      },
      {
        title: 'Norwegian Wood',
        author: 'Haruki Murakami',
        isbn: '978-0-375-70402-4',
        stock: 4,
        publishedYear: 1987,
        publisher: 'Kodansha',
        pages: 296,
        cat: [SAS, FIK],
      },
      {
        title: '1493: Uncovering the New World Columbus Created',
        author: 'Charles C. Mann',
        isbn: '978-0-307-27824-1',
        stock: 2,
        publishedYear: 2011,
        publisher: 'Knopf',
        pages: 720,
        cat: [SEJ],
      },
      {
        title: 'The Diary of a Young Girl',
        author: 'Anne Frank',
        isbn: '978-0-553-29698-2',
        stock: 4,
        publishedYear: 1947,
        publisher: 'Contact Publishing',
        pages: 283,
        cat: [SEJ, NON],
      },
      {
        title: 'Harry Potter and the Philosopher\u2019s Stone',
        author: 'J.K. Rowling',
        isbn: '978-0-7475-3269-9',
        stock: 8,
        publishedYear: 1997,
        publisher: 'Bloomsbury',
        pages: 223,
        cat: [FIK],
      },
      {
        title: 'Atomic Habits',
        author: 'James Clear',
        isbn: '978-0-7352-1129-2',
        stock: 7,
        publishedYear: 2018,
        publisher: 'Avery',
        pages: 320,
        cat: [NON],
      },
    ];

    const books = booksData.map((b) =>
      this.bookRepo.create({
        title: b.title,
        author: b.author,
        isbn: b.isbn,
        stock: b.stock,
        publishedYear: b.publishedYear,
        publisher: b.publisher,
        pages: b.pages,
        synopsis: null,
        cover: coverFor(b.isbn),
        categories: cat(...b.cat),
      }),
    );

    await this.bookRepo.save(books);
    this.logger.log(`${books.length} buku seeded.`);
  }
}
