import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { VocabService } from './vocab.service';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';

@Controller('vocab')
export class VocabController {
  constructor(private service: VocabService) {}

  // 🔹 GET /vocab  → chỉ trả vocab đúng level user
  @UseGuards(JwtAuthGuard)
  @Get()
  findByUserLevel(@Req() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userLevel = req.user.level; // 👈 lấy từ JWT
    return this.service.findByLevel(userLevel);
  }

  // 🔹 POST /vocab → thêm vocab mới (admin hoặc cho test)
  @Post()
  create(@Body() body: { word: string; meaning?: string; level?: string }) {
    return this.service.create(body.word, body.meaning, body.level);
  }

  // 🔹 PUT /vocab/:id
  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  // 🔹 DELETE /vocab/:id
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
