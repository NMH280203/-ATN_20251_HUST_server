import { Body, Controller, Post } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  User,
  Vocabulary,
  GrammarPoint,
  RawArticle,
  ReadingExercise,
  ListeningExercise,
  WritingTask,
  SpeakingTask,
  UserProgress,
} from './db/schemas/index';

@Controller('seed')
export class SeedController {
  constructor(
    @InjectModel(User.name) private users: Model<User>,
    @InjectModel(Vocabulary.name) private vocabs: Model<Vocabulary>,
    @InjectModel(GrammarPoint.name) private grammars: Model<GrammarPoint>,
    @InjectModel(RawArticle.name) private articles: Model<RawArticle>,
    @InjectModel(ReadingExercise.name)
    private readings: Model<ReadingExercise>,
    @InjectModel(ListeningExercise.name)
    private listenings: Model<ListeningExercise>,
    @InjectModel(WritingTask.name)
    private writings: Model<WritingTask>,
    @InjectModel(SpeakingTask.name)
    private speakings: Model<SpeakingTask>,
    @InjectModel(UserProgress.name)
    private progresses: Model<UserProgress>,
  ) {}

  @Post()
  async all() {
    try {
      // === User ===
      const u = await this.users.create({
        name: 'Test User',
        email: `test${Date.now()}@mail.com`,
        passwordHash: 'hash',
        level: 'A1',
      });

      // === Vocabulary ===
      const v = await this.vocabs.create({
        word: 'hello',
        meaning: 'xin chào',
        level: 'A1',
      });

      // === Grammar ===
      const g = await this.grammars.create({
        title: 'Present Simple',
        examples: ['I work.', 'You go.'],
      });

      // === Raw Article ===
      const a = await this.articles.create({
        source: 'web',
        title: 'News A',
        content: 'Lorem ipsum dolor sit amet...',
        url: 'https://https://www.newsweek.com/israeli-military-says-gaza-ceasefire-back-on-10903919',
      });

      // === Reading ===
      const r = await this.readings.create({
        title: 'Reading 1',
        passage: 'This is a sample reading passage...',
        level: 'A1',
        vocabularyList: [v._id],
        grammarList: [g._id],
        sourceArticleId: a._id,
        ai_generated: false,
      });

      // === Listening ===
      const l = await this.listenings.create({
        title: 'Listening 1',
        scriptText: 'Audio text...',
        linkedReadingId: r._id,
        level: 'A1',
        ai_generated: false,
        questions: [
          {
            q: 'What is it?',
            choices: ['A cat', 'A dog', 'A bird'],
            answer: 'A dog',
          },
        ],
      });

      // === Writing ===
      const w = await this.writings.create({
        title: 'Write 1',
        question: 'Describe your day',
        sample_answer: 'I wake up, eat breakfast, and go to school.',
        level: 'A1',
        ai_generated: false,
      });

      // === Speaking ===
      const s = await this.speakings.create({
        title: 'Speak 1',
        question: 'Introduce yourself',
        sample_answer: 'Hi, my name is Anna. I am from Vietnam.',
        level: 'A1',
      });

      // === Progress ===
      const p = await this.progresses.create({
        userId: u._id,
        vocabLearned: 1,
        grammarsLearned: 1,
        readingDone: 1,
        ai_generated: false,
      });

      console.log('✅ Data seeded successfully!');
      return {
        ok: true,
        ids: {
          user: u._id,
          vocab: v._id,
          grammar: g._id,
          article: a._id,
          reading: r._id,
          listening: l._id,
          writing: w._id,
          speaking: s._id,
          progress: p._id,
        },
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return { ok: false, error: errorMessage };
    }
  }
}
