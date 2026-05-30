import { Head, Link, usePage } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import { Fragment, useEffect, useMemo, useState } from 'react';

import LabLayout from '@/Layouts/LabLayout';
import {
    fetchNhl,
    parseGoalieDetail,
    parsePlayerGameLog,
    parsePlayerLanding,
    parseRoster,
    parseSkaterDetail,
    type EdgeOverlay,
    type EdgeUnitMetric,
    type EdgeValueMetric,
    type PlayerRow,
} from '@/lib/nhl';
import { getTeamColor } from '@/lib/teamColors';

type PageProps = {
    playerId: string;
};

type StatKeySpec = {
    key: string;
    label: string;
    format?: 'pct' | 'number';
};

type StatItem = {
    label: string;
    value: string;
    imageSrc?: string;
    imageAlt?: string;
};

type StatSection = {
    label: string;
    meta?: string;
    stats: StatItem[];
    extras: StatItem[];
};

type StatColumn = {
    label: string;
    keys: string[];
    format?: StatKeySpec['format'];
};

const GAME_TYPE_OPTIONS = [
    { value: '2', label: 'Regular season' },
    { value: '3', label: 'Playoffs' },
    { value: '1', label: 'Preseason' },
] as const;

const GAME_TYPE_LABELS: Record<number, string> = {
    1: 'Preseason',
    2: 'Regular season',
    3: 'Playoffs',
};

const SKATER_STAT_KEYS: StatKeySpec[] = [
    { key: 'gamesPlayed', label: 'Games' },
    { key: 'goals', label: 'Goals' },
    { key: 'assists', label: 'Assists' },
    { key: 'points', label: 'Points' },
    { key: 'shots', label: 'Shots' },
    { key: 'shootingPct', label: 'Shot %', format: 'pct' },
    { key: 'shotPct', label: 'Shot %', format: 'pct' },
    { key: 'pointsPerGame', label: 'Points/GP' },
    { key: 'plusMinus', label: '+/-' },
    { key: 'pim', label: 'PIM' },
    { key: 'powerPlayGoals', label: 'PP goals' },
    { key: 'powerPlayPoints', label: 'PP points' },
    { key: 'shortHandedGoals', label: 'SH goals' },
    { key: 'shortHandedPoints', label: 'SH points' },
    { key: 'gameWinningGoals', label: 'GWG' },
    { key: 'timeOnIce', label: 'TOI' },
    { key: 'avgTimeOnIce', label: 'Avg TOI' },
    { key: 'hits', label: 'Hits' },
    { key: 'blocks', label: 'Blocks' },
    { key: 'takeaways', label: 'Takeaways' },
    { key: 'giveaways', label: 'Giveaways' },
    { key: 'faceoffWins', label: 'Faceoff wins' },
    { key: 'faceoffPct', label: 'Faceoff %', format: 'pct' },
];

const GOALIE_STAT_KEYS: StatKeySpec[] = [
    { key: 'gamesPlayed', label: 'Games' },
    { key: 'gamesStarted', label: 'Starts' },
    { key: 'wins', label: 'Wins' },
    { key: 'losses', label: 'Losses' },
    { key: 'overtimeLosses', label: 'OT losses' },
    { key: 'savePct', label: 'Save %', format: 'pct' },
    { key: 'savePercentage', label: 'Save %', format: 'pct' },
    { key: 'goalsAgainstAverage', label: 'GAA' },
    { key: 'goalsAgainst', label: 'GA' },
    { key: 'shotsAgainst', label: 'SA' },
    { key: 'saves', label: 'Saves' },
    { key: 'shutouts', label: 'SO' },
    { key: 'timeOnIce', label: 'TOI' },
    { key: 'avgTimeOnIce', label: 'Avg TOI' },
    { key: 'qualityStarts', label: 'Quality starts' },
    { key: 'qualityStartPct', label: 'Quality start %', format: 'pct' },
    { key: 'highDangerSavePct', label: 'HD save %', format: 'pct' },
    { key: 'mediumDangerSavePct', label: 'MD save %', format: 'pct' },
    { key: 'lowDangerSavePct', label: 'LD save %', format: 'pct' },
    { key: 'evenStrengthSavePct', label: 'EV save %', format: 'pct' },
    { key: 'powerPlaySavePct', label: 'PP save %', format: 'pct' },
    { key: 'shortHandedSavePct', label: 'SH save %', format: 'pct' },
];

const STAT_SKIP_KEYS = new Set([
    'playerId',
    'teamId',
    'gameTypeId',
    'seasonId',
    'season',
    'seasonType',
    'teamAbbrev',
    'teamName',
    'teamTriCode',
    'franchiseId',
    'teamLogo',
    'team',
    'teamCode',
    'teamID',
    'league',
    'leagueAbbrev',
    'leagueName',
    'sequence',
    'logo',
    'position',
    'positionCode',
    'firstName',
    'lastName',
    'fullName',
    'name',
    'rankings',
]);

const formatSeasonLabel = (season: number) => {
    const value = String(season);
    if (value.length === 8) {
        return `${value.slice(0, 4)}-${value.slice(6)}`;
    }
    return value;
};

const getInitials = (value: string) =>
    value
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');

const formatKeyLabel = (value: string) =>
    value
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());

const asRecord = (value: unknown): Record<string, unknown> =>
    value && typeof value === 'object' && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : {};

const resolveStatsRecord = (
    record: Record<string, unknown> | undefined,
) => {
    if (!record) {
        return undefined;
    }
    const source = asRecord(record);
    if (!Object.keys(source).length) {
        return undefined;
    }
    const nested = asRecord(
        source.stats ??
            source.statTotals ??
            source.seasonTotals ??
            source.totals ??
            source.statLine ??
            source.statSummary ??
            source.subSeason ??
            source.subseason,
    );
    return Object.keys(nested).length ? nested : source;
};

const formatStatValue = (
    value: unknown,
    format?: StatKeySpec['format'],
    key?: string,
) => {
    if (value === null || value === undefined || value === '') {
        return '--';
    }
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) {
            return '--';
        }
        const parsed = Number(trimmed);
        if (!Number.isNaN(parsed)) {
            return formatStatValue(parsed, format, key);
        }
        return trimmed;
    }
    if (typeof value === 'number') {
        const needsPercent =
            format === 'pct' || Boolean(key && /pct|percent/i.test(key));
        if (needsPercent) {
            const normalized = value > 1.2 ? value : value * 100;
            return `${normalized.toFixed(1)}%`;
        }
        const digits = Number.isInteger(value) ? 0 : 1;
        return value.toFixed(digits);
    }
    return String(value);
};

const formatGameDate = (value?: string) => {
    if (!value) {
        return '--';
    }
    const parsed = new Date(`${value}T00:00:00Z`);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }
    return parsed.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
};

const formatEdgePercent = (value: number | null | undefined) => {
    if (value === null || value === undefined) {
        return '--';
    }
    return formatStatValue(value, 'pct');
};

const formatEdgeUnit = (
    value: number | null | undefined,
    unit: string,
) => {
    if (value === null || value === undefined) {
        return '--';
    }
    const digits = Number.isInteger(value) ? 0 : 1;
    return `${value.toFixed(digits)} ${unit}`;
};

const formatEdgeMetricValue = (
    metric: EdgeValueMetric | undefined,
    key?: string,
) => {
    if (!metric) {
        return { value: '--', percentile: '--', leagueAvg: '--' };
    }
    return {
        value:
            metric.value === null || metric.value === undefined
                ? '--'
                : formatStatValue(metric.value, undefined, key),
        percentile:
            metric.percentile === null || metric.percentile === undefined
                ? '--'
                : formatEdgePercent(metric.percentile),
        leagueAvg:
            metric.leagueAvg === null || metric.leagueAvg === undefined
                ? '--'
                : formatStatValue(metric.leagueAvg, undefined, key),
    };
};

const formatEdgeOverlay = (overlay?: EdgeOverlay) => {
    if (!overlay) {
        return '';
    }
    const date = formatGameDate(overlay.gameDate);
    const time = overlay.timeInPeriod ?? '';
    const periodNumber =
        overlay.period === null || overlay.period === undefined
            ? null
            : overlay.period;
    const periodType = overlay.periodType ?? '';
    const maxRegPeriods = overlay.maxRegulationPeriods;
    const periodLabel = (() => {
        const parts: string[] = [];
        if (periodType) {
            parts.push(periodType);
        }
        if (periodNumber !== null) {
            const maxLabel =
                maxRegPeriods !== null && maxRegPeriods !== undefined
                    ? `/${maxRegPeriods}`
                    : '';
            parts.push(`P${periodNumber}${maxLabel}`);
        } else if (
            maxRegPeriods !== null &&
            maxRegPeriods !== undefined &&
            !periodType
        ) {
            parts.push(`Reg ${maxRegPeriods}`);
        }
        return parts.join(' ');
    })();
    const playerLabel = overlay.playerName ?? '';
    const awayAbbrev = overlay.away?.abbrev;
    const homeAbbrev = overlay.home?.abbrev;
    const awayScore = overlay.away?.score;
    const homeScore = overlay.home?.score;
    const hasScore =
        (awayScore !== null && awayScore !== undefined) ||
        (homeScore !== null && homeScore !== undefined);
    const scoreline =
        awayAbbrev && homeAbbrev
            ? hasScore
                ? `${awayAbbrev} ${awayScore ?? '-'} @ ${homeAbbrev} ${homeScore ?? '-'}`
                : `${awayAbbrev} @ ${homeAbbrev}`
            : '';
    const outcome = overlay.outcome ?? '';
    const gameTypeLabel =
        overlay.gameType !== null && overlay.gameType !== undefined
            ? GAME_TYPE_LABELS[overlay.gameType] ??
              `Game type ${overlay.gameType}`
            : '';
    const outcomeLabel = outcome && outcome !== periodLabel ? outcome : '';
    return [
        playerLabel,
        date,
        time,
        gameTypeLabel,
        periodLabel,
        scoreline,
        outcomeLabel,
    ]
        .filter(Boolean)
        .join(' | ');
};

const formatEdgeUnitMetric = (
    metric: EdgeUnitMetric | undefined,
    unitImperial: string,
    unitMetric: string,
) => {
    if (!metric) {
        return {
            imperial: '--',
            metric: '--',
            percentile: '--',
            leagueAvg: '--',
            overlay: '',
        };
    }
    const imperial = formatEdgeUnit(metric.imperial, unitImperial);
    const metricValue = formatEdgeUnit(metric.metric, unitMetric);
    const percentile = formatEdgePercent(metric.percentile);
    const leagueAvgImperial = formatEdgeUnit(
        metric.leagueAvgImperial,
        unitImperial,
    );
    const leagueAvgMetric = formatEdgeUnit(
        metric.leagueAvgMetric,
        unitMetric,
    );
    const leagueAvg =
        leagueAvgImperial !== '--' || leagueAvgMetric !== '--'
            ? `${leagueAvgImperial} / ${leagueAvgMetric}`
            : '--';
    return {
        imperial,
        metric: metricValue,
        percentile,
        leagueAvg,
        overlay: formatEdgeOverlay(metric.overlay),
    };
};

const resolveStatValue = (
    record: Record<string, unknown> | undefined,
    column: StatColumn,
) => {
    if (!record) {
        return '--';
    }
    for (const key of column.keys) {
        const value = record[key];
        if (value !== null && value !== undefined && value !== '') {
            return formatStatValue(value, column.format, key);
        }
    }
    return '--';
};

const buildStatItems = (
    record: Record<string, unknown> | undefined,
    specs: StatKeySpec[],
): StatItem[] => {
    const statsRecord = resolveStatsRecord(record);
    if (!statsRecord) {
        return [];
    }
    const items = specs
        .map((spec) => {
            const value = statsRecord[spec.key];
            if (value === null || value === undefined || value === '') {
                return null;
            }
            return {
                label: spec.label,
                value: formatStatValue(value, spec.format, spec.key),
            } satisfies StatItem;
        })
        .filter((item): item is StatItem => item !== null);

    return items;
};

const buildExtraStatItems = (
    record: Record<string, unknown> | undefined,
    specs: StatKeySpec[],
): StatItem[] => {
    const statsRecord = resolveStatsRecord(record);
    if (!statsRecord) {
        return [];
    }
    const specKeys = new Set(specs.map((spec) => spec.key));

    return Object.entries(statsRecord)
        .filter(([key, value]) => {
            if (STAT_SKIP_KEYS.has(key)) {
                return false;
            }
            if (specKeys.has(key)) {
                return false;
            }
            return value !== null && value !== undefined && value !== '';
        })
        .map(([key, value]) => ({
            label: formatKeyLabel(key),
            value: formatStatValue(value, undefined, key),
        }));
};

export default function LabPlayerDetail({ playerId }: PageProps) {
    const { url } = usePage();
    const searchParams = new URLSearchParams(url.split('?')[1] ?? '');
    const teamParam = searchParams.get('team')?.toUpperCase() ?? '';
    const seasonParam = searchParams.get('season') ?? '';
    const gameTypeParam = searchParams.get('gameType') ?? '2';

    const landingQuery = useQuery({
        queryKey: ['nhl', 'player-landing', playerId],
        queryFn: () => fetchNhl(`player/${playerId}/landing`),
        staleTime: 60_000,
    });

    const baseLanding = useMemo(
        () => parsePlayerLanding(landingQuery.data ?? {}),
        [landingQuery.data],
    );

    const teamAbbrev = teamParam || baseLanding?.teamAbbrev || '';
    const initialSeason =
        seasonParam ||
        (baseLanding?.featuredStats?.season
            ? String(baseLanding.featuredStats.season)
            : '');
    const [selectedSeason, setSelectedSeason] = useState(initialSeason);
    const [selectedGameType, setSelectedGameType] = useState(
        gameTypeParam || '2',
    );
    useEffect(() => {
        if (!selectedSeason && initialSeason) {
            setSelectedSeason(initialSeason);
        }
    }, [initialSeason, selectedSeason]);

    const seasonValue = selectedSeason || initialSeason || '20242025';
    const seasonLabel = seasonValue
        ? formatSeasonLabel(Number(seasonValue))
        : 'Season';
    const gameTypeValue = selectedGameType || gameTypeParam || '2';
    const gameTypeLabel =
        GAME_TYPE_OPTIONS.find((option) => option.value === gameTypeValue)
            ?.label ?? 'Regular season';

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }
        const baseUrl = url.split('?')[0] ?? url;
        const params = new URLSearchParams();
        if (teamAbbrev) {
            params.set('team', teamAbbrev);
        }
        if (seasonValue) {
            params.set('season', seasonValue);
        }
        if (gameTypeValue) {
            params.set('gameType', gameTypeValue);
        }
        const next = params.toString();
        const nextUrl = next ? `${baseUrl}?${next}` : baseUrl;
        window.history.replaceState(null, '', nextUrl);
    }, [gameTypeValue, seasonValue, teamAbbrev, url]);

    const rosterQuery = useQuery({
        queryKey: ['nhl', 'roster', teamAbbrev, seasonValue, gameTypeValue],
        queryFn: () =>
            fetchNhl(
                `roster/${teamAbbrev}?season=${seasonValue}&gameType=${gameTypeValue}`,
            ),
        enabled: Boolean(teamAbbrev && seasonValue),
    });

    const roster = useMemo(
        () => parseRoster(rosterQuery.data ?? {}),
        [rosterQuery.data],
    );
    const rosterPlayers = useMemo(
        () => [
            ...roster.forwards,
            ...roster.defensemen,
            ...roster.goalies,
        ],
        [roster.defensemen, roster.forwards, roster.goalies],
    );
    const rosterLookup = useMemo(() => {
        const entries = rosterPlayers.map((player) => [
            String(player.id),
            player,
        ]);
        return new Map(entries);
    }, [rosterPlayers]);

    const rosterPlayer = useMemo(() => {
        return rosterPlayers.find(
            (player) => player.id === String(playerId),
        );
    }, [playerId, rosterPlayers]);

    const player = useMemo(
        () => parsePlayerLanding(landingQuery.data ?? {}, rosterPlayer),
        [landingQuery.data, rosterPlayer],
    );

    const isGoalie = useMemo(() => {
        const position =
            player?.position ?? rosterPlayer?.position ?? '';
        return position.toUpperCase().startsWith('G');
    }, [player?.position, rosterPlayer?.position]);

    const seasonHistoryColumns = useMemo<StatColumn[]>(() => {
        if (isGoalie) {
            return [
                { label: 'GP', keys: ['gamesPlayed', 'gp'] },
                { label: 'W', keys: ['wins', 'w'] },
                { label: 'L', keys: ['losses', 'l'] },
                { label: 'SV%', keys: ['savePct', 'savePercentage'], format: 'pct' },
                { label: 'GAA', keys: ['goalsAgainstAverage', 'gaa'] },
                { label: 'SO', keys: ['shutouts', 'so'] },
            ];
        }
        return [
            { label: 'GP', keys: ['gamesPlayed', 'gp'] },
            { label: 'G', keys: ['goals', 'g'] },
            { label: 'A', keys: ['assists', 'a'] },
            { label: 'P', keys: ['points', 'p'] },
            { label: '+/-', keys: ['plusMinus', 'plusminus'] },
            { label: 'PIM', keys: ['pim', 'penaltyMinutes'] },
        ];
    }, [isGoalie]);
    const seasonHistoryStatSpecs = useMemo<StatKeySpec[]>(() => {
        const keys = new Set<string>();
        seasonHistoryColumns.forEach((column) => {
            column.keys.forEach((key) => keys.add(key));
        });
        return Array.from(keys).map((key) => ({ key, label: key }));
    }, [seasonHistoryColumns]);
    const seasonHistoryColSpan = 4 + seasonHistoryColumns.length;

    const teamColor = getTeamColor(teamAbbrev);

    const featuredSections = useMemo<StatSection[]>(() => {
        const specs = isGoalie ? GOALIE_STAT_KEYS : SKATER_STAT_KEYS;
        const sections: StatSection[] = [];
        const totals = player?.seasonTotals ?? [];
        const normalizedSeason = Number(seasonValue);
        const normalizedGameType = Number(gameTypeValue);
        const seasonMatches = totals.filter(
            (entry) =>
                entry.season === normalizedSeason ||
                String(entry.season ?? '') === seasonValue,
        );
        const selectedTotals =
            seasonMatches.find(
                (entry) => entry.gameTypeId === normalizedGameType,
            ) ?? seasonMatches[0];
        if (selectedTotals) {
            const selectedSeasonLabel =
                selectedTotals.season !== null &&
                selectedTotals.season !== undefined
                    ? formatSeasonLabel(selectedTotals.season)
                    : seasonLabel;
            const selectedGameTypeLabel =
                selectedTotals.gameTypeId !== null &&
                selectedTotals.gameTypeId !== undefined
                    ? GAME_TYPE_LABELS[selectedTotals.gameTypeId] ??
                      `Game type ${selectedTotals.gameTypeId}`
                    : gameTypeLabel;
            const labelParts = [
                selectedGameTypeLabel,
                selectedSeasonLabel,
            ].filter(Boolean);
            const label = labelParts.length
                ? labelParts.join(' ')
                : 'Season totals';
            const stats = buildStatItems(selectedTotals.stats, specs);
            const extras = buildExtraStatItems(selectedTotals.stats, specs);
            if (stats.length || extras.length) {
                sections.push({
                    label,
                    stats,
                    extras,
                });
            }
        }
        if (player?.featuredStats) {
            const featuredSeasonLabel = player.featuredStats.season
                ? formatSeasonLabel(player.featuredStats.season)
                : '';
            const featuredSections: StatSection[] = [
                {
                    label: featuredSeasonLabel
                        ? `Regular season (${featuredSeasonLabel})`
                        : 'Regular season',
                    stats: buildStatItems(
                        player.featuredStats.regularSeason,
                        specs,
                    ),
                    extras: buildExtraStatItems(
                        player.featuredStats.regularSeason,
                        specs,
                    ),
                },
                {
                    label: 'Playoffs',
                    stats: buildStatItems(
                        player.featuredStats.playoffs,
                        specs,
                    ),
                    extras: buildExtraStatItems(
                        player.featuredStats.playoffs,
                        specs,
                    ),
                },
                {
                    label: 'Career',
                    stats: buildStatItems(
                        player.featuredStats.career,
                        specs,
                    ),
                    extras: buildExtraStatItems(
                        player.featuredStats.career,
                        specs,
                    ),
                },
            ].filter(
                (section) =>
                    section.stats.length > 0 || section.extras.length > 0,
            );
            sections.push(...featuredSections);
        }
        return sections;
    }, [
        gameTypeLabel,
        gameTypeValue,
        isGoalie,
        player?.featuredStats,
        player?.seasonTotals,
        seasonLabel,
        seasonValue,
    ]);

    const skaterFallback: PlayerRow | undefined = player
        ? {
              id: player.id,
              name: player.name,
              team: player.teamName,
              position: player.position,
          }
        : rosterPlayer
          ? {
                id: rosterPlayer.id,
                name: rosterPlayer.name,
                team: teamAbbrev,
                position: rosterPlayer.position,
            }
          : undefined;

    const skaterDetailQuery = useQuery({
        queryKey: ['nhl', 'skater-detail', playerId, seasonValue],
        queryFn: () =>
            fetchNhl(`edge/skater-detail/${playerId}?season=${seasonValue}&group=2`),
        enabled: Boolean(playerId && seasonValue && !isGoalie),
    });

    const skaterDetail = useMemo(
        () => parseSkaterDetail(skaterDetailQuery.data ?? {}, skaterFallback),
        [skaterDetailQuery.data, skaterFallback],
    );

    const goalieDetailQuery = useQuery({
        queryKey: ['nhl', 'goalie-detail', playerId, seasonValue],
        queryFn: () =>
            fetchNhl(`edge/goalie-detail/${playerId}?season=${seasonValue}&group=2`),
        enabled: Boolean(playerId && seasonValue && isGoalie),
    });

    const goalieDetail = useMemo(
        () => parseGoalieDetail(goalieDetailQuery.data ?? {}, skaterFallback),
        [goalieDetailQuery.data, skaterFallback],
    );

    const gameLogQuery = useQuery({
        queryKey: ['nhl', 'player-game-log', playerId, seasonValue, gameTypeValue],
        queryFn: () =>
            fetchNhl(
                `player/${playerId}/game-log?season=${seasonValue}&gameType=${gameTypeValue}`,
            ),
        enabled: Boolean(playerId && seasonValue && gameTypeValue),
    });

    const gameLogData = useMemo(
        () => parsePlayerGameLog(gameLogQuery.data ?? {}),
        [gameLogQuery.data],
    );
    const gameLogEntries = gameLogData?.games ?? [];
    const gameLogSeasons = useMemo(() => {
        const seasons = gameLogData?.seasons ?? [];
        return [...seasons].sort((a, b) => b.season - a.season);
    }, [gameLogData?.seasons]);

    const seasonOptions = useMemo(() => {
        if (gameLogSeasons.length > 0) {
            return gameLogSeasons.map((season) => ({
                value: String(season.season),
                label: formatSeasonLabel(season.season),
                gameTypes: season.gameTypes,
            }));
        }
        const totals = player?.seasonTotals ?? [];
        const uniqueSeasons = Array.from(
            new Set(
                totals
                    .map((entry) => entry.season)
                    .filter((value): value is number => value !== null && value !== undefined),
            ),
        ).sort((a, b) => b - a);
        return uniqueSeasons.map((season) => ({
            value: String(season),
            label: formatSeasonLabel(season),
            gameTypes: [],
        }));
    }, [gameLogSeasons, player?.seasonTotals]);

    const gameTypeOptions = useMemo(() => {
        const match = seasonOptions.find(
            (season) => season.value === seasonValue,
        );
        const gameTypes = match?.gameTypes ?? [];
        if (gameTypes.length > 0) {
            return gameTypes.map((value) => ({
                value: String(value),
                label: GAME_TYPE_LABELS[value] ?? `Game type ${value}`,
            }));
        }
        return GAME_TYPE_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
        }));
    }, [seasonOptions, seasonValue]);

    useEffect(() => {
        if (!seasonOptions.length) {
            return;
        }
        const selected = seasonValue || seasonOptions[0].value;
        const exists = seasonOptions.some(
            (option) => option.value === selected,
        );
        if (!exists) {
            setSelectedSeason(seasonOptions[0].value);
        } else if (!selectedSeason) {
            setSelectedSeason(selected);
        }
    }, [seasonOptions, seasonValue, selectedSeason]);

    useEffect(() => {
        if (!gameTypeOptions.length) {
            return;
        }
        const exists = gameTypeOptions.some(
            (option) => option.value === gameTypeValue,
        );
        if (!exists) {
            setSelectedGameType(gameTypeOptions[0].value);
        }
    }, [gameTypeOptions, gameTypeValue]);

    const trackingDetail = isGoalie ? goalieDetail : skaterDetail;
    const edgeMetrics = trackingDetail?.metrics ?? [];
    const skaterTracking = trackingDetail?.skaterTracking;
    const goalieTracking = trackingDetail?.goalieTracking;
    const edgeSeasons = trackingDetail?.edgeSeasons ?? [];
    const edgeAvailability = useMemo(() => {
        if (!edgeSeasons.length) {
            return { status: 'unknown', message: '' };
        }
        const seasonNumber = Number(seasonValue);
        const match = edgeSeasons.find(
            (entry) => entry.seasonId === seasonNumber,
        );
        if (!match) {
            const seasonsLabel = edgeSeasons
                .map((entry) => formatSeasonLabel(entry.seasonId))
                .join(', ');
            return {
                status: 'unavailable',
                message: seasonsLabel
                    ? `NHL Edge data is not available for ${seasonLabel}. Available seasons: ${seasonsLabel}.`
                    : `NHL Edge data is not available for ${seasonLabel}.`,
            };
        }
        const gameTypeNumber = Number(gameTypeValue);
        if (
            match.gameTypes.length &&
            !match.gameTypes.includes(gameTypeNumber)
        ) {
            const gameTypesLabel = match.gameTypes
                .map(
                    (value) =>
                        GAME_TYPE_LABELS[value] ?? `Game type ${value}`,
                )
                .join(', ');
            return {
                status: 'unavailable',
                message: gameTypesLabel
                    ? `NHL Edge data is not available for ${seasonLabel} (${gameTypeLabel}). Available: ${gameTypesLabel}.`
                    : `NHL Edge data is not available for ${seasonLabel} (${gameTypeLabel}).`,
            };
        }
        return { status: 'available', message: '' };
    }, [edgeSeasons, gameTypeLabel, gameTypeValue, seasonLabel, seasonValue]);
    const hasEdgeData =
        edgeMetrics.length > 0 || Boolean(skaterTracking || goalieTracking);
    const edgeTeamLogoLight = trackingDetail?.teamLogoLight;
    const edgeTeamLogoDark = trackingDetail?.teamLogoDark;
    const teamLogo =
        player?.teamLogo ?? edgeTeamLogoLight ?? edgeTeamLogoDark;
    const edgeSeasonsDisplay = useMemo(() => {
        if (!edgeSeasons.length) {
            return [];
        }
        return edgeSeasons.map((entry) => {
            const seasonLabel = formatSeasonLabel(entry.seasonId);
            if (!entry.gameTypes.length) {
                return seasonLabel;
            }
            const gameTypesLabel = entry.gameTypes
                .map(
                    (value) =>
                        GAME_TYPE_LABELS[value] ?? `Game type ${value}`,
                )
                .join(', ');
            return `${seasonLabel} (${gameTypesLabel})`;
        });
    }, [edgeSeasons]);


    const seasonTotalsEntry = useMemo(() => {
        const totals = player?.seasonTotals ?? [];
        if (!totals.length) {
            return null;
        }
        const normalizedSeason = Number(seasonValue);
        const normalizedGameType = Number(gameTypeValue);
        const seasonMatches = totals.filter(
            (entry) =>
                entry.season === normalizedSeason ||
                String(entry.season ?? '') === seasonValue,
        );
        if (seasonMatches.length > 0) {
            const gameTypeMatch = seasonMatches.find(
                (entry) => entry.gameTypeId === normalizedGameType,
            );
            return gameTypeMatch ?? seasonMatches[0];
        }
        return totals[0];
    }, [gameTypeValue, player?.seasonTotals, seasonValue]);

    const totalsSpecs = isGoalie ? GOALIE_STAT_KEYS : SKATER_STAT_KEYS;
    const seasonTotalsSection = useMemo<StatSection | null>(() => {
        if (!seasonTotalsEntry) {
            return null;
        }
        const entrySeasonLabel =
            seasonTotalsEntry.season !== null &&
            seasonTotalsEntry.season !== undefined
                ? formatSeasonLabel(seasonTotalsEntry.season)
                : seasonLabel;
        const entryGameTypeLabel =
            seasonTotalsEntry.gameTypeId !== null &&
            seasonTotalsEntry.gameTypeId !== undefined
                ? GAME_TYPE_LABELS[seasonTotalsEntry.gameTypeId] ??
                  `Game type ${seasonTotalsEntry.gameTypeId}`
                : gameTypeLabel;
        const meta = [
            entryGameTypeLabel,
            entrySeasonLabel,
            seasonTotalsEntry.teamName ?? seasonTotalsEntry.teamAbbrev,
            seasonTotalsEntry.league,
        ]
            .filter(Boolean)
            .join(' | ');
        const stats = buildStatItems(seasonTotalsEntry.stats, totalsSpecs);
        const extras = buildExtraStatItems(seasonTotalsEntry.stats, totalsSpecs);
        if (!stats.length && !extras.length) {
            return null;
        }
        return {
            label: 'Season totals',
            meta: meta || undefined,
            stats,
            extras,
        };
    }, [gameTypeLabel, seasonLabel, seasonTotalsEntry, totalsSpecs]);

    const seasonHistory = useMemo(() => {
        const totals = player?.seasonTotals ?? [];
        if (!totals.length) {
            return [];
        }
        return [...totals].sort((a, b) => {
            const aSeason = a.season ?? 0;
            const bSeason = b.season ?? 0;
            if (aSeason !== bSeason) {
                return bSeason - aSeason;
            }
            const aSeq =
                typeof a.stats.sequence === 'number'
                    ? a.stats.sequence
                    : 0;
            const bSeq =
                typeof b.stats.sequence === 'number'
                    ? b.stats.sequence
                    : 0;
            return bSeq - aSeq;
        });
    }, [player?.seasonTotals]);

    const honors = useMemo(() => {
        const items: string[] = [];
        if (player?.inTop100AllTime) {
            items.push('Top 100 All-Time');
        }
        if (player?.inHHOF) {
            items.push('Hall of Fame');
        }
        return items;
    }, [player?.inHHOF, player?.inTop100AllTime]);

    const actionLinks = useMemo(() => {
        const links: Array<{
            label: string;
            href: string;
            internal?: boolean;
        }> = [];
        if (teamAbbrev) {
            links.push({
                label: 'Team page',
                href: `/lab/teams/${teamAbbrev.toLowerCase()}`,
                internal: true,
            });
        }
        if (player?.links?.watch) {
            links.push({ label: 'Watch', href: player.links.watch });
        }
        if (player?.links?.shop) {
            links.push({ label: 'Shop', href: player.links.shop });
        }
        if (player?.links?.twitter) {
            links.push({ label: 'Twitter', href: player.links.twitter });
        }
        return links;
    }, [player?.links, teamAbbrev]);

    const rosterTeamAbbrev = player?.teamAbbrev ?? teamAbbrev;
    const rosterLink = rosterTeamAbbrev
        ? `/lab/teams/${rosterTeamAbbrev.toLowerCase()}`
        : '';
    const teammateQuery = useMemo(() => {
        const params = new URLSearchParams();
        if (rosterTeamAbbrev) {
            params.set('team', rosterTeamAbbrev);
        }
        if (seasonValue) {
            params.set('season', seasonValue);
        }
        if (gameTypeValue) {
            params.set('gameType', gameTypeValue);
        }
        const query = params.toString();
        return query ? `?${query}` : '';
    }, [gameTypeValue, rosterTeamAbbrev, seasonValue]);
    const teammates = useMemo(() => {
        const roster = player?.teammates ?? [];
        if (!roster.length) {
            return [];
        }
        const currentId = player?.id ? String(player.id) : '';
        return roster.filter((teammate) => teammate.id !== currentId);
    }, [player?.id, player?.teammates]);
    const teammatesDisplay = useMemo(
        () =>
            teammates.slice(0, 6).map((teammate) => {
                const rosterEntry = rosterLookup.get(teammate.id);
                const rosterNumber = rosterEntry?.number
                    ? Number(rosterEntry.number)
                    : null;
                const fallbackNumber =
                    rosterNumber !== null && !Number.isNaN(rosterNumber)
                        ? rosterNumber
                        : undefined;
                return {
                    ...teammate,
                    position: teammate.position ?? rosterEntry?.position,
                    sweaterNumber:
                        teammate.sweaterNumber ?? fallbackNumber,
                    headshot: rosterEntry?.headshot,
                    shoots: rosterEntry?.shoots,
                    height: rosterEntry?.height,
                    weight: rosterEntry?.weight,
                    birthDate: rosterEntry?.birthDate,
                    hometown: rosterEntry?.hometown,
                };
            }),
        [rosterLookup, teammates],
    );
    const teammateCount = teammates.length;

    const careerTotalsSections = useMemo<StatSection[]>(() => {
        if (!player?.careerTotals) {
            return [];
        }
        const record = asRecord(player.careerTotals);
        const regularRecord = asRecord(
            record.regularSeason ?? record.regular,
        );
        const playoffRecord = asRecord(
            record.playoffs ?? record.postseason,
        );
        const sections: StatSection[] = [];
        if (Object.keys(regularRecord).length) {
            const stats = buildStatItems(regularRecord, totalsSpecs);
            const extras = buildExtraStatItems(regularRecord, totalsSpecs);
            if (stats.length || extras.length) {
                sections.push({
                    label: 'Career totals (regular season)',
                    stats,
                    extras,
                });
            }
        }
        if (Object.keys(playoffRecord).length) {
            const stats = buildStatItems(playoffRecord, totalsSpecs);
            const extras = buildExtraStatItems(playoffRecord, totalsSpecs);
            if (stats.length || extras.length) {
                sections.push({
                    label: 'Career totals (playoffs)',
                    stats,
                    extras,
                });
            }
        }
        if (sections.length > 0) {
            return sections;
        }
        const stats = buildStatItems(record, totalsSpecs);
        const extras = buildExtraStatItems(record, totalsSpecs);
        if (!stats.length && !extras.length) {
            return [];
        }
        return [
            {
                label: 'Career totals',
                stats,
                extras,
            },
        ];
    }, [player?.careerTotals, totalsSpecs]);

    const lastFiveGames = useMemo(() => {
        if (gameLogEntries.length > 0) {
            return gameLogEntries.slice(0, 5);
        }
        const fallback = player?.lastFiveGames ?? [];
        if (!fallback.length) {
            return [];
        }
        const normalizedGameType = Number(gameTypeValue);
        if (Number.isNaN(normalizedGameType)) {
            return fallback;
        }
        const filtered = fallback.filter((entry) => {
            if (entry.gameTypeId === null || entry.gameTypeId === undefined) {
                return true;
            }
            return entry.gameTypeId === normalizedGameType;
        });
        return filtered.length ? filtered : fallback;
    }, [gameLogEntries, gameTypeValue, player?.lastFiveGames]);

    const totalsSections = useMemo(() => {
        const sections: StatSection[] = [];
        if (seasonTotalsSection) {
            sections.push(seasonTotalsSection);
        }
        sections.push(...careerTotalsSections);
        return sections;
    }, [careerTotalsSections, seasonTotalsSection]);

    const infoItems = useMemo(() => {
        if (!player) {
            return [];
        }
        const altFirstName =
            player.firstNameFr && player.firstNameFr !== player.firstName
                ? player.firstNameFr
                : '';
        const altLastName =
            player.lastNameFr && player.lastNameFr !== player.lastName
                ? player.lastNameFr
                : '';
        const altFullTeamName =
            player.fullTeamNameFr &&
            player.fullTeamNameFr !== player.fullTeamName
                ? player.fullTeamNameFr
                : '';
        const altCommonTeamName =
            player.teamCommonNameFr &&
            player.teamCommonNameFr !== player.teamCommonName
                ? player.teamCommonNameFr
                : '';
        const altPlaceName =
            player.teamPlaceNameWithPrepositionFr &&
            player.teamPlaceNameWithPrepositionFr !==
                player.teamPlaceNameWithPreposition
                ? player.teamPlaceNameWithPrepositionFr
                : '';
        const heightValue = (() => {
            if (player.height && player.heightCm) {
                return `${player.height} (${player.heightCm} cm)`;
            }
            if (player.height) {
                return player.height;
            }
            if (player.heightCm) {
                return `${player.heightCm} cm`;
            }
            return '--';
        })();
        const weightValue = (() => {
            if (player.weight && player.weightKg) {
                return `${player.weight} lb (${player.weightKg} kg)`;
            }
            if (player.weight) {
                return `${player.weight} lb`;
            }
            if (player.weightKg) {
                return `${player.weightKg} kg`;
            }
            return '--';
        })();
        const birthPlace = [player.birthCity, player.birthState, player.birthCountry]
            .filter(Boolean)
            .join(', ');
        const draftLabel = player.draft
            ? [
                  player.draft.year ? String(player.draft.year) : '',
                  player.draft.round ? `R${player.draft.round}` : '',
                  player.draft.pickInRound
                      ? `P${player.draft.pickInRound}`
                      : player.draft.pick ?? player.draft.overall
                        ? `#${player.draft.pick ?? player.draft.overall}`
                        : '',
                  player.draft.overall ? `O${player.draft.overall}` : '',
              ]
                  .filter(Boolean)
                  .join(' ')
            : '';
        const draftTeamLabel = player.draft
            ? player.draft.teamAbbrev ?? player.draft.teamName ?? ''
            : '';
        const draftValue =
            draftLabel && draftTeamLabel
                ? `${draftLabel} (${draftTeamLabel})`
                : draftLabel || draftTeamLabel;
        const roleLabel = player.captain
            ? 'Captain'
            : player.alternateCaptain
              ? 'Alternate captain'
              : '';
        const suspensionLabel = player.suspensionStatus
            ? player.suspensionStatus.toLowerCase().includes('suspend')
                ? player.suspensionStatus
                : `Suspended (${player.suspensionStatus})`
            : '';
        const statusParts = [
            player.rosterStatus,
            player.injuryStatus,
            suspensionLabel,
            player.isActive === false ? 'Inactive' : '',
        ].filter(Boolean);
        const statusLabel =
            statusParts.length > 0 ? statusParts.join(' | ') : '';
        return [
            { label: 'Player ID', value: player.id },
            { label: 'Number', value: player.sweaterNumber ?? '--' },
            { label: 'Position', value: player.position ?? '--' },
            { label: 'First name', value: player.firstName ?? '--' },
            { label: 'Last name', value: player.lastName ?? '--' },
            { label: 'Shoots', value: player.shoots ?? '--' },
            { label: 'Height', value: heightValue },
            {
                label: 'Weight',
                value: weightValue,
            },
            { label: 'Birth date', value: player.birthDate ?? '--' },
            { label: 'Birthplace', value: birthPlace || player.hometown || '--' },
            { label: 'Nationality', value: player.nationality ?? '--' },
            {
                label: 'Team',
                value: player.teamName ?? teamAbbrev ?? '--',
            },
            {
                label: 'Team ID',
                value:
                    player.teamId !== null && player.teamId !== undefined
                        ? String(player.teamId)
                        : '--',
            },
            {
                label: 'Team full name',
                value: player.fullTeamName ?? '--',
            },
            {
                label: 'Team common name',
                value: player.teamCommonName ?? '--',
            },
            {
                label: 'Team place name',
                value: player.teamPlaceNameWithPreposition ?? '--',
            },
            {
                label: 'Draft',
                value: draftValue || '--',
                imageSrc: player.draft?.teamLogo ?? undefined,
                imageAlt: player.draft?.teamName ?? player.draft?.teamAbbrev,
            },
            { label: 'Role', value: roleLabel || '--' },
            { label: 'Status', value: statusLabel || player.status || '--' },
            {
                label: 'Active',
                value:
                    player.isActive === undefined
                        ? '--'
                        : player.isActive
                          ? 'Yes'
                          : 'No',
            },
            { label: 'Slug', value: player.playerSlug ?? '--' },
            { label: 'Honors', value: honors.join(', ') || '--' },
            { label: 'First name (FR)', value: altFirstName || '--' },
            { label: 'Last name (FR)', value: altLastName || '--' },
            { label: 'Team full name (FR)', value: altFullTeamName || '--' },
            { label: 'Team common name (FR)', value: altCommonTeamName || '--' },
            { label: 'Team place name (FR)', value: altPlaceName || '--' },
        ].filter((item) => item.value && item.value !== '--');
    }, [honors, player, teamAbbrev]);

    const skaterSpeedCards = useMemo(() => {
        if (!skaterTracking) {
            return null;
        }
        return {
            topShotSpeed: skaterTracking.topShotSpeed
                ? formatEdgeUnitMetric(skaterTracking.topShotSpeed, 'mph', 'km/h')
                : null,
            speedMax: skaterTracking.speedMax
                ? formatEdgeUnitMetric(skaterTracking.speedMax, 'mph', 'km/h')
                : null,
            totalDistance: skaterTracking.totalDistance
                ? formatEdgeUnitMetric(skaterTracking.totalDistance, 'mi', 'km')
                : null,
            distanceMaxGame: skaterTracking.distanceMaxGame
                ? formatEdgeUnitMetric(skaterTracking.distanceMaxGame, 'mi', 'km')
                : null,
            burstsOver20: skaterTracking.burstsOver20
                ? formatEdgeMetricValue(skaterTracking.burstsOver20)
                : null,
        };
    }, [skaterTracking]);

    const zoneTimeEntries = useMemo(() => {
        const zoneTime = skaterTracking?.zoneTime;
        if (!zoneTime) {
            return [];
        }
        return [
            { label: 'Offensive zone', metric: zoneTime.offensive, key: 'offensiveZonePctg' },
            { label: 'Neutral zone', metric: zoneTime.neutral, key: 'neutralZonePctg' },
            { label: 'Defensive zone', metric: zoneTime.defensive, key: 'defensiveZonePctg' },
        ].filter((entry) => entry.metric);
    }, [skaterTracking?.zoneTime]);

    const skaterShotSummary = skaterTracking?.shotSummary ?? [];
    const skaterShotDetails = skaterTracking?.shotDetails ?? [];
    const goalieShotSummary = goalieTracking?.shotSummary ?? [];
    const goalieShotDetails = goalieTracking?.shotDetails ?? [];

    const goalieStatEntries = useMemo(() => {
        const stats = goalieTracking?.stats;
        if (!stats) {
            return [];
        }
        return Object.entries(stats).map(([key, metric]) => ({
            key,
            label: formatKeyLabel(key),
            ...formatEdgeMetricValue(metric, key),
        }));
    }, [goalieTracking?.stats]);

    return (
        <>
            <Head title={player?.name ?? 'Player'} />
            <LabLayout active="players">
                <section className="overflow-hidden rounded-lg bg-white shadow-sm">
                    <div
                        className="h-1"
                        style={{ backgroundColor: teamColor }}
                    />
                    <div className="border-b border-gray-100 px-6 py-4">
                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                            Players
                        </p>
                        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                            <h2 className="text-2xl font-semibold text-gray-900">
                                {player?.name ?? 'Player detail'}
                            </h2>
                            {actionLinks.length > 0 && (
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                    {actionLinks.map((link) =>
                                        link.internal ? (
                                            <Link
                                                key={link.label}
                                                href={link.href}
                                                className="rounded-full border border-indigo-200 px-3 py-1 font-semibold text-indigo-600 transition hover:border-indigo-300 hover:text-indigo-500"
                                            >
                                                {link.label}
                                            </Link>
                                        ) : (
                                            <a
                                                key={link.label}
                                                href={link.href}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="rounded-full border border-gray-200 px-3 py-1 font-semibold text-gray-700 transition hover:border-gray-300 hover:text-gray-900"
                                            >
                                                {link.label}
                                            </a>
                                        ),
                                    )}
                                </div>
                            )}
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                            Season {seasonLabel} | {gameTypeLabel}
                        </p>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            <label className="block">
                                <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                    Season
                                </span>
                                <select
                                    value={seasonValue}
                                    onChange={(event) =>
                                        setSelectedSeason(event.target.value)
                                    }
                                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200"
                                >
                                    {seasonOptions.length === 0 && (
                                        <option value={seasonValue}>
                                            {seasonLabel}
                                        </option>
                                    )}
                                    {seasonOptions.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="block">
                                <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                    Game type
                                </span>
                                <select
                                    value={gameTypeValue}
                                    onChange={(event) =>
                                        setSelectedGameType(event.target.value)
                                    }
                                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200"
                                >
                                    {gameTypeOptions.length === 0 && (
                                        <option value={gameTypeValue}>
                                            {gameTypeLabel}
                                        </option>
                                    )}
                                    {gameTypeOptions.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                        {(player?.badges?.length || honors.length > 0) && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {player?.badges?.map((badge, index) => {
                                    const badgeTitle =
                                        badge.title ?? badge.titleFr ?? 'Badge';
                                    const badgeAltTitle =
                                        badge.title &&
                                        badge.titleFr &&
                                        badge.titleFr !== badge.title
                                            ? badge.titleFr
                                            : '';
                                    const badgeLogo =
                                        badge.logoUrl ?? badge.logoUrlFr;
                                    return (
                                        <span
                                            key={`${badgeTitle}-${index}`}
                                            className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700"
                                        >
                                            {badgeLogo && (
                                                <img
                                                    src={badgeLogo}
                                                    alt={badgeTitle}
                                                    className="h-4 w-4 object-contain"
                                                />
                                            )}
                                            <span className="flex flex-col leading-tight">
                                                <span>{badgeTitle}</span>
                                                {badgeAltTitle && (
                                                    <span className="text-[10px] font-semibold text-gray-500">
                                                        {badgeAltTitle}
                                                    </span>
                                                )}
                                            </span>
                                        </span>
                                    );
                                })}
                                {honors.map((honor) => (
                                    <span
                                        key={honor}
                                        className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700"
                                    >
                                        {honor}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="px-6 py-5">
                        {landingQuery.isLoading && (
                            <p className="text-sm text-gray-600">
                                Loading player...
                            </p>
                        )}
                        {landingQuery.isError && (
                            <p className="text-sm text-gray-600">
                                Player data is unavailable.
                            </p>
                        )}
                        {!landingQuery.isLoading &&
                            !landingQuery.isError &&
                            !player && (
                                <p className="text-sm text-gray-600">
                                    Player data not found.
                                </p>
                            )}
                        {player && (
                            <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
                                <div className="space-y-4">
                                    <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-50 text-3xl font-semibold text-gray-500">
                                        {player.headshot ? (
                                            <img
                                                src={player.headshot}
                                                alt={player.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span>
                                                {getInitials(player.name)}
                                            </span>
                                        )}
                                    </div>
                                    {(player.teamName || teamAbbrev) && (
                                        <div className="flex items-center gap-3">
                                            {teamLogo ? (
                                                <img
                                                    src={teamLogo}
                                                    alt={player.teamName}
                                                    className="h-10 w-10 object-contain"
                                                />
                                            ) : (
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white">
                                                    {teamAbbrev || '--'}
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {player.teamName ??
                                                        teamAbbrev}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {teamAbbrev || '--'}
                                                </p>
                                                {edgeTeamLogoDark && (
                                                    <div className="mt-2 flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-400">
                                                        {edgeTeamLogoLight && (
                                                            <img
                                                                src={edgeTeamLogoLight}
                                                                alt={`${player.teamName ?? teamAbbrev ?? 'Team'} light`}
                                                                className="h-5 w-5 object-contain"
                                                            />
                                                        )}
                                                        <div className="flex h-6 w-6 items-center justify-center rounded bg-gray-900">
                                                            <img
                                                                src={edgeTeamLogoDark}
                                                                alt={`${player.teamName ?? teamAbbrev ?? 'Team'} dark`}
                                                                className="h-5 w-5 object-contain"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    {player.heroImage && (
                                        <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                                            <img
                                                src={player.heroImage}
                                                alt={`${player.name} hero`}
                                                className="h-48 w-full object-cover object-[50%_15%]"
                                            />
                                        </div>
                                    )}
                                    <div className="rounded-lg border border-gray-200 bg-white px-4 py-4">
                                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                            Profile
                                        </p>
                                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                            {infoItems.map((item) => (
                                                <div
                                                    key={item.label}
                                                    className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2"
                                                >
                                                    <p className="text-[10px] uppercase tracking-widest text-gray-500">
                                                        {item.label}
                                                    </p>
                                                    <div className="mt-1 flex items-center gap-2">
                                                        {item.imageSrc && (
                                                            <img
                                                                src={item.imageSrc}
                                                                alt={item.imageAlt ?? item.label}
                                                                className="h-6 w-6 object-contain"
                                                            />
                                                        )}
                                                        <p className="text-sm font-semibold text-gray-900">
                                                            {item.value}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {teammatesDisplay.length > 0 && (
                    <section className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                Team roster
                            </p>
                            <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Current teammates
                                </h3>
                                {rosterLink && (
                                    <Link
                                        href={rosterLink}
                                        className="text-xs font-semibold text-indigo-600 transition hover:text-indigo-500"
                                    >
                                        Full roster
                                    </Link>
                                )}
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                {teammateCount} players listed
                            </p>
                        </div>
                        <div className="grid gap-3 px-6 py-5 sm:grid-cols-2 lg:grid-cols-3">
                            {teammatesDisplay.map((teammate) => {
                                const sweaterLabel =
                                    teammate.sweaterNumber !== null &&
                                    teammate.sweaterNumber !== undefined
                                        ? `#${teammate.sweaterNumber}`
                                        : '';
                                const metaParts = [
                                    teammate.position,
                                    sweaterLabel,
                                ].filter(Boolean);
                                const meta = metaParts.join(' | ') || '--';
                                const physicalParts = [
                                    teammate.shoots ? `Shoots ${teammate.shoots}` : '',
                                    teammate.height ?? '',
                                    teammate.weight ? `${teammate.weight} lb` : '',
                                ].filter(Boolean);
                                const bioParts = [
                                    teammate.birthDate ?? '',
                                    teammate.hometown ?? '',
                                ].filter(Boolean);
                                const physicalLabel = physicalParts.join(' • ');
                                const bioLabel = bioParts.join(' • ');
                                return (
                                    <Link
                                        key={teammate.id}
                                        href={`/lab/players/${teammate.id}${teammateQuery}`}
                                        className="rounded-md border border-gray-200 bg-gray-50 px-4 py-3 transition hover:border-gray-300 hover:bg-white"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-white text-xs font-semibold text-gray-500">
                                                {teammate.headshot ? (
                                                    <img
                                                        src={teammate.headshot}
                                                        alt={teammate.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <span>
                                                        {getInitials(teammate.name)}
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {teammate.name}
                                                </p>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {meta}
                                                </p>
                                                {physicalLabel && (
                                                    <p className="mt-1 text-[10px] text-gray-400">
                                                        {physicalLabel}
                                                    </p>
                                                )}
                                                {bioLabel && (
                                                    <p className="mt-1 text-[10px] text-gray-400">
                                                        {bioLabel}
                                                    </p>
                                                )}
                                                {teammate.slug && (
                                                    <p className="mt-1 text-[10px] text-gray-400">
                                                        {teammate.slug}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                        {teammateCount > teammatesDisplay.length && (
                            <div className="border-t border-gray-100 px-6 py-3 text-xs text-gray-500">
                                Showing {teammatesDisplay.length} of {teammateCount}{' '}
                                teammates.
                            </div>
                        )}
                    </section>
                )}

                {featuredSections.length > 0 && (
                    <section className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                Featured stats
                            </p>
                            <h3 className="mt-1 text-lg font-semibold text-gray-900">
                                Quick production snapshot
                            </h3>
                        </div>
                        <div className="space-y-6 px-6 py-5">
                            {featuredSections.map((section) => (
                                <div key={section.label}>
                                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                        {section.label}
                                    </p>
                                    {section.stats.length > 0 && (
                                        <div className="mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
                                            {section.stats.map((stat) => (
                                                <div
                                                    key={`${section.label}-${stat.label}`}
                                                    className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2"
                                                >
                                                    <p className="text-[10px] uppercase tracking-widest text-gray-500">
                                                        {stat.label}
                                                    </p>
                                                    <p className="mt-1 text-sm font-semibold text-gray-900">
                                                        {stat.value}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {section.extras.length > 0 && (
                                        <div className="mt-4">
                                            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                                                Additional stats
                                            </p>
                                            <div className="mt-2 grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
                                                {section.extras.map((stat) => (
                                                    <div
                                                        key={`${section.label}-extra-${stat.label}`}
                                                        className="rounded-md border border-gray-200 bg-white px-3 py-2"
                                                    >
                                                        <p className="text-[10px] uppercase tracking-widest text-gray-500">
                                                            {stat.label}
                                                        </p>
                                                        <p className="mt-1 text-sm font-semibold text-gray-900">
                                                            {stat.value}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {totalsSections.length > 0 && (
                    <section className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                Totals
                            </p>
                            <h3 className="mt-1 text-lg font-semibold text-gray-900">
                                Season and career snapshot
                            </h3>
                        </div>
                        <div className="space-y-6 px-6 py-5">
                            {totalsSections.map((section) => (
                                <div key={section.label}>
                                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                        {section.label}
                                    </p>
                                    {section.meta && (
                                        <p className="mt-1 text-xs text-gray-500">
                                            {section.meta}
                                        </p>
                                    )}
                                    {section.stats.length > 0 && (
                                        <div className="mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
                                            {section.stats.map((stat) => (
                                                <div
                                                    key={`${section.label}-${stat.label}`}
                                                    className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2"
                                                >
                                                    <p className="text-[10px] uppercase tracking-widest text-gray-500">
                                                        {stat.label}
                                                    </p>
                                                    <p className="mt-1 text-sm font-semibold text-gray-900">
                                                        {stat.value}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {section.extras.length > 0 && (
                                        <div className="mt-4">
                                            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                                                Additional stats
                                            </p>
                                            <div className="mt-2 grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
                                                {section.extras.map((stat) => (
                                                    <div
                                                        key={`${section.label}-extra-${stat.label}`}
                                                        className="rounded-md border border-gray-200 bg-white px-3 py-2"
                                                    >
                                                        <p className="text-[10px] uppercase tracking-widest text-gray-500">
                                                            {stat.label}
                                                        </p>
                                                        <p className="mt-1 text-sm font-semibold text-gray-900">
                                                            {stat.value}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {lastFiveGames.length > 0 && (
                    <section className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                Recent games
                            </p>
                            <h3 className="mt-1 text-lg font-semibold text-gray-900">
                                Last 5 games
                            </h3>
                        </div>
                        <div className="overflow-x-auto px-6 py-5">
                            <table className="w-full text-left text-sm">
                                <thead className="text-xs uppercase tracking-widest text-gray-500">
                                    {isGoalie ? (
                                        <tr>
                                            <th className="pb-3">Date</th>
                                            <th className="pb-3">Team</th>
                                            <th className="pb-3">Opp</th>
                                            <th className="pb-3 text-right">GS</th>
                                            <th className="pb-3 text-right">DEC</th>
                                            <th className="pb-3 text-right">SA</th>
                                            <th className="pb-3 text-right">GA</th>
                                            <th className="pb-3 text-right">SV%</th>
                                            <th className="pb-3 text-right">SO</th>
                                            <th className="pb-3 text-right">G</th>
                                            <th className="pb-3 text-right">A</th>
                                            <th className="pb-3 text-right">PIM</th>
                                            <th className="pb-3 text-right">TOI</th>
                                        </tr>
                                    ) : (
                                        <tr>
                                            <th className="pb-3">Date</th>
                                            <th className="pb-3">Team</th>
                                            <th className="pb-3">Opp</th>
                                            <th className="pb-3 text-right">G</th>
                                            <th className="pb-3 text-right">A</th>
                                            <th className="pb-3 text-right">P</th>
                                            <th className="pb-3 text-right">+/-</th>
                                            <th className="pb-3 text-right">S</th>
                                            <th className="pb-3 text-right">PIM</th>
                                            <th className="pb-3 text-right">PPG</th>
                                            <th className="pb-3 text-right">PPP</th>
                                            <th className="pb-3 text-right">SHG</th>
                                            <th className="pb-3 text-right">SHP</th>
                                            <th className="pb-3 text-right">GWG</th>
                                            <th className="pb-3 text-right">OTG</th>
                                            <th className="pb-3 text-right">TOI</th>
                                            <th className="pb-3 text-right">Shifts</th>
                                        </tr>
                                    )}
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {lastFiveGames.map((entry, index) => {
                                        const opponentName =
                                            entry.opponentCommonName ??
                                            entry.opponentAbbrev ??
                                            '--';
                                        const teamName =
                                            entry.teamCommonName ??
                                            entry.teamAbbrev ??
                                            teamAbbrev ??
                                            '--';
                                        const teamCode =
                                            entry.teamCommonName &&
                                            entry.teamAbbrev
                                                ? entry.teamAbbrev
                                                : '';
                                        const opponentCode =
                                            entry.opponentCommonName &&
                                            entry.opponentAbbrev
                                                ? entry.opponentAbbrev
                                                : '';
                                        const homeRoad =
                                            entry.homeRoad?.toUpperCase() ?? '';
                                        const opponentLabel =
                                            homeRoad === 'R'
                                                ? `@ ${opponentName}`
                                                : homeRoad === 'H'
                                                  ? `vs ${opponentName}`
                                                  : opponentName;
                                        const plusMinusValue =
                                            entry.plusMinus === null ||
                                            entry.plusMinus === undefined
                                                ? '--'
                                                : entry.plusMinus > 0
                                                  ? `+${entry.plusMinus}`
                                                  : `${entry.plusMinus}`;
                                        const dateLabel = formatGameDate(
                                            entry.gameDate,
                                        );
                                        const dateNode = entry.gameId ? (
                                            <Link
                                                href={`/lab/scores/${entry.gameId}`}
                                                className="font-semibold text-indigo-600 transition hover:text-indigo-500"
                                            >
                                                {dateLabel}
                                            </Link>
                                        ) : (
                                            <span className="font-semibold text-gray-900">
                                                {dateLabel}
                                            </span>
                                        );
                                        if (isGoalie) {
                                            return (
                                                <tr key={`${entry.gameId ?? 'goalie'}-${index}`}>
                                                    <td className="py-3">
                                                        {dateNode}
                                                    </td>
                                                    <td className="py-3 text-gray-600">
                                                        <div className="font-semibold text-gray-900">
                                                            {teamName}
                                                        </div>
                                                        {teamCode && (
                                                            <div className="text-xs text-gray-400">
                                                                {teamCode}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="py-3 text-gray-600">
                                                        <div className="font-semibold text-gray-900">
                                                            {opponentLabel}
                                                        </div>
                                                        {opponentCode && (
                                                            <div className="text-xs text-gray-400">
                                                                {opponentCode}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="py-3 text-right text-gray-700">
                                                        {entry.gamesStarted ?? '--'}
                                                    </td>
                                                    <td className="py-3 text-right text-gray-700">
                                                        {entry.decision ?? '--'}
                                                    </td>
                                                    <td className="py-3 text-right text-gray-700">
                                                        {entry.shotsAgainst ?? '--'}
                                                    </td>
                                                    <td className="py-3 text-right text-gray-700">
                                                        {entry.goalsAgainst ?? '--'}
                                                    </td>
                                                    <td className="py-3 text-right text-gray-700">
                                                        {entry.savePct !== null &&
                                                        entry.savePct !== undefined
                                                            ? formatStatValue(
                                                                  entry.savePct,
                                                                  'pct',
                                                                  'savePct',
                                                              )
                                                            : '--'}
                                                    </td>
                                                    <td className="py-3 text-right text-gray-700">
                                                        {entry.shutouts ?? '--'}
                                                    </td>
                                                    <td className="py-3 text-right text-gray-700">
                                                        {entry.goals ?? '--'}
                                                    </td>
                                                    <td className="py-3 text-right text-gray-700">
                                                        {entry.assists ?? '--'}
                                                    </td>
                                                    <td className="py-3 text-right text-gray-700">
                                                        {entry.pim ?? '--'}
                                                    </td>
                                                    <td className="py-3 text-right text-gray-700">
                                                        {entry.toi ?? '--'}
                                                    </td>
                                                </tr>
                                            );
                                        }
                                        return (
                                            <tr key={`${entry.gameId ?? 'game'}-${index}`}>
                                                <td className="py-3">
                                                    {dateNode}
                                                </td>
                                                <td className="py-3 text-gray-600">
                                                    <div className="font-semibold text-gray-900">
                                                        {teamName}
                                                    </div>
                                                    {teamCode && (
                                                        <div className="text-xs text-gray-400">
                                                            {teamCode}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3 text-gray-600">
                                                    <div className="font-semibold text-gray-900">
                                                        {opponentLabel}
                                                    </div>
                                                    {opponentCode && (
                                                        <div className="text-xs text-gray-400">
                                                            {opponentCode}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3 text-right text-gray-700">
                                                    {entry.goals ?? '--'}
                                                </td>
                                                <td className="py-3 text-right text-gray-700">
                                                    {entry.assists ?? '--'}
                                                </td>
                                                <td className="py-3 text-right text-gray-700">
                                                    {entry.points ?? '--'}
                                                </td>
                                                <td className="py-3 text-right text-gray-700">
                                                    {plusMinusValue}
                                                </td>
                                                <td className="py-3 text-right text-gray-700">
                                                    {entry.shots ?? '--'}
                                                </td>
                                                <td className="py-3 text-right text-gray-700">
                                                    {entry.pim ?? '--'}
                                                </td>
                                                <td className="py-3 text-right text-gray-700">
                                                    {entry.powerPlayGoals ?? '--'}
                                                </td>
                                                <td className="py-3 text-right text-gray-700">
                                                    {entry.powerPlayPoints ?? '--'}
                                                </td>
                                                <td className="py-3 text-right text-gray-700">
                                                    {entry.shorthandedGoals ?? '--'}
                                                </td>
                                                <td className="py-3 text-right text-gray-700">
                                                    {entry.shorthandedPoints ?? '--'}
                                                </td>
                                                <td className="py-3 text-right text-gray-700">
                                                    {entry.gameWinningGoals ?? '--'}
                                                </td>
                                                <td className="py-3 text-right text-gray-700">
                                                    {entry.otGoals ?? '--'}
                                                </td>
                                                <td className="py-3 text-right text-gray-700">
                                                    {entry.toi ?? '--'}
                                                </td>
                                                <td className="py-3 text-right text-gray-700">
                                                    {entry.shifts ?? '--'}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                <section className="overflow-hidden rounded-lg bg-white shadow-sm">
                    <div className="border-b border-gray-100 px-6 py-4">
                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                            Game log
                        </p>
                        <h3 className="mt-1 text-lg font-semibold text-gray-900">
                            Full season log
                        </h3>
                    </div>
                    <div className="px-6 py-5">
                        {gameLogQuery.isLoading && (
                            <p className="text-sm text-gray-600">
                                Loading game log...
                            </p>
                        )}
                        {gameLogQuery.isError && (
                            <p className="text-sm text-gray-600">
                                Game log is unavailable.
                            </p>
                        )}
                        {!gameLogQuery.isLoading &&
                            !gameLogQuery.isError &&
                            gameLogEntries.length === 0 && (
                                <p className="text-sm text-gray-600">
                                    No game log data for this season and game
                                    type.
                                </p>
                            )}
                        {gameLogEntries.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="text-xs uppercase tracking-widest text-gray-500">
                                        {isGoalie ? (
                                            <tr>
                                                <th className="pb-3">Date</th>
                                                <th className="pb-3">Team</th>
                                                <th className="pb-3">Opp</th>
                                                <th className="pb-3 text-right">GS</th>
                                                <th className="pb-3 text-right">DEC</th>
                                                <th className="pb-3 text-right">SA</th>
                                                <th className="pb-3 text-right">GA</th>
                                                <th className="pb-3 text-right">SV%</th>
                                                <th className="pb-3 text-right">SO</th>
                                                <th className="pb-3 text-right">G</th>
                                                <th className="pb-3 text-right">A</th>
                                                <th className="pb-3 text-right">TOI</th>
                                            </tr>
                                        ) : (
                                            <tr>
                                                <th className="pb-3">Date</th>
                                                <th className="pb-3">Team</th>
                                                <th className="pb-3">Opp</th>
                                                <th className="pb-3 text-right">G</th>
                                                <th className="pb-3 text-right">A</th>
                                                <th className="pb-3 text-right">P</th>
                                                <th className="pb-3 text-right">+/-</th>
                                                <th className="pb-3 text-right">S</th>
                                                <th className="pb-3 text-right">PIM</th>
                                                <th className="pb-3 text-right">PPG</th>
                                                <th className="pb-3 text-right">PPP</th>
                                                <th className="pb-3 text-right">SHG</th>
                                                <th className="pb-3 text-right">SHP</th>
                                                <th className="pb-3 text-right">GWG</th>
                                                <th className="pb-3 text-right">OTG</th>
                                                <th className="pb-3 text-right">TOI</th>
                                                <th className="pb-3 text-right">Shifts</th>
                                            </tr>
                                        )}
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {gameLogEntries.map((entry, index) => {
                                            const opponentName =
                                                entry.opponentCommonName ??
                                                entry.opponentAbbrev ??
                                                '--';
                                            const teamName =
                                                entry.teamCommonName ??
                                                entry.teamAbbrev ??
                                                teamAbbrev ??
                                                '--';
                                            const teamCode =
                                                entry.teamCommonName &&
                                                entry.teamAbbrev
                                                    ? entry.teamAbbrev
                                                    : '';
                                            const opponentCode =
                                                entry.opponentCommonName &&
                                                entry.opponentAbbrev
                                                    ? entry.opponentAbbrev
                                                    : '';
                                            const homeRoad =
                                                entry.homeRoad?.toUpperCase() ?? '';
                                            const opponentLabel =
                                                homeRoad === 'R'
                                                    ? `@ ${opponentName}`
                                                    : homeRoad === 'H'
                                                      ? `vs ${opponentName}`
                                                      : opponentName;
                                            const dateLabel = formatGameDate(
                                                entry.gameDate,
                                            );
                                            const dateNode = entry.gameId ? (
                                                <Link
                                                    href={`/lab/scores/${entry.gameId}`}
                                                    className="font-semibold text-indigo-600 transition hover:text-indigo-500"
                                                >
                                                    {dateLabel}
                                                </Link>
                                            ) : (
                                                <span className="font-semibold text-gray-900">
                                                    {dateLabel}
                                                </span>
                                            );
                                            if (isGoalie) {
                                                return (
                                                    <tr key={`${entry.gameId ?? 'goalie'}-${index}`}>
                                                        <td className="py-3">
                                                            {dateNode}
                                                        </td>
                                                        <td className="py-3 text-gray-600">
                                                            <div className="font-semibold text-gray-900">
                                                                {teamName}
                                                            </div>
                                                            {teamCode && (
                                                                <div className="text-xs text-gray-400">
                                                                    {teamCode}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="py-3 text-gray-600">
                                                            <div className="font-semibold text-gray-900">
                                                                {opponentLabel}
                                                            </div>
                                                            {opponentCode && (
                                                                <div className="text-xs text-gray-400">
                                                                    {opponentCode}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="py-3 text-right text-gray-700">
                                                            {entry.gamesStarted ?? '--'}
                                                        </td>
                                                        <td className="py-3 text-right text-gray-700">
                                                            {entry.decision ?? '--'}
                                                        </td>
                                                        <td className="py-3 text-right text-gray-700">
                                                            {entry.shotsAgainst ?? '--'}
                                                        </td>
                                                        <td className="py-3 text-right text-gray-700">
                                                            {entry.goalsAgainst ?? '--'}
                                                        </td>
                                                        <td className="py-3 text-right text-gray-700">
                                                            {entry.savePct !== null &&
                                                            entry.savePct !== undefined
                                                                ? formatStatValue(
                                                                      entry.savePct,
                                                                      'pct',
                                                                      'savePct',
                                                                  )
                                                                : '--'}
                                                        </td>
                                                        <td className="py-3 text-right text-gray-700">
                                                            {entry.shutouts ?? '--'}
                                                        </td>
                                                        <td className="py-3 text-right text-gray-700">
                                                            {entry.goals ?? '--'}
                                                        </td>
                                                        <td className="py-3 text-right text-gray-700">
                                                            {entry.assists ?? '--'}
                                                        </td>
                                                        <td className="py-3 text-right text-gray-700">
                                                            {entry.toi ?? '--'}
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                            const plusMinusValue =
                                                entry.plusMinus === null ||
                                                entry.plusMinus === undefined
                                                    ? '--'
                                                    : entry.plusMinus > 0
                                                      ? `+${entry.plusMinus}`
                                                      : `${entry.plusMinus}`;
                                            return (
                                                <tr key={`${entry.gameId ?? 'skater'}-${index}`}>
                                                    <td className="py-3">
                                                        {dateNode}
                                                    </td>
                                                    <td className="py-3 text-gray-600">
                                                        <div className="font-semibold text-gray-900">
                                                            {teamName}
                                                        </div>
                                                        {teamCode && (
                                                            <div className="text-xs text-gray-400">
                                                                {teamCode}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="py-3 text-gray-600">
                                                        <div className="font-semibold text-gray-900">
                                                            {opponentLabel}
                                                        </div>
                                                        {opponentCode && (
                                                            <div className="text-xs text-gray-400">
                                                                {opponentCode}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="py-3 text-right text-gray-700">
                                                        {entry.goals ?? '--'}
                                                    </td>
                                                    <td className="py-3 text-right text-gray-700">
                                                        {entry.assists ?? '--'}
                                                    </td>
                                                    <td className="py-3 text-right text-gray-700">
                                                        {entry.points ?? '--'}
                                                    </td>
                                                    <td className="py-3 text-right text-gray-700">
                                                        {plusMinusValue}
                                                    </td>
                                                    <td className="py-3 text-right text-gray-700">
                                                        {entry.shots ?? '--'}
                                                    </td>
                                                    <td className="py-3 text-right text-gray-700">
                                                        {entry.pim ?? '--'}
                                                    </td>
                                                    <td className="py-3 text-right text-gray-700">
                                                        {entry.powerPlayGoals ?? '--'}
                                                    </td>
                                                    <td className="py-3 text-right text-gray-700">
                                                        {entry.powerPlayPoints ?? '--'}
                                                    </td>
                                                    <td className="py-3 text-right text-gray-700">
                                                        {entry.shorthandedGoals ?? '--'}
                                                    </td>
                                                    <td className="py-3 text-right text-gray-700">
                                                        {entry.shorthandedPoints ?? '--'}
                                                    </td>
                                                    <td className="py-3 text-right text-gray-700">
                                                        {entry.gameWinningGoals ?? '--'}
                                                    </td>
                                                    <td className="py-3 text-right text-gray-700">
                                                        {entry.otGoals ?? '--'}
                                                    </td>
                                                    <td className="py-3 text-right text-gray-700">
                                                        {entry.toi ?? '--'}
                                                    </td>
                                                    <td className="py-3 text-right text-gray-700">
                                                        {entry.shifts ?? '--'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </section>

                {seasonHistory.length > 0 && (
                    <section className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                Season history
                            </p>
                            <h3 className="mt-1 text-lg font-semibold text-gray-900">
                                Full log of totals
                            </h3>
                        </div>
                        <div className="overflow-x-auto px-6 py-5">
                            <table className="w-full text-left text-sm">
                                <thead className="text-xs uppercase tracking-widest text-gray-500">
                                    <tr>
                                        <th className="pb-3">Season</th>
                                        <th className="pb-3">League</th>
                                        <th className="pb-3">Team</th>
                                        <th className="pb-3 text-right">Seq</th>
                                        {seasonHistoryColumns.map((column) => (
                                            <th key={column.label} className="pb-3 text-right">
                                                {column.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {seasonHistory.map((entry, index) => {
                                        const statsRecord = resolveStatsRecord(entry.stats);
                                        const extraStats = buildExtraStatItems(
                                            entry.stats,
                                            seasonHistoryStatSpecs,
                                        );
                                        const seasonLabel = entry.season
                                            ? formatSeasonLabel(entry.season)
                                            : '--';
                                        const gameTypeLabel =
                                            entry.gameTypeId &&
                                            entry.gameTypeId !== 2
                                                ? GAME_TYPE_LABELS[entry.gameTypeId] ?? ''
                                                : '';
                                        const seasonDisplay = gameTypeLabel
                                            ? `${seasonLabel} (${gameTypeLabel})`
                                            : seasonLabel;
                                        const rowKey = `${entry.season ?? index}-${entry.teamAbbrev ?? ''}`;
                                        const sequenceLabel =
                                            statsRecord &&
                                            Object.prototype.hasOwnProperty.call(
                                                statsRecord,
                                                'sequence',
                                            )
                                                ? formatStatValue(
                                                      (statsRecord as Record<string, unknown>)
                                                          .sequence,
                                                      undefined,
                                                      'sequence',
                                                  )
                                                : '--';
                                        return (
                                            <Fragment key={rowKey}>
                                                <tr>
                                                    <td className="py-3 font-semibold text-gray-900">
                                                        {seasonDisplay}
                                                    </td>
                                                    <td className="py-3 text-gray-600">
                                                        {entry.league ?? '--'}
                                                    </td>
                                                    <td className="py-3">
                                                        <div className="flex items-center gap-2 text-gray-600">
                                                            {entry.teamLogo && (
                                                                <img
                                                                    src={entry.teamLogo}
                                                                    alt={entry.teamName ?? entry.teamAbbrev ?? 'Team'}
                                                                    className="h-6 w-6 object-contain"
                                                                />
                                                            )}
                                                            <span>
                                                                {entry.teamName ??
                                                                    entry.teamAbbrev ??
                                                                    '--'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 text-right text-gray-700">
                                                        {sequenceLabel}
                                                    </td>
                                                    {seasonHistoryColumns.map((column) => (
                                                        <td
                                                            key={`${rowKey}-${column.label}`}
                                                            className="py-3 text-right text-gray-700"
                                                        >
                                                            {resolveStatValue(
                                                                statsRecord,
                                                                column,
                                                            )}
                                                        </td>
                                                    ))}
                                                </tr>
                                                {extraStats.length > 0 && (
                                                    <tr>
                                                        <td
                                                            colSpan={seasonHistoryColSpan}
                                                            className="pb-4 pt-0"
                                                        >
                                                            <div className="flex flex-wrap gap-2 text-[11px] text-gray-600">
                                                                {extraStats.map((stat) => (
                                                                    <span
                                                                        key={`${rowKey}-${stat.label}`}
                                                                        className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-2 py-1"
                                                                    >
                                                                        <span className="text-gray-500">
                                                                            {stat.label}
                                                                        </span>
                                                                        <span className="font-semibold text-gray-900">
                                                                            {stat.value}
                                                                        </span>
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {player?.awards && player.awards.length > 0 && (
                    <section className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                Awards
                            </p>
                            <h3 className="mt-1 text-lg font-semibold text-gray-900">
                                Trophy history
                            </h3>
                        </div>
                        <div className="space-y-6 px-6 py-5">
                            {player.awards.map((award, index) => (
                                <div key={`${award.trophy ?? 'award'}-${index}`}>
                                    {(() => {
                                        const trophyLabel =
                                            award.trophy ??
                                            award.trophyFr ??
                                            'Award';
                                        const trophyAlt =
                                            award.trophy &&
                                            award.trophyFr &&
                                            award.trophyFr !== award.trophy
                                                ? award.trophyFr
                                                : '';
                                        return (
                                            <>
                                                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                                    {trophyLabel}
                                                </p>
                                                {trophyAlt && (
                                                    <p className="mt-1 text-[10px] text-gray-400">
                                                        {trophyAlt}
                                                    </p>
                                                )}
                                            </>
                                        );
                                    })()}
                                    {award.seasons.length === 0 && (
                                        <p className="mt-2 text-sm text-gray-600">
                                            No season details available.
                                        </p>
                                    )}
                                    {award.seasons.length > 0 && (
                                        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                            {award.seasons.map((season, seasonIndex) => {
                                                const statsRecord = resolveStatsRecord(season.stats);
                                                const extraStats = buildExtraStatItems(
                                                    statsRecord ?? undefined,
                                                    seasonHistoryStatSpecs,
                                                );
                                                const seasonLabel = season.seasonId
                                                    ? formatSeasonLabel(season.seasonId)
                                                    : 'Season';
                                                const gameTypeLabel =
                                                    season.gameTypeId && season.gameTypeId !== 2
                                                        ? GAME_TYPE_LABELS[season.gameTypeId] ?? ''
                                                        : '';
                                                const seasonTitle = gameTypeLabel
                                                    ? `${seasonLabel} (${gameTypeLabel})`
                                                    : seasonLabel;
                                                return (
                                                    <div
                                                        key={`${award.trophy ?? 'award'}-${seasonIndex}`}
                                                        className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
                                                    >
                                                        <p className="text-xs font-semibold text-gray-700">
                                                            {seasonTitle}
                                                        </p>
                                                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600">
                                                            {seasonHistoryColumns.map((column) => (
                                                                <div
                                                                    key={`${seasonTitle}-${column.label}`}
                                                                    className="flex items-center justify-between"
                                                                >
                                                                    <span>{column.label}</span>
                                                                    <span className="font-semibold text-gray-900">
                                                                        {resolveStatValue(
                                                                            statsRecord,
                                                                            column,
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        {extraStats.length > 0 && (
                                                            <div className="mt-3">
                                                                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                                                                    Additional stats
                                                                </p>
                                                                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600">
                                                                    {extraStats.map((stat) => (
                                                                        <div
                                                                            key={`${seasonTitle}-${stat.label}`}
                                                                            className="flex items-center justify-between"
                                                                        >
                                                                            <span>{stat.label}</span>
                                                                            <span className="font-semibold text-gray-900">
                                                                                {stat.value}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {edgeAvailability.status === 'unavailable' && !hasEdgeData && (
                    <section className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                NHL Edge
                            </p>
                            <h3 className="mt-1 text-lg font-semibold text-gray-900">
                                Tracking detail
                            </h3>
                        </div>
                        <div className="px-6 py-5">
                            <p className="text-sm text-gray-600">
                                {edgeAvailability.message}
                            </p>
                        </div>
                    </section>
                )}

                {hasEdgeData && (
                    <section className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                NHL Edge
                            </p>
                            <h3 className="mt-1 text-lg font-semibold text-gray-900">
                                Tracking detail
                            </h3>
                        </div>
                        <div className="space-y-6 px-6 py-5">
                            {edgeSeasonsDisplay.length > 0 && (
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                        Edge seasons available
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                                        {edgeSeasonsDisplay.map((label) => (
                                            <span
                                                key={label}
                                                className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 font-semibold text-gray-700"
                                            >
                                                {label}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {edgeAvailability.status === 'unavailable' && (
                                <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                                    {edgeAvailability.message}
                                </div>
                            )}
                            {edgeMetrics.length > 0 && (
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                        Summary metrics
                                    </p>
                                    <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                        {edgeMetrics.map((metric) => (
                                            <div
                                                key={metric.label}
                                                className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2"
                                            >
                                                <p className="text-[10px] uppercase tracking-widest text-gray-500">
                                                    {metric.label}
                                                </p>
                                                <p className="mt-1 text-sm font-semibold text-gray-900">
                                                    {metric.value}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {skaterTracking && (
                                <div className="space-y-5">
                                    {(skaterSpeedCards?.topShotSpeed ||
                                        skaterSpeedCards?.speedMax ||
                                        skaterSpeedCards?.totalDistance ||
                                        skaterSpeedCards?.distanceMaxGame ||
                                        skaterSpeedCards?.burstsOver20) && (
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                                Speed + distance
                                            </p>
                                            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                                {skaterSpeedCards?.topShotSpeed && (
                                                    <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                                                        <p className="text-[10px] uppercase tracking-widest text-gray-500">
                                                            Top shot speed
                                                        </p>
                                                        <p className="mt-1 text-sm font-semibold text-gray-900">
                                                            {skaterSpeedCards.topShotSpeed.imperial} /{' '}
                                                            {skaterSpeedCards.topShotSpeed.metric}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            Percentile {skaterSpeedCards.topShotSpeed.percentile}
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            League avg {skaterSpeedCards.topShotSpeed.leagueAvg}
                                                        </p>
                                                        {skaterSpeedCards.topShotSpeed.overlay && (
                                                            <p className="mt-1 text-[10px] text-gray-400">
                                                                {skaterSpeedCards.topShotSpeed.overlay}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                                {skaterSpeedCards?.speedMax && (
                                                    <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                                                        <p className="text-[10px] uppercase tracking-widest text-gray-500">
                                                            Max skating speed
                                                        </p>
                                                        <p className="mt-1 text-sm font-semibold text-gray-900">
                                                            {skaterSpeedCards.speedMax.imperial} /{' '}
                                                            {skaterSpeedCards.speedMax.metric}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            Percentile {skaterSpeedCards.speedMax.percentile}
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            League avg {skaterSpeedCards.speedMax.leagueAvg}
                                                        </p>
                                                        {skaterSpeedCards.speedMax.overlay && (
                                                            <p className="mt-1 text-[10px] text-gray-400">
                                                                {skaterSpeedCards.speedMax.overlay}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                                {skaterSpeedCards?.totalDistance && (
                                                    <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                                                        <p className="text-[10px] uppercase tracking-widest text-gray-500">
                                                            Total distance skated
                                                        </p>
                                                        <p className="mt-1 text-sm font-semibold text-gray-900">
                                                            {skaterSpeedCards.totalDistance.imperial} /{' '}
                                                            {skaterSpeedCards.totalDistance.metric}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            Percentile {skaterSpeedCards.totalDistance.percentile}
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            League avg {skaterSpeedCards.totalDistance.leagueAvg}
                                                        </p>
                                                    </div>
                                                )}
                                                {skaterSpeedCards?.distanceMaxGame && (
                                                    <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                                                        <p className="text-[10px] uppercase tracking-widest text-gray-500">
                                                            Max distance (game)
                                                        </p>
                                                        <p className="mt-1 text-sm font-semibold text-gray-900">
                                                            {skaterSpeedCards.distanceMaxGame.imperial} /{' '}
                                                            {skaterSpeedCards.distanceMaxGame.metric}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            Percentile {skaterSpeedCards.distanceMaxGame.percentile}
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            League avg {skaterSpeedCards.distanceMaxGame.leagueAvg}
                                                        </p>
                                                        {skaterSpeedCards.distanceMaxGame.overlay && (
                                                            <p className="mt-1 text-[10px] text-gray-400">
                                                                {skaterSpeedCards.distanceMaxGame.overlay}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                                {skaterSpeedCards?.burstsOver20 && (
                                                    <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                                                        <p className="text-[10px] uppercase tracking-widest text-gray-500">
                                                            Bursts over 20 mph
                                                        </p>
                                                        <p className="mt-1 text-sm font-semibold text-gray-900">
                                                            {skaterSpeedCards.burstsOver20.value}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            Percentile {skaterSpeedCards.burstsOver20.percentile}
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            League avg {skaterSpeedCards.burstsOver20.leagueAvg}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {zoneTimeEntries.length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                                Zone time
                                            </p>
                                            <div className="mt-3 overflow-x-auto">
                                                <table className="w-full text-left text-sm">
                                                    <thead className="text-xs uppercase tracking-widest text-gray-500">
                                                        <tr>
                                                            <th className="pb-3">Zone</th>
                                                            <th className="pb-3 text-right">Pct</th>
                                                            <th className="pb-3 text-right">Percentile</th>
                                                            <th className="pb-3 text-right">League avg</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {zoneTimeEntries.map((entry) => {
                                                            const formatted = formatEdgeMetricValue(
                                                                entry.metric,
                                                                entry.key,
                                                            );
                                                            return (
                                                                <tr key={entry.label}>
                                                                    <td className="py-3 text-gray-700">
                                                                        {entry.label}
                                                                    </td>
                                                                    <td className="py-3 text-right text-gray-700">
                                                                        {formatted.value}
                                                                    </td>
                                                                    <td className="py-3 text-right text-gray-500">
                                                                        {formatted.percentile}
                                                                    </td>
                                                                    <td className="py-3 text-right text-gray-500">
                                                                        {formatted.leagueAvg}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                    {skaterShotSummary.length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                                Shot location summary
                                            </p>
                                            <div className="mt-3 overflow-x-auto">
                                                <table className="w-full text-left text-sm">
                                                    <thead className="text-xs uppercase tracking-widest text-gray-500">
                                                        <tr>
                                                            <th className="pb-3">Zone</th>
                                                            <th className="pb-3">Shots</th>
                                                            <th className="pb-3">Goals</th>
                                                            <th className="pb-3">Shot %</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {skaterShotSummary.map((entry) => (
                                                            <tr key={entry.locationCode}>
                                                                <td className="py-3 font-semibold text-gray-900">
                                                                    {entry.locationCode.toUpperCase()}
                                                                </td>
                                                                <td className="py-3 text-gray-700">
                                                                    <div className="font-semibold text-gray-900">
                                                                        {entry.shots ?? '--'}
                                                                    </div>
                                                                    <div className="text-[10px] text-gray-500">
                                                                        Lg {formatStatValue(entry.shotsLeagueAvg)}
                                                                    </div>
                                                                    <div className="text-[10px] text-gray-400">
                                                                        Pct {formatEdgePercent(entry.shotsPercentile)}
                                                                    </div>
                                                                </td>
                                                                <td className="py-3 text-gray-700">
                                                                    <div className="font-semibold text-gray-900">
                                                                        {entry.goals ?? '--'}
                                                                    </div>
                                                                    <div className="text-[10px] text-gray-500">
                                                                        Lg {formatStatValue(entry.goalsLeagueAvg)}
                                                                    </div>
                                                                    <div className="text-[10px] text-gray-400">
                                                                        Pct {formatEdgePercent(entry.goalsPercentile)}
                                                                    </div>
                                                                </td>
                                                                <td className="py-3 text-gray-700">
                                                                    <div className="font-semibold text-gray-900">
                                                                        {formatEdgePercent(entry.shootingPct)}
                                                                    </div>
                                                                    <div className="text-[10px] text-gray-500">
                                                                        Lg {formatEdgePercent(entry.shootingPctLeagueAvg)}
                                                                    </div>
                                                                    <div className="text-[10px] text-gray-400">
                                                                        Pct {formatEdgePercent(entry.shootingPctPercentile)}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                    {skaterShotDetails.length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                                Shot location detail
                                            </p>
                                            <div className="mt-3 overflow-x-auto">
                                                <table className="w-full text-left text-sm">
                                                    <thead className="text-xs uppercase tracking-widest text-gray-500">
                                                        <tr>
                                                            <th className="pb-3">Area</th>
                                                            <th className="pb-3 text-right">Shots</th>
                                                            <th className="pb-3 text-right">Percentile</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {skaterShotDetails.map((entry) => (
                                                            <tr key={entry.area}>
                                                                <td className="py-3 text-gray-700">
                                                                    {entry.area}
                                                                </td>
                                                                <td className="py-3 text-right text-gray-700">
                                                                    {entry.shots ?? '--'}
                                                                </td>
                                                                <td className="py-3 text-right text-gray-500">
                                                                    {formatEdgePercent(entry.shotsPercentile)}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            {goalieTracking && (
                                <div className="space-y-5">
                                    {goalieStatEntries.length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                                Goalie detail
                                            </p>
                                            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                                {goalieStatEntries.map((entry) => (
                                                    <div
                                                        key={entry.key}
                                                        className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2"
                                                    >
                                                        <p className="text-[10px] uppercase tracking-widest text-gray-500">
                                                            {entry.label}
                                                        </p>
                                                        <p className="mt-1 text-sm font-semibold text-gray-900">
                                                            {entry.value}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            Percentile {entry.percentile}
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            League avg {entry.leagueAvg}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {goalieShotSummary.length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                                Shot location summary
                                            </p>
                                            <div className="mt-3 overflow-x-auto">
                                                <table className="w-full text-left text-sm">
                                                    <thead className="text-xs uppercase tracking-widest text-gray-500">
                                                        <tr>
                                                            <th className="pb-3">Zone</th>
                                                            <th className="pb-3">GA</th>
                                                            <th className="pb-3">SV</th>
                                                            <th className="pb-3">SV%</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {goalieShotSummary.map((entry) => (
                                                            <tr key={entry.locationCode}>
                                                                <td className="py-3 font-semibold text-gray-900">
                                                                    {entry.locationCode.toUpperCase()}
                                                                </td>
                                                                <td className="py-3 text-gray-700">
                                                                    <div className="font-semibold text-gray-900">
                                                                        {entry.goalsAgainst ?? '--'}
                                                                    </div>
                                                                    <div className="text-[10px] text-gray-500">
                                                                        Lg {formatStatValue(entry.goalsAgainstLeagueAvg)}
                                                                    </div>
                                                                    <div className="text-[10px] text-gray-400">
                                                                        Pct {formatEdgePercent(entry.goalsAgainstPercentile)}
                                                                    </div>
                                                                </td>
                                                                <td className="py-3 text-gray-700">
                                                                    <div className="font-semibold text-gray-900">
                                                                        {entry.saves ?? '--'}
                                                                    </div>
                                                                    <div className="text-[10px] text-gray-500">
                                                                        Lg {formatStatValue(entry.savesLeagueAvg)}
                                                                    </div>
                                                                    <div className="text-[10px] text-gray-400">
                                                                        Pct {formatEdgePercent(entry.savesPercentile)}
                                                                    </div>
                                                                </td>
                                                                <td className="py-3 text-gray-700">
                                                                    <div className="font-semibold text-gray-900">
                                                                        {formatEdgePercent(entry.savePct)}
                                                                    </div>
                                                                    <div className="text-[10px] text-gray-500">
                                                                        Lg {formatEdgePercent(entry.savePctLeagueAvg)}
                                                                    </div>
                                                                    <div className="text-[10px] text-gray-400">
                                                                        Pct {formatEdgePercent(entry.savePctPercentile)}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                    {goalieShotDetails.length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                                Shot location detail
                                            </p>
                                            <div className="mt-3 overflow-x-auto">
                                                <table className="w-full text-left text-sm">
                                                    <thead className="text-xs uppercase tracking-widest text-gray-500">
                                                        <tr>
                                                            <th className="pb-3">Area</th>
                                                            <th className="pb-3 text-right">Saves</th>
                                                            <th className="pb-3 text-right">SV%</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {goalieShotDetails.map((entry) => (
                                                            <tr key={entry.area}>
                                                                <td className="py-3 text-gray-700">
                                                                    {entry.area}
                                                                </td>
                                                                <td className="py-3 text-right text-gray-700">
                                                                    {entry.saves ?? '--'}
                                                                </td>
                                                                <td className="py-3 text-right text-gray-500">
                                                                    {formatEdgePercent(entry.savePct)}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>
                )}
            </LabLayout>
        </>
    );
}
