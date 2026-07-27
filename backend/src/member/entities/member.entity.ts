import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';

export enum MemberStatus {
  ACTIVE = 'Aktif',
  INACTIVE = 'Nonaktif',
}

export enum MemberBorrowStatus {
  NOT_BORROWING = 'Tidak Meminjam',
  BORROWING = 'Sedang Meminjam',
  OVERDUE = 'Terlambat',
}

@Entity('members')
export class Member {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  memberNumber: string | null;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  avatar: string | null;

  @Column({ type: 'enum', enum: MemberStatus, default: MemberStatus.ACTIVE })
  status: MemberStatus;

  @Column({
    type: 'enum',
    enum: MemberBorrowStatus,
    default: MemberBorrowStatus.NOT_BORROWING,
  })
  borrowStatus: MemberBorrowStatus;

  @OneToOne(() => User, { nullable: true, eager: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User | null; // akun login yang terhubung ke keanggotaan ini

  @CreateDateColumn()
  joinedDate: Date;
}
