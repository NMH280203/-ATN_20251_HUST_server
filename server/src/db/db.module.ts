import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  User,
  UserSchema,
  UserProgress,
  UserProgressSchema,
  RawArticle,
  RawArticleSchema,
  ReadingExercise,
  ReadingExerciseSchema,
  ListeningExercise,
  ListeningExerciseSchema,
  GrammarPoint,
  GrammarPointSchema,
  Vocabulary,
  VocabularySchema,
  WritingTask,
  WritingTaskSchema,
  SpeakingTask,
  SpeakingTaskSchema,
} from './schemas/index';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserProgress.name, schema: UserProgressSchema },
      { name: RawArticle.name, schema: RawArticleSchema },
      { name: ReadingExercise.name, schema: ReadingExerciseSchema },
      { name: ListeningExercise.name, schema: ListeningExerciseSchema },
      { name: GrammarPoint.name, schema: GrammarPointSchema },
      { name: Vocabulary.name, schema: VocabularySchema },
      { name: WritingTask.name, schema: WritingTaskSchema },
      { name: SpeakingTask.name, schema: SpeakingTaskSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DbModule {}
