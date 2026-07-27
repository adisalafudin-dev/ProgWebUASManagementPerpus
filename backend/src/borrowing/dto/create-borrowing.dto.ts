// src/borrowings/dto/create-borrowing.dto.ts
import { IsUUID } from 'class-validator';

export class CreateBorrowingDto {
  @IsUUID()
  bookId: string;
}
