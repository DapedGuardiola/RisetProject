import { Timestamp } from "next/dist/server/lib/cache-handlers/types";
import type {UserType} from './UserType';

export type CommentType = {
  comment_id: number;
  video_id: number;
  user_id: number;
  comment: string;
  parent_comment_id: number;
  level: number;
  create_time: Timestamp;
  user: UserType;
};