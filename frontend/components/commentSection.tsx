"use client";

import { discoverValidationDepths } from "next/dist/server/app-render/instant-validation/instant-validation";
import { Timestamp } from "next/dist/server/lib/cache-handlers/types";
import { FormEvent, useMemo, useState, useEffect, Fragment } from "react";
import FormComment from "./formReply";
import Comment from "./comment";
import { useContentContext } from "./Clients/ContentClients";

type paramType = {
  userId: number;
};

function getInitial(author: string) {
  return author.trim().charAt(0).toUpperCase() || "?";
}

export default function CommentSection({ userId }: paramType) {
  const { activeComment, isCommentLoading, comments, setComments, setIsCommentLoading, addComment, activeIndex, selectedParentId, setSelectedParentId, parentLimit, setParentLimit, childLimit, setChildLimit } = useContentContext();


  //initial state
  useEffect(() => {
    if (!activeIndex) return;

    const controller = new AbortController();
    setIsCommentLoading(true);

    const fetchData = async () => {
      try {
        const params = new URLSearchParams();
        if (parentLimit != null) params.set('parentLimit', String(parentLimit));
        if (childLimit != null) params.set('childLimit', String(childLimit));
        if (selectedParentId != null) params.set('selectedParentId', String(selectedParentId));

        const res = await fetch(
          `http://localhost:3006/api/comments/video/${activeIndex}?${params.toString()}`,
          { signal: controller.signal }
        );

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        setComments(data.result || []);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Failed to fetch comments:', err);
          setComments([]);
        }
      } finally {
        setIsCommentLoading(false);
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, [activeIndex, parentLimit, childLimit, selectedParentId]);


  console.log("act indx:", activeIndex)

  return (
    <section className={activeComment ? "absolute h-100 max-h-100 overflow-scroll scrollbar-none" : "h-100 max-h-100"} hidden={activeComment}>
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
        <div className="w-h-125 max-h-125 overflow-scroll scrollbar-none">
          {comments.length === 0 ? (
            <p className="text-2xl font-bold">No Comment Here</p>
          ) : (
            comments.map((root) => (
              <Comment key={root.comment_id} data={root} dataReplies={root.children} videoId={activeIndex} userId={userId} />
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
