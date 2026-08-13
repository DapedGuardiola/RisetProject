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
  allReplies: Record<number, CommentType[]>;
};

const REPLIES_PER_PAGE = 10;

export default function Replies({
  userId,
  videoId,
  replies,
  allReplies,
}: paramType) {
  const [showReplies, setShowReplies] = useState(false);
  const [offset, setOffset] = useState(REPLIES_PER_PAGE);

  if (!replies || replies.length === 0) {
    return null;
  }

  const visibleReplies = replies.slice(0, offset);
  const hasMore = offset < replies.length;

  const handleToggleReplies = () => {
    setShowReplies((current) => !current);
  };

  const handleShowMore = () => {
    setOffset((current) =>
      Math.min(current + REPLIES_PER_PAGE, replies.length)
    );
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
          {visibleReplies.map((data) => (
            <Comment
              key={data.comment_id}
              data={data}
              dataReplies={allReplies[data.comment_id]}
              allReplies={allReplies}
              videoId={videoId}
              userId={userId}
            />
          ))}

          {hasMore && (
            <button
              type="button"
              onClick={handleShowMore}
              className="mt-3 text-sm font-medium"
            >
              Show more replies
            </button>
          )}
        </div>
      )}
    </>
  );
}