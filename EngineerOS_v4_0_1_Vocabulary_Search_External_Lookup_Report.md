# EngineerOS v4.0.1 Vocabulary Search and External Lookup Report

## Internal search

Vocabulary now has a visible search input, Search button, Enter-key submission and friendly empty-query validation. Internal results are searched across term, Turkish meaning, discipline, tags, synonyms, collocations, example and technical definition. Results respect the selected skill-level filter and appear before external data.

## External contract

The frontend never calls a dictionary or translation vendor directly. Optional lookup uses:

`GET /api/vocabulary/lookup?word=<word>&targetLang=tr`

The Express backend validates the query, applies an eight-second timeout, calls Free Dictionary API, validates the response and caches successful results in memory. LibreTranslate is optional and environment-driven. MyMemory is disabled unless explicitly enabled.

## Trust behavior

- Missing frontend backend URL: `External lookup is not configured yet. Showing internal dictionary results.`
- Provider/backend failure: `External lookup is temporarily unavailable.`
- Successful results display their real source.
- Reused results display `Cached result`.
- No definition or translation is fabricated.

## Environment

Frontend: `VITE_VOCABULARY_API_URL=`

Backend: `VOCABULARY_LOOKUP_TIMEOUT_MS=8000`, `LIBRETRANSLATE_URL=`, `LIBRETRANSLATE_API_KEY=`, `MYMEMORY_ENABLED=false`.

## Tests

Tests cover internal matching, empty input, button/Enter submission, honest unconfigured/unavailable states, result saving, advanced preview, missing backend word, provider failure and frontend/backend cache reuse.
