export interface AnalyticsMessage<T> {
  data: T[];
  duration: number | null;
}