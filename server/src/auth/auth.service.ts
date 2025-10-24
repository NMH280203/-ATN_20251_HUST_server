import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../db/schemas';

@Injectable()
export class AuthService {
  private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  // 🔹 Đăng ký bằng email / password
  async signupLocal(name: string, email: string, password: string) {
    try {
      const normalizedEmail = email.trim().toLowerCase();

      const exist = await this.userModel.findOne({ email: normalizedEmail });
      if (exist) throw new BadRequestException('Email already exists');

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const hash = await bcrypt.hash(password, 10);

      const user = await this.userModel.create({
        name,
        email: normalizedEmail,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        passwordHash: hash,
        provider: 'local',
      });

      return this.signToken(user);
    } catch (err) {
      console.error('Signup error:', err);
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException('Signup failed');
    }
  }

  // 🔹 Đăng nhập bằng email / password
  async signinLocal(email: string, password: string) {
    try {
      const normalizedEmail = email.trim().toLowerCase();

      const user = await this.userModel.findOne({ email: normalizedEmail });
      if (!user || !user.passwordHash)
        throw new UnauthorizedException('Invalid email or password');

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) throw new UnauthorizedException('Invalid email or password');

      return this.signToken(user);
    } catch (err) {
      console.error('Signin error:', err);
      if (err instanceof UnauthorizedException) throw err;
      throw new InternalServerErrorException('Signin failed');
    }
  }

  // 🔹 Đăng nhập bằng Google token (One Tap hoặc popup)
  async loginWithGoogleToken(idToken: string) {
    try {
      // 🧩 Kiểm tra đầu vào
      if (!idToken) {
        console.error('❌ Google login error: missing idToken from FE');
        throw new UnauthorizedException('Missing Google ID token');
      }

      // 🧩 Log token đầu để debug (ẩn bớt cho an toàn)
      console.log('🧩 Verifying Google token:', idToken.slice(0, 20), '...');

      // 🧠 Xác thực token với Google
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      console.log('✅ Google payload:', payload);

      if (!payload) throw new UnauthorizedException('Invalid Google token');

      const { email, name, picture, sub: googleId } = payload;

      if (!email) {
        console.error('❌ Google login: missing email in payload');
        throw new UnauthorizedException('Google account has no email');
      }

      const normalizedEmail = email.trim().toLowerCase();
      let user = await this.userModel.findOne({ email: normalizedEmail });

      // 🆕 Nếu user chưa tồn tại → tạo mới
      if (!user) {
        console.log('🆕 Creating new Google user:', normalizedEmail);
        user = await this.userModel.create({
          name,
          email: normalizedEmail,
          googleId,
          avatarUrl: picture,
          provider: 'google',
          level: 'A1', // 👈 thêm level mặc định
        });
      }

      // ✅ Trả JWT token có level
      return this.signToken(user);
    } catch (err) {
      console.error('❌ Google login error:', err);
      if (err instanceof UnauthorizedException) throw err;
      throw new InternalServerErrorException('Google login failed');
    }
  }

  // 🔹 Tạo JWT Token
  private signToken(user: User) {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      provider: user.provider,
      level: user.level,
    };

    const access_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '7d',
    });

    return { access_token, user };
  }
}
