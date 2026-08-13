ALTER TABLE "comments" ALTER COLUMN "video_id" SET DATA TYPE integer USING "video_id"::integer;--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "comment_id" SET DATA TYPE integer USING "comment_id"::integer;--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "comment_id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "comments_comment_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "videos" ALTER COLUMN "video_id" SET DATA TYPE integer USING "video_id"::integer;--> statement-breakpoint
ALTER TABLE "videos" ALTER COLUMN "video_id" SET MAXVALUE 2147483647;