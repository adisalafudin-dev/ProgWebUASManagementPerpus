import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { hash } from 'bcrypt';
import { Member } from './entities/member.entity';
import { User, UserRole } from 'src/user/entities/user.entity';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

const DEFAULT_PASSWORD = 'password';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member) private memberRepo: Repository<Member>,
    private dataSource: DataSource,
  ) {}

  private async assertUnique(
    email: string,
    memberNumber?: string,
    excludeId?: string,
  ) {
    const existingEmail = await this.memberRepo.findOneBy({ email });
    if (existingEmail && existingEmail.id !== excludeId) {
      throw new ConflictException('Email sudah dipakai anggota lain');
    }

    if (memberNumber) {
      const existingNumber = await this.memberRepo.findOneBy({ memberNumber });
      if (existingNumber && existingNumber.id !== excludeId) {
        throw new ConflictException('Nomor anggota sudah dipakai');
      }
    }
  }

  async create(dto: CreateMemberDto) {
    await this.assertUnique(dto.email, dto.memberNumber);

    return this.dataSource.transaction(async (manager) => {
      const existingUser = await manager.findOneBy(User, { email: dto.email });
      let loginAccountCreated = false;
      let linkedUser: User;

      if (existingUser) {
        // Sudah ada akun login dengan email ini (misal dia sudah register sendiri
        // sebelumnya) → link ke situ, JANGAN bikin akun baru / timpa passwordnya.
        linkedUser = existingUser;
      } else {
        const hashedPassword = await hash(DEFAULT_PASSWORD, 10);
        const newUser = manager.create(User, {
          name: dto.name,
          email: dto.email,
          password: hashedPassword,
          role: UserRole.USER,
        });
        linkedUser = await manager.save(newUser);
        loginAccountCreated = true;
      }

      const member = manager.create(Member, {
        name: dto.name,
        memberNumber: dto.memberNumber,
        email: dto.email,
        avatar: dto.avatar,
        status: dto.status,
        borrowStatus: dto.borrowStatus,
        user: linkedUser,
      });
      const savedMember = await manager.save(member);

      return {
        ...savedMember,
        // field tambahan, cuma di response POST — bukan kolom di database.
        // Dipakai frontend buat kasih tau admin kalau ada akun baru dibuat.
        loginAccountCreated,
        defaultPassword: loginAccountCreated ? DEFAULT_PASSWORD : undefined,
      };
    });
  }

  findAll() {
    return this.memberRepo.find({ order: { joinedDate: 'DESC' } });
  }

  async findOne(id: string) {
    const member = await this.memberRepo.findOneBy({ id });
    if (!member) throw new NotFoundException('Anggota tidak ditemukan');
    return member;
  }

  async update(id: string, dto: UpdateMemberDto) {
    const member = await this.findOne(id);

    if (dto.email || dto.memberNumber) {
      await this.assertUnique(dto.email ?? member.email, dto.memberNumber, id);
    }

    // Catatan: ganti email member di sini TIDAK ikut mengubah email akun
    // login (`user.email`) yang terhubung — itu tetap harus diganti terpisah
    // lewat PATCH /auth/me oleh pemilik akunnya sendiri.
    Object.assign(member, {
      name: dto.name ?? member.name,
      memberNumber: dto.memberNumber ?? member.memberNumber,
      email: dto.email ?? member.email,
      avatar: dto.avatar ?? member.avatar,
      status: dto.status ?? member.status,
      borrowStatus: dto.borrowStatus ?? member.borrowStatus,
    });

    return this.memberRepo.save(member);
  }

  async remove(id: string) {
    const member = await this.findOne(id);
    await this.memberRepo.remove(member);
    return { message: 'Anggota berhasil dihapus' };
    // Sengaja TIDAK ikut hapus User terkait — hapus keanggotaan bukan
    // berarti akun login harus ikut hilang.
  }
}
