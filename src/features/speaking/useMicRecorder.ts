import { useCallback, useEffect, useRef, useState } from 'react';

export type MicRecorderStatus =
  | 'idle'
  | 'requesting-permission'
  | 'recording'
  | 'stopped'
  | 'unsupported'
  | 'permission-denied'
  | 'error';

export interface MicRecorderResult {
  status: MicRecorderStatus;
  /** The recorded audio, available once status === 'stopped'. */
  audioBlob: Blob | null;
  /** MIME type actually used by the recorder (e.g. 'audio/webm'). */
  mimeType: string | null;
  errorMessage: string | null;
  start: () => Promise<void>;
  stop: () => void;
  /** Clears any previous recording/error and returns to 'idle'. */
  reset: () => void;
}

const PREFERRED_MIME_TYPES = [
  'audio/webm',
  'audio/ogg',
  'audio/mp4',
  'audio/wav',
];

function pickSupportedMimeType(): string | null {
  if (typeof MediaRecorder === 'undefined') return null;
  if (typeof MediaRecorder.isTypeSupported !== 'function') {
    // Some environments support MediaRecorder without isTypeSupported;
    // fall back to letting the browser pick its own default.
    return '';
  }
  for (const type of PREFERRED_MIME_TYPES) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return '';
}

/**
 * Records short spoken audio clips via the browser's MediaRecorder API.
 * This hook only captures audio -- it does not transcribe, score, or upload
 * it. Kademe 5.1: mic capture only, deliberately scoped small.
 */
export function useMicRecorder(): MicRecorderResult {
  const [status, setStatus] = useState<MicRecorderStatus>('idle');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => cleanupStream, [cleanupStream]);

  const start = useCallback(async () => {
    setErrorMessage(null);
    setAudioBlob(null);

    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === 'undefined'
    ) {
      setStatus('unsupported');
      setErrorMessage(
        'Audio recording is not supported in this browser.'
      );
      return;
    }

    setStatus('requesting-permission');

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
      const isPermissionError =
        error instanceof DOMException &&
        (error.name === 'NotAllowedError' ||
          error.name === 'PermissionDeniedError');
      setStatus(isPermissionError ? 'permission-denied' : 'error');
      setErrorMessage(
        isPermissionError
          ? 'Microphone permission was denied.'
          : 'Could not access the microphone.'
      );
      return;
    }

    streamRef.current = stream;
    const selectedMimeType = pickSupportedMimeType();
    if (selectedMimeType === null) {
      cleanupStream();
      setStatus('unsupported');
      setErrorMessage('No supported audio recording format was found.');
      return;
    }

    chunksRef.current = [];
    const recorder = selectedMimeType
      ? new MediaRecorder(stream, { mimeType: selectedMimeType })
      : new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    setMimeType(recorder.mimeType || selectedMimeType || null);

    recorder.ondataavailable = (event: BlobEvent) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, {
        type: recorder.mimeType || selectedMimeType || 'audio/webm',
      });
      setAudioBlob(blob);
      setStatus('stopped');
      cleanupStream();
    };

    recorder.onerror = () => {
      setStatus('error');
      setErrorMessage('Recording failed unexpectedly.');
      cleanupStream();
    };

    recorder.start();
    setStatus('recording');
  }, [cleanupStream]);

  const stop = useCallback(() => {
    if (mediaRecorderRef.current && status === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, [status]);

  const reset = useCallback(() => {
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    cleanupStream();
    setAudioBlob(null);
    setMimeType(null);
    setErrorMessage(null);
    setStatus('idle');
  }, [cleanupStream]);

  return { status, audioBlob, mimeType, errorMessage, start, stop, reset };
}
