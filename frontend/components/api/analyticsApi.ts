const BASE_URL = 'http://localhost:3006/';

export interface SseMessage<T> {
  data: T[];
  duration: number | null;
}

/**
 * Opens an SSE connection and calls onMessage for every event.
 * Returns a cleanup function to close the connection.
 */
export function subscribeToStream<T>(
  path: string,
  params: Record<string, string | number>,
  onMessage: (msg: SseMessage<T>) => void,
  onError: (err: Event) => void,
): () => void {
  const qs = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)]),
  ).toString();

  const es = new EventSource(`${BASE_URL}${path}?${qs}`);

  es.onmessage = (event) => {
    try {
      const parsed = JSON.parse(event.data) as SseMessage<T>;
      onMessage(parsed);
    } catch (e) {
      console.error('Failed to parse SSE message', e);
    }
  };

  es.onerror = (err) => {
    onError(err);
  };

  return () => es.close();
}