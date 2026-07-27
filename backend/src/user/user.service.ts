import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hash } from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  private toSafeUser(user: User) {
    const { password, refreshTokenHash, ...safe } = user;
    return safe;
  }

  async create(dto: CreateUserDto) {
    const existing = await this.userRepo.findOneBy({ email: dto.email });
    if (existing) throw new ConflictException('Email sudah terdaftar');

    const hashedPassword = await hash(dto.password, 10);
    const user = this.userRepo.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: dto.role,
    });
    await this.userRepo.save(user);
    return this.toSafeUser(user);
  }

  async findAll() {
    const users = await this.userRepo.find();
    return users.map((u) => this.toSafeUser(u));
  }

  async findOne(id: string) {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('User tidak ditemukan');
    return this.toSafeUser(user);
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.userRepo.findOneBy({ id });
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
    return this.toSafeUser(user);
  }

  async updateRole(id: string, dto: UpdateUserRoleDto) {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('User tidak ditemukan');

    user.role = dto.role;
    await this.userRepo.save(user);
    return this.toSafeUser(user);
  }

  async remove(id: string) {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('User tidak ditemukan');
    await this.userRepo.remove(user);
    return { message: 'User berhasil dihapus' };
  }
}
