import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { MemberStatus, MemberBorrowStatus } from '../entities/member.entity';

export class CreateMemberDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsOptional()
  @IsString()
  memberNumber?: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsEnum(MemberStatus)
  status?: MemberStatus;

  @IsOptional()
  @IsEnum(MemberBorrowStatus)
  borrowStatus?: MemberBorrowStatus;
}
