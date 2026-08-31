import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE } from './db/db.module';
import type { DrizzleDB } from './db/drizzle';
import { sql } from 'drizzle-orm';

@Injectable()
export class AppService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: DrizzleDB,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async healthCheck() {
    try {
      await this.db.execute(sql`SELECT 1`);
      return {
        status: 'ok',
        service: 'contents-service',
        database: 'connected',
      };
    } catch (error: any) {
      return {
        status: 'error',
        service: 'contents-service',
        database: 'disconnected',
        error: error?.message || 'Database connection error',
      };
    }
  }
}
