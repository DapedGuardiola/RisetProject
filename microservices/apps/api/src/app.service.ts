import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { faker } from '@faker-js/faker';

export function generateTrustScore(): number {
  const roll = Math.random();
  return roll < 0.7
    ? faker.number.int({ min: 6, max: 10 })
    : faker.number.int({ min: 1, max: 5 });
}

@Injectable()
export class AppService {
  constructor(
    @Inject('USERS_SERVICE')
    private readonly usersClients: ClientProxy,
    @Inject('CONTENTS_SERVICE')
    private readonly contentsClients: ClientProxy,
    @Inject('QUERIES_SERVICE')
    private readonly queriesClients: ClientProxy,

  ) { }
  getHello(): string {
    return 'Hello World!';
  }
  private isGenerating = false;
  private shouldStop = false;

  async generateData(totalChunks = 1000) {
    type UserType = {
      username: string;
      nickname: string;
      followers_count: number,
      trust_score: number,
      password: string,
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


    if (this.isGenerating) {
      return { status: 'error', message: 'Already running' };
    }

    this.isGenerating = true;
    this.shouldStop = false;

    console.log('continued to service');

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    try {
      const availableUserID: number[] = await firstValueFrom(
        this.usersClients.send('users.findAllId', {}),
      );
      const check = availableUserID.slice(1, 10);
      console.log('on available user Id', check);

      const availableVideoID: number[] = await firstValueFrom(
        this.contentsClients.send('contents.videos.findAllId', {}),
      );
      console.log('on available Video Id ', availableVideoID);

      const availableParentsCommentID: number[] = await firstValueFrom(
        this.contentsClients.send('contents.comments.findAllId', {}),
      );
      console.log('on available comments Id', availableParentsCommentID.slice(1, 5));

      for (let i = 0; i < totalChunks; i++) {
        if (this.shouldStop) {
          console.log(`Stopped at chunk ${i}`);
          return { status: 'stopped', message: `Stopped early at chunk ${i}`, chunksCompleted: i };
        }

        const randomCommentChunk = faker.number.int({ min: 2, max: 6 });
        const randomUserChunk = faker.number.int({ min: 1, max: 3 });
        const newComments: CommentType[] = [];
        const newUsers: UserType[] = [];

        // Generate Random Comments
        for (let j = 0; j < randomCommentChunk; j++) {
          const parentRandom =
            faker.helpers.maybe(
              () => faker.helpers.arrayElement(availableParentsCommentID),
              { probability: 0.5 },
            ) ?? null;

          newComments.push({
            video_id: faker.helpers.arrayElement(availableVideoID),
            user_id: faker.helpers.arrayElement(availableUserID),
            level: parentRandom == null ? 0 : 1,
            comment: faker.word.words({ count: { min: 8, max: 15 } }),
            parent_comment_id: parentRandom,
            create_time: new Date(),
          });
        }

        const insertedCommentId = await firstValueFrom(
          this.contentsClients.send('contents.comments.simulate', { newComments }),
        );
        const newParentCommentID = insertedCommentId
          .filter((v) => v.level === 0)
          .map((v) => v.comment_id);

        availableParentsCommentID.push(...newParentCommentID);

        // Generate Random Users
        for (let j = 0; j < randomUserChunk; j++) {
          newUsers.push({
            username: faker.person.fullName(),
            nickname: faker.person.firstName(),
            followers_count: 0,
            password: faker.word.words({ count: 1 }),
            trust_score: generateTrustScore(),
            create_time: new Date(),
          });
        }

        const insertedUsersId = await firstValueFrom(
          this.usersClients.send('users.simulate', { newUsers }),
        );
        availableUserID.push(...insertedUsersId);

        if (i % 1000 === 0) {
          console.log(`Seeded ${i} chunks...`);
        }

        if (this.shouldStop) {
          console.log(`Stopped at chunk ${i + 1}`);
          return { status: 'stopped', message: `Stopped early at chunk ${i + 1}`, chunksCompleted: i + 1 };
        }

        const delaySeconds = faker.number.int({ min: 2, max: 8 });
        console.log(`Waiting ${delaySeconds}s before next chunk...`);
        await sleep(delaySeconds * 1000);
      }

      return { status: 'done', message: 'Data Generated' };
    } catch (e) {
      console.error(e);
      return { status: 'error', message: 'data generator error' };
    } finally {
      this.isGenerating = false;
    }
  }

  stopGeneration() {
    if (!this.isGenerating) {
      return { status: 'noop', message: 'Nothing is running' };
    }
    this.shouldStop = true;
    return { status: 'ok', message: 'Stop requested' };
  }

  getStatus() {
    return { isGenerating: this.isGenerating };
  }

  async postComment(dto) {
    const commentData = await firstValueFrom(this.contentsClients.send('contents.comments.postComment', dto));
    const user_id = commentData.user_id;
    const userData = await firstValueFrom(this.usersClients.send('users.findOne', user_id));
    console.log('COMMENT DATA:', JSON.stringify(commentData));
    console.log('USER DATA:', JSON.stringify(userData));
    return {
      ...commentData,
      user: userData
    };
  }
}
