import { Test, TestingModule } from '@nestjs/testing';
import { ClickhouseController } from './clickhouse.controller';

describe('ClickhouseController', () => {
  let controller: ClickhouseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClickhouseController],
    }).compile();

    controller = module.get<ClickhouseController>(ClickhouseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
