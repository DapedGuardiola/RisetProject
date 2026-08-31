"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { videoType } from "./Types/VideoType";
import { useContentContext } from "./Clients/ContentClients";

const PAGE_SIZE = 2;

export default function VideoGrid() {
  const { isVideoLoading, setIsVideoLoading, activeIndex, setActiveIndex, activeComment } = useContentContext();

  const [videoList, setVideoList] = useState<videoType[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const paginationObserverRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);

  const fetchVideos = useCallback(
    async (currentOffset: number) => {
      if (loadingRef.current || !hasMore) {
        return;
      }

      loadingRef.current = true;
      if (videoList.length == 0) {
        setIsVideoLoading(true);
      }
      setError(null);

      try {
        const params = new URLSearchParams({
          offset: String(currentOffset),
        });

        const response = await fetch(
          `http://localhost:3006/api/video?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch videos: ${response.status} ${response.statusText}`
          );
        }

        const data: videoType[] = await response.json();

        if (data.length === 0) {
          setHasMore(false);
          return;
        }

        setVideoList((current) => {
          const existingIds = new Set(
            current.map((video) => video.video_id)
          );

          const newVideos = data.filter(
            (video) => !existingIds.has(video.video_id)
          );

          return [...current, ...newVideos];
        });

        setOffset(currentOffset + data.length);

        // Hanya set active video ketika initial fetch
        if (currentOffset === 0 && data.length > 0) {
          setActiveIndex(data[0].video_id);
        }

        if (data.length < PAGE_SIZE) {
          setHasMore(false);
        }
      } catch (err) {
        console.error("Failed to fetch videos:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load videos."
        );
      } finally {
        loadingRef.current = false;
        isVideoLoading ? setIsVideoLoading(false) : '';
      }
    },
    [hasMore, setActiveIndex]
  );

  /*
   * Initial fetch
   */
  useEffect(() => {
    fetchVideos(0);
  }, [fetchVideos]);

  /*
   * Observer untuk infinite scroll
   */
  useEffect(() => {
    const target = paginationObserverRef.current;

    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }

        if (loadingRef.current || !hasMore) {
          return;
        }

        fetchVideos(offset);
      },
      {
        threshold: 0,
      }
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [fetchVideos, offset, hasMore]);

  /*
   * Observer untuk menentukan active video
   *
   * Video yang masuk ke area tengah container
   * akan menjadi activeIndex.
   */
  useEffect(() => {
    const container = containerRef.current;

    if (!container || videoList.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleVideos = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              b.intersectionRatio - a.intersectionRatio
          );

        const activeVideo = visibleVideos[0];

        if (!activeVideo) {
          return;
        }

        const videoId = Number(
          (activeVideo.target as HTMLElement).dataset.videoId
        );

        if (videoId !== activeIndex) {
          console.log("switching to", videoId, "from", activeIndex);
          setActiveIndex(videoId);
        }
      },
      {
        root: container,

        rootMargin: "-40% 0px -40% 0px",

        threshold: [0, 0.5, 1],
      }
    );

    const videoElements =
      container.querySelectorAll("[data-video-id]");

    videoElements.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, [videoList, activeIndex, setActiveIndex]);

  /*
   * Scroll active video ke tengah
   *
   * Dipakai ketika activeIndex berubah dari luar
   * mekanisme user scrolling.
   */
  useEffect(() => {
    if (activeIndex === -1) {
      return;
    }

    const container = containerRef.current;

    if (!container) {
      return;
    }

    const activeElement = container.querySelector(
      `[data-video-id="${activeIndex}"]`
    ) as HTMLElement | null;

    if (!activeElement) {
      return;
    }

    const containerCenter =
      container.clientHeight / 2;

    const elementCenter =
      activeElement.offsetTop +
      activeElement.clientHeight / 2;

    const scrollTop =
      elementCenter - containerCenter;

    if (
      Math.abs(container.scrollTop - scrollTop) < 5
    ) {
      return;
    }

    container.scrollTo({
      top: scrollTop,
      behavior: "smooth",
    });
  }, [activeIndex]);

  return (
    <section className={`h-full min-w-[355px] overflow-hidden`}>
      <div
        ref={containerRef}
        className={`grid h-full ${activeComment ? `w-full` : `min-w-[355px] w-[355px]`} max-h-125 gap-6 overflow-scroll scrollbar-none`}
      >
        {videoList.map((video) => (
          <article
            key={video.video_id}
            data-video-id={video.video_id}
            className="relative mx-auto h-125 min-w-full w-full overflow-hidden rounded-3xl"
          >
            <img
              src="https://picsum.photos/800/600?random=1"
              alt={video.title}
              loading="lazy"
              className="mx-auto my-auto aspect-[19/16] h-full"
            />

            <div className="absolute bottom-0 left-0">
              <div className="space-y-3 p-5">
                <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
                  {video.title}
                </h2>

                <p className="max-w-2xl text-sm leading-6 text-zinc-600">
                  {video.description}
                </p>
              </div>
            </div>
          </article>
        ))}
        
        {error && (
          <div className="p-4 text-center text-red-600">
            {error}
          </div>
        )}

        {!hasMore && videoList.length > 0 && (
          <div className="p-4 text-center text-zinc-500">
            No more videos.
          </div>
        )}

        {/* Pagination sentinel */}
        {hasMore && (
          <div
            ref={paginationObserverRef}
            className="h-px w-full"
            aria-hidden="true"
          />
        )}
      </div>
    </section>
  );
}