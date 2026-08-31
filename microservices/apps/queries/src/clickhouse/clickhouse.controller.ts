import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ClickhouseService } from './clickhouse.service';
export interface Message<T> {
    result: T[];
    duration: number | null;
}

@Controller()
export class ClickhouseController {
    constructor(private chService: ClickhouseService) { }
    @MessagePattern('userSignUp')
    async userSignUp(): Promise<Message<any>> {
        const { result, duration } = await this.chService.getSignUpAnalytics();
        return { result, duration };
    }
    @MessagePattern('queries.clickhouse.getCommentTotal')
    async getCommentTotal() {
        console.log("hit controller")
        const res = await this.chService.getTotalComment();
        return res;
    }
    @MessagePattern('queries.clickhouse.getCommentsPerMinute')

    async getCommentsPerMinute() {
        const res = await this.chService.getCommentsPerMinutes();
        return res;
    }

    @MessagePattern('queries.clickhouse.getFilteredCommentsPerMinute')
    async getFilteredCommentsPerMinute() {
        const res = await this.chService.getFilteredCommentsPerMinutes();
        return res;
    }

    @MessagePattern('queries.clickhouse.getTopVideos')
    async getTopVideos(
        @Payload() { limit, days }: { limit: string; days: string }
    ) {
        const res = await this.chService.topVideosByComments(Number(limit), Number(days));
        return res;
    }

    @MessagePattern('queries.clickhouse.getTopReplies')
    async getTopReplies(
        @Payload() { limit, days }: { limit: string; days: string }
    ) {
        const res = await this.chService.topComments(Number(limit), Number(days));
        return res;
    }

    @MessagePattern('queries.clickhouse.getUserSignedUp')
    async getUserSignedUp() {
        const res = await this.chService.userSignedUp();
        return res;
    }

    @MessagePattern('queries.clickhouse.botCommentsCount')
    async botCommentsCount() {
        const res = await this.chService.botCommentsCount();
        return res;
    }

    @MessagePattern('queries.clickhouse.getVideoComments')
    async getVideoComments(
        @Payload() { childLimit, selectedParentId, videoId, parentLimit }: { childLimit: number | null, selectedParentId: number | null, videoId: number, parentLimit: number | null }
    ) {
        return this.chService.getVideoComment(videoId, childLimit, selectedParentId, parentLimit);
    }
}
