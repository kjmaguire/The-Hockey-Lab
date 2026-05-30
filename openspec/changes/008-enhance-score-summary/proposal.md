# Change: Enhance scoring summary formatting

## Why
The scoring summary is functional but could be easier to scan. Sorting by period/time and highlighting goal types (PP/SH/EN/OT) improves clarity.

## What Changes
- Sort scoring summary items by period and time.
- Display goal type badges (PP, SH, EN, OT) when available.

## Impact
- Affected specs: scores-view (modified)
- Affected code: resources/js/lib/nhl.ts, resources/js/Pages/LabScoreDetail.tsx
