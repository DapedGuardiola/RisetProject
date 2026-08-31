CREATE TABLE "comments" (
	"video_id" integer,
	"user_id" integer,
	"comment_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "comments_comment_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"parent_comment_id" integer,
	"comment" text,
	"level" integer,
	"create_time" timestamp
);
--> statement-breakpoint
CREATE TABLE "videos" (
	"video_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "videos_video_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" varchar UNIQUE,
	"description" text,
	"views_count" integer DEFAULT 0
);
--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_video_id_videos_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos"("video_id");--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_comment_id_comments_comment_id_fkey" FOREIGN KEY ("parent_comment_id") REFERENCES "comments"("comment_id");