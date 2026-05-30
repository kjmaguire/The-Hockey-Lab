# Change: Add broadcast and game type context to Scores

## Why
Scores cards lack broadcast and game type context even though the NHL schedule payload provides it. Adding these details improves usability without changing core behavior.

## What Changes
- Show a game type label (Regular season, Playoffs, Preseason) on each score card when available.
- Show broadcast networks on each score card when available.

## Impact
- Affected specs: scores-view (new)
- Affected code: resources/js/Pages/LabScores.tsx
