import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { BorrowingModule } from './borrowing/borrowing.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './category/category.module';
import { BooksModule } from './book/book.module';
import { MemberModule } from './member/member.module';
import { FavoriteModule } from './favorite/favorite.module';
import { ReviewModule } from './review/review.module';
import { NotificationModule } from './notification/notification.module';
import { SeederModule } from './seeder/seeder.module';

@Module({
  imports: [
    // Load environment variables globally
    ConfigModule.forRoot({ isGlobal: true }),

    // Configure TypeORM asynchronously using environment variables
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true, // Automatically registers entities inside modules
        synchronize: true, // Set to false in production to prevent data loss!
        entities: [], // Load all entities from the project
      }),
    }),
    UserModule,
    BorrowingModule,
    CategoriesModule,
    BooksModule,
    AuthModule,
    MemberModule,
    FavoriteModule,
    ReviewModule,
    NotificationModule,
    SeederModule,
  ],
})
export class AppModule {}
