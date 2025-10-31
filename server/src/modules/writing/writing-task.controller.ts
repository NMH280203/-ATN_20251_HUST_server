import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { WritingTaskService } from './writing-task.service';

@Controller('writing-tasks')
export class WritingTaskController {
  constructor(private readonly writingTaskService: WritingTaskService) {}

  // 🟢 GET /writing-tasks
  @Get()
  async getAll(@Query('level') level?: string) {
    if (level) return this.writingTaskService.findByLevel(level);
    return this.writingTaskService.findAll();
  }

  // 🟢 GET /writing-tasks/:id
  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.writingTaskService.findById(id);
  }

  // 🟢 GET /writing-tasks/history/:userId
  @Get('history/:userId')
  async getHistory(@Param('userId') userId: string) {
    return this.writingTaskService.findByUser(userId);
  }

  // 🟣 POST /writing-tasks/:id/submit
  @Post(':id/submit')
async submit(
  @Param('id') taskId: string,
  @Body() body: { userId: string; content: string; score: number; feedback: string },
) {
  return this.writingTaskService.submitClientGrade(
    taskId,
    body.userId,
    body.content,
    body.score,
    body.feedback,
  );
}

  // 🟢 POST /writing-tasks
  @Post()
  async create(@Body() data: any) {
    return this.writingTaskService.createTask(data);
  }

  // 🟡 PATCH /writing-tasks/:id
  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.writingTaskService.updateTask(id, data);
  }

  // 🔴 DELETE /writing-tasks/:id
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.writingTaskService.deleteTask(id);
  }
}
