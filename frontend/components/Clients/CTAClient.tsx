"use Client";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
type messageType = {
    minute: string,
    comment_count: number,
}

type dataType = {
    data: messageType[],
    duration: number
}

type contextType = {
    currentTimeLine: dataType,
    setCurrentTimeLine: (timeline: dataType) => void,
    isLoading: boolean,
    setIsLoading: (state: boolean) => void,
}

const CommentTimelineContext = createContext<contextType | undefined>(undefined);
export function CTAClients({ children }: { children: ReactNode }) {
    const [currentTimeLine, setCurrentTimeLine] = useState<dataType>(
        { data: [], duration: 0 }
    );
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        const eventSource = new EventSource('http://localhost:3000/analytics/comments/by-minute?limit');

        eventSource.onmessage = (event) => {
            const extracted: dataType = JSON.parse(event.data)
            console.log('Extracted', extracted);
            setCurrentTimeLine(extracted);
        }
        eventSource.onerror = (err) => {
            console.error('SSE error:', err);
            eventSource.close();
        };

        // cleanup saat unmount
        return () => {
            eventSource.close();
        };
    }, []);
    return (<CommentTimelineContext.Provider value={{ currentTimeLine, setCurrentTimeLine, isLoading, setIsLoading }}>
        {children}
    </CommentTimelineContext.Provider>)
}
export function useCTAContext() {
    const ctx = useContext(CommentTimelineContext);
    if (!ctx) {
        throw new Error("use this contex must be used within a Timeline contex");
    }
    return ctx;
}