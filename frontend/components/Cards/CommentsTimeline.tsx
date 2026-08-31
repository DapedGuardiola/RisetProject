"use client";
import React from 'react';
import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,Legend } from 'recharts';
import { useAnalytics, } from '../Clients/AnalyticClient';

export function CommentsTimelineCard() {
  const { commentsByMinute, filteredCommentsByMinute, loading, error, durations } = useAnalytics();
  const mergedCommentsByMinute = useMemo(() => {
    const map = new Map();

    commentsByMinute.forEach((d) => {
      map.set(d.minute, { minute: d.minute, comment_count: d.comment_count });
    });

    filteredCommentsByMinute.forEach((d) => {
      const existing = map.get(d.minute) || { minute: d.minute };
      existing.filtered_comment_count = d.comment_count;
      map.set(d.minute, existing);
    });

    return Array.from(map.values()).sort((a, b) => a.minute.localeCompare(b.minute));
  }, [commentsByMinute, filteredCommentsByMinute]);
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
          <LineChart data={mergedCommentsByMinute}>
            <XAxis
              dataKey="minute"
              tickFormatter={(v) => new Date(v.replace(' ', 'T')).toLocaleTimeString()}
              minTickGap={40}
            />
            <YAxis allowDecimals={false} />
            <Tooltip
              labelFormatter={(v) => new Date((v as string).replace(' ', 'T')).toLocaleTimeString()}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="comment_count"
              name="All comments"
              stroke="#1ff8ff"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="filtered_comment_count"
              name="Filtered comments"
              stroke="#ff6b6b"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}