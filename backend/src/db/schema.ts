import { AnyPgColumn, text, integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const users = pgTable('users', {
    user_id: integer().primaryKey().generatedAlwaysAsIdentity(),
    username: varchar().unique(),
    nickname: varchar(),
    followers_count: integer(),
    create_time: timestamp(),
})
export const videos = pgTable('videos', {
    video_id: integer().primaryKey().generatedAlwaysAsIdentity(),
    title: varchar().unique(),
    description: text(),
    views_count: integer().default(0),
})
export const comments = pgTable('comments', {
    video_id: integer().references(() => videos.video_id),
    user_id: integer().references(() => users.user_id),
    comment_id: integer().primaryKey().generatedAlwaysAsIdentity(),
    parent_comment_id: integer().references((): AnyPgColumn => comments.comment_id),
    comment: text(),
    level: integer(),
    create_time: timestamp(),
})