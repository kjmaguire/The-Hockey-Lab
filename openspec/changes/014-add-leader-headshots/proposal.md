# Change: Add team leader headshots in game detail

## Why
Leader cards would be more engaging with player headshots when available in the boxscore payload.

## What Changes
- Parse leader headshot URLs from boxscore player data when available.
- Display headshots in the team leader cards.

## Impact
- Affected specs: scores-view (modified)
- Affected code: resources/js/lib/nhl.ts, resources/js/Pages/LabScoreDetail.tsx
