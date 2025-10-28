import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReadingService } from './reading.service';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';

@Controller('reading')
export class ReadingController {
  constructor(private readonly service: ReadingService) {}

  // 🔹 GET /reading → lấy bài đọc đúng level user
  @UseGuards(JwtAuthGuard)
  @Get()
  async findByUserLevel(@Req() req) {
    const userLevel = req.user.level;
    return this.service.findByLevel(userLevel);
  }

  // 🔹 GET /reading/:id → xem chi tiết 1 bài đọc
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getReadingDetail(@Param('id') id: string) {
    return this.service.findById(id);
  }
  @UseGuards(JwtAuthGuard)
  @Get(':id/results')
  async getUserResults(@Param('id') id: string, @Req() req) {
    const userId = req.user.sub;
    return this.service.getUserResults(id, userId);
  }
  // 🔹 POST /reading/:id/submit → lưu kết quả bài làm
  @UseGuards(JwtAuthGuard)
  @Post(':id/submit')
  async submitResult(
    @Param('id') id: string,
    @Req() req,
    @Body()
    body: {
      passage: string;
      qaText: string; // JSON.stringify(answers)
      score: number;
    },
  ) {
    const userId = req.user.sub;
    return this.service.saveUserResult(id, userId, body);
  }
}
