import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { DbModule } from './db/db.module';
import { SeedController } from './seed.controller';
import { HealthController } from './health.controller';
import { VocabModule } from './modules/vocab/vocab.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ReadingModule } from './modules/reading/reading.module';

@Module({
  imports: [
    // Load biến môi trường từ .env
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Kết nối MongoDB
    MongooseModule.forRoot(process.env.MONGODB_URI as string),

    // Đăng ký JWT toàn cục để AuthService có thể dùng
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'supersecretkey',
      signOptions: { expiresIn: '7d' },
    }),

    DbModule,
    VocabModule,
    AuthModule,
    UserModule,
    ReadingModule,
  ],
  controllers: [SeedController, HealthController],
})
export class AppModule {}
