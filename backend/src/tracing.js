import { randomUUID } from 'node:crypto';

const spans = new Map();

export const createTraceId = () => randomUUID();

export const startSpan = (name, traceId) => {
  const spanId = randomUUID();
  const span = {
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

export const endSpan = (spanId, status = 'ok', error = null) => {
  const span = spans.get(spanId);
  if (span) {
    span.end = Date.now();
    span.status = status;
    span.durationMs = span.end - span.start;
    if (error) span.error = error?.message;
  }
  return span;
};

export const getTraceContext = (req) => {
  const traceId = req.headers['x-trace-id'] || createTraceId();
  return { traceId };
};
