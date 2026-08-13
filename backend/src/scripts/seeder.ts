import { Pool } from "pg";
import { DrizzleDB } from "src/db/drizzle";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "src/app.module";
import { drizzle } from "drizzle-orm/node-postgres";
import { relations } from "../db/relations";
import { faker } from '@faker-js/faker';
import { videos, users, comments } from "../db/schema";
import * as fs from 'fs';
import * as path from 'path';
async function bootstrap() {
    type UserType = {
        user_id: number;
        username: string;
        nickname: string;
        followers_count: number,
        create_time: Date,
    };
    type videoType = {
        video_id: number,
        title: string,
        yt_key: string,
        description: string,
        thumbnail: string,
        views_count: number,
    };
    type CommentType = {
        comment_id: number;
        video_id: number;
        user_id: number;
        comment: string;
        parent_comment_id: number;
        level: number;
        create_time: Date;
        user: UserType;
    };

    const app = await NestFactory.createApplicationContext(AppModule);
    const configService = app.get(ConfigService);
    const pool = new Pool({
        connectionString: configService.get<string>('DATABASE_URL'),
    });
    const db: DrizzleDB = drizzle({ client: pool, relations });

    const outputVideoIdsPath = path.join(__dirname, './rawdata/newvideo_id.json');
    const outputCommentsPath = path.join(__dirname, './rawdata/newcomments.json');
    const outputUsersPath = path.join(__dirname, './rawdata/newusers.json');

    ///////// VIDEO ////////
    const availableVideoId = fs.readFileSync(outputVideoIdsPath, 'utf-8');
    const videoIds = JSON.parse(availableVideoId);

    const insertedVideos = await db
        .insert(videos)
        .values(
            videoIds.map(item => ({
                video_id: Number(item),
                title: faker.word.words({
                    count: { min: 4, max: 8 },
                }),
                description: faker.word.words({
                    count: { min: 8, max: 25 },
                }),
            }))
        )
        .returning({ id: videos.video_id });

    //////// User /////////
    const rawUser = fs.readFileSync(outputUsersPath, 'utf-8');
    const usersData: UserType[] = JSON.parse(rawUser);

    const insertedUsers: { user_id: number }[] = [];

    let simulatedTime = Date.now();
    const rows = usersData.map(user => ({
        user_id: user.user_id,
        username: user.username,
        nickname: user.nickname,
        followers_count: faker.number.int({ min: 1000, max: 2000 }),
        create_time: new Date(simulatedTime),
    }));

    for (let i = 0; i < rows.length;) {
        const CHUNK_SIZE = faker.number.int({ min: 400, max: 700 });
        const chunk = rows.slice(i, i + CHUNK_SIZE);
        const result = await db.insert(users)
            .values(chunk)
            .returning({ user_id: users.user_id });
        insertedUsers.push(...result);
        i += CHUNK_SIZE;
        simulatedTime += 60 * 1000;
    }

    //comments
    const rawComments = fs.readFileSync(outputCommentsPath, 'utf-8');
    const commentData = JSON.parse(rawComments);
    const commentRows = commentData.map(comment => {
        return {
            video_id: comment.video_id,
            comment_id: comment.comment_id,
            user_id: comment.user_id,
            level: Number(comment.level),
            comment: comment.comment,
            parent_comment_id: comment.parent_comment_id === "" || comment.parent_comment_id == null
                ? null
                : Number(comment.parent_comment_id),
            create_time: comment.create_time,
        }
    });

    // Split into parents (level 0) and children (level > 0)
    const parentRows = commentRows.filter(c => c.level === 0);
    const childRows = commentRows.filter(c => c.level !== 0);

    const insertedComments: { comment_id: number }[] = [];

    async function insertInChunks(rows: typeof commentRows) {
        for (let i = 0; i < rows.length; i += 1) {
            const CHUNK_SIZE = faker.number.int({ min: 300, max: 800 });
            const chunk = rows.slice(i, i + CHUNK_SIZE);
            if (chunk.length === 0) continue;

            const result = await db.insert(comments)
                .values(chunk)
                .returning({ comment_id: comments.comment_id });
            insertedComments.push(...result);

            i += CHUNK_SIZE - 1; // account for variable chunk size
        }
    }

    // Insert parents first, then children
    await insertInChunks(parentRows);
    await insertInChunks(childRows);
    console.log(`[Inserted video count : ]${insertedVideos.length}`);
    console.log(`[Inserted user count : ]${insertedUsers.length}`);
    console.log(`[Inserted comment count : ]${insertedComments.length}`);
    await pool.end();
    await app.close();
}
bootstrap();