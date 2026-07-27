// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { hash, compare } from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User, UserRole } from 'src/user/entities/user.entity';
import { UpdateProfileDto } from 'src/user/dto/update-profile.dto';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenDto } from 'src/user/dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { DataSource } from 'typeorm';
import {
  Member,
  MemberStatus,
  MemberBorrowStatus,
} from 'src/member/entities/member.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(Member) private memberRepo: Repository<Member>,
    private dataSource: DataSource,
  ) {}

  private toProfile(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  private async issueTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload as Record<string, any>, {
      secret:
        this.configService.get<string>('JWT_REFRESH_SECRET') ??
        this.configService.get<string>('JWT_SECRET'),
      // cast to any to satisfy overload types (can be string like '7d' or number)
      expiresIn: this.configService.get<string>(
        'JWT_REFRESH_EXPIRES_IN',
        '7d',
      ) as any,
    });

    user.refreshTokenHash = await hash(refreshToken, 10);
    await this.userRepo.save(user);

    return { accessToken, refreshToken };
  }

  async register(dto: RegisterDto) {
    const existing = await this.userRepo.findOneBy({ email: dto.email });
    if (existing) throw new ConflictException('Email sudah terdaftar');

    const hashedPassword = await hash(dto.password, 10);

    const user = await this.dataSource.transaction(async (manager) => {
      const newUser = manager.create(User, {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        role: UserRole.USER,
      });
      const savedUser = await manager.save(newUser);

      // Kalau admin sudah pernah daftarin dia sebagai member (walk-in) duluan,
      // link ke situ. Kalau belum ada, buat Member baru otomatis.
      const existingMember = await manager.findOneBy(Member, {
        email: dto.email,
      });

      if (existingMember) {
        existingMember.user = savedUser;
        await manager.save(existingMember);
      } else {
        const newMember = manager.create(Member, {
          name: dto.name,
          email: dto.email,
          memberNumber: `LIB-${new Date().getFullYear()}-${savedUser.id.slice(0, 8).toUpperCase()}`,
          status: MemberStatus.ACTIVE,
          borrowStatus: MemberBorrowStatus.NOT_BORROWING,
          user: savedUser,
        });
        await manager.save(newMember);
      }

      return savedUser;
    });

    const tokens = await this.issueTokens(user);
    return { ...tokens, user: this.toProfile(user) };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOneBy({ email: dto.email });
    if (!user) throw new UnauthorizedException('Email atau password salah');

    const isMatch = await compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Email atau password salah');

    const tokens = await this.issueTokens(user);
    return { ...tokens, user: this.toProfile(user) };
  }

  async logout(userId: string) {
    await this.userRepo.update({ id: userId }, { refreshTokenHash: null });
    return { message: 'Logout berhasil' };
  }

  async refresh(dto: RefreshTokenDto) {
    let payload: { sub: string; email: string; role: string };
    try {
      payload = this.jwtService.verify(dto.refreshToken, {
        secret:
          this.configService.get<string>('JWT_REFRESH_SECRET') ??
          this.configService.get<string>('JWT_SECRET'),
      });
    } catch {
      throw new UnauthorizedException(
        'Refresh token tidak valid atau kadaluarsa',
      );
    }

    const user = await this.userRepo.findOne({
      where: { id: payload.sub },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        refreshTokenHash: true,
      },
    });
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException(
        'Sesi tidak ditemukan, silakan login ulang',
      );
    }

    const isValid = await compare(dto.refreshToken, user.refreshTokenHash);
    if (!isValid) throw new UnauthorizedException('Refresh token tidak valid');

    return this.issueTokens(user);
  }

  async getProfile(userId: string) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User tidak ditemukan');
    return this.toProfile(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User tidak ditemukan');

    if (dto.email && dto.email !== user.email) {
      const emailTaken = await this.userRepo.findOneBy({ email: dto.email });
      if (emailTaken)
        throw new ConflictException('Email sudah dipakai user lain');
    }

    Object.assign(user, {
      name: dto.name ?? user.name,
      email: dto.email ?? user.email,
    });

    await this.userRepo.save(user);
    return this.toProfile(user);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: { id: true, password: true },
    });
    if (!user) throw new NotFoundException('User tidak ditemukan');

    const isMatch = await compare(dto.oldPassword, user.password);
    if (!isMatch) throw new UnauthorizedException('Password lama salah');

    user.password = await hash(dto.newPassword, 10);
    await this.userRepo.save(user);

    return { message: 'Password berhasil diubah' };
  }
}
