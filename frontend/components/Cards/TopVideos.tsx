import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAnalytics } from '../Clients/AnalyticClient';

export function TopVideosCard() {
  const { topVideos, loading, error, durations } = useAnalytics();

  return (
    <div className="card">
      <div className="card-header">
        <h2>Top Videos by Comments</h2>
        {durations.topVideos != null && (
          <span className="duration">{durations.topVideos.toFixed(1)} ms</span>
        )}
      </div>

      {loading.topVideos && <p>Loading…</p>}
      {error.topVideos && <p className="error">{error.topVideos}</p>}

      {!loading.topVideos && !error.topVideos && (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={topVideos} layout="vertical" margin={{ left: 40 }}>
            <XAxis type="number" allowDecimals={false} />
            <YAxis type="category" dataKey="video_id" width={120} />
            <Tooltip />
            <Bar dataKey="comment_count" fill="#4f46e5" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}