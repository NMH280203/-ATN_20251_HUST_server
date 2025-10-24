import { Controller, Get, Put, Body, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';

@Controller('user')
//@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 🔹 Lấy thông tin người dùng hiện tại
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userId = req.user.sub;
    console.log('👤 Get profile for:', userId);

    return this.userService.getUserById(userId);
  }

  // 🔹 Cập nhật thông tin người dùng (tên, level, avatar)
  @UseGuards(JwtAuthGuard)
  @Put('me')
  async updateProfile(@Req() req, @Body() body: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userId = req.user.sub;
    console.log('Updating user:', userId, 'with body:', body);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.userService.updateUser(req.user.sub, body);
  }
}
