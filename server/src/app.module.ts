import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { DbModule } from './db/db.module';
import { SeedController } from './seed.controller';
import { HealthController } from './health.controller';
import { VocabModule } from './modules/vocab/vocab.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI as string),
    DbModule,
    VocabModule,
  ],
  controllers: [SeedController, HealthController],
})
export class AppModule {}
