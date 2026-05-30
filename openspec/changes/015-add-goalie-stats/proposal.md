# Change: Add goalie stats to game detail

## Why
Boxscore team stats omit goalie performance. Adding goalie stat lines gives a fuller game snapshot.

## What Changes
- Parse goalie stat lines from the gamecenter boxscore payload.
- Display goalie stats (SV%, GAA, shots, saves) in the game detail view.

## Impact
- Affected specs: scores-view (modified)
- Affected code: resources/js/lib/nhl.ts, resources/js/Pages/LabScoreDetail.tsx
