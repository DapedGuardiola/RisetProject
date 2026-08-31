import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE } from './db/db.module';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class AppService {
  constructor(
    @Inject(DRIZZLE) private db: any
  ) { }

  async getAllUsers(limit: number = 10, offset: number = 0) {
    const rows = await this.db
      .select({
        user_id: users.user_id,
        username: users.username,
        nickname: users.nickname,
        followers_count: users.followers_count,
        trust_score: users.trust_score,
        create_time: users.create_time,
      })
      .from(users)
      .limit(limit)
      .offset(offset);
    return rows;
  }

  async createUser(object: any) {
    const result = await this.db.insert(users).values(object);
    const inserted = await this.db
      .select({
        id: users.user_id,
        username: users.username,
        nickname: users.nickname,
        followers_count: users.followers_count,
      })
      .from(users)
      .where(eq(users.user_id, result[0].insertId));

    return inserted[0];
  }

  async findAllId() {
    const rows = await this.db.select({ user_id: users.user_id }).from(users);
    return rows.map((row: any) => row.user_id);
  }

  async findOne(user_id: number) {
    const res = await this.db
      .select()
      .from(users)
      .where(eq(users.user_id, user_id));
    return res[0];
  }

  async simulate(dto: any) {
    const convertedUsers = dto.map((u: any) => ({
      ...u,
      create_time: new Date(u.create_time),
    }));
    return await this.db.transaction(async (tx: any) => {
      const result = await tx.insert(users).values(convertedUsers);
      const firstId = result.insertId;
      return dto.map((_: any, i: number) => firstId + i);
    });
  }
}
