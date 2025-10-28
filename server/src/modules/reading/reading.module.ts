import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReadingExercise, ReadingExerciseSchema } from '../../db/schemas';
import { ReadingController } from './reading.controller';
import { ReadingService } from './reading.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ReadingExercise.name, schema: ReadingExerciseSchema },
    ]),
  ],
  controllers: [ReadingController],
  providers: [ReadingService],
  exports: [ReadingService],
})
export class ReadingModule {}
