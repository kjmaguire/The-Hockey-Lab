# Change: Add league-wide skater leaders from stats API

## Why
We currently show goalie leaders from the NHL stats API but skater leaders come only from NHL Edge. We need league-wide skater summary leaders from the stats API for consistent coverage.

## What Changes
- Add a `skater-leaders` API endpoint backed by `api.nhle.com/stats/rest/en` skater summary.
- Add client parsing for stats API skater leaders.
- Display league-wide skater leaders in Lab Hockey IQ (season + game type).

## Impact
- Affected specs: nhl-data
- Affected code: app/Http/Controllers/NhlApiController.php, routes/web.php, resources/js/lib/nhl.ts, resources/js/Pages/LabHockeyIQ.tsx
