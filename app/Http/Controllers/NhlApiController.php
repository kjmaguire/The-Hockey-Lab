<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class NhlApiController extends Controller
{
    private const API_BASE = 'https://api-web.nhle.com/v1';
    private const STATS_API_BASE = 'https://api.nhle.com/stats/rest/en';
    private const CACHE_SECONDS = 300;

    public function schedule(Request $request): JsonResponse
    {
        $start = $request->query('start');
        $end = $request->query('end');
        $date = $request->query('date');

        if ($start && $end) {
            return $this->scheduleRange($start, $end);
        }

        if ($date) {
            return $this->proxy(
                "schedule/{$date}",
                "nhl.schedule.{$date}"
            );
        }

        return $this->proxy('schedule/now', 'nhl.schedule');
    }

    public function scoreboard(Request $request): JsonResponse
    {
        $date = $request->query('date');

        if ($date) {
            return $this->proxy(
                "score/{$date}",
                "nhl.scoreboard.{$date}"
            );
        }

        return $this->proxy('score/now', 'nhl.scoreboard');
    }

    public function gamecenterBoxscore(string $gameId): JsonResponse
    {
        return $this->proxy(
            "gamecenter/{$gameId}/boxscore",
            "nhl.gamecenter.boxscore.{$gameId}"
        );
    }

    public function gamecenterPlayByPlay(string $gameId): JsonResponse
    {
        return $this->proxy(
            "gamecenter/{$gameId}/play-by-play",
            "nhl.gamecenter.playbyplay.{$gameId}"
        );
    }

    public function gamecenterRightRail(string $gameId): JsonResponse
    {
        return $this->proxy(
            "gamecenter/{$gameId}/right-rail",
            "nhl.gamecenter.right-rail.{$gameId}"
        );
    }

    public function teams(): JsonResponse
    {
        $cacheKey = 'nhl.teams';

        if (Cache::has($cacheKey)) {
            return response()->json(Cache::get($cacheKey));
        }

        try {
            $response = Http::acceptJson()
                ->timeout(10)
                ->get(self::API_BASE.'/standings/now');
        } catch (\Throwable $exception) {
            return response()->json([
                'error' => true,
                'message' => 'Unable to reach the NHL API.',
            ], 502);
        }

        if (! $response->successful()) {
            return response()->json([
                'error' => true,
                'status' => $response->status(),
                'message' => 'NHL API responded with an error.',
            ], 502);
        }

        $standings = $response->json('standings') ?? [];
        $teams = collect($standings)
            ->map(function (array $row, int $index) {
                $name = data_get($row, 'teamName.default')
                    ?: data_get($row, 'teamName')
                    ?: data_get($row, 'teamCommonName.default')
                    ?: data_get($row, 'placeName.default')
                    ?: 'Unknown';
                $abbrev = data_get($row, 'teamAbbrev.default')
                    ?: data_get($row, 'teamAbbrev');
                $id = data_get($row, 'teamId')
                    ?: $abbrev
                    ?: $name
                    ?: $index;

                return [
                    'id' => $id,
                    'name' => $name,
                    'abbrev' => $abbrev,
                ];
            })
            ->values()
            ->all();

        $data = ['teams' => $teams];
        Cache::put($cacheKey, $data, now()->addSeconds(self::CACHE_SECONDS));

        return response()->json($data);
    }

    public function standings(): JsonResponse
    {
        return $this->proxy('standings/now', 'nhl.standings');
    }

    public function goalieLeaders(Request $request): JsonResponse
    {
        $season = $request->query('season', '20242025');
        $gameType = $request->query('gameType', '2');

        try {
            $data = $this->statsRequest(
                'goalie/summary',
                "nhl.stats.goalie.summary.{$season}.{$gameType}",
                [
                    'isAggregate' => 'false',
                    'isGame' => 'false',
                    'start' => 0,
                    'limit' => 200,
                    'cayenneExp' => "seasonId={$season} and gameTypeId={$gameType}",
                ],
            );
        } catch (\Throwable $exception) {
            return response()->json([
                'error' => true,
                'message' => 'Unable to reach the NHL stats API.',
            ], 502);
        }

        return response()->json($data);
    }

    public function skaterLeaders(Request $request): JsonResponse
    {
        $season = $request->query('season', '20242025');
        $gameType = $request->query('gameType', '2');

        try {
            $data = $this->statsRequest(
                'skater/summary',
                "nhl.stats.skater.summary.{$season}.{$gameType}",
                [
                    'isAggregate' => 'false',
                    'isGame' => 'false',
                    'start' => 0,
                    'limit' => 1000,
                    'cayenneExp' => "seasonId={$season} and gameTypeId={$gameType}",
                ],
            );
        } catch (\Throwable $exception) {
            return response()->json([
                'error' => true,
                'message' => 'Unable to reach the NHL stats API.',
            ], 502);
        }

        return response()->json($data);
    }

    public function skaterLanding(Request $request): JsonResponse
    {
        $season = $request->query('season', '20242025');
        $group = $request->query('group', '2');

        return $this->proxy(
            "edge/skater-landing/{$season}/{$group}",
            "nhl.edge.skater-landing.{$season}.{$group}"
        );
    }

    public function skaterDetail(string $playerId, Request $request): JsonResponse
    {
        $season = $request->query('season', '20242025');
        $group = $request->query('group', '2');

        return $this->proxy(
            "edge/skater-detail/{$playerId}/{$season}/{$group}",
            "nhl.edge.skater-detail.{$playerId}.{$season}.{$group}"
        );
    }

    public function goalieDetail(string $playerId, Request $request): JsonResponse
    {
        $season = $request->query('season', '20242025');
        $group = $request->query('group', '2');

        return $this->proxy(
            "edge/goalie-detail/{$playerId}/{$season}/{$group}",
            "nhl.edge.goalie-detail.{$playerId}.{$season}.{$group}"
        );
    }

    public function playerLanding(string $playerId): JsonResponse
    {
        return $this->proxy(
            "player/{$playerId}/landing",
            "nhl.player.landing.{$playerId}"
        );
    }

    public function playerGameLog(string $playerId, Request $request): JsonResponse
    {
        $season = $request->query('season', '20242025');
        $gameType = $request->query('gameType', '2');

        return $this->proxy(
            "player/{$playerId}/game-log/{$season}/{$gameType}",
            "nhl.player.game-log.{$playerId}.{$season}.{$gameType}"
        );
    }

    public function roster(string $teamAbbrev, Request $request): JsonResponse
    {
        $season = $request->query('season', '20242025');
        $gameType = $request->query('gameType', '2');

        return $this->proxy(
            "roster/{$teamAbbrev}/{$season}",
            "nhl.roster.{$teamAbbrev}.{$season}.{$gameType}",
            ['gameType' => $gameType],
        );
    }

    public function clubSchedule(string $teamAbbrev, Request $request): JsonResponse
    {
        $season = $request->query('season', '20242025');

        return $this->proxy(
            "club-schedule-season/{$teamAbbrev}/{$season}",
            "nhl.club-schedule.{$teamAbbrev}.{$season}"
        );
    }

    public function clubScheduleView(string $teamAbbrev, Request $request): JsonResponse
    {
        $view = $request->query('view', 'month');
        $date = $request->query('date');

        if (! in_array($view, ['month', 'week'], true)) {
            return response()->json([
                'error' => true,
                'message' => 'Invalid schedule view.',
            ], 400);
        }

        $slug = $date ?: 'now';
        $path = "club-schedule/{$teamAbbrev}/{$view}/{$slug}";

        return $this->proxy(
            $path,
            "nhl.club-schedule.{$teamAbbrev}.{$view}.{$slug}"
        );
    }

    public function clubStats(string $teamAbbrev, Request $request): JsonResponse
    {
        $season = $request->query('season', '20242025');
        $gameType = $request->query('gameType', '2');

        return $this->proxy(
            "club-stats/{$teamAbbrev}/{$season}/{$gameType}",
            "nhl.club-stats.{$teamAbbrev}.{$season}.{$gameType}"
        );
    }

    public function clubStatsSeason(string $teamAbbrev): JsonResponse
    {
        return $this->proxy(
            "club-stats-season/{$teamAbbrev}",
            "nhl.club-stats-season.{$teamAbbrev}"
        );
    }

    public function rosterSeason(string $teamAbbrev): JsonResponse
    {
        return $this->proxy(
            "roster-season/{$teamAbbrev}",
            "nhl.roster-season.{$teamAbbrev}"
        );
    }

    public function prospects(string $teamAbbrev): JsonResponse
    {
        return $this->proxy(
            "prospects/{$teamAbbrev}",
            "nhl.prospects.{$teamAbbrev}"
        );
    }

    public function teamStats(string $teamAbbrev, Request $request): JsonResponse
    {
        $season = $request->query('season', '20242025');
        $gameType = $request->query('gameType', '2');
        $teamKey = strtoupper($teamAbbrev);

        try {
            $teamMap = $this->statsTeamMap();
        } catch (\Throwable $exception) {
            return response()->json([
                'error' => true,
                'message' => 'Unable to reach the NHL stats API.',
            ], 502);
        }

        if (! isset($teamMap[$teamKey])) {
            return response()->json([
                'error' => true,
                'message' => 'Team stats are unavailable.',
            ], 404);
        }

        $teamId = $teamMap[$teamKey]['id'];
        $summaryCacheKey = "nhl.stats.team.summary.all.{$season}.{$gameType}";

        try {
            $summaryAll = $this->statsRequest(
                'team/summary',
                $summaryCacheKey,
                [
                    'isAggregate' => 'false',
                    'isGame' => 'false',
                    'start' => 0,
                    'limit' => 200,
                    'cayenneExp' => "seasonId={$season} and gameTypeId={$gameType}",
                ],
            );
            $percentagesAll = $this->statsRequest(
                'team/percentages',
                "nhl.stats.team.percentages.all.{$season}.{$gameType}",
                [
                    'isAggregate' => 'false',
                    'isGame' => 'false',
                    'start' => 0,
                    'limit' => 200,
                    'cayenneExp' => "seasonId={$season} and gameTypeId={$gameType}",
                ],
            );
            $summaryRow = collect($summaryAll['data'] ?? [])
                ->firstWhere('teamId', $teamId);

            $saveRow = $this->statsTeamReport(
                'savePercentage',
                $teamId,
                $season,
                $gameType
            );
            $percentagesRow = $this->statsTeamReport(
                'percentages',
                $teamId,
                $season,
                $gameType
            );
            $summaryShootingRow = $this->statsTeamReport(
                'summaryshooting',
                $teamId,
                $season,
                $gameType
            );
            $powerPlayRow = $this->statsTeamReport(
                'powerplay',
                $teamId,
                $season,
                $gameType
            );
            $penaltyKillRow = $this->statsTeamReport(
                'penaltykill',
                $teamId,
                $season,
                $gameType
            );
            $faceoffPercentagesRow = $this->statsTeamReport(
                'faceoffpercentages',
                $teamId,
                $season,
                $gameType
            );
            $faceoffWinsRow = $this->statsTeamReport(
                'faceoffwins',
                $teamId,
                $season,
                $gameType
            );
            $penaltiesRow = $this->statsTeamReport(
                'penalties',
                $teamId,
                $season,
                $gameType
            );
            $goalsByPeriodRow = $this->statsTeamReport(
                'goalsbyperiod',
                $teamId,
                $season,
                $gameType
            );
            $goalsForByStrengthRow = $this->statsTeamReport(
                'goalsforbystrength',
                $teamId,
                $season,
                $gameType
            );
            $goalsAgainstByStrengthRow = $this->statsTeamReport(
                'goalsagainstbystrength',
                $teamId,
                $season,
                $gameType
            );
            $goalsForByStrengthPullRow = $this->statsTeamReport(
                'goalsforbystrengthgoaliepull',
                $teamId,
                $season,
                $gameType
            );
            $goalsAgainstByStrengthPullRow = $this->statsTeamReport(
                'goalsagainstbystrengthgoaliepull',
                $teamId,
                $season,
                $gameType
            );
            $leadingTrailingRow = $this->statsTeamReport(
                'leadingtrailing',
                $teamId,
                $season,
                $gameType
            );
            $scoreTrailFirstRow = $this->statsTeamReport(
                'scoretrailfirst',
                $teamId,
                $season,
                $gameType
            );
            $shootoutRow = $this->statsTeamReport(
                'shootout',
                $teamId,
                $season,
                $gameType
            );
            $shotTypeRow = $this->statsTeamReport(
                'shottype',
                $teamId,
                $season,
                $gameType
            );
            $realtimeRow = $this->statsTeamReport(
                'realtime',
                $teamId,
                $season,
                $gameType
            );
            $outshootRow = $this->statsTeamReport(
                'outshootoutshotby',
                $teamId,
                $season,
                $gameType
            );
            $goalGamesRow = $this->statsTeamReport(
                'goalgames',
                $teamId,
                $season,
                $gameType
            );
            $powerPlayTimeRow = $this->statsTeamReport(
                'powerplaytime',
                $teamId,
                $season,
                $gameType
            );
            $penaltyKillTimeRow = $this->statsTeamReport(
                'penaltykilltime',
                $teamId,
                $season,
                $gameType
            );

            $seasonInfo = $this->statsSeasonMeta((int) $season);
        } catch (\Throwable $exception) {
            return response()->json([
                'error' => true,
                'message' => 'Unable to reach the NHL stats API.',
            ], 502);
        }

        $summaryData = $summaryAll['data'] ?? [];
        $percentagesData = $percentagesAll['data'] ?? [];
        $powerPlayRank = $this->rankFromList($summaryData, 'powerPlayPct', $teamId);
        $penaltyKillRank = $this->rankFromList($summaryData, 'penaltyKillPct', $teamId);
        $pointPctRank = $this->rankFromList($summaryData, 'pointPct', $teamId);
        $goalsForPerGameRank = $this->rankFromList($summaryData, 'goalsForPerGame', $teamId);
        $goalsAgainstPerGameRank = $this->rankFromList($summaryData, 'goalsAgainstPerGame', $teamId, 'asc');
        $shotsForPerGameRank = $this->rankFromList($summaryData, 'shotsForPerGame', $teamId);
        $shotsAgainstPerGameRank = $this->rankFromList($summaryData, 'shotsAgainstPerGame', $teamId, 'asc');
        $faceoffWinPctRank = $this->rankFromList($summaryData, 'faceoffWinPct', $teamId);
        $satPctRank = $this->rankFromList($percentagesData, 'satPct', $teamId);
        $usatPctRank = $this->rankFromList($percentagesData, 'usatPct', $teamId);
        $shootingPct5v5Rank = $this->rankFromList($percentagesData, 'shootingPct5v5', $teamId);
        $savePct5v5Rank = $this->rankFromList($percentagesData, 'savePct5v5', $teamId);
        $pdo5v5Rank = $this->rankFromList($percentagesData, 'shootingPlusSavePct5v5', $teamId);
        $zoneStartPct5v5Rank = $this->rankFromList($percentagesData, 'zoneStartPct5v5', $teamId);

        return response()->json([
            'summary' => $summaryRow,
            'savePercentage' => $saveRow['data'][0] ?? null,
            'percentages' => $percentagesRow['data'][0] ?? null,
            'summaryShooting' => $summaryShootingRow['data'][0] ?? null,
            'powerPlay' => $powerPlayRow['data'][0] ?? null,
            'penaltyKill' => $penaltyKillRow['data'][0] ?? null,
            'faceoffPercentages' => $faceoffPercentagesRow['data'][0] ?? null,
            'faceoffWins' => $faceoffWinsRow['data'][0] ?? null,
            'penalties' => $penaltiesRow['data'][0] ?? null,
            'goalsByPeriod' => $goalsByPeriodRow['data'][0] ?? null,
            'goalsForByStrength' => $goalsForByStrengthRow['data'][0] ?? null,
            'goalsAgainstByStrength' => $goalsAgainstByStrengthRow['data'][0] ?? null,
            'goalsForByStrengthGoaliePull' => $goalsForByStrengthPullRow['data'][0] ?? null,
            'goalsAgainstByStrengthGoaliePull' => $goalsAgainstByStrengthPullRow['data'][0] ?? null,
            'leadingTrailing' => $leadingTrailingRow['data'][0] ?? null,
            'scoreTrailFirst' => $scoreTrailFirstRow['data'][0] ?? null,
            'shootout' => $shootoutRow['data'][0] ?? null,
            'shotType' => $shotTypeRow['data'][0] ?? null,
            'realtime' => $realtimeRow['data'][0] ?? null,
            'outshootOutshot' => $outshootRow['data'][0] ?? null,
            'goalGames' => $goalGamesRow['data'][0] ?? null,
            'powerPlayTime' => $powerPlayTimeRow['data'][0] ?? null,
            'penaltyKillTime' => $penaltyKillTimeRow['data'][0] ?? null,
            'season' => $seasonInfo,
            'ranks' => [
                'powerPlayPct' => $powerPlayRank,
                'penaltyKillPct' => $penaltyKillRank,
                'pointPct' => $pointPctRank,
                'goalsForPerGame' => $goalsForPerGameRank,
                'goalsAgainstPerGame' => $goalsAgainstPerGameRank,
                'shotsForPerGame' => $shotsForPerGameRank,
                'shotsAgainstPerGame' => $shotsAgainstPerGameRank,
                'faceoffWinPct' => $faceoffWinPctRank,
                'satPct' => $satPctRank,
                'usatPct' => $usatPctRank,
                'shootingPct5v5' => $shootingPct5v5Rank,
                'savePct5v5' => $savePct5v5Rank,
                'shootingPlusSavePct5v5' => $pdo5v5Rank,
                'zoneStartPct5v5' => $zoneStartPct5v5Rank,
            ],
        ]);
    }

    private function proxy(string $path, string $cacheKey, array $query = []): JsonResponse
    {
        if (Cache::has($cacheKey)) {
            return response()->json(Cache::get($cacheKey));
        }

        try {
            $response = Http::acceptJson()
                ->timeout(10)
                ->get(self::API_BASE.'/'.$path, $query);
        } catch (\Throwable $exception) {
            return response()->json([
                'error' => true,
                'message' => 'Unable to reach the NHL API.',
            ], 502);
        }

        if (! $response->successful()) {
            return response()->json([
                'error' => true,
                'status' => $response->status(),
                'message' => 'NHL API responded with an error.',
            ], 502);
        }

        $data = $response->json();
        Cache::put($cacheKey, $data, now()->addSeconds(self::CACHE_SECONDS));

        return response()->json($data);
    }

    private function scheduleRange(string $start, string $end): JsonResponse
    {
        $cacheKey = "nhl.schedule.range.{$start}.{$end}";

        if (Cache::has($cacheKey)) {
            return response()->json(Cache::get($cacheKey));
        }

        $daysByDate = [];
        $currentStart = $start;
        $iterations = 0;

        while ($iterations < 12) {
            $iterations++;
            $response = $this->proxy(
                "schedule/{$currentStart}",
                "nhl.schedule.{$currentStart}",
            );
            $payload = $response->getData(true);
            $gameWeek = $payload['gameWeek'] ?? [];

            foreach ($gameWeek as $day) {
                $date = $day['date'] ?? null;
                if (! $date) {
                    continue;
                }
                $daysByDate[$date] = $day;
            }

            $lastDate = null;
            if (! empty($gameWeek)) {
                $lastEntry = end($gameWeek);
                $lastDate = $lastEntry['date'] ?? null;
                reset($gameWeek);
            }

            if (! $lastDate || $lastDate >= $end) {
                break;
            }

            $nextStart = $payload['nextStartDate'] ?? null;
            if (! $nextStart || $nextStart === $currentStart) {
                break;
            }

            $currentStart = $nextStart;
        }

        $filtered = array_filter($daysByDate, function ($day) use ($start, $end) {
            $date = $day['date'] ?? '';
            return $date >= $start && $date <= $end;
        });

        ksort($filtered);

        $payload = [
            'gameWeek' => array_values($filtered),
        ];

        Cache::put($cacheKey, $payload, now()->addSeconds(self::CACHE_SECONDS));

        return response()->json($payload);
    }

    private function statsRequest(string $path, string $cacheKey, array $query = []): array
    {
        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        $response = Http::acceptJson()
            ->timeout(10)
            ->get(self::STATS_API_BASE.'/'.$path, $query);

        if (! $response->successful()) {
            throw new \RuntimeException('NHL stats API responded with an error.');
        }

        $data = $response->json();
        Cache::put($cacheKey, $data, now()->addSeconds(self::CACHE_SECONDS));

        return $data;
    }

    private function statsTeamMap(): array
    {
        $cacheKey = 'nhl.stats.team-map';
        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        $data = $this->statsRequest('team', 'nhl.stats.team-list');
        $map = collect($data['data'] ?? [])
            ->filter(function (array $row) {
                return isset($row['triCode'], $row['id']);
            })
            ->mapWithKeys(function (array $row) {
                $triCode = strtoupper($row['triCode']);
                return [$triCode => ['id' => $row['id'], 'name' => $row['fullName'] ?? $triCode]];
            })
            ->all();

        Cache::put($cacheKey, $map, now()->addSeconds(self::CACHE_SECONDS));

        return $map;
    }

    private function statsTeamReport(
        string $report,
        int $teamId,
        string $season,
        string $gameType
    ): array {
        return $this->statsRequest(
            "team/{$report}",
            "nhl.stats.team.{$report}.{$teamId}.{$season}.{$gameType}",
            [
                'isAggregate' => 'false',
                'isGame' => 'false',
                'start' => 0,
                'limit' => 1,
                'cayenneExp' => "seasonId={$season} and gameTypeId={$gameType} and teamId={$teamId}",
            ],
        );
    }

    private function statsSeasonMeta(int $seasonId): array
    {
        $cacheKey = 'nhl.stats.season-meta';
        if (Cache::has($cacheKey)) {
            $cached = Cache::get($cacheKey);
        } else {
            $data = $this->statsRequest('season', 'nhl.stats.season-list');
            $cached = collect($data['data'] ?? [])
                ->filter(function (array $row) {
                    return isset($row['id']);
                })
                ->mapWithKeys(function (array $row) {
                    return [$row['id'] => $row];
                })
                ->all();
            Cache::put($cacheKey, $cached, now()->addSeconds(self::CACHE_SECONDS));
        }

        $season = $cached[$seasonId] ?? null;

        return [
            'id' => $seasonId,
            'numberOfGames' => $season['numberOfGames'] ?? null,
        ];
    }

    private function rankFromList(
        array $rows,
        string $field,
        int $teamId,
        string $direction = 'desc'
    ): ?int
    {
        $sorted = collect($rows)
            ->filter(function (array $row) use ($field) {
                return isset($row[$field]) && is_numeric($row[$field]);
            })
            ->when(
                $direction === 'asc',
                fn ($collection) => $collection->sortBy($field),
                fn ($collection) => $collection->sortByDesc($field)
            )
            ->values();

        $index = $sorted->search(function (array $row) use ($teamId) {
            return ($row['teamId'] ?? null) === $teamId;
        });

        if ($index === false) {
            return null;
        }

        return $index + 1;
    }
}
