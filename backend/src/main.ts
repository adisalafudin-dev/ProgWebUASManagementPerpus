// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // buang field yang tidak ada di DTO
      forbidNonWhitelisted: true, // tolak request kalau ada field asing/tidak dikenal
      transform: true, // otomatis ubah tipe data (string "5" → number 5, dst)
    }),
  );

  app.enableCors(); // supaya frontend (domain beda) bisa akses API ini

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Server berjalan di http://localhost:${port}`);
}
bootstrap();
