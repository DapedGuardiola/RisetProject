ALTER TABLE "comments" ALTER COLUMN "video_id" SET DATA TYPE bigint USING "video_id"::bigint;--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "comment_id" SET DATA TYPE bigint USING "comment_id"::bigint;--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "comment_id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "videos" ALTER COLUMN "video_id" SET DATA TYPE bigint USING "video_id"::bigint;--> statement-breakpoint
ALTER TABLE "videos" ALTER COLUMN "video_id" SET MAXVALUE 9223372036854775807;