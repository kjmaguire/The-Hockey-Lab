# Change: Add fallback game id matching

## Why
Schedule game ids can sometimes differ from gamecenter ids. A fallback match (team + start time) prevents broken drill‑downs.

## What Changes
- Add a fallback matcher that maps schedule games to gamecenter ids by team abbreviations and start time.
- Use the fallback when the schedule id does not resolve in gamecenter data.

## Impact
- Affected specs: scores-view (modified)
- Affected code: resources/js/Pages/LabScores.tsx, resources/js/lib/nhl.ts
