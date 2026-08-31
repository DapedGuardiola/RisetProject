import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @MessagePattern('contents.health')
  async healthCheck() {
    return await this.appService.healthCheck();
  }

  @MessagePattern('contents.check')
  async checkConnection() {
    return await this.appService.healthCheck();
  }
}
