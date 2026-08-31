"use client";

import { useState } from "react";
import Comment from "./comment";
import type { CommentType } from "./Types/CommentType";
type usersType = {
  user_id: number;
  username: string;
  nickname: string;
  followers_count: number;
};

type paramType = {
  userId: number;
  videoId: number;
  replies: CommentType[];
};

export default function Replies({
  userId,
  videoId,
  replies,
}: paramType) {
  const [showReplies, setShowReplies] = useState(false);

  if (!replies || replies.length === 0) {
    return null;
  }

  const handleToggleReplies = () => {
    setShowReplies((current) => !current);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleToggleReplies}
        className="text-sm font-medium"
      >
        {showReplies
          ? "Hide replies"
          : `Show replies (${replies.length})`}
      </button>

      {showReplies && (
        <div className="max-h-100 overflow-scroll scrollbar-none">
          {replies.map((data) => (
            <Comment
              key={data.comment_id}
              data={data}
              videoId={videoId}
              userId={userId}
            />
          ))}
        </div>
      )}
    </>
  );
}