// server/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: ['http://localhost:5173'], credentials: true });
  // Nếu bạn có global prefix 'api', nhớ đổi client path tương ứng
  // app.setGlobalPrefix('api');
  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000);
}
bootstrap();
