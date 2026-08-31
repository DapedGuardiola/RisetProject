import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE } from 'src/db/db.module';
import type { DrizzleDB } from 'src/db/drizzle';
import type { createCommentDTO } from './comment.dto';
import { comments, users } from 'src/db/schema';
import { CLICKHOUSE } from '../analytics/clickhouse.constants';
import type { ClickHouseClient } from '@clickhouse/client';
import { eq } from 'drizzle-orm';

@Injectable()
export class CommentsService {
    constructor(
        @Inject(DRIZZLE)
        private db: DrizzleDB,
        @Inject(CLICKHOUSE)
        private readonly ch: ClickHouseClient
    ) { }
    async findAll() {
        try {
            return await this.db.transaction(async (tx) => {
                return tx.query.comments.findMany();
            });
        } catch (e) {
            console.error(e);
        }
    }

    async findById(id: number) {
        try {
            return await this.db.transaction(async (tx) => {
                return tx.query.comments.findFirst({
                    where: {
                        comment_id: { eq: id }
                    }
                });
            });
        } catch (e) {
            console.error(e);
        }
    }

    async create(commentData: createCommentDTO) {
        try {
            const result = await this.db.transaction(async (tx) => {
                const [newComment] = await tx
                    .insert(comments)
                    .values(commentData)
                    .returning();

                if (!newComment) {
                    throw new Error('Failed to insert comment');
                }

                const [withUser] = await tx
                    .select({
                        comment_id: comments.comment_id,
                        video_id: comments.video_id,
                        parent_comment_id: comments.parent_comment_id,
                        comment: comments.comment,
                        level: comments.level,
                        user_id: comments.user_id,
                        create_time: comments.create_time,
                        users: {
                            user_id: users.user_id,
                            username: users.username,
                            nickname: users.nickname,
                            followers_count: users.followers_count,
                            create_time: users.create_time,
                        }
                    })
                    .from(comments)
                    .leftJoin(users, eq(comments.user_id, users.user_id))
                    .where(eq(comments.comment_id, newComment.comment_id));
                console.log("[response insert]" , withUser)
                return withUser;
            });

            return {
                ...result,
                children: []
            };

        } catch (e) {
            console.error(e);
            throw e;
        }
    }
    async getVideoComment(videoId: number, childLimit: number | null, selectedParentId: number | null = null, parentLimit: number | null) {
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
                  AND video_id = {videoId:UInt32}
                  ${selectedParentId !== null ? 'AND parent_comment_id = {selectedParentId:UInt32}' : ''}
                ORDER BY comment_id ASC
                LIMIT {parentLimit:Nullable(UInt32)} BY parent_comment_id
            `,
                format: 'JSONEachRow',
                query_params: selectedParentId !== null
                    ? { parentLimit, selectedParentId, videoId }
                    : { parentLimit, videoId }
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

            const parentIds = parentArr.map(c => c.comment_id);
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
                    WHERE video_id = {videoId:UInt32} and parent_comment_id IN ({parentIds:Array(UInt64)})
                    ORDER BY comment_id ASC
                    LIMIT {childLimit:Nullable(UInt32)} OFFSET {OFFSET:Nullable(UInt32)}
                `,
                    format: 'JSONEachRow',
                    query_params: { parentIds, childLimit, OFFSET, videoId }
                });
                childArr = await childResultSet.json();
                const childSummary = childResultSet.response_headers?.['x-clickhouse-summary'];
                const parsedChildSummary = childSummary ? JSON.parse(childSummary as string) : null;
                if (parsedChildSummary) total_duration += Number(parsedChildSummary.elapsed_ns) / 1e6;
            }

            const userIds = Array.from(new Set([
                ...parentArr.map(c => c.user_id),
                ...childArr.map(c => c.user_id)
            ]));

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
                    query_params: { userIds }
                });
                usersArr = await usersResultSet.json();
                const usersSummary = usersResultSet.response_headers?.['x-clickhouse-summary'];
                const parsedUsersSummary = usersSummary ? JSON.parse(usersSummary as string) : null;
                if (parsedUsersSummary) total_duration += Number(parsedUsersSummary.elapsed_ns) / 1e6;
            }

            const usersMap = new Map(usersArr.map(u => [u.user_id, u]));

            console.log(`Each Queries Separator ::::: [Duration] ${total_duration} ms`);

            return {
                result: parentArr.map(p => ({
                    ...p,
                    user: usersMap.get(p.user_id) ?? null,
                    children: childArr
                        .filter(c => c.parent_comment_id === p.comment_id)
                        .map(c => ({
                            ...c,
                            users: usersMap.get(c.user_id) ?? null
                        }))
                })),
                total_duration
            };

        } catch (e) {
            console.error(e);
            throw e;
        }
    }

}
