# Change: Add scoring summary and team leaders to game detail

## Why
The game detail view currently stops at team stats and recent events. Fans expect a scoring summary and quick leader stats for goals/assists/points.

## What Changes
- Add a scoring summary section to the game detail view when goal data is available.
- Add a team leaders section (goals, assists, points) when leader data is available in the boxscore payload.

## Impact
- Affected specs: scores-view (modified)
- Affected code: resources/js/lib/nhl.ts, resources/js/Pages/LabScoreDetail.tsx
