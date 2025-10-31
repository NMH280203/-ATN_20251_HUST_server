import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ListeningController } from './listening.controller';
import { ListeningService } from './listening.service';
import { ListeningExercise, ListeningExerciseSchema } from '../../db/schemas';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [
    AuthModule, 
    MongooseModule.forFeature([
      { name: ListeningExercise.name, schema: ListeningExerciseSchema },
    ]),
  ],
  controllers: [ListeningController],
  providers: [ListeningService],
  exports: [ListeningService],
})
export class ListeningModule {}
