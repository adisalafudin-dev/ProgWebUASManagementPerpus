import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ModerateReviewDto } from './dto/moderate-review.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UserRole } from 'src/user/entities/user.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get()
  findAll(@CurrentUser() user: { sub: string; role: UserRole }) {
    return this.reviewService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewService.findOne(id);
  }

  @Post()
  create(@CurrentUser() user: { sub: string }, @Body() dto: CreateReviewDto) {
    return this.reviewService.create(user.sub, dto);
  }

  @Put(':id')
  update(
    @CurrentUser() user: { sub: string },
    @Param('id') id: string,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviewService.update(user.sub, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: { sub: string; role: UserRole },
    @Param('id') id: string,
  ) {
    return this.reviewService.remove(user, id);
  }

  @Patch(':id/moderate')
  @Roles(UserRole.ADMIN)
  moderate(@Param('id') id: string, @Body() dto: ModerateReviewDto) {
    return this.reviewService.moderate(id, dto);
  }
}

@UseGuards(JwtAuthGuard)
@Controller('books')
export class BookReviewsController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get(':bookId/reviews')
  findByBook(
    @Param('bookId') bookId: string,
    @CurrentUser() user: { sub: string; role: UserRole },
  ) {
    return this.reviewService.findByBook(bookId, user);
  }

  @Get(':bookId/rating-summary')
  getRatingSummary(@Param('bookId') bookId: string) {
    return this.reviewService.getRatingSummary(bookId);
  }
}
