import { Injectable, Inject } from '@nestjs/common';
import { CLICKHOUSE } from './clickhouse.constants';
import { ClickHouseClient } from '@clickhouse/client';

export interface QueryResult<T> {
  result: T[];
  duration: number | null;
}

@Injectable()
export class ClickhouseService {
  constructor(
    @Inject(CLICKHOUSE)
    private ch: ClickHouseClient) { }

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

  async getSignUpAnalytics() {
    const query = `
      SELECT
        count() AS user_count
      FROM users_storage
      WHERE create_time >= toStartOfHour(now())
      `;
    return this.run<{ user_count: number }>(query);
  }

  async getTotalComment() {
    console.log("hit service");
    const query = `
      SELECT * from video_comment_totals` ;
    return this.run<{ video_id: number, total_comments: number }>(query);
  }

  async getCommentsPerMinutes(hours = 24) {
    const query = `
      SELECT
        toStartOfMinute(create_time) AS minute,
        count() AS comment_count
      FROM comments_storage
      WHERE create_time >= now() - INTERVAL {hours:UInt32} HOUR
      GROUP BY minute
      ORDER BY minute ASC
    `;
    return this.run<{ minute: string; comment_count: number }>(query, { hours });
  }

  async getFilteredCommentsPerMinutes(hours = 24) {
    const query = `
      SELECT
        minute,
        countMerge(comments_this_minute) AS comment_count
    FROM video_comment_minutes
    WHERE minute >= now() - INTERVAL {hours:UInt32} HOUR
    GROUP BY minute
    `;
    return this.run<{ minute: string; comment_count: number }>(query, { hours });
  }

  async topVideosByComments(limit = 5, days = 1) {
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

  async topComments(limit = 5, days = 1) {
    const query = `
      SELECT
          parent_comment_id AS top_comment_id,
          any(p.comment) AS topic,
          count() AS reply_count
      FROM comments_storage AS c
      INNER JOIN comments_storage AS p
        ON c.parent_comment_id = p.comment_id
      WHERE p.level = 0 and  create_time >= now() - INTERVAL {days:UInt32} DAY
      GROUP BY parent_comment_id
      ORDER BY reply_count DESC
      LIMIT {limit:UInt32}
      `;
    return this.run<{ top_comment_id: number; topic: Text, reply_count: number }>(query, { limit, days });
  }

  async userSignedUp() {
    const query = `
      SELECT
        count() AS user_count
      FROM users_storage
      WHERE create_time >= toStartOfHour(now())
      `;
    return this.run<{ user_count: number }>(query);
  }
  async botCommentsCount() {
    const query = `
      SELECT sum(bot_comments_count) AS bot_comments_count  from bot_comments
      `;
    return this.run<{ bot_comments_count: number }>(query);
  }

  async getVideoComment(
    videoId: number,
    childLimit: number | null = 10,
    selectedParentId: number | null = null,
    parentLimit: number | null = 10,
  ) {
    const pLimit = Number(parentLimit) || 10;
    const cLimit = Number(childLimit) || 10;
    const vId = Number(videoId);
    const OFFSET = 0;

    try {
      const parentResultSet = await this.ch.query({
        query: `
        SELECT
            comment_id,
            video_id,
            parent_comment_id,
            comment,
            level,
            user_id,
            create_time
        FROM comments_storage
        WHERE level = 0
          AND video_id = {vId:UInt32}
        ORDER BY comment_id ASC
        LIMIT {pLimit:UInt32}
      `,
        format: 'JSONEachRow',
        query_params: { pLimit, vId },
      });

      const parentArr = await parentResultSet.json<{
        comment_id: number;
        video_id: number;
        parent_comment_id: number | null;
        comment: string;
        level: number;
        user_id: number;
        create_time: string;
      }>();

      const parentIds = parentArr.map((c) => c.comment_id);
      let total_duration = 0;

      const parentSummary = parentResultSet.response_headers?.['x-clickhouse-summary'];
      const parsedParentSummary = parentSummary ? JSON.parse(parentSummary as string) : null;
      if (parsedParentSummary) total_duration += Number(parsedParentSummary.elapsed_ns) / 1e6;

      let childArr: any[] = [];

      if (parentIds.length > 0) {
        const childResultSet = await this.ch.query({
          query: `
          SELECT
              comment_id,
              video_id,
              parent_comment_id,
              comment,
              level,
              user_id,
              create_time
          FROM comments_storage
          WHERE video_id = {vId:UInt32} 
            AND parent_comment_id IN ({parentIds:Array(UInt64)})
          ORDER BY comment_id ASC
          LIMIT {cLimit:UInt32} BY parent_comment_id
        `,
          format: 'JSONEachRow',
          query_params: { parentIds, cLimit, vId },
        });
        childArr = await childResultSet.json();
        const childSummary = childResultSet.response_headers?.['x-clickhouse-summary'];
        const parsedChildSummary = childSummary ? JSON.parse(childSummary as string) : null;
        if (parsedChildSummary) total_duration += Number(parsedChildSummary.elapsed_ns) / 1e6;
      }


      const userIds = Array.from(
        new Set([
          ...parentArr.map((c) => c.user_id),
          ...childArr.map((c) => c.user_id),
        ]),
      );

      let usersArr: {
        user_id: number;
        username: string;
        nickname: string;
        followers_count: number;
        create_time: string | null;
      }[] = [];

      if (userIds.length > 0) {
        const usersResultSet = await this.ch.query({
          query: `
          SELECT
              user_id,
              username,
              nickname,
              followers_count,
              create_time
          FROM users_storage
          WHERE user_id IN ({userIds:Array(UInt64)})
        `,
          format: 'JSONEachRow',
          query_params: { userIds },
        });
        usersArr = await usersResultSet.json();
        const usersSummary = usersResultSet.response_headers?.['x-clickhouse-summary'];
        const parsedUsersSummary = usersSummary ? JSON.parse(usersSummary as string) : null;
        if (parsedUsersSummary) total_duration += Number(parsedUsersSummary.elapsed_ns) / 1e6;
      }

      const usersMap = new Map(usersArr.map((u) => [u.user_id, u]));

      return {
        result: parentArr.map((p) => ({
          ...p,
          user: usersMap.get(p.user_id) ?? null,
          children: childArr
            .filter((c) => c.parent_comment_id === p.comment_id)
            .map((c) => ({
              ...c,
              user: usersMap.get(c.user_id) ?? null,
            })),
        })),
        total_duration,
      };
    } catch (e) {
      console.error('Error fetching video comments from ClickHouse:', e);
      throw e;
    }
  }

}
