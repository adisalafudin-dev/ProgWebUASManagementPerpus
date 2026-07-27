import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorite } from './entities/favorite.entity';
import { FavoriteService } from './favorite.service';
import { FavoriteController } from './favorite.controller';
import { Book } from 'src/book/entities/book.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Favorite, Book])],
  controllers: [FavoriteController],
  providers: [FavoriteService],
  exports: [TypeOrmModule],
})
export class FavoriteModule {}
