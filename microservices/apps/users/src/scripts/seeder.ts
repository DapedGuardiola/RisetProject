import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "src/app.module";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from 'mysql2/promise';
import * as fs from 'fs';
import * as path from 'path';
import { faker } from '@faker-js/faker';
import { users } from "src/db/schema";

export function generateTrustScore(): number {
    const roll = Math.random();
    return roll < 0.7
        ? faker.number.int({ min: 6, max: 10 })
        : faker.number.int({ min: 1, max: 5 });
}

async function bootstrap() {
    type UserType = {
        user_id: number;
        username: string;
        nickname: string;
        followers_count: number,
        create_time: Date,
    };

    const app = await NestFactory.createApplicationContext(AppModule);
    const configService = app.get(ConfigService);
    const poolConnection = mysql.createPool({
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        user: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
    });

    const db = drizzle({ client: poolConnection });
    const outputUsersPath = path.join(__dirname, './rawdata/newusers.json');

    try {
        const rawUser = fs.readFileSync(outputUsersPath, 'utf-8');
        const usersData: UserType[] = JSON.parse(rawUser);

        let simulatedTime = Date.now();
        const rows = usersData.map(user => ({
            user_id: user.user_id,
            username: user.username,
            nickname: user.nickname,
            followers_count: faker.number.int({ min: 1000, max: 2000 }),
            trust_score: generateTrustScore(),
            password: faker.word.words({ count: 1 }),
            create_time: new Date(simulatedTime),
        }));

        for (let i = 0; i < rows.length;) {
            const CHUNK_SIZE = faker.number.int({ min: 400, max: 700 });
            const chunk = rows.slice(i, i + CHUNK_SIZE);
            const result = await db.insert(users).values(chunk);
            i += CHUNK_SIZE;
            simulatedTime += 60 * 1000;
        }

        console.log("seed Successfully");
    } catch (e) {
        console.error(e);
    }
    await poolConnection.end();
    await app.close();
}
bootstrap();