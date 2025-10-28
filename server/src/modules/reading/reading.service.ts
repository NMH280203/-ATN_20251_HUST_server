import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ReadingExercise } from '../../db/schemas';

@Injectable()
export class ReadingService {
  constructor(
    @InjectModel(ReadingExercise.name)
    private readonly readingModel: Model<ReadingExercise>,
  ) {}

  async findByLevel(level: string) {
    return this.readingModel.find({ level }).select("title level user_results").lean();
  }

  async findById(id: string) {
    const reading = await this.readingModel.findById(id).lean();
    if (!reading) throw new NotFoundException('Reading not found');
    return reading;
  }
  async getUserResults(readingId: string, userId: string) {
    const reading = await this.readingModel
      .findById(readingId)
      .select('user_results')
      .lean();

    if (!reading || !reading.user_results) return [];

    // Lọc ra các lần của đúng user
    return reading.user_results.filter((r) => r.userId.toString() === userId);
  }

  async saveUserResult(
    readingId: string,
    userId: string,
    data: { passage: string; qaText: string; score: number },
  ) {
    return this.readingModel.updateOne(
      { _id: new Types.ObjectId(readingId) },
      {
        $push: {
          user_results: {
            userId: new Types.ObjectId(userId),
            passageSnapshot: data.passage,
            questionsSnapshot: data.qaText,
            score: data.score,
            submittedAt: new Date(),
          },
        },
      },
    );
  }
}
