// src/borrowings/borrowings.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateBorrowingDto } from './dto/create-borrowing.dto';
import { BorrowingsService } from './borrowing.service';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { UserRole } from 'src/user/entities/user.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('borrowings')
export class BorrowingsController {
  constructor(private borrowingsService: BorrowingsService) {}

  @Post() // user pinjam buku
  borrow(
    @Body() dto: CreateBorrowingDto,
    @CurrentUser() user: { sub: string },
  ) {
    return this.borrowingsService.borrowBook(user.sub, dto.bookId);
  }

  @Patch(':id/return') // user kembalikan buku
  returnBook(@Param('id') id: string, @CurrentUser() user: { sub: string }) {
    return this.borrowingsService.returnBook(id, user.sub);
  }

  @Get('me') // riwayat peminjaman milik diri sendiri
  findMine(@CurrentUser() user: { sub: string }) {
    return this.borrowingsService.findMyBorrowings(user.sub);
  }

  @Get() // admin lihat SEMUA peminjaman
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.borrowingsService.findAll();
  }
}
