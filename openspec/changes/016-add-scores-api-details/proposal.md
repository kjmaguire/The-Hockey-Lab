# Change: Add richer score card details from NHL API

## Why
The Scores page already shows schedule and live context, but several helpful data points from the NHL API are still missing. Surfacing them keeps fans from bouncing into the detail page just to confirm basics like series status or shots on goal.

## What Changes
- Add series status, linescore, and shots on goal to score cards when score/now provides them.
- Add broadcast breakdown (TV vs radio), venue detail, and status flags when schedule provides them.
- Add links to gamecenter, recap, or tickets when available in schedule payloads.

## Impact
- Affected specs: scores-view (modified)
- Affected code: resources/js/lib/nhl.ts, resources/js/Pages/LabScores.tsx
