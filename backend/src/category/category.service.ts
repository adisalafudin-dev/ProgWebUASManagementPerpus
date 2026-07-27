// src/categories/categories.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
  ) {}

  async create(dto: CreateCategoryDto) {
    const existing = await this.categoryRepo.findOneBy({ name: dto.name });
    if (existing) throw new ConflictException('Kategori sudah ada');

    const category = this.categoryRepo.create(dto);
    return this.categoryRepo.save(category);
  }

  async findAll() {
    // Fallback: load books relation and compute counts in JS.
    // This ensures `bookCount` is present even if relation-count mapping fails.
    const categories = await this.categoryRepo.find({
      relations: { books: true },
    });
    return categories.map((c) => {
      const { books, ...rest } = c as any;
      return { ...rest, bookCount: Array.isArray(books) ? books.length : 0 };
    });
  }

  async findOne(id: string) {
    const category = await this.categoryRepo.findOneBy({ id });
    if (!category) throw new NotFoundException('Kategori tidak ditemukan');
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.findOne(id); // reuse, sekalian validasi ada/tidaknya
    Object.assign(category, dto);
    return this.categoryRepo.save(category);
  }

  async remove(id: string) {
    const category = await this.findOne(id);
    await this.categoryRepo.remove(category);
    return { message: 'Kategori berhasil dihapus' };
  }
}
