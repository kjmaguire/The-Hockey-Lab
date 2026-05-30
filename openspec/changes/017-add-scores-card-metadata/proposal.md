# Change: Expand Scores cards with schedule metadata and per-period shots

## Why
The Scores page already shows totals and basic context, but key schedule metadata and per-period shot detail are still hidden. Adding this data lets fans understand OT/SO context, neutral-site flags, and broadcast specifics without leaving the Scores view.

## What Changes
- Add per-period shots on goal to the linescore summary when provided by score/now.
- Show explicit OT/SO labels in period formatting.
- Surface neutral-site or special-event flags from schedule payloads.
- Show broadcast metadata (language, national vs regional) when present.
- Show all schedule entries returned by the API (remove day/game slicing).

## Impact
- Affected specs: scores-view (modified)
- Affected code: resources/js/lib/nhl.ts, resources/js/Pages/LabScores.tsx
