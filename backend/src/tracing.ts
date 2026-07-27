import { randomUUID } from 'node:crypto';

interface TraceSpan {
  name: string;
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  start: number;
  end: number | null;
  status: string;
  durationMs?: number;
  error?: string;
  attributes?: Record<string, unknown>;
}

interface TraceExport {
  traceId: string;
  spans: TraceSpan[];
  startTime: string;
  endTime: string;
  totalDurationMs: number;
}

const spans = new Map<string, TraceSpan>();
const traceSpans = new Map<string, Set<string>>();

export const createTraceId = (): string => randomUUID();

export const startSpan = (
  name: string,
  traceId: string,
  parentSpanId?: string,
  attributes?: Record<string, unknown>
): string => {
  const spanId = randomUUID();
  const span: TraceSpan = {
    name,
    traceId,
    spanId,
    parentSpanId,
    start: Date.now(),
    end: null,
    status: 'ok',
    attributes,
  };
  spans.set(spanId, span);

  // Track spans per trace
  if (!traceSpans.has(traceId)) {
    traceSpans.set(traceId, new Set());
  }
  traceSpans.get(traceId)!.add(spanId);

  return spanId;
};

export const endSpan = (
  spanId: string,
  status: string = 'ok',
  error: Error | null = null
): TraceSpan | undefined => {
  const span = spans.get(spanId);
  if (span) {
    span.end = Date.now();
    span.status = status;
    span.durationMs = span.end - span.start;
    if (error) span.error = error?.message;
  }
  return span;
};

export const getTraceContext = (req: {
  headers: Record<string, string | string[] | undefined>;
}): { traceId: string } => {
  const traceId = (req.headers['x-trace-id'] as string) || createTraceId();
  return { traceId };
};

export const exportTrace = (traceId: string): TraceExport | null => {
  const spanIds = traceSpans.get(traceId);
  if (!spanIds || spanIds.size === 0) return null;

  const traceSpansList: TraceSpan[] = [];
  let minStart = Infinity;
  let maxEnd = 0;

  for (const spanId of spanIds) {
    const span = spans.get(spanId);
    if (span) {
      traceSpansList.push(span);
      minStart = Math.min(minStart, span.start);
      maxEnd = Math.max(maxEnd, span.end || span.start);
    }
  }

  return {
    traceId,
    spans: traceSpansList.sort((a, b) => a.start - b.start),
    startTime: new Date(minStart).toISOString(),
    endTime: new Date(maxEnd).toISOString(),
    totalDurationMs: maxEnd - minStart,
  };
};

export const cleanupOldSpans = (maxAgeMs: number = 300000): void => {
  const cutoff = Date.now() - maxAgeMs;
  for (const [spanId, span] of spans) {
    if (span.start < cutoff) {
      spans.delete(spanId);
      const spanSet = traceSpans.get(span.traceId);
      if (spanSet) {
        spanSet.delete(spanId);
        if (spanSet.size === 0) {
          traceSpans.delete(span.traceId);
        }
      }
    }
  }
};

// Auto-cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => cleanupOldSpans(), 300000);
}
