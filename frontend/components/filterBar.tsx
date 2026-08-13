import React from 'react';
import { useAnalytics } from './Clients/AnalyticClient';

export function FiltersBar() {
  const { filters, setFilters } = useAnalytics();

  return (
    <div className="filters-bar">
      <label>
        Days (videos/repliers)
        <input
          type="number"
          value={filters.days}
          onChange={(e) => setFilters({ days: Number(e.target.value) })}
        />
      </label>

      <label>
        Hours (timeline)
        <input
          type="number"
          value={filters.hours}
          onChange={(e) => setFilters({ hours: Number(e.target.value) })}
        />
      </label>

      <label>
        Limit
        <input
          type="number"
          value={filters.limit}
          onChange={(e) => setFilters({ limit: Number(e.target.value) })}
        />
      </label>

      <span className="live-indicator">🟢 Live</span>
    </div>
  );
}