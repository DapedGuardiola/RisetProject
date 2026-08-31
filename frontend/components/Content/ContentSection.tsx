"use client";

import VideoGrid from '../video';
import CommentSection from "../commentSection";
import ContentActionButton from "../Cards/ContentActionButton";
import UserSelector from "../Cards/UserSelector";
import { useContentContext } from "../Clients/ContentClients";

export default function ContentSection() {
  const { currentUser } = useContentContext();

  return (
    <div className={`relative flex flex-row gap-2 overflow-hidden w-full mx-auto`}>
      {/* Absolute User Selection Card at Top Right */}
      <UserSelector />

      <VideoGrid />
      <ContentActionButton />
      <CommentSection userId={currentUser?.user_id ?? 1} />
    </div>
  );
}
