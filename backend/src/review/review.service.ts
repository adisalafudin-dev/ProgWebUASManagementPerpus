import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review, ReviewStatus } from './entities/review.entity';
import { Book } from 'src/book/entities/book.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ModerateReviewDto } from './dto/moderate-review.dto';
import { UserRole } from 'src/user/entities/user.entity';

type CurrentUser = { sub: string; role: UserRole };

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review) private reviewRepo: Repository<Review>,
    @InjectRepository(Book) private bookRepo: Repository<Book>,
  ) {}

  private visibilityFilter(requester: CurrentUser) {
    // Admin lihat semua status. User biasa cuma lihat yang approved + review miliknya sendiri.
    return requester.role === UserRole.ADMIN ? {} : undefined; // ditangani manual di query karena butuh OR
  }

  async create(userId: string, dto: CreateReviewDto) {
    const book = await this.bookRepo.findOneBy({ id: dto.bookId });
    if (!book) throw new NotFoundException('Buku tidak ditemukan');

    const existing = await this.reviewRepo.findOne({
      where: { user: { id: userId }, book: { id: dto.bookId } },
    });
    if (existing)
      throw new ConflictException('Anda sudah pernah mereview buku ini');

    const review = this.reviewRepo.create({
      user: { id: userId } as any,
      book,
      rating: dto.rating,
      comment: dto.comment,
      status: ReviewStatus.PENDING,
    });
    return this.reviewRepo.save(review);
  }

  async findAll(requester: CurrentUser) {
    if (requester.role === UserRole.ADMIN) {
      return this.reviewRepo.find({
        relations: {
          book: true,
        },
        order: { createdAt: 'DESC' },
      });
    }

    return this.reviewRepo
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.book', 'book')
      .leftJoinAndSelect('review.user', 'user')
      .where('review.status = :approved', { approved: ReviewStatus.APPROVED })
      .orWhere('user.id = :userId', { userId: requester.sub })
      .orderBy('review.createdAt', 'DESC')
      .getMany();
  }

  async findByBook(bookId: string, requester: CurrentUser) {
    const qb = this.reviewRepo
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .where('review.book_id = :bookId', { bookId });

    if (requester.role !== UserRole.ADMIN) {
      qb.andWhere('(review.status = :approved OR user.id = :userId)', {
        approved: ReviewStatus.APPROVED,
        userId: requester.sub,
      });
    }

    return qb.orderBy('review.createdAt', 'DESC').getMany();
  }

  async findOne(id: string) {
    const review = await this.reviewRepo.findOne({
      where: { id },
      relations: {
        book: true,
        user: true,
      },
    });
    if (!review) throw new NotFoundException('Review tidak ditemukan');
    return review;
  }

  async update(userId: string, id: string, dto: UpdateReviewDto) {
    const review = await this.findOne(id);
    if (review.user.id !== userId) {
      throw new ForbiddenException('Bukan review milik Anda');
    }

    Object.assign(review, {
      rating: dto.rating ?? review.rating,
      comment: dto.comment ?? review.comment,
      status: ReviewStatus.PENDING, // edit ulang → perlu di-approve lagi
    });

    return this.reviewRepo.save(review);
  }

  async remove(requester: CurrentUser, id: string) {
    const review = await this.findOne(id);
    if (review.user.id !== requester.sub && requester.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Bukan review milik Anda');
    }
    await this.reviewRepo.remove(review);
    return { message: 'Review berhasil dihapus' };
  }

  async moderate(id: string, dto: ModerateReviewDto) {
    const review = await this.findOne(id);
    review.status = dto.status;
    return this.reviewRepo.save(review);
  }

  async getRatingSummary(bookId: string) {
    const result = await this.reviewRepo
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'average')
      .addSelect('COUNT(review.id)', 'count')
      .where('review.book_id = :bookId', { bookId })
      .andWhere('review.status = :status', { status: ReviewStatus.APPROVED })
      .getRawOne();

    return {
      average: result.average ? parseFloat(Number(result.average).toFixed(1)) : 0,
      count: parseInt(result.count, 10),
    };
  }
}
