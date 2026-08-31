import { Controller, Query, MessageEvent } from '@nestjs/common';
import { Sse } from '@nestjs/common';
import { Observable, interval } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { AnalyticsService } from './analytics.service';
import { AnalyticsMessage } from './types/analytics';

@Controller('analytics/')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) { }
  @Sse('/comments')
  streamComments(): Observable<AnalyticsMessage<any>> {
    console.log(process.env.CLICKHOUSE_URL);
    return interval(1000).pipe(
      switchMap(() => this.analyticsService.streamComments()),
      map(({ result, duration }) => ({ data: result, duration }) as AnalyticsMessage<any>));
  }
  @Sse('/comments/top-videos')
  streamTopVideos(
    @Query('limit') limit?: string,
    @Query('days') days?: string,
  ): Observable<MessageEvent> {
    return interval(1000).pipe(
      switchMap(() =>
        this.analyticsService.topVideosByComments(
          limit ? Number(limit) : undefined,
          days ? Number(days) : undefined,
        ),
      ),
      map(({ result, duration }) => ({ data: { data: result, duration } as AnalyticsMessage<any> })),
    );
  }

  @Sse('/comments/by-minute')
  streamCommentsByMinute(
    @Query('hours') hours?: string,): Observable<MessageEvent> {
    return interval(1000).pipe(
      switchMap(() =>
        this.analyticsService.commentsByMinute(
          hours ? Number(hours) : undefined),
      ),
      map(({ result, duration }) => ({
        data: { data: result, duration } as AnalyticsMessage<any>,
      })),
    );
  }

  @Sse('/comments/top-repliers')
  streamTopRepliers(
    @Query('limit') limit?: string,
    @Query('days') days?: string,
  ): Observable<MessageEvent> {
    return interval(1000).pipe(
      switchMap(() =>
        this.analyticsService.topUsersByReplies(
          limit ? Number(limit) : undefined,
          days ? Number(days) : undefined,
        ),
      ),
      map(({ result, duration }) => ({
        data: { data: result, duration } as AnalyticsMessage<any>,
      })),
    );
  }

  @Sse('/users/user-signed-up')
  StreamUserSignUp(): Observable<MessageEvent> {
    return interval(1000).pipe(
      switchMap(() =>
        this.analyticsService.userSignedUp(
        ),
      ),
      map(({ result, duration }) => ({
        data: { data: result, duration } as AnalyticsMessage<any>,
      })),
    );
  }

}