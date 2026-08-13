import React from 'react';
import { useAnalytics } from '../Clients/AnalyticClient';

export function TopRepliersCard() {
  const { topRepliers, loading, error, durations } = useAnalytics();

  return (
    <div className="card">
      <div className="card-header">
        <h2>Users with Most Replies</h2>
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
              <th>#</th>
              <th>User</th>
              <th>Replies</th>
            </tr>
          </thead>
          <tbody>
            {topRepliers.map((u, i) => (
              <tr key={u.user_id}>
                <td>{i + 1}</td>
                <td>{u.user_id}</td>
                <td>{u.reply_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}