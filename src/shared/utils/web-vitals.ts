import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';
import { logger } from '@/shared/logger';

interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

const sendToAnalytics = (metric: WebVitalsMetric) => {
  logger.d(`[WebVitals] ${metric.name}: ${metric.value} (${metric.rating})`);

  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag(
      'event',
      metric.name,
      {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(
          metric.name === 'CLS' ? metric.value * 1000 : metric.value
        ),
        non_interaction: true,
      }
    );
  }
};

export const reportWebVitals = () => {
  onCLS(sendToAnalytics);
  onFCP(sendToAnalytics);
  onINP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
};
