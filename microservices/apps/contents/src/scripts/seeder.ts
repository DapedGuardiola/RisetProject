import { Pool } from "pg";
import { DrizzleDB } from "src/db/drizzle";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "src/app.module";
import { drizzle } from "drizzle-orm/node-postgres";
import { relations } from "../db/relations";
import { faker } from '@faker-js/faker';
import { videos, comments } from "../db/schema";
import * as fs from 'fs';
import * as path from 'path';
async function bootstrap() {

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
    };

    const app = await NestFactory.createApplicationContext(AppModule);
    const configService = app.get(ConfigService);
    const pool = new Pool({
        connectionString: configService.get<string>('DATABASE_URL'),
    });
    const db: DrizzleDB = drizzle({ client: pool, relations });

    const outputVideoIdsPath = path.join(__dirname, './rawdata/newvideo_id.json');
    const outputCommentsPath = path.join(__dirname, './rawdata/newcomments.json');

    ///////// VIDEO ////////
    const availableVideoId = fs.readFileSync(outputVideoIdsPath, 'utf-8');
    const availableComments = fs.readFileSync(outputVideoIdsPath, 'utf-8');
    const videoIds = JSON.parse(availableVideoId);

    await db.insert(videos).values(
        videoIds.map(item => ({
            video_id: Number(item),
            title: faker.word.words({
                count: { min: 4, max: 8 },
            }),
            description: faker.word.words({
                count: { min: 8, max: 25 },
            }),
        }))
    );

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

    const parentRows = commentRows.filter(c => c.level === 0);
    const childRows = commentRows.filter(c => c.level !== 0);

    async function insertInChunks(rows: typeof commentRows) {
        for (let i = 0; i < rows.length; i += 1) {
            const CHUNK_SIZE = faker.number.int({ min: 300, max: 800 });
            const chunk = rows.slice(i, i + CHUNK_SIZE);
            
            if (chunk.length === 0) continue;

            await db.insert(comments)
                .values(chunk)
            i += CHUNK_SIZE - 1; // account for variable chunk size
        }
    }

    // Insert parents first, then children
    await insertInChunks(parentRows);
    await insertInChunks(childRows);
    
    console.log("Insertion Completed")
    await pool.end();
    await app.close();

}
bootstrap();