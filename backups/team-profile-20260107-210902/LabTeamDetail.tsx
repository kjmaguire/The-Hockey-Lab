import { Head, Link, usePage } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import Modal from '@/Components/Modal';
import LabLayout from '@/Layouts/LabLayout';
import {
    fetchNhl,
    normalizeDate,
    normalizeTime,
    parseClubStats,
    parseProspects,
    parseRoster,
    parseSchedule,
    parseSeasonList,
    parseStandings,
    parseTeamStats,
    parseTeams,
    type ScheduleGame,
} from '@/lib/nhl';

type PageProps = {
    team: string;
};

type GameRow = {
    id: string;
    title: string;
    subtitle: string;
    value: string;
    valueTone?: 'win' | 'loss' | 'neutral';
    badge?: string;
    badgeTone?: 'home' | 'away';
    meta?: string;
};

type ReportMetricSpec = {
    label: string;
    keys: string[];
    format?: 'pct' | 'number';
    digits?: number;
};

type ReportMetric = {
    label: string;
    value: string;
};

const ROSTER_FILTERS = ['All', 'Forwards', 'Defensemen', 'Goalies'] as const;
type RosterFilter = (typeof ROSTER_FILTERS)[number];
const GAME_TYPE_OPTIONS = [
    { value: '2', label: 'Regular season' },
    { value: '3', label: 'Playoffs' },
    { value: '1', label: 'Preseason' },
] as const;
type GameTypeValue = (typeof GAME_TYPE_OPTIONS)[number]['value'];

const slugify = (value: string) =>
    value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

const formatRecord = (
    wins?: number | null,
    losses?: number | null,
    ot?: number | null,
) => {
    if (wins === null || wins === undefined) {
        return '--';
    }
    return `${wins}-${losses ?? 0}-${ot ?? 0}`;
};

const formatPct = (value?: number | null) => {
    if (value === null || value === undefined) {
        return '--';
    }
    return `${(value * 100).toFixed(1)}%`;
};

const formatPctSmart = (value?: number | null) => {
    if (value === null || value === undefined) {
        return '--';
    }
    if (value > 1.2) {
        return `${value.toFixed(1)}%`;
    }
    return `${(value * 100).toFixed(1)}%`;
};

const formatGoalDiff = (value?: number | null) => {
    if (value === null || value === undefined) {
        return '--';
    }
    return `${value > 0 ? '+' : ''}${value}`;
};

const formatStreak = (code?: string, count?: number | null) => {
    if (!code || count === null || count === undefined) {
        return '--';
    }
    return `${code}${count}`;
};

const formatRank = (value?: number | null) => {
    if (value === null || value === undefined) {
        return '--';
    }
    return `#${value}`;
};

const formatClinchIndicator = (value?: string | null) => {
    if (!value) {
        return '--';
    }
    const normalized = value.toLowerCase();
    const labels: Record<string, string> = {
        x: 'Clinched playoff spot',
        y: 'Clinched division',
        z: 'Clinched conference',
        p: "Presidents' Trophy",
        e: 'Eliminated',
    };
    return labels[normalized] ?? value.toUpperCase();
};

const formatGap = (value?: number | null) => {
    if (value === null || value === undefined) {
        return '--';
    }
    return `${value > 0 ? '+' : ''}${value}`;
};

const formatNumber = (value?: number | null, digits = 1) => {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return '--';
    }
    return value.toFixed(digits);
};

const formatToiTotal = (value: string | number | null) => {
    if (value === null) {
        return '--';
    }
    if (typeof value === 'number') {
        return formatNumber(value / 60, 1);
    }
    const numeric = toNumber(value);
    if (numeric !== null) {
        return formatNumber(numeric / 60, 1);
    }
    return value;
};

const getGameTypeLabel = (value: string) =>
    GAME_TYPE_OPTIONS.find((option) => option.value === value)?.label ??
    'Regular season';

const formatRestHours = (value?: number | null) => {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return '--';
    }
    if (value < 1) {
        return '<1h';
    }
    const days = Math.floor(value / 24);
    const hours = Math.round(value % 24);
    if (days > 0) {
        return `${days}d ${hours}h`;
    }
    return `${Math.round(value)}h`;
};

const getMatchup = (
    game: ScheduleGame,
    teamAbbrev: string | undefined,
    teamName: string,
) => {
    const teamKey = teamAbbrev?.toLowerCase();
    const teamNameKey = teamName.toLowerCase();
    const isHome =
        (teamKey && game.home.abbrev?.toLowerCase() === teamKey) ||
        game.home.name.toLowerCase() === teamNameKey;
    return {
        label: isHome ? 'vs' : '@',
        opponent: isHome ? game.away.name : game.home.name,
        isHome,
        venue: game.venue ?? '',
    };
};

const buildGameMeta = (game: ScheduleGame) => {
    const parts = [
        game.status,
        game.broadcasts?.length ? `TV: ${game.broadcasts.join(', ')}` : '',
    ].filter(Boolean);
    return parts.length ? parts.join(' | ') : undefined;
};

const buildUpcomingRows = (
    games: ScheduleGame[],
    teamAbbrev: string | undefined,
    teamName: string,
): GameRow[] =>
    games.map((game) => {
        const { label, opponent, isHome, venue } = getMatchup(
            game,
            teamAbbrev,
            teamName,
        );
        const date = normalizeDate(game.startTime || '');
        const subtitle = venue ? `${date} - ${venue}` : date;
        const meta = buildGameMeta(game);
        return {
            id: game.id,
            title: `${label} ${opponent}`,
            subtitle,
            value: normalizeTime(game.startTime),
            valueTone: 'neutral',
            badge: isHome ? 'Home' : 'Away',
            badgeTone: isHome ? 'home' : 'away',
            meta,
        };
    });

const isLiveStatus = (status?: string) => {
    if (!status) {
        return false;
    }
    const normalized = status.toLowerCase();
    return (
        normalized.includes('live') ||
        normalized.includes('in progress') ||
        normalized.includes('in-progress')
    );
};

const countHomeAway = (
    games: ScheduleGame[],
    teamAbbrev: string | undefined,
    teamName: string,
) =>
    games.reduce(
        (acc, game) => {
            const { isHome } = getMatchup(game, teamAbbrev, teamName);
            if (isHome) {
                acc.home += 1;
            } else {
                acc.away += 1;
            }
            return acc;
        },
        { home: 0, away: 0 },
    );

const getRowValueClass = (tone?: GameRow['valueTone']) => {
    if (tone === 'win') {
        return 'text-emerald-600';
    }
    if (tone === 'loss') {
        return 'text-rose-600';
    }
    return 'text-gray-500';
};

const getBadgeClass = (tone?: GameRow['badgeTone']) => {
    if (tone === 'home') {
        return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    }
    if (tone === 'away') {
        return 'border-sky-200 bg-sky-50 text-sky-700';
    }
    return 'border-gray-200 bg-gray-50 text-gray-600';
};

const getInitials = (value: string) =>
    value
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');

const toNumber = (value?: string | number | null) => {
    if (typeof value === 'number') {
        return value;
    }
    if (typeof value === 'string') {
        const parsed = Number(value);
        return Number.isNaN(parsed) ? null : parsed;
    }
    return null;
};

const toReportValue = (value: unknown): string | number | null => {
    if (typeof value === 'number') {
        return value;
    }
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) {
            return null;
        }
        const numeric = toNumber(trimmed);
        return numeric !== null ? numeric : trimmed;
    }
    return null;
};

const REPORT_SKIP_KEYS = new Set([
    'teamId',
    'teamName',
    'teamFullName',
    'teamAbbrev',
    'teamTriCode',
    'teamCode',
    'seasonId',
    'gameTypeId',
    'franchiseId',
]);

const formatKeyLabel = (value: string) =>
    value
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());

const formatSeasonLabel = (season: number) => {
    const value = String(season);
    if (value.length === 8) {
        return `${value.slice(0, 4)}-${value.slice(6)}`;
    }
    return value;
};

const getReportValue = (
    report: Record<string, unknown> | null | undefined,
    keys: string[],
) => {
    if (!report) {
        return null;
    }
    for (const key of keys) {
        const value = toReportValue(report[key]);
        if (value !== null) {
            return value;
        }
    }
    return null;
};

const formatReportValue = (
    value: string | number | null,
    format?: ReportMetricSpec['format'],
    digits?: number,
) => {
    if (value === null) {
        return '--';
    }
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) {
            return '--';
        }
        const numeric = toNumber(trimmed);
        if (numeric !== null) {
            return formatReportValue(numeric, format, digits);
        }
        if (format === 'pct' && trimmed.includes('%')) {
            return trimmed;
        }
        return trimmed;
    }
    if (format === 'pct') {
        return formatPctSmart(value);
    }
    const resolvedDigits =
        digits ?? (Number.isInteger(value) ? 0 : 1);
    return formatNumber(value, resolvedDigits);
};

const buildFallbackReportMetrics = (
    report: Record<string, unknown> | null | undefined,
    limit = 4,
): ReportMetric[] => {
    if (!report) {
        return [];
    }
    const entries = Object.entries(report)
        .filter(([key, value]) => !REPORT_SKIP_KEYS.has(key))
        .map(([key, value]) => ({
            key,
            value: toReportValue(value),
        }))
        .filter((entry) => entry.value !== null)
        .slice(0, limit);

    return entries.map((entry) => {
        const label = formatKeyLabel(entry.key);
        const value = /pct|percent/i.test(entry.key)
            ? formatReportValue(entry.value, 'pct')
            : formatReportValue(entry.value, 'number');
        return { label, value };
    });
};

const buildReportMetrics = (
    report: Record<string, unknown> | null | undefined,
    specs: ReportMetricSpec[],
): ReportMetric[] => {
    const metrics = specs.map((spec) => {
        const value = getReportValue(report, spec.keys);
        return {
            label: spec.label,
            value: formatReportValue(value, spec.format, spec.digits),
            hasValue: value !== null,
        };
    });

    if (metrics.some((metric) => metric.hasValue)) {
        return metrics.map(({ label, value }) => ({ label, value }));
    }

    return buildFallbackReportMetrics(report, specs.length || 4);
};

const getReportMetricCount = (
    report: Record<string, unknown> | null | undefined,
) => {
    if (!report) {
        return 0;
    }
    return Object.entries(report).reduce((count, [key, value]) => {
        if (REPORT_SKIP_KEYS.has(key)) {
            return count;
        }
        return toReportValue(value) === null
            ? count
            : count + 1;
    }, 0);
};

const buildAllReportMetrics = (
    report: Record<string, unknown> | null | undefined,
    excludeKeys: Set<string> = new Set(),
): ReportMetric[] => {
    if (!report) {
        return [];
    }
    return Object.entries(report)
        .filter(([key, value]) => {
            if (REPORT_SKIP_KEYS.has(key) || excludeKeys.has(key)) {
                return false;
            }
            return toReportValue(value) !== null;
        })
        .map(([key, value]) => {
            const reportValue = toReportValue(value);
            const formatted = /pct|percent/i.test(key)
                ? formatReportValue(reportValue, 'pct')
                : formatReportValue(reportValue, 'number');
            return {
                label: formatKeyLabel(key),
                value: formatted,
            };
        })
        .sort((a, b) => a.label.localeCompare(b.label));
};

const hasReportSpecMatch = (
    report: Record<string, unknown> | null | undefined,
    specs: ReportMetricSpec[],
) => specs.some((spec) => getReportValue(report, spec.keys) !== null);

const buildFullReportMetrics = (
    report: Record<string, unknown> | null | undefined,
    specs: ReportMetricSpec[],
): ReportMetric[] => {
    if (!report) {
        return [];
    }
    if (!hasReportSpecMatch(report, specs)) {
        return buildAllReportMetrics(report);
    }
    const excludeKeys = new Set(specs.flatMap((spec) => spec.keys));
    return [
        ...buildReportMetrics(report, specs),
        ...buildAllReportMetrics(report, excludeKeys),
    ];
};

const getSeasonParam = (seasonId?: number | null) => {
    if (seasonId) {
        return String(seasonId);
    }
    const now = new Date();
    const startYear =
        now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
    return `${startYear}${startYear + 1}`;
};

export default function LabTeamDetail() {
    const { team } = usePage().props as PageProps;
    const teamParam = team?.toString().toLowerCase() ?? '';

    const standingsQuery = useQuery({
        queryKey: ['nhl', 'standings'],
        queryFn: () => fetchNhl('standings'),
        staleTime: 60_000,
    });
    const teamsQuery = useQuery({
        queryKey: ['nhl', 'teams'],
        queryFn: () => fetchNhl('teams'),
        staleTime: 300_000,
    });

    const standings = useMemo(
        () => parseStandings(standingsQuery.data ?? {}),
        [standingsQuery.data],
    );
    const teams = useMemo(
        () => parseTeams(teamsQuery.data ?? {}),
        [teamsQuery.data],
    );

    const teamFromStandings = useMemo(() => {
        const isAbbrev = teamParam.length <= 4;
        return standings.find((row) => {
            if (isAbbrev && row.abbrev) {
                return row.abbrev.toLowerCase() === teamParam;
            }
            return slugify(row.name) === teamParam;
        });
    }, [standings, teamParam]);

    const teamFromList = useMemo(() => {
        const isAbbrev = teamParam.length <= 4;
        return teams.find((row) => {
            if (isAbbrev && row.abbrev) {
                return row.abbrev.toLowerCase() === teamParam;
            }
            return slugify(row.name) === teamParam;
        });
    }, [teamParam, teams]);

    const teamName = teamFromStandings?.name ?? teamFromList?.name ?? 'Team';
    const teamAbbrev =
        teamFromStandings?.abbrev ??
        teamFromList?.abbrev ??
        (teamParam.length <= 4 ? teamParam.toUpperCase() : undefined);
    const seasonParam = getSeasonParam(teamFromStandings?.seasonId);
    const [selectedClubSeason, setSelectedClubSeason] =
        useState(seasonParam);
    const [selectedRosterSeason, setSelectedRosterSeason] =
        useState(seasonParam);
    const [selectedGameType, setSelectedGameType] =
        useState<GameTypeValue>('2');
    const clubStatsSeasonValue = selectedClubSeason || seasonParam;
    const rosterSeasonValue = selectedRosterSeason || seasonParam;
    const gameTypeLabel = getGameTypeLabel(selectedGameType);
    const selectedGameTypeId = Number(selectedGameType);
    const standingsAvailable = selectedGameType === '2';

    const teamScheduleQuery = useQuery({
        queryKey: ['nhl', 'club-schedule', teamAbbrev, seasonParam],
        queryFn: () =>
            fetchNhl(`club-schedule/${teamAbbrev}?season=${seasonParam}`),
        enabled: Boolean(teamAbbrev),
        staleTime: 60_000,
    });
    const schedule = useMemo(
        () => parseSchedule(teamScheduleQuery.data ?? {}),
        [teamScheduleQuery.data],
    );

    const scheduleWeekQuery = useQuery({
        queryKey: ['nhl', 'club-schedule-view', teamAbbrev, 'week'],
        queryFn: () =>
            fetchNhl(`club-schedule-view/${teamAbbrev}?view=week`),
        enabled: Boolean(teamAbbrev),
        staleTime: 60_000,
    });
    const scheduleMonthQuery = useQuery({
        queryKey: ['nhl', 'club-schedule-view', teamAbbrev, 'month'],
        queryFn: () =>
            fetchNhl(`club-schedule-view/${teamAbbrev}?view=month`),
        enabled: Boolean(teamAbbrev),
        staleTime: 60_000,
    });
    const scheduleWeek = useMemo(
        () => parseSchedule(scheduleWeekQuery.data ?? {}),
        [scheduleWeekQuery.data],
    );
    const scheduleMonth = useMemo(
        () => parseSchedule(scheduleMonthQuery.data ?? {}),
        [scheduleMonthQuery.data],
    );

    const teamStatsQuery = useQuery({
        queryKey: ['nhl', 'team-stats', teamAbbrev, seasonParam, selectedGameType],
        queryFn: () =>
            fetchNhl(
                `team-stats/${teamAbbrev}?season=${seasonParam}&gameType=${selectedGameType}`,
            ),
        enabled: Boolean(teamAbbrev),
        staleTime: 300_000,
    });
    const teamStats = useMemo(
        () => parseTeamStats(teamStatsQuery.data ?? {}),
        [teamStatsQuery.data],
    );

    const clubStatsQuery = useQuery({
        queryKey: [
            'nhl',
            'club-stats',
            teamAbbrev,
            clubStatsSeasonValue,
            selectedGameType,
        ],
        queryFn: () =>
            fetchNhl(
                `club-stats/${teamAbbrev}?season=${clubStatsSeasonValue}&gameType=${selectedGameType}`,
            ),
        enabled: Boolean(teamAbbrev),
        staleTime: 300_000,
    });
    const clubStats = useMemo(
        () => parseClubStats(clubStatsQuery.data ?? {}),
        [clubStatsQuery.data],
    );

    const clubStatsSeasonQuery = useQuery({
        queryKey: ['nhl', 'club-stats-season', teamAbbrev],
        queryFn: () => fetchNhl(`club-stats-season/${teamAbbrev}`),
        enabled: Boolean(teamAbbrev),
        staleTime: 300_000,
    });
    const rosterSeasonQuery = useQuery({
        queryKey: ['nhl', 'roster-season', teamAbbrev],
        queryFn: () => fetchNhl(`roster-season/${teamAbbrev}`),
        enabled: Boolean(teamAbbrev),
        staleTime: 300_000,
    });
    const clubStatsSeasons = useMemo(
        () =>
            parseSeasonList(clubStatsSeasonQuery.data ?? {}).sort(
                (a, b) => b.season - a.season,
            ),
        [clubStatsSeasonQuery.data],
    );
    const rosterSeasons = useMemo(
        () =>
            parseSeasonList(rosterSeasonQuery.data ?? {}).sort(
                (a, b) => b.season - a.season,
            ),
        [rosterSeasonQuery.data],
    );

    useEffect(() => {
        if (clubStatsSeasons.length === 0) {
            return;
        }
        const current = selectedClubSeason || seasonParam;
        const exists = clubStatsSeasons.some(
            (season) => String(season.season) === current,
        );
        if (!exists) {
            setSelectedClubSeason(String(clubStatsSeasons[0].season));
        }
    }, [clubStatsSeasons, seasonParam, selectedClubSeason]);

    useEffect(() => {
        if (rosterSeasons.length === 0) {
            return;
        }
        const current = selectedRosterSeason || seasonParam;
        const exists = rosterSeasons.some(
            (season) => String(season.season) === current,
        );
        if (!exists) {
            setSelectedRosterSeason(String(rosterSeasons[0].season));
        }
    }, [rosterSeasons, seasonParam, selectedRosterSeason]);

    const prospectsQuery = useQuery({
        queryKey: ['nhl', 'prospects', teamAbbrev],
        queryFn: () => fetchNhl(`prospects/${teamAbbrev}`),
        enabled: Boolean(teamAbbrev),
        staleTime: 300_000,
    });
    const prospects = useMemo(
        () => parseProspects(prospectsQuery.data ?? {}),
        [prospectsQuery.data],
    );

    const rosterQuery = useQuery({
        queryKey: [
            'nhl',
            'roster',
            teamAbbrev,
            rosterSeasonValue,
            selectedGameType,
        ],
        queryFn: () =>
            fetchNhl(
                `roster/${teamAbbrev}?season=${rosterSeasonValue}&gameType=${selectedGameType}`,
            ),
        enabled: Boolean(teamAbbrev),
        staleTime: 300_000,
    });
    const roster = useMemo(
        () => parseRoster(rosterQuery.data ?? {}),
        [rosterQuery.data],
    );
    const [rosterFilter, setRosterFilter] =
        useState<RosterFilter>('All');
    const [showUpcomingDialog, setShowUpcomingDialog] = useState(false);
    const [showRecentDialog, setShowRecentDialog] = useState(false);
    const [showClubStatsDialog, setShowClubStatsDialog] = useState(false);
    const [showWeekScheduleDialog, setShowWeekScheduleDialog] = useState(false);
    const [showMonthScheduleDialog, setShowMonthScheduleDialog] = useState(false);
    const [reportDialog, setReportDialog] = useState<{
        title: string;
        subtitle?: string;
        metrics: ReportMetric[];
    } | null>(null);

    const teamGames = useMemo(() => {
        const matchesTeam = (value?: string) => {
            if (!value) {
                return false;
            }
            if (teamAbbrev && value.toLowerCase() === teamAbbrev.toLowerCase()) {
                return true;
            }
            return value.toLowerCase() === teamName.toLowerCase();
        };
        const matchesGameType = (game: ScheduleGame) =>
            !game.gameTypeId || game.gameTypeId === selectedGameTypeId;

        return schedule
            .flatMap((day) => day.games)
            .filter(
                (game) =>
                    matchesGameType(game) &&
                    (matchesTeam(game.home.abbrev) ||
                        matchesTeam(game.away.abbrev) ||
                        matchesTeam(game.home.name) ||
                        matchesTeam(game.away.name)),
            )
            .map((game) => ({
                game,
                time: game.startTime ? new Date(game.startTime).getTime() : null,
            }))
            .filter(
                (entry) =>
                    entry.time !== null && !Number.isNaN(entry.time),
            );
    }, [schedule, selectedGameTypeId, teamAbbrev, teamName]);

    const upcomingGamesAll = useMemo(() => {
        const now = Date.now();
        return teamGames
            .filter((entry) => (entry.time as number) >= now)
            .slice()
            .sort((a, b) => (a.time as number) - (b.time as number))
            .map((entry) => entry.game);
    }, [teamGames]);

    const upcomingSplit = useMemo(() => {
        let home = 0;
        let away = 0;
        upcomingGamesAll.forEach((game) => {
            const isHome =
                (teamAbbrev &&
                    game.home.abbrev?.toLowerCase() ===
                        teamAbbrev.toLowerCase()) ||
                game.home.name.toLowerCase() === teamName.toLowerCase();
            if (isHome) {
                home += 1;
            } else {
                away += 1;
            }
        });
        return { home, away };
    }, [teamAbbrev, teamName, upcomingGamesAll]);

    const recentResultsAll = useMemo(() => {
        const now = Date.now();
        return teamGames
            .filter((entry) => (entry.time as number) <= now)
            .map((entry) => entry.game)
            .filter(
                (game) =>
                    game.home.score !== null &&
                    game.home.score !== undefined &&
                    game.away.score !== null &&
                    game.away.score !== undefined,
            )
            .map((game) => ({
                game,
                time: game.startTime ? new Date(game.startTime).getTime() : null,
            }))
            .filter(
                (entry) =>
                    entry.time !== null && !Number.isNaN(entry.time),
            )
            .slice()
            .sort((a, b) => (b.time as number) - (a.time as number))
            .map((entry) => entry.game)
            .map((game) => {
                const { label, opponent, isHome, venue } = getMatchup(
                    game,
                    teamAbbrev,
                    teamName,
                );
                const scoreFor = isHome ? game.home.score : game.away.score;
                const scoreAgainst = isHome ? game.away.score : game.home.score;
                const result =
                    scoreFor > scoreAgainst
                        ? 'W'
                        : scoreFor < scoreAgainst
                          ? 'L'
                          : 'T';
                const tone =
                    result === 'W' ? 'win' : result === 'L' ? 'loss' : 'neutral';
                const date = normalizeDate(game.startTime || '');
                const subtitle = venue ? `${date} - ${venue}` : date;
                const meta = buildGameMeta(game);

                return {
                    id: game.id,
                    title: `${label} ${opponent}`,
                    subtitle,
                    value: `${result} ${scoreFor}-${scoreAgainst}`,
                    valueTone: tone,
                    badge: isHome ? 'Home' : 'Away',
                    badgeTone: isHome ? 'home' : 'away',
                    meta,
                } satisfies GameRow;
            });
    }, [teamAbbrev, teamGames, teamName]);

    const recentResults = useMemo(
        () => recentResultsAll.slice(0, 5),
        [recentResultsAll],
    );

    const upcomingRowsAll = useMemo(
        () => buildUpcomingRows(upcomingGamesAll, teamAbbrev, teamName),
        [teamAbbrev, teamName, upcomingGamesAll],
    );
    const upcomingRows = useMemo(
        () => upcomingRowsAll.slice(0, 5),
        [upcomingRowsAll],
    );

    const nextGame = useMemo(() => upcomingGamesAll[0] ?? null, [upcomingGamesAll]);
    const nextGameInfo = useMemo(() => {
        if (!nextGame?.startTime) {
            return null;
        }
        const gameTime = new Date(nextGame.startTime);
        if (Number.isNaN(gameTime.getTime())) {
            return null;
        }
        const { label, opponent, isHome, venue } = getMatchup(
            nextGame,
            teamAbbrev,
            teamName,
        );
        const restHours = (gameTime.getTime() - Date.now()) / 36e5;
        const date = normalizeDate(nextGame.startTime);
        const time = normalizeTime(nextGame.startTime);
        const subtitle = venue ? `${date} - ${venue}` : date;
        const meta = buildGameMeta(nextGame);

        return {
            title: `${label} ${opponent}`,
            subtitle,
            time,
            isHome,
            restHours,
            meta,
        };
    }, [nextGame, teamAbbrev, teamName]);

    const liveGameInfo = useMemo(() => {
        const liveGames = teamGames
            .map((entry) => entry.game)
            .filter((game) => isLiveStatus(game.status));
        if (liveGames.length === 0) {
            return null;
        }
        const sorted = [...liveGames].sort((a, b) => {
            const aTime = a.startTime ? new Date(a.startTime).getTime() : null;
            const bTime = b.startTime ? new Date(b.startTime).getTime() : null;
            if (aTime === null && bTime === null) {
                return 0;
            }
            if (aTime === null) {
                return 1;
            }
            if (bTime === null) {
                return -1;
            }
            return bTime - aTime;
        });
        const game = sorted[0];
        const { label, opponent, isHome, venue } = getMatchup(
            game,
            teamAbbrev,
            teamName,
        );
        const scoreFor = isHome ? game.home.score : game.away.score;
        const scoreAgainst = isHome ? game.away.score : game.home.score;
        const date = normalizeDate(game.startTime || '');
        const subtitle = venue ? `${date} - ${venue}` : date;
        const meta = buildGameMeta(game);
        const scoreLine =
            scoreFor !== null &&
            scoreFor !== undefined &&
            scoreAgainst !== null &&
            scoreAgainst !== undefined
                ? `${scoreFor}-${scoreAgainst}`
                : '--';

        return {
            title: `${label} ${opponent}`,
            subtitle,
            scoreLine,
            meta,
        };
    }, [teamAbbrev, teamGames, teamName]);

    const matchesSelectedGameType = (game: ScheduleGame) =>
        !game.gameTypeId || game.gameTypeId === selectedGameTypeId;
    const weekGames = useMemo(
        () =>
            scheduleWeek
                .flatMap((day) => day.games)
                .filter(matchesSelectedGameType),
        [scheduleWeek, selectedGameTypeId],
    );
    const monthGames = useMemo(
        () =>
            scheduleMonth
                .flatMap((day) => day.games)
                .filter(matchesSelectedGameType),
        [scheduleMonth, selectedGameTypeId],
    );
    const weekSplit = useMemo(
        () => countHomeAway(weekGames, teamAbbrev, teamName),
        [teamAbbrev, teamName, weekGames],
    );
    const monthSplit = useMemo(
        () => countHomeAway(monthGames, teamAbbrev, teamName),
        [teamAbbrev, teamName, monthGames],
    );
    const weekRowsAll = useMemo(() => {
        const sorted = [...weekGames].sort((a, b) => {
            const aTime = a.startTime ? new Date(a.startTime).getTime() : null;
            const bTime = b.startTime ? new Date(b.startTime).getTime() : null;
            if (aTime === null && bTime === null) {
                return 0;
            }
            if (aTime === null) {
                return 1;
            }
            if (bTime === null) {
                return -1;
            }
            return aTime - bTime;
        });
        return buildUpcomingRows(sorted, teamAbbrev, teamName);
    }, [teamAbbrev, teamName, weekGames]);
    const monthRowsAll = useMemo(() => {
        const sorted = [...monthGames].sort((a, b) => {
            const aTime = a.startTime ? new Date(a.startTime).getTime() : null;
            const bTime = b.startTime ? new Date(b.startTime).getTime() : null;
            if (aTime === null && bTime === null) {
                return 0;
            }
            if (aTime === null) {
                return 1;
            }
            if (bTime === null) {
                return -1;
            }
            return aTime - bTime;
        });
        return buildUpcomingRows(sorted, teamAbbrev, teamName);
    }, [monthGames, teamAbbrev, teamName]);
    const scheduleViewLoading =
        scheduleWeekQuery.isLoading || scheduleMonthQuery.isLoading;
    const scheduleViewError =
        scheduleWeekQuery.isError || scheduleMonthQuery.isError;
    const scheduleViewEmpty =
        !scheduleViewLoading &&
        !scheduleViewError &&
        weekGames.length === 0 &&
        monthGames.length === 0;

    const statsSummary = teamStats.summary ?? null;
    const goalieSummary = teamStats.savePercentage ?? null;
    const percentages = teamStats.percentages ?? null;
    const summaryShooting = teamStats.summaryShooting ?? null;
    const powerPlay = teamStats.powerPlay ?? null;
    const penaltyKill = teamStats.penaltyKill ?? null;
    const seasonGames = teamStats.season?.numberOfGames ?? null;
    const gamesPlayed =
        statsSummary?.gamesPlayed ?? teamFromStandings?.gamesPlayed ?? null;
    const points = statsSummary?.points ?? teamFromStandings?.points ?? null;
    const goalsFor =
        statsSummary?.goalsFor ?? teamFromStandings?.goalsFor ?? null;
    const goalsAgainst =
        statsSummary?.goalsAgainst ?? teamFromStandings?.goalsAgainst ?? null;
    const profilePoints = standingsAvailable
        ? teamFromStandings?.points ?? statsSummary?.points ?? null
        : statsSummary?.points ?? null;
    const profileWins = standingsAvailable
        ? teamFromStandings?.wins ?? statsSummary?.wins ?? null
        : statsSummary?.wins ?? null;
    const profileLosses = standingsAvailable
        ? teamFromStandings?.losses ?? statsSummary?.losses ?? null
        : statsSummary?.losses ?? null;
    const profileOtLosses = standingsAvailable
        ? teamFromStandings?.otLosses ?? statsSummary?.otLosses ?? null
        : statsSummary?.otLosses ?? null;
    const profilePointPct = standingsAvailable
        ? teamFromStandings?.pointPctg ?? statsSummary?.pointPct ?? null
        : statsSummary?.pointPct ?? null;
    const profileGoalDiff =
        goalsFor !== null && goalsAgainst !== null
            ? goalsFor - goalsAgainst
            : teamFromStandings?.goalDifferential ?? null;
    const goalsForPerGame =
        statsSummary?.goalsForPerGame ??
        (goalsFor !== null && gamesPlayed
            ? goalsFor / gamesPlayed
            : null);
    const goalsAgainstPerGame =
        statsSummary?.goalsAgainstPerGame ??
        (goalsAgainst !== null && gamesPlayed
            ? goalsAgainst / gamesPlayed
            : null);
    const shotsForPerGame = statsSummary?.shotsForPerGame ?? null;
    const shotsAgainstPerGame = statsSummary?.shotsAgainstPerGame ?? null;
    const shotDiffPerGame =
        shotsForPerGame !== null && shotsAgainstPerGame !== null
            ? shotsForPerGame - shotsAgainstPerGame
            : null;
    const shootingPct =
        goalsFor !== null &&
        gamesPlayed &&
        shotsForPerGame !== null &&
        shotsForPerGame > 0
            ? goalsFor / (shotsForPerGame * gamesPlayed)
            : null;
    const savePct = goalieSummary?.savePct ?? null;
    const pointsPerGame =
        points !== null && gamesPlayed ? points / gamesPlayed : null;
    const seasonLength = seasonGames ?? 82;
    const pointPace =
        pointsPerGame !== null ? pointsPerGame * seasonLength : null;
    const gamesRemaining =
        gamesPlayed !== null ? Math.max(seasonLength - gamesPlayed, 0) : null;
    const ppToiMinutes =
        powerPlay?.ppTimeOnIcePerGame !== null &&
        powerPlay?.ppTimeOnIcePerGame !== undefined
            ? powerPlay.ppTimeOnIcePerGame / 60
            : null;
    const pkToiMinutes =
        penaltyKill?.pkTimeOnIcePerGame !== null &&
        penaltyKill?.pkTimeOnIcePerGame !== undefined
            ? penaltyKill.pkTimeOnIcePerGame / 60
            : null;
    const ppToiTotal = getReportValue(teamStats.powerPlayTime, [
        'ppTimeOnIce',
        'ppTimeOnIceTotal',
        'powerPlayTimeOnIce',
        'powerPlayTimeOnIceTotal',
    ]);
    const pkToiTotal = getReportValue(teamStats.penaltyKillTime, [
        'pkTimeOnIce',
        'pkTimeOnIceTotal',
        'penaltyKillTimeOnIce',
        'penaltyKillTimeOnIceTotal',
    ]);
    const ppOppsTotal =
        getReportValue(teamStats.powerPlayTime, [
            'ppOpportunities',
            'ppOpportunitiesTotal',
            'powerPlayOpportunities',
            'powerPlayOpportunitiesTotal',
        ]) ?? powerPlay?.ppOpportunities ?? null;
    const timesShorthandedTotal =
        getReportValue(teamStats.penaltyKillTime, [
            'timesShorthanded',
            'timesShortHanded',
            'timesShorthandedTotal',
        ]) ?? penaltyKill?.timesShorthanded ?? null;
    const satDiff =
        summaryShooting?.satFor !== null &&
        summaryShooting?.satFor !== undefined &&
        summaryShooting?.satAgainst !== null &&
        summaryShooting?.satAgainst !== undefined
            ? summaryShooting.satFor - summaryShooting.satAgainst
            : null;
    const usatDiff =
        summaryShooting?.usatFor !== null &&
        summaryShooting?.usatFor !== undefined &&
        summaryShooting?.usatAgainst !== null &&
        summaryShooting?.usatAgainst !== undefined
            ? summaryShooting.usatFor - summaryShooting.usatAgainst
            : null;


    const isLoading = standingsQuery.isLoading || teamsQuery.isLoading;
    const teamMissing = !isLoading && !teamFromStandings && !teamFromList;
    const rosterCount =
        roster.forwards.length +
        roster.defensemen.length +
        roster.goalies.length;
    const clubStatsCount =
        clubStats.skaters.length + clubStats.goalies.length;
    const sortRoster = (players: typeof roster.forwards) => {
        return [...players].sort((a, b) => {
            const aNumber = toNumber(a.number);
            const bNumber = toNumber(b.number);
            if (aNumber !== null && bNumber !== null && aNumber !== bNumber) {
                return aNumber - bNumber;
            }
            return a.name.localeCompare(b.name);
        });
    };
    const allPlayers = useMemo(
        () => sortRoster([...roster.forwards, ...roster.defensemen, ...roster.goalies]),
        [roster.defensemen, roster.forwards, roster.goalies],
    );
    const filteredPlayers = useMemo(() => {
        if (rosterFilter === 'Forwards') {
            return sortRoster(roster.forwards);
        }
        if (rosterFilter === 'Defensemen') {
            return sortRoster(roster.defensemen);
        }
        if (rosterFilter === 'Goalies') {
            return sortRoster(roster.goalies);
        }
        return allPlayers;
    }, [allPlayers, roster.defensemen, roster.forwards, roster.goalies, rosterFilter]);

    const topSkaters = useMemo(() => {
        return [...clubStats.skaters]
            .sort((a, b) => {
                const aPoints = a.points ?? -1;
                const bPoints = b.points ?? -1;
                if (aPoints !== bPoints) {
                    return bPoints - aPoints;
                }
                const aGoals = a.goals ?? -1;
                const bGoals = b.goals ?? -1;
                if (aGoals !== bGoals) {
                    return bGoals - aGoals;
                }
                return a.name.localeCompare(b.name);
            })
            .slice(0, 5);
    }, [clubStats.skaters]);

    const topGoalies = useMemo(() => {
        return [...clubStats.goalies]
            .sort((a, b) => {
                const aWins = a.wins ?? -1;
                const bWins = b.wins ?? -1;
                if (aWins !== bWins) {
                    return bWins - aWins;
                }
                const aSave = a.savePercentage ?? -1;
                const bSave = b.savePercentage ?? -1;
                if (aSave !== bSave) {
                    return bSave - aSave;
                }
                return a.name.localeCompare(b.name);
            })
            .slice(0, 3);
    }, [clubStats.goalies]);

    const allSkatersSorted = useMemo(() => {
        return [...clubStats.skaters].sort((a, b) => {
            const aPoints = a.points ?? -1;
            const bPoints = b.points ?? -1;
            if (aPoints !== bPoints) {
                return bPoints - aPoints;
            }
            const aGoals = a.goals ?? -1;
            const bGoals = b.goals ?? -1;
            if (aGoals !== bGoals) {
                return bGoals - aGoals;
            }
            return a.name.localeCompare(b.name);
        });
    }, [clubStats.skaters]);

    const allGoaliesSorted = useMemo(() => {
        return [...clubStats.goalies].sort((a, b) => {
            const aWins = a.wins ?? -1;
            const bWins = b.wins ?? -1;
            if (aWins !== bWins) {
                return bWins - aWins;
            }
            const aSave = a.savePercentage ?? -1;
            const bSave = b.savePercentage ?? -1;
            if (aSave !== bSave) {
                return bSave - aSave;
            }
            return a.name.localeCompare(b.name);
        });
    }, [clubStats.goalies]);

    const sortProspects = (players: typeof prospects.forwards) => {
        const sorted = [...players];
        return sorted.sort((a, b) => {
            const aYear = a.draftYear ?? 0;
            const bYear = b.draftYear ?? 0;
            if (aYear !== bYear) {
                return bYear - aYear;
            }
            const aRound = a.draftRound ?? 99;
            const bRound = b.draftRound ?? 99;
            if (aRound !== bRound) {
                return aRound - bRound;
            }
            const aPick = a.draftPick ?? 999;
            const bPick = b.draftPick ?? 999;
            if (aPick !== bPick) {
                return aPick - bPick;
            }
            return a.name.localeCompare(b.name);
        });
    };

    const prospectGroups = useMemo(
        () => [
            {
                label: 'Forwards',
                players: sortProspects(prospects.forwards),
            },
            {
                label: 'Defensemen',
                players: sortProspects(prospects.defensemen),
            },
            {
                label: 'Goalies',
                players: sortProspects(prospects.goalies),
            },
        ],
        [prospects.defensemen, prospects.forwards, prospects.goalies],
    );
    const prospectCount =
        prospects.forwards.length +
        prospects.defensemen.length +
        prospects.goalies.length;

    const wildCardGap = useMemo(() => {
        if (!standingsAvailable || !teamFromStandings?.conferenceName) {
            return {
                gapPoints: null as number | null,
                gapGames: null as number | null,
            };
        }
        const conferenceTeams = standings.filter(
            (row) => row.conferenceName === teamFromStandings.conferenceName,
        );
        const wc2 = conferenceTeams.find(
            (row) => row.wildcardSequence === 2,
        );
        if (!wc2) {
            return { gapPoints: null, gapGames: null };
        }
        if (
            teamFromStandings.points === null ||
            teamFromStandings.points === undefined ||
            wc2.points === null ||
            wc2.points === undefined
        ) {
            return { gapPoints: null, gapGames: null };
        }
        const gapPoints = teamFromStandings.points - wc2.points;
        const gapGames =
            teamFromStandings.gamesPlayed !== null &&
            teamFromStandings.gamesPlayed !== undefined &&
            wc2.gamesPlayed !== null &&
            wc2.gamesPlayed !== undefined
                ? teamFromStandings.gamesPlayed - wc2.gamesPlayed
                : null;
        return { gapPoints, gapGames };
    }, [standings, standingsAvailable, teamFromStandings]);

    const wildCardStatus = useMemo(() => {
        if (!standingsAvailable) {
            return '--';
        }
        const seq = teamFromStandings?.wildcardSequence ?? null;
        if (seq === 1) {
            return 'WC1';
        }
        if (seq === 2) {
            return 'WC2';
        }
        if (seq !== null && seq > 2) {
            return 'Outside';
        }
        if (seq === 0) {
            return 'Division';
        }
        return '--';
    }, [standingsAvailable, teamFromStandings?.wildcardSequence]);
    const clinchStatus = standingsAvailable
        ? formatClinchIndicator(teamFromStandings?.clinchIndicator)
        : '--';

    const reportCards = useMemo(
        () => {
            const reportSources = [
                teamStats.faceoffPercentages,
                teamStats.faceoffWins,
                teamStats.penalties,
                teamStats.goalsByPeriod,
                teamStats.goalsForByStrength,
                teamStats.goalsAgainstByStrength,
                teamStats.goalsForByStrengthGoaliePull,
                teamStats.goalsAgainstByStrengthGoaliePull,
                teamStats.leadingTrailing,
                teamStats.scoreTrailFirst,
                teamStats.shootout,
                teamStats.shotType,
                teamStats.realtime,
                teamStats.outshootOutshot,
                teamStats.goalGames,
                teamStats.powerPlayTime,
                teamStats.penaltyKillTime,
            ];
            const cards = [
            {
                title: 'Faceoff percentages',
                subtitle: 'Zone win rates',
                metrics: buildFullReportMetrics(teamStats.faceoffPercentages, [
                    {
                        label: 'Overall FO%',
                        keys: [
                            'faceoffWinPct',
                            'faceoffWinPctg',
                            'faceoffWinPercentage',
                            'overallFaceoffWinPctg',
                            'overallFaceoffWinPct',
                            'faceoffWinPercent',
                        ],
                        format: 'pct',
                    },
                    {
                        label: 'O-zone FO%',
                        keys: [
                            'offensiveZoneFaceoffWinPct',
                            'offensiveZoneFaceoffWinPctg',
                            'offensiveZoneFaceoffPct',
                            'offensiveZoneWinPct',
                            'oZoneFaceoffWinPct',
                            'oZoneFaceoffWinPctg',
                            'oZoneFaceoffPct',
                            'offensiveZonePct',
                        ],
                        format: 'pct',
                    },
                    {
                        label: 'D-zone FO%',
                        keys: [
                            'defensiveZoneFaceoffWinPct',
                            'defensiveZoneFaceoffWinPctg',
                            'defensiveZoneFaceoffPct',
                            'defensiveZoneWinPct',
                            'dZoneFaceoffWinPct',
                            'dZoneFaceoffWinPctg',
                            'dZoneFaceoffPct',
                            'defensiveZonePct',
                        ],
                        format: 'pct',
                    },
                    {
                        label: 'Neutral FO%',
                        keys: [
                            'neutralZoneFaceoffWinPct',
                            'neutralZoneFaceoffWinPctg',
                            'neutralZoneFaceoffPct',
                            'neutralZoneWinPct',
                            'nZoneFaceoffWinPct',
                            'nZoneFaceoffWinPctg',
                            'nZoneFaceoffPct',
                            'neutralZonePct',
                        ],
                        format: 'pct',
                    },
                ]),
            },
            {
                title: 'Faceoff wins',
                subtitle: 'Volume splits',
                metrics: buildFullReportMetrics(teamStats.faceoffWins, [
                    {
                        label: 'FO wins',
                        keys: [
                            'faceoffWins',
                            'faceoffsWon',
                            'faceoffWin',
                            'faceoffWinsTotal',
                            'faceoffsWonTotal',
                            'totalFaceoffWins',
                        ],
                    },
                    {
                        label: 'FO losses',
                        keys: [
                            'faceoffLosses',
                            'faceoffsLost',
                            'faceoffLossesTotal',
                            'faceoffsLostTotal',
                            'totalFaceoffLosses',
                        ],
                    },
                    {
                        label: 'FO taken',
                        keys: [
                            'faceoffTaken',
                            'faceoffsTaken',
                            'faceoffTakenTotal',
                            'faceoffsTotal',
                            'totalFaceoffs',
                        ],
                    },
                    {
                        label: 'O-zone wins',
                        keys: [
                            'offensiveZoneFaceoffWins',
                            'offensiveZoneFaceoffWinsTotal',
                            'offensiveZoneFaceoffsWon',
                            'offensiveZoneWins',
                            'oZoneFaceoffWins',
                            'oZoneFaceoffsWon',
                        ],
                    },
                    {
                        label: 'D-zone wins',
                        keys: [
                            'defensiveZoneFaceoffWins',
                            'defensiveZoneFaceoffWinsTotal',
                            'defensiveZoneFaceoffsWon',
                            'defensiveZoneWins',
                            'dZoneFaceoffWins',
                            'dZoneFaceoffsWon',
                        ],
                    },
                    {
                        label: 'Neutral wins',
                        keys: [
                            'neutralZoneFaceoffWins',
                            'neutralZoneFaceoffWinsTotal',
                            'neutralZoneFaceoffsWon',
                            'neutralZoneWins',
                            'nZoneFaceoffWins',
                            'nZoneFaceoffsWon',
                        ],
                    },
                    {
                        label: 'O-zone taken',
                        keys: [
                            'offensiveZoneFaceoffTaken',
                            'offensiveZoneFaceoffsTaken',
                            'offensiveZoneFaceoffs',
                            'oZoneFaceoffTaken',
                            'oZoneFaceoffsTaken',
                        ],
                    },
                    {
                        label: 'D-zone taken',
                        keys: [
                            'defensiveZoneFaceoffTaken',
                            'defensiveZoneFaceoffsTaken',
                            'defensiveZoneFaceoffs',
                            'dZoneFaceoffTaken',
                            'dZoneFaceoffsTaken',
                        ],
                    },
                    {
                        label: 'Neutral taken',
                        keys: [
                            'neutralZoneFaceoffTaken',
                            'neutralZoneFaceoffsTaken',
                            'neutralZoneFaceoffs',
                            'nZoneFaceoffTaken',
                            'nZoneFaceoffsTaken',
                        ],
                    },
                ]),
            },
            {
                title: 'Penalties',
                subtitle: 'Discipline splits',
                metrics: buildFullReportMetrics(teamStats.penalties, [
                    {
                        label: 'Penalty minutes',
                        keys: [
                            'pim',
                            'pimTotal',
                            'penaltyMinutes',
                            'penaltyMinutesTotal',
                        ],
                    },
                    {
                        label: 'Penalties taken',
                        keys: [
                            'penalties',
                            'penaltiesTaken',
                            'penaltiesFor',
                            'penaltiesCommitted',
                            'penaltiesTakenTotal',
                        ],
                    },
                    {
                        label: 'Penalties drawn',
                        keys: [
                            'penaltiesDrawn',
                            'penaltiesDrawnFor',
                            'penaltiesDrawnTotal',
                            'penaltiesReceived',
                            'penaltiesAgainst',
                        ],
                    },
                    {
                        label: 'Penalty diff',
                        keys: [
                            'penaltyDiff',
                            'penaltyDifferential',
                            'penaltyDifferentialTotal',
                            'netPenaltyDifferential',
                            'netPenalties',
                        ],
                    },
                    {
                        label: 'Minor penalties',
                        keys: [
                            'minorPenalties',
                            'minorPenaltiesTaken',
                            'minorPenaltiesTotal',
                            'minors',
                        ],
                    },
                    {
                        label: 'Major penalties',
                        keys: [
                            'majorPenalties',
                            'majorPenaltiesTaken',
                            'majorPenaltiesTotal',
                            'majors',
                        ],
                    },
                    {
                        label: 'Misconducts',
                        keys: [
                            'misconductPenalties',
                            'misconductPenaltiesTotal',
                            'misconducts',
                            'misconduct',
                        ],
                    },
                    {
                        label: 'Bench minors',
                        keys: [
                            'benchMinors',
                            'benchMinorPenalties',
                            'benchMinorPenaltiesTotal',
                        ],
                    },
                    {
                        label: 'Fighting majors',
                        keys: [
                            'fightingMajors',
                            'fightingMajorPenalties',
                            'fights',
                        ],
                    },
                ]),
            },
            {
                title: 'Goals by period',
                subtitle: 'Period scoring',
                metrics: buildFullReportMetrics(teamStats.goalsByPeriod, [
                    {
                        label: 'GF 1st',
                        keys: [
                            'goalsForPeriod1',
                            'goalsFor1stPeriod',
                            'goalsFor1st',
                        ],
                    },
                    {
                        label: 'GA 1st',
                        keys: [
                            'goalsAgainstPeriod1',
                            'goalsAgainst1stPeriod',
                            'goalsAgainst1st',
                        ],
                    },
                    {
                        label: 'GF 2nd',
                        keys: [
                            'goalsForPeriod2',
                            'goalsFor2ndPeriod',
                            'goalsFor2nd',
                        ],
                    },
                    {
                        label: 'GA 2nd',
                        keys: [
                            'goalsAgainstPeriod2',
                            'goalsAgainst2ndPeriod',
                            'goalsAgainst2nd',
                        ],
                    },
                    {
                        label: 'GF 3rd',
                        keys: [
                            'goalsForPeriod3',
                            'goalsFor3rdPeriod',
                            'goalsFor3rd',
                        ],
                    },
                    {
                        label: 'GA 3rd',
                        keys: [
                            'goalsAgainstPeriod3',
                            'goalsAgainst3rdPeriod',
                            'goalsAgainst3rd',
                        ],
                    },
                    {
                        label: 'GF OT',
                        keys: [
                            'goalsForOvertime',
                            'goalsForOT',
                            'overtimeGoalsFor',
                            'goalsForPeriod4',
                        ],
                    },
                    {
                        label: 'GA OT',
                        keys: [
                            'goalsAgainstOvertime',
                            'goalsAgainstOT',
                            'overtimeGoalsAgainst',
                            'goalsAgainstPeriod4',
                        ],
                    },
                ]),
            },
            {
                title: 'Goals for by strength',
                subtitle: 'State scoring',
                metrics: buildFullReportMetrics(teamStats.goalsForByStrength, [
                    {
                        label: 'GF 5v5',
                        keys: [
                            'goalsFor5v5',
                            'goalsFor5On5',
                            'goalsForEvenStrength',
                        ],
                    },
                    {
                        label: 'GF PP',
                        keys: [
                            'goalsForPowerPlay',
                            'powerPlayGoalsFor',
                            'powerPlayGoals',
                            'goalsForPP',
                            'ppGoalsFor',
                        ],
                    },
                    {
                        label: 'GF SH',
                        keys: [
                            'goalsForShortHanded',
                            'shortHandedGoalsFor',
                            'goalsForSH',
                            'shGoalsFor',
                        ],
                    },
                    {
                        label: 'GF 4v4',
                        keys: ['goalsFor4v4', 'goalsFor4On4'],
                    },
                    {
                        label: 'GF 5v4',
                        keys: ['goalsFor5v4', 'goalsFor5On4'],
                    },
                    {
                        label: 'GF 4v5',
                        keys: ['goalsFor4v5', 'goalsFor4On5'],
                    },
                    {
                        label: 'GF 3v3',
                        keys: ['goalsFor3v3', 'goalsFor3On3'],
                    },
                ]),
            },
            {
                title: 'Goals against by strength',
                subtitle: 'State defense',
                metrics: buildFullReportMetrics(teamStats.goalsAgainstByStrength, [
                    {
                        label: 'GA 5v5',
                        keys: [
                            'goalsAgainst5v5',
                            'goalsAgainst5On5',
                            'goalsAgainstEvenStrength',
                        ],
                    },
                    {
                        label: 'GA PP',
                        keys: [
                            'goalsAgainstPowerPlay',
                            'powerPlayGoalsAgainst',
                            'goalsAgainstPP',
                            'ppGoalsAgainst',
                        ],
                    },
                    {
                        label: 'GA SH',
                        keys: [
                            'goalsAgainstShortHanded',
                            'shortHandedGoalsAgainst',
                            'goalsAgainstSH',
                            'shGoalsAgainst',
                        ],
                    },
                    {
                        label: 'GA 4v4',
                        keys: ['goalsAgainst4v4', 'goalsAgainst4On4'],
                    },
                    {
                        label: 'GA 5v4',
                        keys: ['goalsAgainst5v4', 'goalsAgainst5On4'],
                    },
                    {
                        label: 'GA 4v5',
                        keys: ['goalsAgainst4v5', 'goalsAgainst4On5'],
                    },
                    {
                        label: 'GA 3v3',
                        keys: ['goalsAgainst3v3', 'goalsAgainst3On3'],
                    },
                ]),
            },
            {
                title: 'Goals for (goalie pull)',
                subtitle: 'Extra attacker',
                metrics: buildFullReportMetrics(
                    teamStats.goalsForByStrengthGoaliePull,
                    [
                        {
                            label: 'GF 6v5',
                            keys: ['goalsFor6v5', 'goalsFor6On5'],
                        },
                        {
                            label: 'GF 5v6',
                            keys: ['goalsFor5v6', 'goalsFor5On6'],
                        },
                        {
                            label: 'Empty net',
                            keys: [
                                'goalsForEmptyNet',
                                'emptyNetGoalsFor',
                            ],
                        },
                        {
                            label: 'Pulled goalie',
                            keys: ['goalsForPullGoalie', 'goalsForGoaliePull'],
                        },
                    ],
                ),
            },
            {
                title: 'Goals against (goalie pull)',
                subtitle: 'Extra attacker',
                metrics: buildFullReportMetrics(
                    teamStats.goalsAgainstByStrengthGoaliePull,
                    [
                        {
                            label: 'GA 6v5',
                            keys: ['goalsAgainst6v5', 'goalsAgainst6On5'],
                        },
                        {
                            label: 'GA 5v6',
                            keys: ['goalsAgainst5v6', 'goalsAgainst5On6'],
                        },
                        {
                            label: 'Empty net',
                            keys: [
                                'goalsAgainstEmptyNet',
                                'emptyNetGoalsAgainst',
                            ],
                        },
                        {
                            label: 'Pulled goalie',
                            keys: [
                                'goalsAgainstPullGoalie',
                                'goalsAgainstGoaliePull',
                            ],
                        },
                    ],
                ),
            },
            {
                title: 'Leading & trailing',
                subtitle: 'Game state time',
                metrics: buildFullReportMetrics(teamStats.leadingTrailing, [
                    {
                        label: 'Time leading',
                        keys: [
                            'timeLeading',
                            'timeLeadingMinutes',
                            'timeLeadingSeconds',
                        ],
                    },
                    {
                        label: 'Time tied',
                        keys: [
                            'timeTied',
                            'timeTiedMinutes',
                            'timeTiedSeconds',
                        ],
                    },
                    {
                        label: 'Time trailing',
                        keys: [
                            'timeTrailing',
                            'timeTrailingMinutes',
                            'timeTrailingSeconds',
                        ],
                    },
                    {
                        label: 'Wins when leading',
                        keys: [
                            'winsWhenLeading',
                            'leadingWins',
                            'winsLeading',
                            'winsWhenLeadingAfter2',
                            'winsLeadingAfter2',
                        ],
                    },
                ]),
            },
            {
                title: 'Score/trail first',
                subtitle: 'First goal impact',
                metrics: buildFullReportMetrics(teamStats.scoreTrailFirst, [
                    {
                        label: 'Scored first',
                        keys: [
                            'scoredFirst',
                            'scoreFirst',
                            'scoredFirstGames',
                            'scoreFirstGames',
                        ],
                    },
                    {
                        label: 'Scored 1st wins',
                        keys: [
                            'scoredFirstWins',
                            'scoreFirstWins',
                            'scoredFirstWin',
                            'scoreFirstWin',
                        ],
                    },
                    {
                        label: 'Scored 1st losses',
                        keys: [
                            'scoredFirstLosses',
                            'scoreFirstLosses',
                            'scoredFirstLoss',
                            'scoreFirstLoss',
                        ],
                    },
                    {
                        label: 'Trailed 1st wins',
                        keys: [
                            'trailFirstWins',
                            'trailedFirstWins',
                            'trailFirstWin',
                            'trailedFirstWin',
                        ],
                    },
                ]),
            },
            {
                title: 'Shootout',
                subtitle: 'Skills results',
                metrics: buildFullReportMetrics(teamStats.shootout, [
                    {
                        label: 'Shootout wins',
                        keys: [
                            'shootoutWins',
                            'winsInShootout',
                            'shootoutWin',
                        ],
                    },
                    {
                        label: 'Shootout losses',
                        keys: [
                            'shootoutLosses',
                            'lossesInShootout',
                            'shootoutLoss',
                        ],
                    },
                    {
                        label: 'Shootout win %',
                        keys: [
                            'shootoutWinPct',
                            'shootoutWinPercentage',
                            'shootoutWinPctg',
                            'shootoutPct',
                        ],
                        format: 'pct',
                    },
                    {
                        label: 'Shootout goals',
                        keys: [
                            'shootoutGoalsFor',
                            'goalsForShootout',
                            'shootoutGoals',
                        ],
                    },
                ]),
            },
            {
                title: 'Shot type',
                subtitle: 'Shot distribution',
                metrics: buildFullReportMetrics(teamStats.shotType, [
                    {
                        label: 'Wrist',
                        keys: [
                            'wristShots',
                            'wristShotsOnGoal',
                            'wristShotAttempts',
                            'wrist',
                        ],
                    },
                    {
                        label: 'Slap',
                        keys: [
                            'slapShots',
                            'slapShotsOnGoal',
                            'slapShotAttempts',
                            'slap',
                        ],
                    },
                    {
                        label: 'Snap',
                        keys: [
                            'snapShots',
                            'snapShotsOnGoal',
                            'snapShotAttempts',
                            'snap',
                        ],
                    },
                    {
                        label: 'Backhand',
                        keys: [
                            'backhandShots',
                            'backhandShotsOnGoal',
                            'backhandShotAttempts',
                            'backhand',
                        ],
                    },
                ]),
            },
            {
                title: 'Realtime',
                subtitle: 'Contact & possession',
                metrics: buildFullReportMetrics(teamStats.realtime, [
                    { label: 'Hits', keys: ['hits', 'hitsFor', 'hitsTotal'] },
                    {
                        label: 'Blocks',
                        keys: ['blockedShots', 'blocks', 'shotsBlocked'],
                    },
                    {
                        label: 'Giveaways',
                        keys: ['giveaways', 'giveaway', 'giveawaysTotal'],
                    },
                    {
                        label: 'Takeaways',
                        keys: ['takeaways', 'takeaway', 'takeawaysTotal'],
                    },
                ]),
            },
            {
                title: 'Outshoot/outshot',
                subtitle: 'Shot volume results',
                metrics: buildFullReportMetrics(teamStats.outshootOutshot, [
                    {
                        label: 'Games outshooting',
                        keys: [
                            'gamesOutshootingOpponent',
                            'gamesOutshootOpponent',
                            'gamesOutshoot',
                        ],
                    },
                    {
                        label: 'Games outshot',
                        keys: [
                            'gamesOutshot',
                            'gamesOutshotByOpponent',
                            'gamesOutshotOpponent',
                        ],
                    },
                    {
                        label: 'Wins outshooting',
                        keys: [
                            'winsOutshootingOpponent',
                            'winsOutshootOpponent',
                            'winsOutshoot',
                        ],
                    },
                    {
                        label: 'Wins outshot',
                        keys: [
                            'winsOutshot',
                            'winsWhenOutshot',
                            'winsOutshotByOpponent',
                        ],
                    },
                ]),
            },
            {
                title: 'Goal games',
                subtitle: 'Situational wins',
                metrics: buildFullReportMetrics(teamStats.goalGames, [
                    {
                        label: 'One-goal games',
                        keys: [
                            'oneGoalGames',
                            'oneGoalGame',
                            'oneGoalGamesPlayed',
                        ],
                    },
                    {
                        label: 'One-goal wins',
                        keys: [
                            'oneGoalWins',
                            'oneGoalGamesWins',
                            'oneGoalWin',
                        ],
                    },
                    {
                        label: 'One-goal losses',
                        keys: [
                            'oneGoalLosses',
                            'oneGoalGamesLosses',
                            'oneGoalLoss',
                        ],
                    },
                    {
                        label: 'Multi-goal wins',
                        keys: [
                            'multiGoalWins',
                            'multiGoalGameWins',
                            'multiGoalGamesWins',
                            'multiGoalWin',
                        ],
                    },
                ]),
            },
            {
                title: 'Power play time',
                subtitle: 'PP workload',
                metrics: buildFullReportMetrics(teamStats.powerPlayTime, [
                    {
                        label: 'PP TOI',
                        keys: [
                            'ppTimeOnIce',
                            'ppTimeOnIceTotal',
                            'powerPlayTimeOnIce',
                            'powerPlayTimeOnIceTotal',
                        ],
                    },
                    {
                        label: 'PP TOI / game',
                        keys: [
                            'ppTimeOnIcePerGame',
                            'powerPlayTimeOnIcePerGame',
                        ],
                    },
                    {
                        label: 'PP opps',
                        keys: [
                            'ppOpportunities',
                            'ppOpportunitiesTotal',
                            'powerPlayOpportunities',
                        ],
                    },
                    {
                        label: 'PP opps / game',
                        keys: [
                            'ppOpportunitiesPerGame',
                            'powerPlayOpportunitiesPerGame',
                        ],
                    },
                ]),
            },
            {
                title: 'Penalty kill time',
                subtitle: 'PK workload',
                metrics: buildFullReportMetrics(teamStats.penaltyKillTime, [
                    {
                        label: 'PK TOI',
                        keys: [
                            'pkTimeOnIce',
                            'pkTimeOnIceTotal',
                            'penaltyKillTimeOnIce',
                            'penaltyKillTimeOnIceTotal',
                        ],
                    },
                    {
                        label: 'PK TOI / game',
                        keys: [
                            'pkTimeOnIcePerGame',
                            'penaltyKillTimeOnIcePerGame',
                        ],
                    },
                    {
                        label: 'Times short',
                        keys: [
                            'timesShorthanded',
                            'timesShortHanded',
                            'timesShorthandedTotal',
                        ],
                    },
                    {
                        label: 'Times short / game',
                        keys: [
                            'timesShorthandedPerGame',
                            'timesShortHandedPerGame',
                        ],
                    },
                ]),
            },
            ];
            return cards.map((card, index) => ({
                ...card,
                report: reportSources[index] ?? null,
                metricCount: getReportMetricCount(reportSources[index]),
            }));
        },
        [
            teamStats.faceoffPercentages,
            teamStats.faceoffWins,
            teamStats.penalties,
            teamStats.goalsByPeriod,
            teamStats.goalsForByStrength,
            teamStats.goalsAgainstByStrength,
            teamStats.goalsForByStrengthGoaliePull,
            teamStats.goalsAgainstByStrengthGoaliePull,
            teamStats.leadingTrailing,
            teamStats.scoreTrailFirst,
            teamStats.shootout,
            teamStats.shotType,
            teamStats.realtime,
            teamStats.outshootOutshot,
            teamStats.goalGames,
            teamStats.powerPlayTime,
            teamStats.penaltyKillTime,
        ],
    );

    const renderGameRow = (row: GameRow) => (
        <div
            key={row.id}
            className="flex items-center justify-between gap-4 px-6 py-3 text-sm"
        >
            <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-gray-900">{row.title}</p>
                    {row.badge && (
                        <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${getBadgeClass(
                                row.badgeTone,
                            )}`}
                        >
                            {row.badge}
                        </span>
                    )}
                </div>
                <p className="text-xs text-gray-500">{row.subtitle}</p>
                {row.meta && (
                    <p className="mt-1 text-[11px] text-gray-400">
                        {row.meta}
                    </p>
                )}
            </div>
            <span
                className={`text-xs font-semibold uppercase tracking-wide ${getRowValueClass(
                    row.valueTone,
                )}`}
            >
                {row.value}
            </span>
        </div>
    );

    return (
        <>
            <Head title={`${teamName} | Team`} />
            <LabLayout active="teams">
                <section className="space-y-6">
                    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-600">
                                        {teamFromStandings?.logo ? (
                                            <img
                                                src={teamFromStandings.logo}
                                                alt={teamName}
                                                className="h-full w-full object-contain"
                                            />
                                        ) : (
                                            <span>{getInitials(teamName)}</span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                            Team profile
                                        </p>
                                        <h1 className="mt-2 text-2xl font-semibold text-gray-900">
                                            {teamName}
                                        </h1>
                                        <p className="mt-1 text-sm text-gray-600">
                                            {teamAbbrev ?? '--'} |{' '}
                                            {teamFromStandings?.conferenceName ??
                                                'Conference'}{' '}
                                            |{' '}
                                            {teamFromStandings?.divisionName ??
                                                'Division'}
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    href="/lab/teams"
                                    className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-500"
                                >
                                    Back to Teams
                                </Link>
                            </div>
                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                    Game type
                                </span>
                                {GAME_TYPE_OPTIONS.map((option) => {
                                    const isSelected =
                                        option.value === selectedGameType;
                                    return (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() =>
                                                setSelectedGameType(option.value)
                                            }
                                            className={
                                                isSelected
                                                    ? 'rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white'
                                                    : 'rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600 transition hover:bg-gray-100'
                                            }
                                        >
                                            {option.label}
                                        </button>
                                    );
                                })}
                            </div>
                            {!standingsAvailable && (
                                <p className="mt-2 text-xs text-gray-500">
                                    Standings ranks, wild card, and playoff status are
                                    available for regular season only.
                                </p>
                            )}
                        </div>
                        {teamMissing && (
                            <div className="px-6 py-4 text-sm text-gray-600">
                                Team details are unavailable right now. Return
                                to the Teams page and choose another team.
                            </div>
                        )}
                        <div className="grid gap-4 px-6 py-5 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm">
                                <p className="text-xs uppercase tracking-widest text-gray-500">
                                    Points
                                </p>
                                <p className="mt-2 text-2xl font-semibold text-gray-900">
                                    {profilePoints ?? '--'}
                                </p>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm">
                                <p className="text-xs uppercase tracking-widest text-gray-500">
                                    Record
                                </p>
                                <p className="mt-2 text-2xl font-semibold text-gray-900">
                                    {formatRecord(
                                        profileWins,
                                        profileLosses,
                                        profileOtLosses,
                                    )}
                                </p>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm">
                                <p className="text-xs uppercase tracking-widest text-gray-500">
                                    Point %
                                </p>
                                <p className="mt-2 text-2xl font-semibold text-gray-900">
                                    {formatPct(profilePointPct)}
                                </p>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm">
                                <p className="text-xs uppercase tracking-widest text-gray-500">
                                    Goal diff
                                </p>
                                <p className="mt-2 text-2xl font-semibold text-gray-900">
                                    {formatGoalDiff(profileGoalDiff)}
                                </p>
                            </div>
                        </div>
                        <div className="border-t border-gray-100 px-6 py-4">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                        Next game
                                    </p>
                                    {teamScheduleQuery.isLoading && (
                                        <p className="mt-2 text-sm text-gray-600">
                                            Loading next game...
                                        </p>
                                    )}
                                    {!teamScheduleQuery.isLoading &&
                                        liveGameInfo && (
                                            <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm">
                                                <p className="text-xs font-semibold uppercase tracking-widest text-rose-600">
                                                    Live now
                                                </p>
                                                <p className="mt-2 text-lg font-semibold text-rose-900">
                                                    {liveGameInfo.title}
                                                </p>
                                                <p className="mt-1 text-sm text-rose-700">
                                                    {liveGameInfo.subtitle}
                                                </p>
                                                <p className="mt-2 text-lg font-semibold text-rose-900">
                                                    {liveGameInfo.scoreLine}
                                                </p>
                                                {liveGameInfo.meta && (
                                                    <p className="mt-1 text-xs text-rose-700">
                                                        {liveGameInfo.meta}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    {!teamScheduleQuery.isLoading &&
                                        nextGameInfo && (
                                            <>
                                                <div className="mt-2 flex items-center gap-2 text-lg font-semibold text-gray-900">
                                                    <span>{nextGameInfo.title}</span>
                                                    <span
                                                        className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${getBadgeClass(
                                                            nextGameInfo.isHome
                                                                ? 'home'
                                                                : 'away',
                                                        )}`}
                                                    >
                                                        {nextGameInfo.isHome
                                                            ? 'Home'
                                                            : 'Away'}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-sm text-gray-600">
                                                    {nextGameInfo.subtitle}
                                                </p>
                                                <p className="mt-1 text-xs uppercase tracking-widest text-gray-500">
                                                    {nextGameInfo.time}
                                                </p>
                                                {nextGameInfo.meta && (
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        {nextGameInfo.meta}
                                                    </p>
                                                )}
                                            </>
                                        )}
                                    {!teamScheduleQuery.isLoading &&
                                        !nextGameInfo &&
                                        !liveGameInfo && (
                                            <p className="mt-2 text-sm text-gray-600">
                                                No upcoming games.
                                            </p>
                                        )}
                                </div>
                                {!teamScheduleQuery.isLoading && nextGameInfo && (
                                    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm">
                                        <p className="text-xs uppercase tracking-widest text-gray-500">
                                            Rest window
                                        </p>
                                        <p className="mt-2 text-xl font-semibold text-gray-900">
                                            {formatRestHours(
                                                nextGameInfo.restHours,
                                            )}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                            <div className="border-b border-gray-100 px-6 py-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                            Team leaders
                                        </p>
                                        <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                                            Skaters and goalies
                                        </h2>
                                        <p className="mt-2 text-xs text-gray-500">
                                            Season {formatSeasonLabel(Number(clubStatsSeasonValue))} | Game type {gameTypeLabel}
                                        </p>
                                    </div>
                                    {!clubStatsQuery.isLoading &&
                                        !clubStatsQuery.isError &&
                                        clubStatsCount > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => setShowClubStatsDialog(true)}
                                                className="text-xs font-semibold uppercase tracking-widest text-indigo-600 transition hover:text-indigo-500"
                                            >
                                                View full tables
                                            </button>
                                        )}
                                </div>
                            </div>
                            <div className="divide-y divide-gray-100">
                                <div className="px-6 py-4">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                        Skaters
                                    </p>
                                    {clubStatsQuery.isLoading && (
                                        <p className="mt-2 text-sm text-gray-600">
                                            Loading skater leaders...
                                        </p>
                                    )}
                                    {clubStatsQuery.isError && (
                                        <p className="mt-2 text-sm text-gray-600">
                                            Club stats are unavailable.
                                        </p>
                                    )}
                                    {!clubStatsQuery.isLoading &&
                                        !clubStatsQuery.isError &&
                                        topSkaters.length === 0 && (
                                            <p className="mt-2 text-sm text-gray-600">
                                                No skater stats yet.
                                            </p>
                                        )}
                                    {!clubStatsQuery.isLoading &&
                                        !clubStatsQuery.isError &&
                                        topSkaters.length > 0 && (
                                            <div className="mt-3 overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead className="text-[10px] uppercase tracking-widest text-gray-500">
                                                        <tr>
                                                            <th className="py-1 text-left font-semibold">
                                                                Player
                                                            </th>
                                                            <th className="py-1 text-right font-semibold">
                                                                GP
                                                            </th>
                                                            <th className="py-1 text-right font-semibold">
                                                                G
                                                            </th>
                                                            <th className="py-1 text-right font-semibold">
                                                                A
                                                            </th>
                                                            <th className="py-1 text-right font-semibold">
                                                                PTS
                                                            </th>
                                                            <th className="py-1 text-right font-semibold">
                                                                S
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="text-gray-700">
                                                        {topSkaters.map((skater) => (
                                                            <tr
                                                                key={skater.id}
                                                                className="border-t border-gray-100"
                                                            >
                                                                <td className="py-2 pr-3">
                                                                    <p className="font-semibold text-gray-900">
                                                                        {skater.name}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {skater.position ?? '--'}
                                                                    </p>
                                                                </td>
                                                                <td className="py-2 text-right">
                                                                    {skater.gamesPlayed ?? '--'}
                                                                </td>
                                                                <td className="py-2 text-right">
                                                                    {skater.goals ?? '--'}
                                                                </td>
                                                                <td className="py-2 text-right">
                                                                    {skater.assists ?? '--'}
                                                                </td>
                                                                <td className="py-2 text-right font-semibold text-gray-900">
                                                                    {skater.points ?? '--'}
                                                                </td>
                                                                <td className="py-2 text-right">
                                                                    {skater.shots ?? '--'}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                </div>
                                <div className="px-6 py-4">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                        Goalies
                                    </p>
                                    {clubStatsQuery.isLoading && (
                                        <p className="mt-2 text-sm text-gray-600">
                                            Loading goalie leaders...
                                        </p>
                                    )}
                                    {clubStatsQuery.isError && (
                                        <p className="mt-2 text-sm text-gray-600">
                                            Goalie stats are unavailable.
                                        </p>
                                    )}
                                    {!clubStatsQuery.isLoading &&
                                        !clubStatsQuery.isError &&
                                        topGoalies.length === 0 && (
                                            <p className="mt-2 text-sm text-gray-600">
                                                No goalie stats yet.
                                            </p>
                                        )}
                                    {!clubStatsQuery.isLoading &&
                                        !clubStatsQuery.isError &&
                                        topGoalies.length > 0 && (
                                            <div className="mt-3 overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead className="text-[10px] uppercase tracking-widest text-gray-500">
                                                        <tr>
                                                            <th className="py-1 text-left font-semibold">
                                                                Player
                                                            </th>
                                                            <th className="py-1 text-right font-semibold">
                                                                GP
                                                            </th>
                                                            <th className="py-1 text-right font-semibold">
                                                                W-L
                                                            </th>
                                                            <th className="py-1 text-right font-semibold">
                                                                SV%
                                                            </th>
                                                            <th className="py-1 text-right font-semibold">
                                                                GAA
                                                            </th>
                                                            <th className="py-1 text-right font-semibold">
                                                                SO
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="text-gray-700">
                                                        {topGoalies.map((goalie) => (
                                                            <tr
                                                                key={goalie.id}
                                                                className="border-t border-gray-100"
                                                            >
                                                                <td className="py-2 pr-3">
                                                                    <p className="font-semibold text-gray-900">
                                                                        {goalie.name}
                                                                    </p>
                                                                </td>
                                                                <td className="py-2 text-right">
                                                                    {goalie.gamesPlayed ?? '--'}
                                                                </td>
                                                                <td className="py-2 text-right">
                                                                    {goalie.wins === null ||
                                                                    goalie.wins === undefined
                                                                        ? '--'
                                                                        : `${goalie.wins}-${goalie.losses ?? 0}`}
                                                                </td>
                                                                <td className="py-2 text-right">
                                                                    {formatPctSmart(
                                                                        goalie.savePercentage,
                                                                    )}
                                                                </td>
                                                                <td className="py-2 text-right">
                                                                    {formatNumber(
                                                                        goalie.goalsAgainstAverage,
                                                                        2,
                                                                    )}
                                                                </td>
                                                                <td className="py-2 text-right">
                                                                    {goalie.shutouts ?? '--'}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                </div>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                            <div className="border-b border-gray-100 px-6 py-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                            Schedule snapshot
                                        </p>
                                        <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                                            Week and month view
                                        </h2>
                                        <p className="mt-2 text-xs text-gray-500">
                                            Game type {gameTypeLabel}
                                        </p>
                                    </div>
                                    {!scheduleViewLoading &&
                                        !scheduleViewError && (
                                            <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-widest text-indigo-600">
                                                {weekRowsAll.length > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setShowWeekScheduleDialog(
                                                                true,
                                                            )
                                                        }
                                                        className="transition hover:text-indigo-500"
                                                    >
                                                        View week
                                                    </button>
                                                )}
                                                {monthRowsAll.length > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setShowMonthScheduleDialog(
                                                                true,
                                                            )
                                                        }
                                                        className="transition hover:text-indigo-500"
                                                    >
                                                        View month
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                </div>
                            </div>
                            {scheduleViewLoading && (
                                <p className="px-6 py-4 text-sm text-gray-600">
                                    Loading schedule views...
                                </p>
                            )}
                            {scheduleViewError && (
                                <p className="px-6 py-4 text-sm text-gray-600">
                                    Schedule view data is unavailable.
                                </p>
                            )}
                            {scheduleViewEmpty && (
                                <p className="px-6 py-4 text-sm text-gray-600">
                                    No schedule view data yet.
                                </p>
                            )}
                            {!scheduleViewLoading &&
                                !scheduleViewError &&
                                !scheduleViewEmpty && (
                                    <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
                                        {[
                                            {
                                                label: 'Games this week',
                                                value: weekGames.length,
                                            },
                                            {
                                                label: 'Home/Away (week)',
                                                value: `${weekSplit.home} / ${weekSplit.away}`,
                                            },
                                            {
                                                label: 'Games this month',
                                                value: monthGames.length,
                                            },
                                            {
                                                label: 'Home/Away (month)',
                                                value: `${monthSplit.home} / ${monthSplit.away}`,
                                            },
                                        ].map((item) => (
                                            <div
                                                key={item.label}
                                                className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm"
                                            >
                                                <p className="text-xs uppercase tracking-widest text-gray-500">
                                                    {item.label}
                                                </p>
                                                <p className="mt-2 text-lg font-semibold text-gray-900">
                                                    {item.value}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            <div className="border-t border-gray-100 px-6 py-3 text-xs text-gray-500">
                                Powered by club schedule week/month views.
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                            <div className="border-b border-gray-100 px-6 py-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                            Upcoming games
                                        </p>
                                        <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                                            Next five
                                        </h2>
                                        <p className="mt-2 text-xs text-gray-500">
                                            Home {upcomingSplit.home} | Away {upcomingSplit.away}
                                        </p>
                                        <p className="mt-1 text-xs text-gray-500">
                                            Game type {gameTypeLabel}
                                        </p>
                                    </div>
                                    {upcomingGamesAll.length > 5 && (
                                        <button
                                            type="button"
                                            onClick={() => setShowUpcomingDialog(true)}
                                            className="text-xs font-semibold uppercase tracking-widest text-indigo-600 transition hover:text-indigo-500"
                                        >
                                            View all
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {teamScheduleQuery.isLoading && (
                                    <p className="px-6 py-4 text-sm text-gray-600">
                                        Loading schedule...
                                    </p>
                                )}
                                {teamScheduleQuery.isError && (
                                    <p className="px-6 py-4 text-sm text-gray-600">
                                        Schedule data is unavailable.
                                    </p>
                                )}
                                {!teamScheduleQuery.isLoading &&
                                    !teamScheduleQuery.isError &&
                                    upcomingRows.length === 0 && (
                                        <p className="px-6 py-4 text-sm text-gray-600">
                                            No upcoming games yet.
                                        </p>
                                    )}
                                {upcomingRows.map(renderGameRow)}
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                            <div className="border-b border-gray-100 px-6 py-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                            Recent results
                                        </p>
                                        <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                                            Last five games
                                        </h2>
                                        <p className="mt-2 text-xs text-gray-500">
                                            Game type {gameTypeLabel}
                                        </p>
                                    </div>
                                    {recentResultsAll.length > 5 && (
                                        <button
                                            type="button"
                                            onClick={() => setShowRecentDialog(true)}
                                            className="text-xs font-semibold uppercase tracking-widest text-indigo-600 transition hover:text-indigo-500"
                                        >
                                            View all
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {teamScheduleQuery.isLoading && (
                                    <p className="px-6 py-4 text-sm text-gray-600">
                                        Loading recent results...
                                    </p>
                                )}
                                {teamScheduleQuery.isError && (
                                    <p className="px-6 py-4 text-sm text-gray-600">
                                        Recent results are unavailable.
                                    </p>
                                )}
                                {!teamScheduleQuery.isLoading &&
                                    !teamScheduleQuery.isError &&
                                    recentResults.length === 0 && (
                                        <p className="px-6 py-4 text-sm text-gray-600">
                                            No recent results available.
                                        </p>
                                    )}
                                {recentResults.map(renderGameRow)}
                            </div>
                        </div>

                    </div>

                    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                Team stats
                            </p>
                            <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                                Season snapshot
                            </h2>
                            <p className="mt-2 text-xs text-gray-500">
                                Game type {gameTypeLabel}
                            </p>
                        </div>
                        <div className="grid gap-4 px-6 py-5 sm:grid-cols-2 lg:grid-cols-3">
                            {[
                                {
                                    label: 'Games played',
                                    value: gamesPlayed ?? '--',
                                },
                                {
                                    label: 'Season games',
                                    value: seasonGames ?? 82,
                                },
                                {
                                    label: 'Games remaining',
                                    value: gamesRemaining ?? '--',
                                },
                                {
                                    label: 'Points per game',
                                    value: formatNumber(pointsPerGame, 2),
                                },
                                {
                                    label: 'Point pace',
                                    value: formatNumber(pointPace, 1),
                                },
                                {
                                    label: 'Point %',
                                    value: formatPct(
                                        statsSummary?.pointPct ??
                                            teamFromStandings?.pointPctg,
                                    ),
                                    rank: teamStats.ranks?.pointPct ?? null,
                                },
                                {
                                    label: 'Goals for',
                                    value: goalsFor ?? '--',
                                },
                                {
                                    label: 'Goals against',
                                    value: goalsAgainst ?? '--',
                                },
                                {
                                    label: 'GF / game',
                                    value: formatNumber(goalsForPerGame, 2),
                                    rank: teamStats.ranks?.goalsForPerGame ?? null,
                                },
                                {
                                    label: 'GA / game',
                                    value: formatNumber(goalsAgainstPerGame, 2),
                                    rank: teamStats.ranks?.goalsAgainstPerGame ?? null,
                                },
                                {
                                    label: 'Shots for / game',
                                    value: formatNumber(shotsForPerGame, 1),
                                    rank: teamStats.ranks?.shotsForPerGame ?? null,
                                },
                                {
                                    label: 'Shots against / game',
                                    value: formatNumber(shotsAgainstPerGame, 1),
                                    rank: teamStats.ranks?.shotsAgainstPerGame ?? null,
                                },
                                {
                                    label: 'Shot diff / game',
                                    value: formatNumber(shotDiffPerGame, 1),
                                },
                                {
                                    label: 'Shooting %',
                                    value: formatPct(shootingPct),
                                },
                                {
                                    label: 'Save %',
                                    value: formatPct(savePct),
                                },
                                {
                                    label: 'Goals against avg',
                                    value: formatNumber(
                                        goalieSummary?.goalsAgainstAverage,
                                        2,
                                    ),
                                },
                                {
                                    label: 'Shots against (total)',
                                    value: goalieSummary?.shotsAgainst ?? '--',
                                },
                                {
                                    label: 'Saves (total)',
                                    value: goalieSummary?.saves ?? '--',
                                },
                                {
                                    label: '5v5 shooting %',
                                    value: formatPct(percentages?.shootingPct5v5),
                                    rank: teamStats.ranks?.shootingPct5v5 ?? null,
                                },
                                {
                                    label: '5v5 save %',
                                    value: formatPct(percentages?.savePct5v5),
                                    rank: teamStats.ranks?.savePct5v5 ?? null,
                                },
                                {
                                    label: '5v5 PDO',
                                    value: formatNumber(
                                        percentages?.shootingPlusSavePct5v5,
                                        3,
                                    ),
                                    rank: teamStats.ranks?.shootingPlusSavePct5v5 ?? null,
                                },
                                {
                                    label: '5v5 zone start %',
                                    value: formatPct(percentages?.zoneStartPct5v5),
                                    rank: teamStats.ranks?.zoneStartPct5v5 ?? null,
                                },
                                {
                                    label: 'SAT %',
                                    value: formatPct(percentages?.satPct),
                                    rank: teamStats.ranks?.satPct ?? null,
                                },
                                {
                                    label: 'USAT %',
                                    value: formatPct(percentages?.usatPct),
                                    rank: teamStats.ranks?.usatPct ?? null,
                                },
                                {
                                    label: 'SAT for',
                                    value: formatNumber(summaryShooting?.satFor, 0),
                                },
                                {
                                    label: 'SAT against',
                                    value: formatNumber(summaryShooting?.satAgainst, 0),
                                },
                                {
                                    label: 'USAT for',
                                    value: formatNumber(summaryShooting?.usatFor, 0),
                                },
                                {
                                    label: 'USAT against',
                                    value: formatNumber(summaryShooting?.usatAgainst, 0),
                                },
                                {
                                    label: 'SAT diff',
                                    value: formatNumber(satDiff, 0),
                                },
                                {
                                    label: 'USAT diff',
                                    value: formatNumber(usatDiff, 0),
                                },
                                {
                                    label: 'Shots 5v5',
                                    value: formatNumber(summaryShooting?.shots5v5, 0),
                                },
                                {
                                    label: 'Power play %',
                                    value: formatPct(
                                        powerPlay?.powerPlayPct ??
                                            statsSummary?.powerPlayPct,
                                    ),
                                    rank: teamStats.ranks?.powerPlayPct ?? null,
                                },
                                {
                                    label: 'Power play net %',
                                    value: formatPct(powerPlay?.powerPlayNetPct),
                                },
                                {
                                    label: 'PP opps / game',
                                    value: formatNumber(
                                        powerPlay?.ppOpportunitiesPerGame,
                                        2,
                                    ),
                                },
                                {
                                    label: 'PP opps (total)',
                                    value: formatReportValue(ppOppsTotal, 'number'),
                                },
                                {
                                    label: 'PP TOI / game (min)',
                                    value: formatNumber(ppToiMinutes, 1),
                                },
                                {
                                    label: 'PP TOI (total, min)',
                                    value: formatToiTotal(ppToiTotal),
                                },
                                {
                                    label: 'PP goals / game',
                                    value: formatNumber(
                                        powerPlay?.ppGoalsPerGame,
                                        2,
                                    ),
                                },
                                {
                                    label: 'PP net goals',
                                    value: powerPlay?.ppNetGoals ?? '--',
                                },
                                {
                                    label: 'PP goals (total)',
                                    value: powerPlay?.powerPlayGoalsFor ?? '--',
                                },
                                {
                                    label: 'SH goals against',
                                    value: powerPlay?.shGoalsAgainst ?? '--',
                                },
                                {
                                    label: 'Penalty kill %',
                                    value: formatPct(
                                        penaltyKill?.penaltyKillPct ??
                                            statsSummary?.penaltyKillPct,
                                    ),
                                    rank: teamStats.ranks?.penaltyKillPct ?? null,
                                },
                                {
                                    label: 'Penalty kill net %',
                                    value: formatPct(penaltyKill?.penaltyKillNetPct),
                                },
                                {
                                    label: 'PK times shorthanded / game',
                                    value: formatNumber(
                                        penaltyKill?.timesShorthandedPerGame,
                                        2,
                                    ),
                                },
                                {
                                    label: 'Times shorthanded (total)',
                                    value: formatReportValue(
                                        timesShorthandedTotal,
                                        'number',
                                    ),
                                },
                                {
                                    label: 'PK TOI / game (min)',
                                    value: formatNumber(pkToiMinutes, 1),
                                },
                                {
                                    label: 'PK TOI (total, min)',
                                    value: formatToiTotal(pkToiTotal),
                                },
                                {
                                    label: 'PP goals against',
                                    value: penaltyKill?.ppGoalsAgainst ?? '--',
                                },
                                {
                                    label: 'SH goals for',
                                    value: penaltyKill?.shGoalsFor ?? '--',
                                },
                                {
                                    label: 'PK net goals',
                                    value: penaltyKill?.pkNetGoals ?? '--',
                                },
                                {
                                    label: 'RW (Regulation wins)',
                                    value: statsSummary?.winsInRegulation ?? '--',
                                },
                                {
                                    label: 'ROW (Reg + OT wins)',
                                    value:
                                        statsSummary?.regulationAndOtWins ??
                                        '--',
                                },
                                {
                                    label: 'Shootout wins',
                                    value: statsSummary?.winsInShootout ?? '--',
                                },
                                {
                                    label: 'Shutouts',
                                    value:
                                        goalieSummary?.shutouts ??
                                        statsSummary?.teamShutouts ??
                                        '--',
                                },
                                {
                                    label: 'Faceoff win %',
                                    value: formatPct(statsSummary?.faceoffWinPct),
                                    rank: teamStats.ranks?.faceoffWinPct ?? null,
                                },
                                {
                                    label: 'Streak',
                                    value: standingsAvailable
                                        ? formatStreak(
                                              teamFromStandings?.streakCode,
                                              teamFromStandings?.streakCount,
                                          )
                                        : '--',
                                },
                                {
                                    label: 'Last 10',
                                    value: standingsAvailable
                                        ? formatRecord(
                                              teamFromStandings?.l10Wins,
                                              teamFromStandings?.l10Losses,
                                              teamFromStandings?.l10OtLosses,
                                          )
                                        : '--',
                                },
                                {
                                    label: 'Home record',
                                    value: standingsAvailable
                                        ? formatRecord(
                                              teamFromStandings?.homeWins,
                                              teamFromStandings?.homeLosses,
                                              teamFromStandings?.homeOtLosses,
                                          )
                                        : '--',
                                },
                                {
                                    label: 'Road record',
                                    value: standingsAvailable
                                        ? formatRecord(
                                              teamFromStandings?.roadWins,
                                              teamFromStandings?.roadLosses,
                                              teamFromStandings?.roadOtLosses,
                                          )
                                        : '--',
                                },
                                {
                                    label: 'League rank',
                                    value: standingsAvailable
                                        ? formatRank(
                                              teamFromStandings?.leagueSequence,
                                          )
                                        : '--',
                                },
                                {
                                    label: 'Conference rank',
                                    value: standingsAvailable
                                        ? formatRank(
                                              teamFromStandings?.conferenceSequence,
                                          )
                                        : '--',
                                },
                                {
                                    label: 'Division rank',
                                    value: standingsAvailable
                                        ? formatRank(
                                              teamFromStandings?.divisionSequence,
                                          )
                                        : '--',
                                },
                                {
                                    label: 'Playoff status',
                                    value: clinchStatus,
                                },
                                {
                                    label: 'Wild card status',
                                    value: wildCardStatus,
                                },
                                {
                                    label: 'WC2 gap',
                                    value:
                                        wildCardGap.gapPoints !== null
                                            ? `${formatGap(
                                                  wildCardGap.gapPoints,
                                              )} pts | GP ${formatGap(
                                                  wildCardGap.gapGames,
                                              )}`
                                            : '--',
                                },
                            ].map((stat) => (
                                <div
                                    key={stat.label}
                                    className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm"
                                >
                                    <p className="text-xs uppercase tracking-widest text-gray-500">
                                        {stat.label}
                                    </p>
                                    <div className="mt-2 flex items-center justify-between gap-2">
                                        <p className="text-lg font-semibold text-gray-900">
                                            {stat.value}
                                        </p>
                                        {stat.rank !== null &&
                                            stat.rank !== undefined &&
                                            stat.value !== '--' && (
                                                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                                                    #{stat.rank}
                                                </span>
                                            )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                Advanced reports
                            </p>
                            <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                                Situational splits
                            </h2>
                            <p className="mt-2 text-xs text-gray-500">
                                Game type {gameTypeLabel}
                            </p>
                        </div>
                        {teamStatsQuery.isLoading && (
                            <p className="px-6 py-4 text-sm text-gray-600">
                                Loading advanced reports...
                            </p>
                        )}
                        {teamStatsQuery.isError && (
                            <p className="px-6 py-4 text-sm text-gray-600">
                                Report data is unavailable.
                            </p>
                        )}
                        {!teamStatsQuery.isLoading &&
                            !teamStatsQuery.isError && (
                                <div className="grid gap-4 px-6 py-5 sm:grid-cols-2 lg:grid-cols-3">
                                    {reportCards.map((card) => (
                                        <div
                                            key={card.title}
                                            className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-xs uppercase tracking-widest text-gray-500">
                                                        {card.title}
                                                    </p>
                                                    {card.subtitle && (
                                                        <p className="mt-1 text-xs text-gray-400">
                                                            {card.subtitle}
                                                        </p>
                                                    )}
                                                </div>
                                                {card.metricCount > card.metrics.length && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setReportDialog({
                                                                title: card.title,
                                                                subtitle: card.subtitle,
                                                                metrics: buildAllReportMetrics(
                                                                    card.report,
                                                                ),
                                                            })
                                                        }
                                                        className="text-[10px] font-semibold uppercase tracking-widest text-indigo-600 transition hover:text-indigo-500"
                                                    >
                                                        View full
                                                    </button>
                                                )}
                                            </div>
                                            {card.metrics.length === 0 ? (
                                                <p className="mt-3 text-xs text-gray-500">
                                                    No report data available.
                                                </p>
                                            ) : (
                                                <div className="mt-3 space-y-2">
                                                    {card.metrics.map((metric) => (
                                                        <div
                                                            key={metric.label}
                                                            className="flex items-center justify-between gap-3 text-xs text-gray-600"
                                                        >
                                                            <span>
                                                                {metric.label}
                                                            </span>
                                                            <span className="font-semibold text-gray-900">
                                                                {metric.value}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                    </div>

                    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                        Prospects
                                    </p>
                                    <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                                        Development pipeline
                                    </h2>
                                </div>
                            </div>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {prospectsQuery.isLoading && (
                                <p className="px-6 py-4 text-sm text-gray-600">
                                    Loading prospects...
                                </p>
                            )}
                            {prospectsQuery.isError && (
                                <p className="px-6 py-4 text-sm text-gray-600">
                                    Prospects data is unavailable.
                                </p>
                            )}
                            {!prospectsQuery.isLoading &&
                                !prospectsQuery.isError &&
                                prospectCount === 0 && (
                                    <p className="px-6 py-4 text-sm text-gray-600">
                                        No prospect data yet.
                                    </p>
                                )}
                            {!prospectsQuery.isLoading &&
                                !prospectsQuery.isError &&
                                prospectCount > 0 && (
                                    <div className="px-6 py-4">
                                        <div className="space-y-6">
                                            {prospectGroups.map((group) => (
                                                <div key={group.label}>
                                                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                                        {group.label} ({group.players.length})
                                                    </p>
                                                    {group.players.length === 0 && (
                                                        <p className="mt-3 text-sm text-gray-600">
                                                            No {group.label.toLowerCase()} prospects.
                                                        </p>
                                                    )}
                                                    <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                                        {group.players.map((player) => {
                                                            const draftLabel =
                                                                player.draftYear !== null &&
                                                                player.draftYear !== undefined
                                                                    ? `Draft ${player.draftYear}${
                                                                          player.draftRound
                                                                              ? ` R${player.draftRound}`
                                                                              : ''
                                                                      }${
                                                                          player.draftPick
                                                                              ? ` #${player.draftPick}`
                                                                              : ''
                                                                      }${
                                                                          player.draftTeam
                                                                              ? ` (${player.draftTeam})`
                                                                              : ''
                                                                      }`
                                                                    : '';
                                                            const details: string[] = [];
                                                            const seen = new Set<string>();
                                                            const addDetail = (value?: string) => {
                                                                if (!value) {
                                                                    return;
                                                                }
                                                                const key = value.toLowerCase();
                                                                if (seen.has(key)) {
                                                                    return;
                                                                }
                                                                seen.add(key);
                                                                details.push(value);
                                                            };
                                                            addDetail(player.height);
                                                            if (player.weight) {
                                                                addDetail(`${player.weight} lb`);
                                                            }
                                                            addDetail(player.birthDate);
                                                            addDetail(player.hometown);
                                                            if (
                                                                player.birthCountry &&
                                                                !player.hometown
                                                                    ?.toLowerCase()
                                                                    .includes(
                                                                        player.birthCountry.toLowerCase(),
                                                                    )
                                                            ) {
                                                                addDetail(player.birthCountry);
                                                            }
                                                            addDetail(player.status);
                                                            addDetail(draftLabel);
                                                            return (
                                                                <div
                                                                    key={`${group.label}-${player.id}`}
                                                                    className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm"
                                                                >
                                                                    <div className="flex items-start gap-3">
                                                                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-600">
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
                                                                        <div className="flex-1">
                                                                            <p className="font-semibold text-gray-900">
                                                                                {player.name}
                                                                            </p>
                                                                            <p className="text-xs text-gray-500">
                                                                                {player.position ?? 'POS'} |{' '}
                                                                                {player.shoots ?? '--'}
                                                                            </p>
                                                                            {(player.team || player.league) && (
                                                                                <p className="text-xs text-gray-500">
                                                                                    {player.team ?? 'Team'}
                                                                                    {player.league
                                                                                        ? ` • ${player.league}`
                                                                                        : ''}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                        <span className="text-xs font-semibold text-gray-500">
                                                                            {player.position ?? '--'}
                                                                        </span>
                                                                    </div>
                                                                    {details.length > 0 && (
                                                                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                                                                            {details.map((detail) => (
                                                                                <span key={detail}>
                                                                                    {detail}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                Season coverage
                            </p>
                            <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                                Available seasons
                            </h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            <div className="px-6 py-4">
                                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                    Club stats seasons
                                </p>
                                {clubStatsSeasonQuery.isLoading && (
                                    <p className="mt-2 text-sm text-gray-600">
                                        Loading club stats seasons...
                                    </p>
                                )}
                                {clubStatsSeasonQuery.isError && (
                                    <p className="mt-2 text-sm text-gray-600">
                                        Club stats seasons are unavailable.
                                    </p>
                                )}
                                {!clubStatsSeasonQuery.isLoading &&
                                    !clubStatsSeasonQuery.isError &&
                                    clubStatsSeasons.length === 0 && (
                                        <p className="mt-2 text-sm text-gray-600">
                                            No club stats seasons yet.
                                        </p>
                                    )}
                                {!clubStatsSeasonQuery.isLoading &&
                                    !clubStatsSeasonQuery.isError &&
                                    clubStatsSeasons.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {clubStatsSeasons.map((season) => {
                                                const value = String(season.season);
                                                const isSelected =
                                                    value === clubStatsSeasonValue;
                                                return (
                                                    <button
                                                        key={`club-${season.season}`}
                                                        type="button"
                                                        onClick={() =>
                                                            setSelectedClubSeason(value)
                                                        }
                                                        className={
                                                            isSelected
                                                                ? 'rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white'
                                                                : 'rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600 transition hover:bg-gray-100'
                                                        }
                                                    >
                                                        {formatSeasonLabel(season.season)}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                            </div>
                            <div className="px-6 py-4">
                                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                    Roster seasons
                                </p>
                                {rosterSeasonQuery.isLoading && (
                                    <p className="mt-2 text-sm text-gray-600">
                                        Loading roster seasons...
                                    </p>
                                )}
                                {rosterSeasonQuery.isError && (
                                    <p className="mt-2 text-sm text-gray-600">
                                        Roster seasons are unavailable.
                                    </p>
                                )}
                                {!rosterSeasonQuery.isLoading &&
                                    !rosterSeasonQuery.isError &&
                                    rosterSeasons.length === 0 && (
                                        <p className="mt-2 text-sm text-gray-600">
                                            No roster seasons yet.
                                        </p>
                                    )}
                                {!rosterSeasonQuery.isLoading &&
                                    !rosterSeasonQuery.isError &&
                                    rosterSeasons.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {rosterSeasons.map((season) => {
                                                const value = String(season.season);
                                                const isSelected =
                                                    value === rosterSeasonValue;
                                                return (
                                                    <button
                                                        key={`roster-${season.season}`}
                                                        type="button"
                                                        onClick={() =>
                                                            setSelectedRosterSeason(value)
                                                        }
                                                        className={
                                                            isSelected
                                                                ? 'rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white'
                                                                : 'rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600 transition hover:bg-gray-100'
                                                        }
                                                    >
                                                        {formatSeasonLabel(season.season)}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                Roster
                            </p>
                            <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                                Current lineup
                            </h2>
                            <p className="mt-2 text-xs text-gray-500">
                                Season {formatSeasonLabel(Number(rosterSeasonValue))} | Game type {gameTypeLabel}
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {ROSTER_FILTERS.map((filter) => (
                                    <button
                                        key={filter}
                                        type="button"
                                        onClick={() => setRosterFilter(filter)}
                                        className={
                                            filter === rosterFilter
                                                ? 'rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white'
                                                : 'rounded-full border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-50'
                                        }
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {rosterQuery.isLoading && (
                                <p className="px-6 py-4 text-sm text-gray-600">
                                    Loading roster...
                                </p>
                            )}
                            {rosterQuery.isError && (
                                <p className="px-6 py-4 text-sm text-gray-600">
                                    Roster data is unavailable.
                                </p>
                            )}
                            {!rosterQuery.isLoading &&
                                !rosterQuery.isError &&
                                rosterCount === 0 && (
                                    <p className="px-6 py-4 text-sm text-gray-600">
                                        No roster data yet.
                                    </p>
                            )}
                                {!rosterQuery.isLoading &&
                                    !rosterQuery.isError &&
                                    rosterCount > 0 && (
                                    <div className="px-6 py-4">
                                        {rosterFilter === 'All' ? (
                                            <div className="space-y-6">
                                                {[
                                                    {
                                                        label: 'Forwards',
                                                        players: sortRoster(roster.forwards),
                                                    },
                                                    {
                                                        label: 'Defensemen',
                                                        players: sortRoster(roster.defensemen),
                                                    },
                                                    {
                                                        label: 'Goalies',
                                                        players: sortRoster(roster.goalies),
                                                    },
                                                ].map((group) => (
                                                    <div key={group.label}>
                                                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                                            {group.label} ({group.players.length})
                                                        </p>
                                                        {group.players.length === 0 && (
                                                            <p className="mt-3 text-sm text-gray-600">
                                                                No {group.label.toLowerCase()} data.
                                                            </p>
                                                        )}
                                                        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                                            {group.players.map((player) => (
                                                                <div
                                                                    key={`${group.label}-${player.id}`}
                                                                    className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm"
                                                                >
                                                                    <div className="flex items-start gap-3">
                                                                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-600">
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
                                                                        <div className="flex-1">
                                                                            <p className="font-semibold text-gray-900">
                                                                                {player.name}
                                                                            </p>
                                                                            <p className="text-xs text-gray-500">
                                                                                #{player.number ?? '--'} |{' '}
                                                                                {player.position ?? 'POS'} |{' '}
                                                                                {player.shoots ?? '--'}
                                                                            </p>
                                                                        </div>
                                                                        <span className="text-xs font-semibold text-gray-500">
                                                                            {player.position ?? '--'}
                                                                        </span>
                                                                    </div>
                                                                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                                                                        <span>
                                                                            {player.height ?? '--'}
                                                                        </span>
                                                                        <span>
                                                                            {player.weight
                                                                                ? `${player.weight} lb`
                                                                                : '--'}
                                                                        </span>
                                                                        {player.birthDate && (
                                                                            <span>
                                                                                {player.birthDate}
                                                                            </span>
                                                                        )}
                                                                        {player.hometown && (
                                                                            <span>
                                                                                {player.hometown}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <>
                                                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                                    {rosterFilter} ({filteredPlayers.length})
                                                </p>
                                                {filteredPlayers.length === 0 && (
                                                    <p className="mt-3 text-sm text-gray-600">
                                                        No players available.
                                                    </p>
                                                )}
                                                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                                    {filteredPlayers.map((player) => (
                                                        <div
                                                            key={player.id}
                                                            className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm"
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-600">
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
                                                                <div className="flex-1">
                                                                    <p className="font-semibold text-gray-900">
                                                                        {player.name}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        #{player.number ?? '--'} |{' '}
                                                                        {player.position ?? 'POS'} |{' '}
                                                                        {player.shoots ?? '--'}
                                                                    </p>
                                                                </div>
                                                                <span className="text-xs font-semibold text-gray-500">
                                                                    {player.position ?? '--'}
                                                                </span>
                                                            </div>
                                                            <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                                                                <span>
                                                                    {player.height ?? '--'}
                                                                </span>
                                                                <span>
                                                                    {player.weight
                                                                        ? `${player.weight} lb`
                                                                        : '--'}
                                                                </span>
                                                                {player.birthDate && (
                                                                    <span>
                                                                        {player.birthDate}
                                                                    </span>
                                                                )}
                                                                {player.hometown && (
                                                                    <span>
                                                                        {player.hometown}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                        </div>
                    </div>
                </section>

                <Modal
                    show={showUpcomingDialog}
                    onClose={() => setShowUpcomingDialog(false)}
                    maxWidth="2xl"
                >
                    <div className="border-b border-gray-100 px-6 py-4">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                    Upcoming games
                                </p>
                                <h3 className="mt-1 text-xl font-semibold text-gray-900">
                                    Full schedule
                                </h3>
                                <p className="mt-2 text-xs text-gray-500">
                                    Game type {gameTypeLabel}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowUpcomingDialog(false)}
                                className="text-xs font-semibold uppercase tracking-widest text-gray-500 transition hover:text-gray-700"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                    <div className="max-h-[70vh] divide-y divide-gray-100 overflow-y-auto">
                        {teamScheduleQuery.isLoading && (
                            <p className="px-6 py-4 text-sm text-gray-600">
                                Loading schedule...
                            </p>
                        )}
                        {teamScheduleQuery.isError && (
                            <p className="px-6 py-4 text-sm text-gray-600">
                                Schedule data is unavailable.
                            </p>
                        )}
                        {!teamScheduleQuery.isLoading &&
                            !teamScheduleQuery.isError &&
                            upcomingRowsAll.length === 0 && (
                                <p className="px-6 py-4 text-sm text-gray-600">
                                    No upcoming games yet.
                                </p>
                            )}
                        {!teamScheduleQuery.isLoading &&
                            !teamScheduleQuery.isError &&
                            upcomingRowsAll.map(renderGameRow)}
                    </div>
                </Modal>

                <Modal
                    show={showRecentDialog}
                    onClose={() => setShowRecentDialog(false)}
                    maxWidth="2xl"
                >
                    <div className="border-b border-gray-100 px-6 py-4">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                    Recent results
                                </p>
                                <h3 className="mt-1 text-xl font-semibold text-gray-900">
                                    Full results
                                </h3>
                                <p className="mt-2 text-xs text-gray-500">
                                    Game type {gameTypeLabel}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowRecentDialog(false)}
                                className="text-xs font-semibold uppercase tracking-widest text-gray-500 transition hover:text-gray-700"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                    <div className="max-h-[70vh] divide-y divide-gray-100 overflow-y-auto">
                        {teamScheduleQuery.isLoading && (
                            <p className="px-6 py-4 text-sm text-gray-600">
                                Loading recent results...
                            </p>
                        )}
                        {teamScheduleQuery.isError && (
                            <p className="px-6 py-4 text-sm text-gray-600">
                                Recent results are unavailable.
                            </p>
                        )}
                        {!teamScheduleQuery.isLoading &&
                            !teamScheduleQuery.isError &&
                            recentResultsAll.length === 0 && (
                                <p className="px-6 py-4 text-sm text-gray-600">
                                    No recent results available.
                                </p>
                            )}
                        {!teamScheduleQuery.isLoading &&
                            !teamScheduleQuery.isError &&
                            recentResultsAll.map(renderGameRow)}
                    </div>
                </Modal>

                <Modal
                    show={showClubStatsDialog}
                    onClose={() => setShowClubStatsDialog(false)}
                    maxWidth="2xl"
                >
                    <div className="border-b border-gray-100 px-6 py-4">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                    Club stats
                                </p>
                                <h3 className="mt-1 text-xl font-semibold text-gray-900">
                                    Full tables
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowClubStatsDialog(false)}
                                className="text-xs font-semibold uppercase tracking-widest text-gray-500 transition hover:text-gray-700"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                    <div className="max-h-[70vh] divide-y divide-gray-100 overflow-y-auto">
                        {clubStatsQuery.isLoading && (
                            <p className="px-6 py-4 text-sm text-gray-600">
                                Loading club stats...
                            </p>
                        )}
                        {clubStatsQuery.isError && (
                            <p className="px-6 py-4 text-sm text-gray-600">
                                Club stats are unavailable.
                            </p>
                        )}
                        {!clubStatsQuery.isLoading &&
                            !clubStatsQuery.isError &&
                            clubStatsCount === 0 && (
                                <p className="px-6 py-4 text-sm text-gray-600">
                                    No club stats data yet.
                                </p>
                            )}
                        {!clubStatsQuery.isLoading &&
                            !clubStatsQuery.isError &&
                            clubStatsCount > 0 && (
                                <div className="px-6 py-4">
                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                                Skaters ({allSkatersSorted.length})
                                            </p>
                                            <div className="mt-3 overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead className="text-[10px] uppercase tracking-widest text-gray-500">
                                                        <tr>
                                                            <th className="py-1 text-left font-semibold">
                                                                Player
                                                            </th>
                                                            <th className="py-1 text-right font-semibold">
                                                                GP
                                                            </th>
                                                            <th className="py-1 text-right font-semibold">
                                                                G
                                                            </th>
                                                            <th className="py-1 text-right font-semibold">
                                                                A
                                                            </th>
                                                            <th className="py-1 text-right font-semibold">
                                                                PTS
                                                            </th>
                                                            <th className="py-1 text-right font-semibold">
                                                                S
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="text-gray-700">
                                                        {allSkatersSorted.map((skater) => (
                                                            <tr
                                                                key={`full-skater-${skater.id}`}
                                                                className="border-t border-gray-100"
                                                            >
                                                                <td className="py-2 pr-3">
                                                                    <p className="font-semibold text-gray-900">
                                                                        {skater.name}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {skater.position ?? '--'}
                                                                    </p>
                                                                </td>
                                                                <td className="py-2 text-right">
                                                                    {skater.gamesPlayed ?? '--'}
                                                                </td>
                                                                <td className="py-2 text-right">
                                                                    {skater.goals ?? '--'}
                                                                </td>
                                                                <td className="py-2 text-right">
                                                                    {skater.assists ?? '--'}
                                                                </td>
                                                                <td className="py-2 text-right font-semibold text-gray-900">
                                                                    {skater.points ?? '--'}
                                                                </td>
                                                                <td className="py-2 text-right">
                                                                    {skater.shots ?? '--'}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                                Goalies ({allGoaliesSorted.length})
                                            </p>
                                            <div className="mt-3 overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead className="text-[10px] uppercase tracking-widest text-gray-500">
                                                        <tr>
                                                            <th className="py-1 text-left font-semibold">
                                                                Player
                                                            </th>
                                                            <th className="py-1 text-right font-semibold">
                                                                GP
                                                            </th>
                                                            <th className="py-1 text-right font-semibold">
                                                                W-L
                                                            </th>
                                                            <th className="py-1 text-right font-semibold">
                                                                SV%
                                                            </th>
                                                            <th className="py-1 text-right font-semibold">
                                                                GAA
                                                            </th>
                                                            <th className="py-1 text-right font-semibold">
                                                                SO
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="text-gray-700">
                                                        {allGoaliesSorted.map((goalie) => (
                                                            <tr
                                                                key={`full-goalie-${goalie.id}`}
                                                                className="border-t border-gray-100"
                                                            >
                                                                <td className="py-2 pr-3">
                                                                    <p className="font-semibold text-gray-900">
                                                                        {goalie.name}
                                                                    </p>
                                                                </td>
                                                                <td className="py-2 text-right">
                                                                    {goalie.gamesPlayed ?? '--'}
                                                                </td>
                                                                <td className="py-2 text-right">
                                                                    {goalie.wins === null ||
                                                                    goalie.wins === undefined
                                                                        ? '--'
                                                                        : `${goalie.wins}-${goalie.losses ?? 0}`}
                                                                </td>
                                                                <td className="py-2 text-right">
                                                                    {formatPctSmart(
                                                                        goalie.savePercentage,
                                                                    )}
                                                                </td>
                                                                <td className="py-2 text-right">
                                                                    {formatNumber(
                                                                        goalie.goalsAgainstAverage,
                                                                        2,
                                                                    )}
                                                                </td>
                                                                <td className="py-2 text-right">
                                                                    {goalie.shutouts ?? '--'}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                    </div>
                </Modal>

                <Modal
                    show={showWeekScheduleDialog}
                    onClose={() => setShowWeekScheduleDialog(false)}
                    maxWidth="2xl"
                >
                    <div className="border-b border-gray-100 px-6 py-4">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                    Schedule view
                                </p>
                                <h3 className="mt-1 text-xl font-semibold text-gray-900">
                                    This week
                                </h3>
                                <p className="mt-2 text-xs text-gray-500">
                                    Game type {gameTypeLabel}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowWeekScheduleDialog(false)}
                                className="text-xs font-semibold uppercase tracking-widest text-gray-500 transition hover:text-gray-700"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                    <div className="max-h-[70vh] divide-y divide-gray-100 overflow-y-auto">
                        {scheduleWeekQuery.isLoading && (
                            <p className="px-6 py-4 text-sm text-gray-600">
                                Loading week schedule...
                            </p>
                        )}
                        {scheduleWeekQuery.isError && (
                            <p className="px-6 py-4 text-sm text-gray-600">
                                Week schedule is unavailable.
                            </p>
                        )}
                        {!scheduleWeekQuery.isLoading &&
                            !scheduleWeekQuery.isError &&
                            weekRowsAll.length === 0 && (
                                <p className="px-6 py-4 text-sm text-gray-600">
                                    No games this week.
                                </p>
                            )}
                        {!scheduleWeekQuery.isLoading &&
                            !scheduleWeekQuery.isError &&
                            weekRowsAll.map(renderGameRow)}
                    </div>
                </Modal>

                <Modal
                    show={showMonthScheduleDialog}
                    onClose={() => setShowMonthScheduleDialog(false)}
                    maxWidth="2xl"
                >
                    <div className="border-b border-gray-100 px-6 py-4">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                    Schedule view
                                </p>
                                <h3 className="mt-1 text-xl font-semibold text-gray-900">
                                    This month
                                </h3>
                                <p className="mt-2 text-xs text-gray-500">
                                    Game type {gameTypeLabel}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowMonthScheduleDialog(false)}
                                className="text-xs font-semibold uppercase tracking-widest text-gray-500 transition hover:text-gray-700"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                    <div className="max-h-[70vh] divide-y divide-gray-100 overflow-y-auto">
                        {scheduleMonthQuery.isLoading && (
                            <p className="px-6 py-4 text-sm text-gray-600">
                                Loading month schedule...
                            </p>
                        )}
                        {scheduleMonthQuery.isError && (
                            <p className="px-6 py-4 text-sm text-gray-600">
                                Month schedule is unavailable.
                            </p>
                        )}
                        {!scheduleMonthQuery.isLoading &&
                            !scheduleMonthQuery.isError &&
                            monthRowsAll.length === 0 && (
                                <p className="px-6 py-4 text-sm text-gray-600">
                                    No games this month.
                                </p>
                            )}
                        {!scheduleMonthQuery.isLoading &&
                            !scheduleMonthQuery.isError &&
                            monthRowsAll.map(renderGameRow)}
                    </div>
                </Modal>

                <Modal
                    show={Boolean(reportDialog)}
                    onClose={() => setReportDialog(null)}
                    maxWidth="2xl"
                >
                    <div className="border-b border-gray-100 px-6 py-4">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                    Advanced report
                                </p>
                                <h3 className="mt-1 text-xl font-semibold text-gray-900">
                                    {reportDialog?.title ?? 'Report'}
                                </h3>
                                {reportDialog?.subtitle && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        {reportDialog.subtitle}
                                    </p>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => setReportDialog(null)}
                                className="text-xs font-semibold uppercase tracking-widest text-gray-500 transition hover:text-gray-700"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                    <div className="max-h-[70vh] overflow-y-auto px-6 py-4">
                        {!reportDialog?.metrics.length && (
                            <p className="text-sm text-gray-600">
                                No report data available.
                            </p>
                        )}
                        {reportDialog?.metrics.length ? (
                            <div className="grid gap-3 sm:grid-cols-2">
                                {reportDialog.metrics.map((metric) => (
                                    <div
                                        key={metric.label}
                                        className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm"
                                    >
                                        <p className="text-xs uppercase tracking-widest text-gray-500">
                                            {metric.label}
                                        </p>
                                        <p className="mt-2 text-lg font-semibold text-gray-900">
                                            {metric.value}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </div>
                </Modal>

            </LabLayout>
        </>
    );
}
