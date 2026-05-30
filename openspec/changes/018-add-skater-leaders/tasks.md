## 1. Implementation
- [x] 1.1 Add `skaterLeaders` method in `App\Http\Controllers\NhlApiController` using stats API `skater/summary` with season + gameType parameters and caching.
- [x] 1.2 Add route `GET /api/nhl/skater-leaders` in `routes/web.php`.
- [x] 1.3 Add client parsing/export for skater leaders in `resources/js/lib/nhl.ts` (reuse `parseSkaterLanding` or add a new parser if needed).
- [x] 1.4 Add Lab Hockey IQ section for league-wide skater leaders (apply min GP filter, show points/goals/assists/GP).
- [x] 1.5 Add/update tests or document manual verification steps.

## Manual Verification
- GET /api/nhl/skater-leaders?season=20242025&gameType=2 returns skater rows.
- Visit /lab/hockey-iq and confirm League skater leaders renders.
