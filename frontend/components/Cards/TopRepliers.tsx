"use Client";
import React, { useEffect,useState } from 'react';
import { useAnalytics } from '../Clients/AnalyticClient';

export function TopRepliersCard() {
  const { topRepliers, loading, error, durations } = useAnalytics();

  const [highlightClass, setHighlightClass] = useState("")
  useEffect(
    () => {
      setHighlightClass("bg-[#a2ff00] transition-colors duration-1000 ease-out");

      // turn highlight OFF after 1s so it fades back to normal
      const timeoutId = setTimeout(() => {
        setHighlightClass("bg-transparent transition-colors duration-1000 ease-out");
      }, 200);

      return () => clearTimeout(timeoutId);
    }, [topRepliers]
  )
  return (
    <div className="card">
      <div className="card-header">
        <h2>Trending Topics</h2>
        {durations.topRepliers != null && (
          <span className="duration">{durations.topRepliers.toFixed(1)} ms</span>
        )}
      </div>

      {loading.topRepliers && <p>Loading…</p>}
      {error.topRepliers && <p className="error">{error.topRepliers}</p>}

      {!loading.topRepliers && !error.topRepliers && (
        <table className="table">
          <thead>
            <tr>
              <th>Comment Id</th>
              <th>Topics</th>
              <th>Replies</th>
            </tr>
          </thead>
          <tbody>
            {topRepliers.map((tp) => (
              <tr key={tp.top_comment_id}>
                <td>{tp.top_comment_id}</td>
                <td>{tp.topic}</td>
                <td className={highlightClass}>{tp.reply_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}