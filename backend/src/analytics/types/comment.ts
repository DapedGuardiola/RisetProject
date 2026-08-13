import { Timestamp } from "rxjs"

type comments = {
    comment_id: number,
    video_id: number,
    user_id: number,
    parent_comment_id: number,
    level: number,
    comment: string,
}

export interface CommentsMessage {
    data: comments[];
    duration : number | null;
}