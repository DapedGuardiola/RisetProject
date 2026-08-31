import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { createUserDTO } from './user.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @MessagePattern('users.getAllUsers')
  async getAllUsers(
    @Payload() payload?: { limit?: number; offset?: number },
  ) {
    const limit = payload?.limit !== undefined ? Number(payload.limit) : 10;
    const offset = payload?.offset !== undefined ? Number(payload.offset) : 0;
    return await this.appService.getAllUsers(limit, offset);
  }

  @MessagePattern('createUser')
  async getHello(@Payload() dto: createUserDTO): Promise<string> {
    return await this.appService.createUser(dto);
  }

  @MessagePattern('cekidot')
  async cekidot() {
    return 'halo ini udah connect';
  }

  @MessagePattern('users.findAllId')
  async findAllId() {
    return await this.appService.findAllId();
  }

  @MessagePattern('users.findOne')
  async findOne(
    @Payload() user_id: number
  ) {
    return await this.appService.findOne(user_id);
  }

  @MessagePattern('users.simulate')
  async simulate(@Payload() { newUsers }: { newUsers: createUserDTO[] }) {
    return await this.appService.simulate(newUsers);
  }
}
