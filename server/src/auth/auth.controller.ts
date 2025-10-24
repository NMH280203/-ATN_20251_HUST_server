import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() body: SignupDto) {
    return this.authService.signupLocal(body.name, body.email, body.password);
  }

  @Post('signin')
  signin(@Body() body: SigninDto) {
    return this.authService.signinLocal(body.email, body.password);
  }

  @Post('google/token')
  googleLogin(@Body() body: { id_token: string }) {
    return this.authService.loginWithGoogleToken(body.id_token);
  }
}
