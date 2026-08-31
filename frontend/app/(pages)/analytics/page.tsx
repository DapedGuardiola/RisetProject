"use client";
import { AnalyticsProvider } from '@/components/Clients/AnalyticClient';
import { FiltersBar } from '@/components/filterBar';
import { TopVideosCard } from '@/components/Cards/TopVideos';
import { CommentsTimelineCard } from '@/components/Cards/CommentsTimeline';
import { TopRepliersCard } from '@/components/Cards/TopRepliers';
import UserSignedUp from '@/components/Cards/UserSignedUp';
import BotCard from '@/components/Cards/BotCard';

import './analytics.css';

export default function AnalyticsPage() {
  return (
    <AnalyticsProvider>
      <div className="analytics-page">
        <h1>Comment Analytics</h1>
        <FiltersBar />
        <div className="grid grid-row">
          <TopVideosCard />
          <CommentsTimelineCard />
          <TopRepliersCard />
        </div>
        <div className='absolute right-0 top-0 flex'>
          <UserSignedUp />
          <BotCard />      
        </div>
      </div>
    </AnalyticsProvider>
  );
}