export class CreateCommentDto {
    video_id!: number;
    comment!: string;
    user_id!: number;
    parent_comment_id?: number;
    level?: number;
    create_time?: Date;
}
