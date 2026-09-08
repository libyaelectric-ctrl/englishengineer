import { afterEach, describe, expect, it, vi } from 'vitest';

import { ObservabilityService } from '@/core/observability/observability.service';

import { logBoundaryError } from './boundaryLogging';

vi.mock('@/core/observability/observability.service', () => ({
  ObservabilityService: {
    logError: vi.fn(),
  },
}));

const mockedLogError = vi.mocked(ObservabilityService.logError);

describe('logBoundaryError', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('maps global scope to the unhandled_error code and high severity', () => {
    const error = new Error('boom');
    logBoundaryError({ error, scope: 'global' });

    expect(mockedLogError).toHaveBeenCalledTimes(1);
    const report = mockedLogError.mock.calls[0][0];
    expect(report.code).toBe('unhandled_error');
    expect(report.severity).toBe('high');
    expect(report.message).toBe('boom');
    expect(report.context).toEqual({ scope: 'global' });
  });

  it('maps page scope to page_error with the page name prefixed', () => {
    logBoundaryError({ error: new Error('broken'), scope: 'page', pageName: 'Vocabulary' });

    const report = mockedLogError.mock.calls[0][0];
    expect(report.code).toBe('page_error');
    expect(report.severity).toBe('medium');
    expect(report.message).toBe('[Vocabulary] broken');
    expect(report.context).toEqual({ scope: 'page', pageName: 'Vocabulary' });
  });

  it('maps route scope to route_error and forwards the component stack', () => {
    logBoundaryError({
      error: new Error('route failure'),
      scope: 'route',
      componentStack: 'at BrokenView',
    });

    const report = mockedLogError.mock.calls[0][0];
    expect(report.code).toBe('route_error');
    expect(report.context).toEqual({ scope: 'route', componentStack: 'at BrokenView' });
  });

  it('wraps non-Error values so every boundary reports consistently', () => {
    logBoundaryError({ error: 'string error', scope: 'page' });

    const report = mockedLogError.mock.calls[0][0];
    expect(report.message).toBe('string error');
  });
});
