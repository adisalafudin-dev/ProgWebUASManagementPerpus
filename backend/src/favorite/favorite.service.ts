import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { Book } from 'src/book/entities/book.entity';
import { CreateFavoriteDto } from './dto/create-favorite.dto';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectRepository(Favorite) private favoriteRepo: Repository<Favorite>,
    @InjectRepository(Book) private bookRepo: Repository<Book>,
  ) {}

  async addFavorite(userId: string, dto: CreateFavoriteDto) {
    const book = await this.bookRepo.findOneBy({ id: dto.bookId });
    if (!book) throw new NotFoundException('Buku tidak ditemukan');

    const existing = await this.favoriteRepo.findOne({
      where: { user: { id: userId }, book: { id: dto.bookId } },
    });
    if (existing) throw new ConflictException('Buku sudah ada di favorit');

    const favorite = this.favoriteRepo.create({
      user: { id: userId } as any,
      book,
    });
    return this.favoriteRepo.save(favorite);
  }

  findAll(userId: string) {
    return this.favoriteRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(userId: string, id: string) {
    const favorite = await this.favoriteRepo.findOne({
      where: { id },
      relations: {
        user: true,
      },
    });
    if (!favorite) throw new NotFoundException('Favorit tidak ditemukan');
    if (favorite.user.id !== userId) {
      throw new ForbiddenException('Bukan favorit milik Anda');
    }
    return favorite;
  }

  async remove(userId: string, id: string) {
    const favorite = await this.findOne(userId, id);
    await this.favoriteRepo.remove(favorite);
    return { message: 'Buku dihapus dari favorit' };
  }

  async removeByBook(userId: string, bookId: string) {
    const favorite = await this.favoriteRepo.findOne({
      where: { user: { id: userId }, book: { id: bookId } },
    });
    if (!favorite) throw new NotFoundException('Favorit tidak ditemukan');
    await this.favoriteRepo.remove(favorite);
    return { message: 'Buku dihapus dari favorit' };
  }

  async check(userId: string, bookId: string) {
    const favorite = await this.favoriteRepo.findOne({
      where: { user: { id: userId }, book: { id: bookId } },
    });
    return { isFavorite: Boolean(favorite), favoriteId: favorite?.id ?? null };
  }
}
