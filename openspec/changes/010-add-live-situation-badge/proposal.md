# Change: Add live situation badges to score cards

## Why
Live games benefit from context such as power play, shorthanded, empty net, or goalie pulled. A compact badge makes these situations visible at a glance.

## What Changes
- Parse live situation context from the score/now payload when available.
- Display a badge (PP, SH, EN, GP) on score cards for live games.

## Impact
- Affected specs: scores-view (modified)
- Affected code: resources/js/lib/nhl.ts, resources/js/Pages/LabScores.tsx
