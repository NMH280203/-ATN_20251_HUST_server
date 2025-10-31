import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { ListeningService } from './listening.service';

type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

// Body “không DTO” – typing tối thiểu để tránh any:
type SubmitBody =
  | { score: number; userAnswers?: string[] }
  | { userAnswers: string[]; score?: number };

@Controller('listening')
@UseGuards(JwtAuthGuard)
export class ListeningController {
  constructor(private readonly service: ListeningService) {}

  /** ✅ GET /listening -> lọc theo level trong JWT; có thể search theo q= */
  @Get()
  findByUserLevel(@Req() req: any, @Query('q') q?: string) {
    const userLevel = req.user.level as Level; // lấy level từ JWT
    return this.service.findByLevel(userLevel, q);
  }

  /** ✅ GET /listening/:id -> chi tiết + lịch sử của chính user (ẩn đáp án) */
  @Get(':id')
  detail(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.sub as string;
    return this.service.detailForUser(id, userId);
  }

  /** ✅ POST /listening/:id/submit -> lưu điểm (score hoặc userAnswers để chấm server-side) */
  @Post(':id/submit')
  submit(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: SubmitBody,
  ) {
    const userId = req.user.sub as string;
    return this.service.submitScore(id, userId, body);
  }
}
