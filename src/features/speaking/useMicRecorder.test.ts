import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useMicRecorder } from './useMicRecorder';

class FakeMediaRecorder {
  static isTypeSupported = vi.fn(() => true);
  mimeType: string;
  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  onerror: (() => void) | null = null;

  constructor(_stream: MediaStream, options?: { mimeType?: string }) {
    this.mimeType = options?.mimeType ?? 'audio/webm';
  }

  start() {
    // no-op; test triggers data/stop manually
  }

  stop() {
    this.ondataavailable?.({ data: new Blob(['fake-bytes']) });
    this.onstop?.();
  }
}

const fakeTrack = { stop: vi.fn() };
const fakeStream = { getTracks: () => [fakeTrack] } as unknown as MediaStream;

describe('useMicRecorder', () => {
  beforeEach(() => {
    vi.stubGlobal('MediaRecorder', FakeMediaRecorder);
    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia: vi.fn().mockResolvedValue(fakeStream),
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('starts idle', () => {
    const { result } = renderHook(() => useMicRecorder());
    expect(result.current.status).toBe('idle');
    expect(result.current.audioBlob).toBeNull();
  });

  it('transitions to recording after start()', async () => {
    const { result } = renderHook(() => useMicRecorder());
    await act(async () => {
      await result.current.start();
    });
    expect(result.current.status).toBe('recording');
  });

  it('produces an audioBlob after stop()', async () => {
    const { result } = renderHook(() => useMicRecorder());
    await act(async () => {
      await result.current.start();
    });
    act(() => {
      result.current.stop();
    });
    await waitFor(() => expect(result.current.status).toBe('stopped'));
    expect(result.current.audioBlob).toBeInstanceOf(Blob);
    expect(result.current.audioBlob?.size).toBeGreaterThan(0);
  });

  it('reports unsupported when MediaRecorder is unavailable', async () => {
    vi.stubGlobal('MediaRecorder', undefined);
    const { result } = renderHook(() => useMicRecorder());
    await act(async () => {
      await result.current.start();
    });
    expect(result.current.status).toBe('unsupported');
  });

  it('reports permission-denied when getUserMedia rejects with NotAllowedError', async () => {
    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia: vi
          .fn()
          .mockRejectedValue(new DOMException('denied', 'NotAllowedError')),
      },
    });
    const { result } = renderHook(() => useMicRecorder());
    await act(async () => {
      await result.current.start();
    });
    expect(result.current.status).toBe('permission-denied');
  });

  it('reset() returns to idle and clears the recording', async () => {
    const { result } = renderHook(() => useMicRecorder());
    await act(async () => {
      await result.current.start();
    });
    act(() => {
      result.current.stop();
    });
    await waitFor(() => expect(result.current.status).toBe('stopped'));

    act(() => {
      result.current.reset();
    });
    expect(result.current.status).toBe('idle');
    expect(result.current.audioBlob).toBeNull();
  });
});
