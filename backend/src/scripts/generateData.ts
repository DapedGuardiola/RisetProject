import { Pool } from "pg";
import { DrizzleDB } from "src/db/drizzle";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "src/app.module";
import { drizzle } from "drizzle-orm/node-postgres";
import { relations } from "../db/relations";
import { fa, faker } from '@faker-js/faker';
import { videos, users, comments } from "../db/schema";
import * as fs from 'fs';
import * as path from 'path';
async function bootstrap() {

    //                   //
    //                  //
    // Generate COMMENT//
    //                //

    type UserType = {
        username: string;
        nickname: string;
        followers_count: number,
        create_time: Date,
    };

    type CommentType = {
        video_id: number;
        user_id: number;
        comment: string;
        parent_comment_id: number | null;
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
    const outputUsersPath = path.join(__dirname, './rawdata/newusers.json');
    const dbVideos = await db.query.videos.findMany({
    columns: {
        video_id: true,
    },
    });

    const dbUsers = await db.query.users.findMany({
  columns: { user_id: true },
});

const dbParentComments = await db.query.comments.findMany({
  columns: { comment_id: true },
  where: { level: 0 },
});

const availableVideoId: number[] = dbVideos.map(v => v.video_id);
const availableUserId: number[] = dbUsers.map(v => v.user_id);
const availableParent: number[] = dbParentComments.map(v => v.comment_id);

const TOTAL_CHUNKS = 1_000_000; // adjust as needed
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
for (let i = 0; i < TOTAL_CHUNKS; i++) {
  const randomCommentChunk = faker.number.int({ min: 2, max: 6 });
  const randomUserChunk = faker.number.int({ min: 1, max: 3 });
  const newComments: CommentType[] = [];
  const newUsers: UserType[] = [];


  // Generate Random Comment
  for (let j = 0; j < randomCommentChunk; j++) {
    const parentRandom =
      faker.helpers.maybe(
        () => faker.helpers.arrayElement(availableParent),
        { probability: 0.5 }
      ) ?? null;

    newComments.push({
      video_id: faker.helpers.arrayElement(availableVideoId),
      user_id: faker.helpers.arrayElement(availableUserId),
      level: parentRandom == null ? 0 : 1,
      comment: faker.word.words({ count: { min: 8, max: 15 } }),
      parent_comment_id: parentRandom,
      create_time: new Date(),
    });
  }

  // Insert Comments
    const result = await db
      .insert(comments)
      .values(newComments)
      .returning({
        comment_id: comments.comment_id,
        level: comments.level,
      });
  
  // Only keep level-0 comments as future parents, filter out undefined
  const newParents = result
    .filter(v => v.level === 0)
    .map(v => v.comment_id);

  availableParent.push(...newParents);
  // Generate Random Users
  for (let j = 0; j < randomUserChunk; j++) {
    newUsers.push({
      username : faker.person.fullName(),
      nickname : faker.person.firstName(),
      followers_count:0,
      create_time: new Date(),
    });
  }

  // Insert Users
  const userResult = await db
    .insert(users)
    .values(newUsers)
    .returning({
      user_id: users.user_id,
    });

  // Only keep level-0 comments as future parents, filter out undefined
  const newUsersId = userResult.map(v => v.user_id);

  availableUserId.push(...newUsersId);

  if (i % 1000 === 0) {
    console.log(`Seeded ${i} chunks...`);
  }

  const delaySeconds = faker.number.int({ min: 2, max: 8 });
  console.log(`Waiting ${delaySeconds}s before next chunk...`); 
  await sleep(delaySeconds * 1000);
}

await pool.end();
await app.close();
}
bootstrap();


    
    // type videoType = {
    //     video_id: number,
    //     title: string,
    //     yt_key: string,
    //     description: string,
    //     thumbnail: string,
    //     views_count: number,
    // };

    // // ///////// VIDEO ////////
    // const availableVideoId = fs.readFileSync(outputVideoIdsPath, 'utf-8');
    // const videoIds = JSON.parse(availableVideoId);

    // const insertedVideos = await db
    //     .insert(videos)
    //     .values(
    //         videoIds.map(item => ({
    //             video_id: Number(item),
    //             title: faker.word.words({
    //                 count: { min: 4, max: 8 },
    //             }),
    //             description: faker.word.words({
    //                 count: { min: 8, max: 25 },
    //             }),
    //         }))
    //     )
    //     .returning({ id: videos.video_id });

    // //////// User /////////
    // const rawUser = fs.readFileSync(outputUsersPath, 'utf-8');
    // const usersData: UserType[] = JSON.parse(rawUser);

    // const insertedUsers: { user_id: number }[] = [];

    // let simulatedTime = Date.now();
    // const rows = usersData.map(user => ({
    //     user_id: user.user_id,
    //     username: user.username,
    //     nickname: user.nickname,
    //     followers_count: faker.number.int({ min: 1000, max: 2000 }),
    //     create_time: new Date(simulatedTime),
    // }));

    // for (let i = 0; i < rows.length;) {
    //     const CHUNK_SIZE = faker.number.int({ min: 400, max: 700 });
    //     const chunk = rows.slice(i, i + CHUNK_SIZE);
    //     const result = await db.insert(users)
    //         .values(chunk)
    //         .returning({ user_id: users.user_id });
    //     insertedUsers.push(...result);
    //     i += CHUNK_SIZE;
    //     simulatedTime += 60 * 1000;
    // }

    //comments
    

    // // Split into parents (level 0) and children (level > 0)
   
    // console.log(`[Inserted video count : ]${insertedVideos.length}`);
    // console.log(`[Inserted user count : ]${insertedUsers.length}`);