import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ["http://frontend:3000","http://localhost:3000"],
    credentials: true,
  });
  const port = process.env.PORT ?? 3006;
  await app.listen(port, '0.0.0.0');
  console.log(`API Gateway is running on: http://localhost:${port}/api`);
  console.log(`Health check available at: http://localhost:${port}/api/health`);
}
bootstrap();