"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { subscribeToStream } from '@/components/api/analyticsApi';
import type { AnalyticsState, BotComment, FilteredCommentsByMinute, UserSignUp } from '../Types/Analytics';
import { TopReplier, TopVideo, CommentsByMinute } from '../Types/Analytics';
interface AnalyticsContextValue extends AnalyticsState {
    setFilters: (filters: Partial<AnalyticsState['filters']>) => void;
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

const initialState: AnalyticsState = {
    topVideos: [],
    commentsByMinute: [],
    topRepliers: [],
    userSignUp: [],
    botComment: [],
    filteredCommentsByMinute: [],
    loading: { topVideos: true, commentsByMinute: true, filteredCommentsByMinute: true, topRepliers: true, userSignUp: true, botComment: true },
    error: { topVideos: null, commentsByMinute: null, filteredCommentsByMinute: null, topRepliers: null, userSignUp: null, botComment: null },
    durations: { topVideos: null, commentsByMinute: null, filteredCommentsByMinute: null, topRepliers: null, userSignUp: null, botComment: null },
    filters: { days: 1, hours: 1, limit: 5 },
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
            'api/top-videos',
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
            'api/commentsPerMinute',
            { hours: state.filters.hours },
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

    // Comments by minute stream
    useEffect(() => {
        setState((prev) => ({
            ...prev,
            loading: { ...prev.loading, filteredCommentsByMinute: true },
            error: { ...prev.error, filteredCommentsByMinute: null },
        }));

        const cleanup = subscribeToStream<FilteredCommentsByMinute>(
            'api/filteredCommentsPerMinute',
            { hours: state.filters.hours },
            (msg) => {
                setState((prev) => ({
                    ...prev,
                    filteredCommentsByMinute: msg.data,
                    durations: { ...prev.durations, filteredCommentsByMinute: msg.duration },
                    loading: { ...prev.loading, filteredCommentsByMinute: false },
                }));
            },
            () => {
                setState((prev) => ({
                    ...prev,
                    loading: { ...prev.loading, filteredCommentsByMinute: false },
                    error: { ...prev.error, filteredCommentsByMinute: 'Connection lost' },
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
            'api/top-repliers',
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

    //Inserted User Count by minute
    useEffect(() => {
        setState((prev) => ({
            ...prev,
            loading: { ...prev.loading, userSignUp: true },
            error: { ...prev.error, userSignUp: null },
        }));

        const cleanup = subscribeToStream<UserSignUp>(
            'api/user-signed-up',
            { hours: state.filters.hours },
            (msg) => {
                setState((prev) => ({
                    ...prev,
                    userSignUp: msg.data,
                    durations: { ...prev.durations, userSignup: msg.duration },
                    loading: { ...prev.loading, userSignup: false },
                }));
            },
            () => {
                setState((prev) => ({
                    ...prev,
                    loading: { ...prev.loading, userSignup: false },
                    error: { ...prev.error, userSignup: 'Connection lost' },
                }));
            },
        );
        return cleanup;
    }, []);

    useEffect(() => {
        setState((prev) => ({
            ...prev,
            loading: { ...prev.loading, botComment: true },
            error: { ...prev.error, botComment: null },
        }));

        const cleanup = subscribeToStream<BotComment>(
            'api/bot-comments',
            { hours: state.filters.hours },
            (msg) => {
                setState((prev) => ({
                    ...prev,
                    botComment: msg.data,
                    durations: { ...prev.durations, botComment: msg.duration },
                    loading: { ...prev.loading, botComment: false },
                }));
            },
            () => {
                setState((prev) => ({
                    ...prev,
                    loading: { ...prev.loading, botComment: false },
                    error: { ...prev.error, botComment: 'Connection lost' },
                }));
            },
        );
        return cleanup;
    }, []);


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