import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE } from 'src/db/db.module';
import type { DrizzleDB } from 'src/db/drizzle';
import type { createCommentDTO } from './comment.dto';
import { comments } from 'src/db/schema';
@Injectable()
export class CommentsService {
    constructor(
        @Inject(DRIZZLE)
        private db: DrizzleDB
    ) {}
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
            const inserted = await this.db.transaction(async (tx) => {
                return tx.insert(comments).values(commentData);
            });
            console.log(inserted);
        } catch (e) {
            console.error(e);
        }
    }
    async getVideoComment(id: number) {
        try {
            return await this.db.transaction(async (tx) => {
                return tx.query.comments.findMany({
                    where: {
                        video_id: { eq: id }
                    },
                    with: {
                        user: true
                    }
                });
            });
        } catch (e) {
            console.error(e);
        }
    }

}
