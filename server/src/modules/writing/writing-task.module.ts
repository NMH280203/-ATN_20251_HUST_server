import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WritingTask, WritingTaskSchema } from '@/db/schemas';
import { WritingTaskController } from './writing-task.controller';
import { WritingTaskService } from './writing-task.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WritingTask.name, schema: WritingTaskSchema },
    ]),
  ],
  providers: [WritingTaskService],
  controllers: [WritingTaskController],
})
export class WritingTaskModule {}
