# EngineerOS v2.3 Listening Engine

Current source version: **v4.0.1**. All thirteen WAV assets under `public/audio/`
remain required in every clean source package.

The twelve assets include matching A1 and A2 starter recordings used by the
skill-level content gate. Existing ten professional recordings remain intact.

## v2.6.0 Verification Note

Project Olympus verifies the Listening workspace through real Playwright browser E2E. The browser suite confirms the route loads, real shipped audio paths remain part of the application flow, and audio-unavailable resilience is represented without fake playback claims.

## Purpose

The Listening Engine now supports real browser audio playback while preserving the existing mission, evaluator, scoring, persistence, and Learning Engine integration.

The evaluator still scores comprehension, keywords, vocabulary usage, and summary quality. Audio playback improves the learning experience without changing scoring rules.

## Architecture

Existing feature architecture is preserved:

```text
src/features/listening/
  listening.types.ts
  listening.data.ts
  listening.helpers.ts
  listening.evaluator.ts
  listening.service.ts
  listening.store.ts
  index.ts
```

The page owns the browser `<audio>` element. The store persists playback state, bookmarks, replay count, listening time, average speed samples, and audio completion.

## Audio Sources

Each mission defines:

- `audioUrl`: shipped WAV asset path
- `fallbackAudioUrl`: optional fallback path only when a real fallback file exists
- `audioDurationSeconds`
- `missionType`
- `accentLabel`
- `audioSourceLabel`

Production audio files are placed in:

```text
public/audio/
```

using the mission IDs, for example:

```text
public/audio/list_site_meeting.wav
```

This package includes browser-playable `.wav` files under `public/audio/`. Metadata in `listening.data.ts` is aligned to the actual WAV duration.

## Player Features

Supported controls:

- WAV playback
- Optional fallback playback only when a real fallback file exists
- Play
- Pause
- Resume
- Replay
- Progress bar seeking
- Skip backward 10 seconds
- Skip forward 10 seconds
- Playback speed: `0.75x`, `1x`, `1.25x`, `1.5x`
- Audio preload
- Loading state
- Error state
- Retry
- Auto next mission after audio completion

Keyboard shortcuts:

- `Space`: play / pause
- `ArrowLeft`: skip backward 10 seconds
- `ArrowRight`: skip forward 10 seconds

## Transcript

Transcripts are hidden by default. The reveal control shows the transcript with sentence highlighting based on current playback progress.

The transcript panel auto-scrolls into view while revealed.

## Bookmarks And Resume

The engine persists:

- Favorite missions
- Last playback position per mission
- Replay count per mission
- Audio completion per mission

Resume data is stored locally through the existing storage layer.

## Analytics

Listening analytics now track:

- Total listening time
- Replay count
- Audio completion
- Speed samples
- Average playback speed

These analytics remain local-first and do not duplicate the central Learning Engine scoring state.

## Offline

The service exposes audio caching through the browser Cache API. If the browser does not support Cache API, or the audio asset is unavailable, the UI shows a graceful failure message.

Cloud audio synchronization is not implemented in this sprint.

## Mission Types

The current mission pack covers:

- Office Meeting
- Site Meeting
- Consultant Meeting
- Toolbox Talk
- Inspection
- Commissioning
- Generator Test
- FAT
- Fire Alarm Test
- Daily Coordination

## Production Notes

For production release:

- Replace local `.wav` files with recorded professional audio when studio assets are available.
- Keep `audioUrl` aligned with the shipped file format.
- Keep transcripts aligned with the final recordings.
- Consider CDN hosting only through configured backend/static asset policy.
