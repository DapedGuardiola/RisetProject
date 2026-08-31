import { AnyPgColumn, text, integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const videos = pgTable('videos', {
    video_id: integer().primaryKey().generatedByDefaultAsIdentity(),
    title: varchar().unique(),
    description: text(),
    views_count: integer().default(0),
})
export const comments = pgTable('comments', {
    video_id: integer().references(() => videos.video_id),
    user_id: integer(),
    comment_id: integer().primaryKey().generatedByDefaultAsIdentity(),
    parent_comment_id: integer().references((): AnyPgColumn => comments.comment_id),
    comment: text(),
    level: integer(),
    create_time: timestamp(),
})