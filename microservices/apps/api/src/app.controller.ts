import { Controller, Get, Post, Inject, Sse, MessageEvent, Query, Param, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy } from '@nestjs/microservices';
import { interval, map, Observable, switchMap, firstValueFrom, timeout, catchError, of } from 'rxjs';
import { CreateCommentDto } from './dto/createCommentDTO';

export interface AnalyticsMessage<T> {
  data: T[];
  duration: number | null;
}

@Controller('api')
export class AppController {
  constructor(
    @Inject('USERS_SERVICE')
    private readonly usersService: ClientProxy,
    @Inject('CONTENTS_SERVICE')
    private readonly contentsService: ClientProxy,
    @Inject('QUERIES_SERVICE')
    private readonly queriesService: ClientProxy,
    private readonly apiService: AppService,
  ) { }

  @Get()
  getRoot() {
    return {
      status: 'ok',
      message: 'API Gateway is running',
      endpoints: {
        health: '/api/health',
        users: '/api/users',
        video: '/api/video',
      },
    };
  }

  @Get('users')
  getAllUsers(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.usersService.send('users.getAllUsers', {
      limit: limit ? Number(limit) : 10,
      offset: offset ? Number(offset) : 0,
    });
  }

  @Post('users')
  async createUsers(): Promise<Observable<string>> {
    return await this.usersService.send('createUser', { username: "david", nickname: "dvd123", password: "halodek", followers_count: 50, trust_score: 6 });
  }

  @Post('generate')
  async generateData() {
    return await this.apiService.generateData();
  }

  @Post('generate/stop')
  stopGenerate() {
    return this.apiService.stopGeneration();
  }

  @Get('health')
  async healthCheck() {
    const [contents, users, queries] = await Promise.all([
      firstValueFrom(
        this.contentsService.send('contents.health', {}).pipe(
          timeout(3000),
          catchError((err) => of({ status: 'error', service: 'contents-service', error: err.message })),
        ),
      ),
      firstValueFrom(
        this.usersService.send('users.health', {}).pipe(
          timeout(3000),
          catchError((err) => of({ status: 'error', service: 'users-service', error: err.message })),
        ),
      ),
      firstValueFrom(
        this.queriesService.send('queries.health', {}).pipe(
          timeout(3000),
          catchError((err) => of({ status: 'error', service: 'queries-service', error: err.message })),
        ),
      ),
    ]);

    const isAllOk = contents.status === 'ok' && users.status === 'ok' && queries.status === 'ok';

    return {
      status: isAllOk ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      gateway: 'running',
      services: {
        contents,
        users,
        queries,
      },
    };
  }

  @Get('checkContentsConnection')
  checkContent() {
    return this.contentsService.send('contents.check', {});
  }

  @Sse('totalComments')
  streamCommentsByMinute(): Observable<MessageEvent> {
    return interval(1000).pipe(
      switchMap(() =>
        this.queriesService.send('queries.clickhouse.getCommentTotal', {})),
      map(({ result, duration }) => ({
        data: { data: result, duration } as AnalyticsMessage<any>,
      })),
    );
  }

  @Sse('filteredCommentsPerMinute')
  streamFilteredCommentPerMinutes(): Observable<MessageEvent> {
    return interval(1000).pipe(
      switchMap(() =>
        this.queriesService.send('queries.clickhouse.getFilteredCommentsPerMinute', {})),
      map(({ result, duration }) => ({
        data: { data: result, duration } as AnalyticsMessage<any>,
      })),
    );
  }

  @Sse('CommentsPerMinute')
  streamCommentPerMinutes(): Observable<MessageEvent> {
    return interval(1000).pipe(
      switchMap(() =>
        this.queriesService.send('queries.clickhouse.getCommentsPerMinute', {})),
      map(({ result, duration }) => ({
        data: { data: result, duration } as AnalyticsMessage<any>,
      })),
    );
  }

  @Sse('top-videos')
  streamTopVideos(
    @Query('limit') limit?: string,
    @Query('days') days?: string,
  ): Observable<MessageEvent> {
    const params = { limit, days };
    return interval(1000).pipe(
      switchMap(() =>
        this.queriesService.send('queries.clickhouse.getTopVideos', params)
      ),
      map(({ result, duration }) => ({ data: { data: result, duration } as AnalyticsMessage<any> })),
    );
  }

  @Sse('top-repliers')
  streamTopRepliers(
    @Query('limit') limit?: string,
    @Query('days') days?: string,
  ): Observable<MessageEvent> {
    const params = { limit, days };
    return interval(1000).pipe(
      switchMap(() =>
        this.queriesService.send('queries.clickhouse.getTopReplies', params)
      ),
      map(({ result, duration }) => ({
        data: { data: result, duration } as AnalyticsMessage<any>,
      })),
    );
  }

  @Sse('user-signed-up')
  StreamUserSignUp(): Observable<MessageEvent> {
    return interval(1000).pipe(
      switchMap(() =>
        this.queriesService.send('queries.clickhouse.getUserSignedUp', {})
      ),
      map(({ result, duration }) => ({
        data: { data: result, duration } as AnalyticsMessage<any>,
      })),
    );
  }

  @Sse('bot-comments')
  botCommentsCount(): Observable<MessageEvent> {
    return interval(1000).pipe(
      switchMap(() =>
        this.queriesService.send('queries.clickhouse.botCommentsCount', {})
      ),
      map(({ result, duration }) => ({
        data: { data: result, duration } as AnalyticsMessage<any>,
      })),
    );
  }

  @Get('video')
  async findAll(@Query('offset') offset: number = 0) {
    return this.contentsService.send('contents.videos.findAll', offset);
  }

  @Get('comments/video/:videoId')
  async findByVideoId(
    @Param('videoId') videoId: string,
    @Query('childLimit') childLimit?: string,
    @Query('selectedParentId') selectedParentId?: string,
    @Query('parentLimit') parentLimit?: string,
  ) {
    return this.queriesService.send('queries.clickhouse.getVideoComments', {
      videoId: Number(videoId),
      childLimit: childLimit ? Number(childLimit) : 10,
      selectedParentId: selectedParentId ? Number(selectedParentId) : null,
      parentLimit: parentLimit ? Number(parentLimit) : 10,
    });
  }

  @Post('comments')
  async postComents(
    @Body() dto: CreateCommentDto
  ) {
    const commentData = await this.apiService.postComment(dto);
    console.log(commentData);
    return commentData
  }

  //UserSignUpQuery
  // @Sse('/users/user-signed-up')
  // streamUserSignUp(): Observable<MessageEvent> {
  //   return interval(1000).pipe(
  //     switchMap(() =>
  //       this.queriesService.send('userSignUp', {}),
  //     ),
  //     map(({ result, duration }) => ({
  //       data: { data: result, duration } as AnalyticsMessage<any>,
  //     })),
  //   );
  // }
}
