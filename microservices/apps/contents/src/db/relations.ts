import { defineRelations } from "drizzle-orm";
import { videos, comments } from "./schema";
export const relations = defineRelations(
    { videos, comments }, (r) => ({
        comments: {
            video: r.one.videos({
                from: r.comments.video_id,
                to: r.videos.video_id,
            }),
            child: r.many.comments({
                from: r.comments.comment_id,
                to: r.comments.parent_comment_id,
            }),
            parent: r.one.comments({
                from: r.comments.parent_comment_id,
                to: r.comments.comment_id,
            })
        },
        videos: {
            comments: r.many.comments()
        },
    })
)