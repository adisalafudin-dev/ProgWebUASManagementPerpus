import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { ReviewService } from './review.service';
import { ReviewController, BookReviewsController } from './review.controller';
import { Book } from 'src/book/entities/book.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Book])],
  controllers: [ReviewController, BookReviewsController],
  providers: [ReviewService],
  exports: [TypeOrmModule],
})
export class ReviewModule {}
