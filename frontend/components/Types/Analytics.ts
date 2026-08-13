export interface TopVideo {
  video_id: string;
  comment_count: number;
}

export interface CommentsByMinute {
  minute: string;
  comment_count: number;
}

export interface TopReplier {
  user_id: string;
  reply_count: number;
}

export interface AnalyticsState {
  topVideos: TopVideo[];
  commentsByMinute: CommentsByMinute[];
  topRepliers: TopReplier[];
  loading: {
    topVideos: boolean;
    commentsByMinute: boolean;
    topRepliers: boolean;
  };
  error: {
    topVideos: string | null;
    commentsByMinute: string | null;
    topRepliers: string | null;
  };
  durations: {
    topVideos: number | null;
    commentsByMinute: number | null;
    topRepliers: number | null;
  };
  filters: {
    days: number;
    hours: number;
    limit: number;
  };
}