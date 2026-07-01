# EngineerOS v4.0.1 Vocabulary Memory and Review Report

## Canonical local memory

Saved search results use one storage-backed vocabulary memory state. Each saved word records term, Turkish meaning, CEFR, category, example, status, date added, last review, next review, review count and source.

Allowed statuses are New, Learning, Weak, Review Today and Mastered. New words return tomorrow, Learning words in two days, Weak/Review Today words immediately, and Mastered words after seven days. Existing vocabulary evaluation marks a saved word Weak after an incorrect answer.

## User views

- Search Vocabulary
- My Vocabulary
- Review Queue
- Weak Words

My Vocabulary filters support All, A1, A2, B1, B2, C1, C2, Weak, Review Today and Mastered. Actions support Mark as Learned, Mark as Weak, Review Again, Mark as Mastered and Remove.

The UI states `Saved locally on this device.` Cloud synchronization is not claimed.

## Dashboard

The Dashboard vocabulary panel consumes the same memory service and shows Saved, Due today, Weak and Mastered counts without duplicating persistence.

## Tests

Tests cover save, deduplication, persistence, Weak, Mastered, removal, due queue, CEFR/status filters and dashboard summary calculations.
