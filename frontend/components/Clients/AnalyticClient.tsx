"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { subscribeToStream } from '@/components/api/analyticsApi';
import type { AnalyticsState } from '../Types/Analytics';
import { TopReplier, TopVideo, CommentsByMinute } from '../Types/Analytics';
interface AnalyticsContextValue extends AnalyticsState {
    setFilters: (filters: Partial<AnalyticsState['filters']>) => void;
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

const initialState: AnalyticsState = {
    topVideos: [],
    commentsByMinute: [],
    topRepliers: [],
    loading: { topVideos: true, commentsByMinute: true, topRepliers: true },
    error: { topVideos: null, commentsByMinute: null, topRepliers: null },
    durations: { topVideos: null, commentsByMinute: null, topRepliers: null },
    filters: { days: 30, hours: 24, limit: 20 },
};

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<AnalyticsState>(initialState);

    const setFilters = useCallback((filters: Partial<AnalyticsState['filters']>) => {
        setState((prev) => ({ ...prev, filters: { ...prev.filters, ...filters } }));
    }, []);

    // Top videos stream
    useEffect(() => {
        setState((prev) => ({
            ...prev,
            loading: { ...prev.loading, topVideos: true },
            error: { ...prev.error, topVideos: null },
        }));

        const cleanup = subscribeToStream<TopVideo>(
            '/top-videos',
            { limit: state.filters.limit, days: state.filters.days },
            (msg) => {
                setState((prev) => ({
                    ...prev,
                    topVideos: msg.data,
                    durations: { ...prev.durations, topVideos: msg.duration },
                    loading: { ...prev.loading, topVideos: false },
                }));
            },
            () => {
                setState((prev) => ({
                    ...prev,
                    loading: { ...prev.loading, topVideos: false },
                    error: { ...prev.error, topVideos: 'Connection lost' },
                }));
            },
        );

        return cleanup;
    }, [state.filters.limit, state.filters.days]);

    // Comments by minute stream
    useEffect(() => {
        setState((prev) => ({
            ...prev,
            loading: { ...prev.loading, commentsByMinute: true },
            error: { ...prev.error, commentsByMinute: null },
        }));

        const cleanup = subscribeToStream<CommentsByMinute>(
            '/by-minute',
            { limit: state.filters.limit, days: state.filters.days },
            (msg) => {
                setState((prev) => ({
                    ...prev,
                    commentsByMinute: msg.data,
                    durations: { ...prev.durations, commentsByMinute: msg.duration },
                    loading: { ...prev.loading, commentsByMinute: false },
                }));
            },
            () => {
                setState((prev) => ({
                    ...prev,
                    loading: { ...prev.loading, commentsByMinute: false },
                    error: { ...prev.error, commentsByMinute: 'Connection lost' },
                }));
            },
        );

        return cleanup;
    }, [state.filters.hours]);

    // Top repliers stream
    useEffect(() => {
        setState((prev) => ({
            ...prev,
            loading: { ...prev.loading, topRepliers: true },
            error: { ...prev.error, topRepliers: null },
        }));

        const cleanup = subscribeToStream<TopReplier>(
            '/top-repliers',
            { limit: state.filters.limit, days: state.filters.days },
            (msg) => {
                setState((prev) => ({
                    ...prev,
                    topRepliers: msg.data,
                    durations: { ...prev.durations, topRepliers: msg.duration },
                    loading: { ...prev.loading, topRepliers: false },
                }));
            },
            () => {
                setState((prev) => ({
                    ...prev,
                    loading: { ...prev.loading, topRepliers: false },
                    error: { ...prev.error, topRepliers: 'Connection lost' },
                }));
            },
        );

        return cleanup;
    }, [state.filters.limit, state.filters.days]);

    return (
        <AnalyticsContext.Provider value={{ ...state, setFilters }}>
            {children}
        </AnalyticsContext.Provider>
    );
}

export function useAnalytics() {
    const ctx = useContext(AnalyticsContext);
    if (!ctx) throw new Error('useAnalytics must be used within AnalyticsProvider');
    return ctx;
}