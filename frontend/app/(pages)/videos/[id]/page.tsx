import VideoDetailClient from "@/components/videoDetailClient";
type VideoDetailPageProps = {
  params: Promise<{
    id: number;
  }>;
};
type videoType = {
  video_id: number;
  title: string;
  yt_key: string;
  description: string;
  thumbnail: string;
  views_count: number;
};
export default async function VideoDetailPage({
  params,
}: VideoDetailPageProps) {
  
  const { id } = await params;
  const videoRes = await fetch(`http://backend:3000/video/${id}`);
  const data: videoType = await videoRes.json();

  return <VideoDetailClient data={data} id={id} />
}
