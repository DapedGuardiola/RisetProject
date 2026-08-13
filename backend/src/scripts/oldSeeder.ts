import { Pool } from "pg";
import { DrizzleDB } from "src/db/drizzle";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "src/app.module";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { drizzle } from "drizzle-orm/node-postgres";
import { relations } from "../db/relations";
import { faker } from '@faker-js/faker';
import { videos, users, comments } from "../db/schema";

async function bootstrap() {

    console.log(faker.word.words(5));
    const availTrailer = [
        { title: "Avenger: Infinity war", key: "6ZfuNTqbHE8", thumb: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLRjEFmxz5jzrgiwo2aZZKJwqfEFpBs8Of0nZBEIxDZoV2eVPKOyeMV7o2&s=10" },
        { title: "Avenger: Doomsday", key: "irVNGjRFZGk", thumb: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdVxisllxih2dyGbvJ_vvGM_1dbOP69E1tKcWv7iFm1A&s=10" },
        { title: "Spider-man 1", key: "HXFpaMHiaPc", thumb: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXlXktxSkrmMb4X13sm-qu0rLRX2RyDtBF_X5PjKbp7w&s=10" },
        { title: "Extraction", key: "L6P3nI6VnlY", thumb: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTawzz6PZQPxdKeehUEN00zFeXGNoY2Gm7UyJb8hWpDgWck94ZCsceQrME&s=10" },
        { title: "Extraction 2", key: "Nz2I7NlBJp0", thumb: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-fmheyAvfCLwIwY_X5BmI44zdOU0KtNHUWXkFTxmOeUhawKVGwxfyk0lk&s=10" },
        { title: "Transformers", key: "itnqEauWQZM", thumb: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLrcYxS6hPWb03siduszF_4ZUKINGetKNGXDT53Yd7Dw&s=10" },
        { title: "Avatar : Fire & Ash", key: "nb_fFj_0rq8", thumb: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQgt7cRtTb7Q3IXwSw56cPbfmOoWHqg8ATyS9XVdR0PQ&s=10" },
    ];

    const app = await NestFactory.createApplicationContext(AppModule);
    const configService = app.get(ConfigService);
    const pool = new Pool({
        connectionString: configService.get<string>('DATABASE_URL'),
    });
    const db: DrizzleDB = drizzle({ client: pool, relations });
    const insertedVideos = await db
        .insert(videos)
        .values(
            availTrailer.map(item => ({
                title: item.title,
                yt_key: item.key,
                thumbnail: item.thumb,
                description: faker.word.words({
                    count: { min: 8, max: 15 },
                }),
            }))
        )
        .returning({ id: videos.video_id });

    const videoIds = insertedVideos.map(v => v.id);
    // users
    const usersData = Array.from({ length: 10 }, () => ({
        username: faker.person.fullName(),
        nickname: faker.person.firstName(),
    }));
    const insertedUser = await db.insert(users).values(usersData).returning({ user_id: users.user_id });
    const userIds = insertedUser.map(v => v.user_id);

    //comments
    const topLevelComments = Array.from({ length: 20 }, () => ({
        video_id: faker.helpers.arrayElement(videoIds),
        user_id: faker.helpers.arrayElement(userIds),
        level: 0,
        comment: faker.word.words({ count: { min: 8, max: 15 } }),
        create_time: faker.date.recent({ days: 30 }),
    }));

    const insertedComments = await db.insert(comments).values(topLevelComments).returning({ comment_id: comments.comment_id });

    const replies = Array.from({ length: 20 }, () => ({
        video_id: faker.helpers.arrayElement(videoIds),
        user_id: faker.helpers.arrayElement(userIds),
        parent_comment_id: faker.helpers.arrayElement(insertedComments).comment_id, // pick a real parent
        level: 1,
        comment: faker.word.words({ count: { min: 8, max: 15 } }),
        create_time: faker.date.recent({ days: 30 }),
    }));
    await db.insert(comments).values(replies);
    await pool.end();
    await app.close();
}
bootstrap();