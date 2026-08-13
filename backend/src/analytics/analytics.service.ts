import { Inject, Injectable } from '@nestjs/common';
import { CLICKHOUSE } from './clickhouse.constants';
import type { ClickHouseClient } from '@clickhouse/client';

interface QueryResult<T> {
  result: T[];
  duration: number | null;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @Inject(CLICKHOUSE)
    private readonly ch: ClickHouseClient,
  ) { }

  private async run<T = any>(query: string, params?: Record<string, any>): Promise<QueryResult<T>> {
    const res = await this.ch.query({
      query,
      format: 'JSONEachRow',
      query_params: params,
    });
    const summary = res.response_headers?.['x-clickhouse-summary'];
    const parsedSummary = summary ? JSON.parse(summary as string) : null;
    const duration = parsedSummary ? Number(parsedSummary.elapsed_ns) / 1e6 : null;
    const result = await res.json<T>();
    console.log(`Each Queries Separator  ::::: [Duration] ${duration} ms`);
    return { result: result as unknown as T[], duration };
  }
  async streamComments() {
    const res = await this.ch.query({
      query: 'SELECT * FROM comments_storage',
      format: 'JSONEachRow'
    })
    const summary = res.response_headers?.['x-clickhouse-summary'];
    const parsedSummary = summary ? JSON.parse(summary as string) : null;
    const duration = parsedSummary ? Number(parsedSummary.elapsed_ns) / 1e6 : null;
    const result = await res.json();
    console.log(`Each Queries Separator  ::::: [Duration] ${duration} ms`);
    return { result, duration };
  }

  /** Videos with the most comments */
  async topVideosByComments(limit = 20, days = 30) {
    const query = `
      SELECT
        video_id,
        count() AS comment_count
      FROM comments_storage
      WHERE create_time >= now() - INTERVAL {days:UInt32} DAY
      GROUP BY video_id
      ORDER BY comment_count DESC
      LIMIT {limit:UInt32}
    `;
    return this.run<{ video_id: string; comment_count: number }>(query, { limit, days });
  }

  /** Comment volume bucketed by minute */
  async commentsByMinute(limit) {
    const query = `
      SELECT
        toStartOfMinute(create_time) AS minute,
        count() AS comment_count
      FROM comments_storage
      GROUP BY minute
      ORDER BY minute ASC
    `;
    return this.run<{ minute: string; comment_count: number }>(query,{limit});
  }

  /** Users with the most replies (comments where parent_comment_id is not null) */
  async topUsersByReplies(limit = 20, days = 30) {
    const query = `
      SELECT
        user_id,
        count() AS reply_count
      FROM comments_storage
      WHERE parent_comment_id != ''
        AND create_time >= now() - INTERVAL {days:UInt32} DAY
      GROUP BY user_id
      ORDER BY reply_count DESC
      LIMIT {limit:UInt32}
    `;
    return this.run<{ user_id: string; reply_count: number }>(query, { limit, days });
  }
}