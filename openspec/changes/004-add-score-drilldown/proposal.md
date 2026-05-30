# Change: Add game detail drilldown on Scores

## Why
Scores cards only show high-level info. The NHL gamecenter endpoints provide boxscore and play-by-play data that fans expect when clicking into a game.

## What Changes
- Add NHL API proxies for gamecenter boxscore and play-by-play by game id.
- Add a Scores game detail page that surfaces boxscore and key play-by-play context.
- Link Scores cards to the game detail page.

## Impact
- Affected specs: scores-view (modified)
- Affected code: routes/web.php, app/Http/Controllers/NhlApiController.php, resources/js/lib/nhl.ts, resources/js/Pages/LabScores.tsx, new detail page
