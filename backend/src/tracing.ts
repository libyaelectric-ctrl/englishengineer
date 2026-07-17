import { randomUUID } from 'node:crypto';

interface TraceSpan {
  name: string;
  traceId: string;
  spanId: string;
  start: number;
  end: number | null;
  status: string;
  durationMs?: number;
  error?: string;
}

const spans = new Map<string, TraceSpan>();

export const createTraceId = (): string => randomUUID();

export const startSpan = (name: string, traceId: string): string => {
  const spanId = randomUUID();
  const span: TraceSpan = {
    name,
    traceId,
    spanId,
    start: Date.now(),
    end: null,
    status: 'ok',
  };
  spans.set(spanId, span);
  return spanId;
};

export const endSpan = (spanId: string, status: string = 'ok', error: Error | null = null): TraceSpan | undefined => {
  const span = spans.get(spanId);
  if (span) {
    span.end = Date.now();
    span.status = status;
    span.durationMs = span.end - span.start;
    if (error) span.error = error?.message;
  }
  return span;
};

export const getTraceContext = (req: { headers: Record<string, string | string[] | undefined> }): { traceId: string } => {
  const traceId = (req.headers['x-trace-id'] as string) || createTraceId();
  return { traceId };
};
