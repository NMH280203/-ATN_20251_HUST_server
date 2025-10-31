import { WritingTask, WritingTaskDocument } from '@/db/schemas';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class WritingTaskService {
  constructor(
    @InjectModel(WritingTask.name)
    private writingTaskModel: Model<WritingTaskDocument>,
  ) {}

  // 🟢 Lấy tất cả bài
  async findAll(): Promise<WritingTask[]> {
    return this.writingTaskModel.find().sort({ level: 1, title: 1 }).lean().exec();
  }

  // 🟢 Lọc theo level
  async findByLevel(level: string): Promise<WritingTask[]> {
    return this.writingTaskModel.find({ level }).sort({ title: 1 }).lean().exec();
  }

  // 🟢 Lấy chi tiết 1 bài
  async findById(id: string): Promise<WritingTask | null> {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid task id');
    return this.writingTaskModel.findById(id).lean().exec();
  }

  // 🟢 Lấy lịch sử làm bài của 1 user (theo tất cả task)
  async findByUser(userId: string): Promise<WritingTask[]> {
    if (!Types.ObjectId.isValid(userId)) throw new BadRequestException('Invalid user id');
    return this.writingTaskModel
      .find({ 'user_submissions.userId': new Types.ObjectId(userId) })
      .select('title level user_submissions')
      .sort({ updatedAt: -1 })
      .lean()
      .exec();
  }

  // 🔕 (Tuỳ chọn) Giữ lại cho dev/local test, nhưng KHÔNG dùng khi FE tự chấm
  private async mockAIGrade(content: string): Promise<{ score: number; feedback: string }> {
    const baseScore = Math.min(10, Math.max(5, content.length / 25));
    return {
      score: Math.round(baseScore),
      feedback:
        content.length < 50
          ? 'Your writing is too short. Try adding more examples and ideas.'
          : 'Good organization and vocabulary! You can improve by using more complex sentence structures.',
    };
  }

  // 🔕 (Tuỳ chọn) Chấm ở BE — KHÔNG dùng khi FE chấm
  async submitAndGrade(taskId: string, userId: string, content: string) {
    if (!Types.ObjectId.isValid(taskId)) throw new BadRequestException('Invalid task id');
    if (!Types.ObjectId.isValid(userId)) throw new BadRequestException('Invalid user id');

    const exist = await this.writingTaskModel.exists({ _id: taskId });
    if (!exist) throw new NotFoundException('WritingTask not found');

    const { score, feedback } = await this.mockAIGrade(content);

    return this.writingTaskModel.findByIdAndUpdate(
      taskId,
      {
        $push: {
          user_submissions: {
            userId: new Types.ObjectId(userId),
            content,
            score,
            feedback,
            submittedAt: new Date(),
          },
        },
      },
      { new: true },
    );
  }

  // 🟣 FE chấm → BE chỉ LƯU score + feedback
  async submitClientGrade(
    taskId: string,
    userId: string,
    content: string,
    score: number,
    feedback: string,
  ) {
    if (!Types.ObjectId.isValid(taskId)) throw new BadRequestException('Invalid task id');
    if (!Types.ObjectId.isValid(userId)) throw new BadRequestException('Invalid user id');

    const task = await this.writingTaskModel.findById(taskId).select('_id').lean();
    if (!task) throw new NotFoundException('WritingTask not found');

    const safeScore = Math.max(0, Math.min(10, Math.round(Number(score) || 0)));
    const safeFeedback = String(feedback ?? '').trim();

    return this.writingTaskModel.findByIdAndUpdate(
      taskId,
      {
        $push: {
          user_submissions: {
            userId: new Types.ObjectId(userId),
            content,
            score: safeScore,
            feedback: safeFeedback, // 🔑 đảm bảo push feedback
            submittedAt: new Date(),
          },
        },
      },
      { new: true },
    );
  }

  // 🟡 Cập nhật bài viết (admin)
  async updateTask(id: string, data: Partial<WritingTask>) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid task id');
    return this.writingTaskModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  // 🔴 Xóa bài (admin)
  async deleteTask(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid task id');
    return this.writingTaskModel.findByIdAndDelete(id).exec();
  }

  // 🟢 Tạo bài viết mới (admin)
  async createTask(data: Partial<WritingTask>) {
    const newTask = new this.writingTaskModel(data);
    return newTask.save();
  }
}
