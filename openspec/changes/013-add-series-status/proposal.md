# Change: Add playoff series status to score detail

## Why
During playoffs, users expect to see the series record and game number context. The score payload often includes series info.

## What Changes
- Parse series status from the score/now payload when available.
- Display series status on the game detail page.

## Impact
- Affected specs: scores-view (modified)
- Affected code: resources/js/lib/nhl.ts, resources/js/Pages/LabScoreDetail.tsx
