import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vocabulary } from '../../db/schemas';

@Injectable()
export class VocabService {
  constructor(
    @InjectModel(Vocabulary.name) private vocabModel: Model<Vocabulary>,
  ) {}

  async findByLevel(level: string) {
    return this.vocabModel.find({ level }).lean();
  }

  findAll() {
    return this.vocabModel.find().sort({ createdAt: -1 });
  }

  create(word: string, meaning?: string, level?: string) {
    return this.vocabModel.create({ word, meaning, level });
  }

  update(id: string, data: Partial<Vocabulary>) {
    return this.vocabModel.findByIdAndUpdate(id, data, { new: true });
  }

  delete(id: string) {
    return this.vocabModel.findByIdAndDelete(id);
  }
}
