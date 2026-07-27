import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Get('check/:bookId')
  check(@CurrentUser() user: { sub: string }, @Param('bookId') bookId: string) {
    return this.favoriteService.check(user.sub, bookId);
  }

  @Get()
  findAll(@CurrentUser() user: { sub: string }) {
    return this.favoriteService.findAll(user.sub);
  }

  @Get(':id')
  findOne(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.favoriteService.findOne(user.sub, id);
  }

  @Post()
  create(@CurrentUser() user: { sub: string }, @Body() dto: CreateFavoriteDto) {
    return this.favoriteService.addFavorite(user.sub, dto);
  }

  @Delete('book/:bookId')
  removeByBook(
    @CurrentUser() user: { sub: string },
    @Param('bookId') bookId: string,
  ) {
    return this.favoriteService.removeByBook(user.sub, bookId);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.favoriteService.remove(user.sub, id);
  }
}
