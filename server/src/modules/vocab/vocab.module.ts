import { Module } from '@nestjs/common';
import { DbModule } from '../../db/db.module';
import { VocabController } from './vocab.controller';
import { VocabService } from './vocab.service';

@Module({
  imports: [DbModule],
  controllers: [VocabController],
  providers: [VocabService],
})
export class VocabModule {}
