"use client";
import { use, useState, useEffect } from "react";
import { useContentContext } from "./Clients/ContentClients";
import { CommentItem, ParentComment } from "./Clients/ContentClients";
import { convertServerPatchToFullTree } from "next/dist/client/components/segment-cache/navigation";
export default function FormComment({
  isRoot = false,
  parent,
  parentLevel,
  replyUserId,
  replyVideoId,
}: {
  isRoot?: boolean;
  parent: number | undefined;
  parentLevel?: number;
  replyUserId: number;
  replyVideoId: number | undefined;
}) {
  const [reply, setReply] = useState(false);
  const { addComment, comments, setAddComment, setComments } = useContentContext();

  function insertReply(
    comments: ParentComment[],
    newComment: CommentItem
  ): ParentComment[] {
    return comments.map(comment => {
      if (comment.comment_id === newComment.parent_comment_id) {
        console.log("insert into comment : ", comment.comment);
        console.log("with new children : ", newComment);
        return {
          ...comment,
          children: [...comment.children, newComment],
        };
      }
      return comment;
    });
  }

  let handleReply = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newComment = {
      video_id: replyVideoId,
      parent_comment_id: parent,
      level: (isRoot ? 0 : parentLevel! + 1),
      comment: addComment,
      user_id: replyUserId,
      create_time : new Date(),
    }
    const res = await fetch(`http://localhost:3006/api/comments`, {
      method: "POST",
      headers: { "Content-Type": "Application/json" },
      body: JSON.stringify(newComment),
    });
    if (res.ok) {
      const returnedComment = await res.json();
      console.log("comment", returnedComment);
      if (isRoot) {
        setComments([...comments, { ...returnedComment, children: [] }]);
        console.log("root inserted reply ");
      } else {
        console.log("Before insertion: ", comments);
        setComments(insertReply(comments, returnedComment));
      }
      setAddComment("");
    }
  };

  useEffect(() => {
    console.log("[[[[After Insertion ]]]]", comments);
  }, [comments]);

  let handleButtonReply = () => {
    setReply(!reply);
  };
  return (
    <>
      <button
        onClick={handleButtonReply}
        className="cursor-pointer text-blue-400"
        hidden={isRoot}
      >
        reply
      </button>
      <form
        onSubmit={(e) => handleReply(e)}
        className="w-full flex"
        hidden={(!reply && !isRoot)}
      >
        <input
          name="comment"
          type="text"
          value={addComment}
          onChange={(e) => setAddComment(e.target.value)}
          className="w-full h-10 text-xl pl-2 mr-2 border border-gray-800 rounded"
          placeholder="Write your reply"
        />
        <button type="submit" className="cursor-pointer">
          Reply
        </button>
      </form>
    </>
  );
}
