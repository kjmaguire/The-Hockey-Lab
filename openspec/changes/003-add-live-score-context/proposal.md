# Change: Add live score context to Scores

## Why
Scores cards lack live period/clock context; the NHL score/now endpoint provides real-time game state details.

## What Changes
- Add an NHL API proxy for score/now.
- Parse live game state (period/clock/intermission) and attach it to score cards when available.
- Display live context on the Scores page without changing existing schedule behavior.

## Impact
- Affected specs: scores-view (modified)
- Affected code: app/Http/Controllers/NhlApiController.php, resources/js/lib/nhl.ts, resources/js/Pages/LabScores.tsx
