import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type Id = Types.ObjectId;
export type Doc<T> = HydratedDocument<T>;
export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true }) name: string;
  @Prop({ required: true, unique: true, lowercase: true, index: true })
  email: string;
  @Prop({ required: true }) passwordHash: string;
  @Prop({ type: String, enum: ['A1', 'A2', 'B1', 'B2', 'C1'], default: 'A1' })
  level: Level;
  @Prop() avatarUrl?: string;
  @Prop({ default: () => new Date() }) joinDate?: Date;
  @Prop() lastLogin?: Date;
}
export const UserSchema = SchemaFactory.createForClass(User);

@Schema({ timestamps: true })
export class RawArticle {
  @Prop({ required: true }) source: string;
  @Prop({ required: true }) title: string;
  @Prop({ required: true }) content: string;
  @Prop() url?: string;
  @Prop() publishedAt?: Date;
  @Prop({ default: false, index: true }) processed?: boolean;
}
export const RawArticleSchema = SchemaFactory.createForClass(RawArticle);

@Schema({ timestamps: true })
export class GrammarPoint {
  @Prop({ required: true, index: true }) title: string;
  @Prop() structure?: string;
  @Prop() explanation?: string;
  @Prop({ type: [String], default: [] }) examples?: string[];
}
export const GrammarPointSchema = SchemaFactory.createForClass(GrammarPoint);

@Schema({ timestamps: true })
export class Vocabulary {
  @Prop({ required: true, index: true }) word: string;
  @Prop() meaning?: string;
  @Prop() pronunciation?: string;
  @Prop() example?: string;
  @Prop() topic?: string;
  @Prop({ type: String, enum: ['A1', 'A2', 'B1', 'B2', 'C1'], default: 'A1' })
  level?: Level;
}
export const VocabularySchema = SchemaFactory.createForClass(Vocabulary);

@Schema({ timestamps: true })
export class ReadingExercise {
  @Prop({ required: true }) title: string;
  @Prop({ required: true }) passage: string;
  @Prop() summary?: string;
  @Prop() imageUrl?: string;
  @Prop({
    type: String,
    enum: ['A1', 'A2', 'B1', 'B2', 'C1'],
    default: 'A1',
    index: true,
  })
  level?: Level;
  @Prop() originalUrl?: string;
  @Prop({ default: false }) ai_generated?: boolean;
  @Prop({ type: [Types.ObjectId], ref: 'Vocabulary', default: [] })
  vocabularyList?: Id[];
  @Prop({ type: [Types.ObjectId], ref: 'GrammarPoint', default: [] })
  grammarList?: Id[];
  @Prop({ type: Types.ObjectId, ref: 'RawArticle' }) sourceArticleId?: Id;
  @Prop({ type: Array, default: [] }) user_results?: Array<{
    userId: Id;
    score: number;
    submittedAt: Date;
  }>;
}
export const ReadingExerciseSchema =
  SchemaFactory.createForClass(ReadingExercise);

@Schema({ timestamps: true })
export class ListeningExercise {
  @Prop({ required: true }) title: string;
  @Prop({ required: true }) scriptText: string;
  @Prop({ type: Types.ObjectId, ref: 'ReadingExercise' }) linkedReadingId?: Id;
  @Prop({
    type: String,
    enum: ['A1', 'A2', 'B1', 'B2', 'C1'],
    default: 'A1',
    index: true,
  })
  level?: Level;
  @Prop({ default: false }) ai_generated?: boolean;
  @Prop({ type: Array, default: [] }) questions?: Array<{
    q: string;
    choices?: string[];
    answer?: string;
  }>;
  @Prop({ type: Array, default: [] }) user_results?: Array<{
    userId: Id;
    score: number;
    submittedAt: Date;
  }>;
}
export const ListeningExerciseSchema =
  SchemaFactory.createForClass(ListeningExercise);

@Schema({ timestamps: true })
export class WritingTask {
  @Prop({ required: true }) title: string;
  @Prop({ required: true }) question: string;
  @Prop() sample_answer?: string;
  @Prop({
    type: String,
    enum: ['A1', 'A2', 'B1', 'B2', 'C1'],
    default: 'A1',
    index: true,
  })
  level?: Level;
  @Prop() tips?: string;
  @Prop({ default: false }) ai_generated?: boolean;
  @Prop({ type: Array, default: [] }) user_submissions?: Array<{
    userId: Id;
    content: string;
    score?: number;
    submittedAt: Date;
  }>;
}
export const WritingTaskSchema = SchemaFactory.createForClass(WritingTask);

@Schema({ timestamps: true })
export class SpeakingTask {
  @Prop({ required: true }) title: string;
  @Prop({ required: true }) question: string;
  @Prop() sample_answer?: string;
  @Prop({
    type: String,
    enum: ['A1', 'A2', 'B1', 'B2', 'C1'],
    default: 'A1',
    index: true,
  })
  level?: Level;
  @Prop() tips?: string;
  @Prop({ type: Array, default: [] }) user_submissions?: Array<{
    userId: Id;
    transcript?: string;
    audioUrl?: string;
    score?: number;
    submittedAt: Date;
  }>;
}
export const SpeakingTaskSchema = SchemaFactory.createForClass(SpeakingTask);

@Schema({ timestamps: true })
export class UserProgress {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Id;
  // counters / snapshot
  @Prop({ default: 0 }) vocabLearned?: number;
  @Prop({ default: 0 }) grammarsLearned?: number;
  @Prop({ default: 0 }) readingDone?: number;
  // nguồn & flag
  @Prop() source?: string;
  @Prop() originalUrl?: string;
  @Prop({ default: false }) ai_generated?: boolean;
}
export const UserProgressSchema = SchemaFactory.createForClass(UserProgress);

// ---- re-export names để DbModule import gọn:
