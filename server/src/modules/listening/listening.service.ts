import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { ListeningExercise } from '../../db/schemas';

type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

@Injectable()
export class ListeningService {
  constructor(
    @InjectModel(ListeningExercise.name)
    private readonly model: Model<ListeningExercise>,
  ) {}

  /** Danh sách theo level (ẩn đáp án); optional search q theo title */
  async findByLevel(level: Level, q?: string) {
    const filter: FilterQuery<ListeningExercise> = { level };
    if (q) filter.title = { $regex: q, $options: 'i' };

    return this.model
      .find(filter)
      .select({
        title: 1,
        level: 1,
        ai_generated: 1,
        linkedReadingId: 1,
        createdAt: 1,
        // Có thể bỏ scriptText ở list để nhẹ response
        questions: {
          $map: {
            input: '$questions',
            as: 'q',
            in: { q: '$$q.q', choices: '$$q.choices' }, // Ẩn answer
          },
        },
      })
      .sort({ createdAt: -1 })
      .lean();
  }

  /** Chi tiết bài + lịch sử của chính user; Ẩn đáp án */
  async detailForUser(exerciseId: string, userId: string) {
    const _id = new Types.ObjectId(exerciseId);
    const doc = await this.model.findById(_id).lean();
    if (!doc) throw new NotFoundException('Listening exercise not found');

    const maskedQuestions = (doc.questions || []).map((q: any) => ({
      q: q.q,
      choices: q.choices,
    }));

    const myHistory = (doc.user_results || []).filter(
      (r: any) => r.userId?.toString() === userId,
    );

    return {
      _id: doc._id,
      title: doc.title,
      scriptText: doc.scriptText,
      linkedReadingId: doc.linkedReadingId,
      level: doc.level,
      ai_generated: doc.ai_generated,
      questions: maskedQuestions,
      user_results: myHistory,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  /** (Private) Chấm server-side nếu có userAnswers – quy về thang 10, 1 chữ số thập phân */
  private scoreFromAnswers(doc: any, userAnswers: string[]) {
    const qs = doc.questions || [];
    if (!qs.length) return 0;

    let correct = 0;
    qs.forEach((q: any, i: number) => {
      const ans = (q.answer || '').trim().toLowerCase();
      const user = ((userAnswers[i] || '').trim()).toLowerCase();
      if (ans && user && ans === user) correct++;
    });

    const score10 = (correct / qs.length) * 10;
    return Math.round(score10 * 10) / 10;
  }

  /** Lưu điểm: nhận score trực tiếp hoặc tự chấm từ userAnswers */
  async submitScore(
    exerciseId: string,
    userId: string,
    body: { score?: number; userAnswers?: string[] },
  ) {
    const _id = new Types.ObjectId(exerciseId);
    const doc = await this.model.findById(_id).lean();
    if (!doc) throw new NotFoundException('Listening exercise not found');

    let score: number | undefined = typeof body.score === 'number' ? body.score : undefined;
    if (score === undefined && Array.isArray(body.userAnswers)) {
      score = this.scoreFromAnswers(doc, body.userAnswers);
    }
    if (typeof score !== 'number') score = 0;

    await this.model.updateOne(
      { _id },
      {
        $push: {
          user_results: {
            userId: new Types.ObjectId(userId),
            score,
            submittedAt: new Date(),
          },
        },
      },
    );

    return { ok: true, score };
  }
}
