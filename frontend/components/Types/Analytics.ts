export interface TopVideo {
  video_id: string;
  comment_count: number;
}

export interface CommentsByMinute {
  minute: string;
  comment_count: number;
}
export interface FilteredCommentsByMinute {
  minute: string;
  comment_count: number;
}

export interface TopReplier {
  top_comment_id: number;
  topic: string;
  reply_count: number;
}

export interface UserSignUp {
  user_count: number,
}

export interface BotComment {
  bot_comments_count: number,
}

export interface AnalyticsState {
  topVideos: TopVideo[];
  commentsByMinute: CommentsByMinute[];
  topRepliers: TopReplier[];
  userSignUp: UserSignUp[];
  botComment: BotComment[];
  filteredCommentsByMinute: FilteredCommentsByMinute[];
  loading: {
    topVideos: boolean;
    commentsByMinute: boolean;
    filteredCommentsByMinute: boolean;
    topRepliers: boolean;
    userSignUp: boolean;
    botComment: boolean;
  };
  error: {
    topVideos: string | null;
    commentsByMinute: string | null;
    filteredCommentsByMinute: string | null;
    topRepliers: string | null;
    userSignUp: string | null;
    botComment: string | null;
  };
  durations: {
    topVideos: number | null;
    commentsByMinute: number | null;
    filteredCommentsByMinute: number | null;
    topRepliers: number | null;
    userSignUp: number | null;
    botComment: number | null;
  };
  filters: {
    days: number;
    hours: number;
    limit: number;
  };
}