"use client";
import { AnalyticsProvider } from '@/components/Clients/AnalyticClient';
import { FiltersBar } from '@/components/filterBar';
import { TopVideosCard } from '@/components/Cards/TopVideos';
import { CommentsTimelineCard } from '@/components/Cards/CommentsTimeline';
import { TopRepliersCard } from '@/components/Cards/TopRepliers';
import './analytics.css';

export default function AnalyticsPage() {
  return (
    <AnalyticsProvider>
      <div className="analytics-page">
        <h1>Comment Analytics</h1>
        <FiltersBar />
        <div className="grid">
          {/* <TopVideosCard /> */}
          <CommentsTimelineCard />
          {/* <TopRepliersCard /> */}
        </div>
      </div>
    </AnalyticsProvider>
  );
}