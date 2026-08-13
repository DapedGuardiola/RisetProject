"use client";
import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAnalytics } from '../Clients/AnalyticClient';

export function CommentsTimelineCard() {
  const { commentsByMinute, loading, error, durations } = useAnalytics();

  return (
    <div className="card">
      <div className="card-header">
        <h2>Comments Added per Minute</h2>
        {durations.commentsByMinute != null && (
          <span className="duration">{durations.commentsByMinute.toFixed(1)} ms</span>
        )}
      </div>

      {loading.commentsByMinute && <p>Loading…</p>}
      {error.commentsByMinute && <p className="error">{error.commentsByMinute}</p>}

      {!loading.commentsByMinute && !error.commentsByMinute && (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={commentsByMinute}>
            <XAxis
              dataKey="minute"
              tickFormatter={(v) => new Date(v.replace(' ', 'T')).toLocaleTimeString()}
              minTickGap={40}
            />
            <YAxis allowDecimals={false} />
            <Tooltip labelFormatter={(v) => new Date((v as string).replace(' ', 'T')).toLocaleTimeString()} />
            <Line type="monotone" dataKey="comment_count" stroke="#16a34a" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}