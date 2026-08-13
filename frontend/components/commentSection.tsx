"use client";

import { discoverValidationDepths } from "next/dist/server/app-render/instant-validation/instant-validation";
import { Timestamp } from "next/dist/server/lib/cache-handlers/types";
import { FormEvent, useMemo, useState, useEffect,Fragment } from "react";
import FormComment from "./formReply";
import Comment from "./comment";
import { useContentContext } from "./Clients/ContentClients";

type usersType = {
  user_id: number;
  username: string;
  nickname: string;
  followers_count: number;
};

type paramType = {
  userId: number;
};

type CommentItem = {
  comment_id: number;
  video_id: number;
  user_id: number;
  comment: string;
  parent_comment_id: number;
  level: number;
  create_time: Timestamp;
  user: usersType;
};

function getInitial(author: string) {
  return author.trim().charAt(0).toUpperCase() || "?";
}

export default function CommentSection({userId }: paramType) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const {activeComment,addComment, activeIndex} = useContentContext();
  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/comments/video/${activeIndex}`,
      );
      const data: CommentItem[] = await res.json();
      setComments(data);
      console.log(data);
      if (data) {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [activeIndex,addComment]);

  const { topLevel, repliesByParent } = useMemo(() => {
    if (comments) {
      const validParentIds = new Set(
        comments.map((comment) => comment.comment_id),
      );
      const groupedReplies: Record<number, CommentItem[]> = {};
      const roots: CommentItem[] = [];

      for (const comment of comments) {
        const isReply =
          comment.parent_comment_id !== null &&
          validParentIds.has(comment.parent_comment_id);
        if (isReply) {
          const parentId = comment.parent_comment_id as number;
          if (!groupedReplies[parentId]) {
            groupedReplies[parentId] = [];
          }
          groupedReplies[parentId].push(comment);
        } else {
          roots.push(comment);
        }
      }
      return { topLevel: roots, repliesByParent: groupedReplies };
    } else {
      return { topLevel: [], repliesByParent: [] };
    }
  }, [comments]);

  return isLoading ? (
    <Fragment >
      <div className="animate-spin hidden={activeComment}">
        <svg className="mr-3 size-5 animate-spin ..." viewBox="0 0 24 24"></svg>
      </div>
      <p hidden={activeComment}>Loading Comment Data...</p>
    </Fragment>
  ) : (
    <section className={activeComment?"absolute":""} hidden={activeComment}>
      {/* Comment Header  */}
      <div className="w-full max-w-60 border-b border-gray-500 rounded-t-xl">
        <h2 className="p-6 font-semibold text-2xl">
          {comments.length} Comments
        </h2>
      </div>
      <div className="py-6">
        {/* Add comment Handler */}
        <FormComment isRoot={true}
          parent={undefined}
          replyVideoId={activeIndex}
          replyUserId={userId} />

        {/*All Comments */}
        <div className="w-full ">
          {comments.length === 0 ? (
            <p className="text-2xl font-bold">No Comment Here</p>
          ) : (
            topLevel.map((root) => (
              <Comment key={root.comment_id} data={root} allReplies={repliesByParent} dataReplies={repliesByParent[root.comment_id]} videoId={activeIndex} userId={userId} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}

//   {/* Replies */}
//   {repliesByParent[root.comment_id] ? (
//     repliesByParent[root.comment_id].map((replies) => (
//       <article>
//         <div className="">
//           <img
//             src="https://picsum.photos/600/600"
//             alt={replies.user.username}
//             className="h-16 w-16 rounded-full object-cover"
//           />
//         </div>
//         <div>
//           <div className="flex-1 min-w-0 ">
//             <span className="text-sm text-zinc-500">
//               @{replies.user.nickname}
//             </span>
//           </div>
//           <p className="line-clamp-2 truncate">
//             {replies.comment}
//           </p>
//         </div>
//       </article>
//     ))
//   ) : (
//     <div>no replies</div>
//   )}
