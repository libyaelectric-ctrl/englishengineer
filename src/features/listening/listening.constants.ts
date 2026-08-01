export const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5] as const;
export type PlaybackSpeed = (typeof PLAYBACK_SPEEDS)[number];
