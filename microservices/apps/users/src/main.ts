import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule,{
    transport:Transport.TCP,
    options:{
      host:"0.0.0.0",
      port:Number(process.env.PORT) || 3004,
    }
  });
  await app.listen();
  console.log("Users run in port 3004" )
}
bootstrap();

