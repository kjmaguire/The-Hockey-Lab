import { Head, Link } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import LabLayout from '@/Layouts/LabLayout';
import {
    type EdgeOverlay,
    type EdgeUnitMetric,
    type EdgeValueMetric,
    type ScheduleGame,
    type StandingsRow,
    fetchNhl,
    normalizeDate,
    normalizeTime,
    parseGoalieDetail,
    parseGoalieLeaders,
    parseSkaterLeaders,
    parseSkaterLanding,
    parseSkaterDetail,
    parseSchedule,
    parseStandings,
} from '@/lib/nhl';

type ScheduleLoad = {
    team: string;
    games: number;
};

type RestEntry = {
    team: string;
    nextGame: Date;
    hoursUntil: number;
};

const getCurrentSeasonId = (today = new Date()) => {
    const year = today.getFullYear();
    const seasonStartYear = today.getMonth() >= 8 ? year : year - 1;
    return `${seasonStartYear}${seasonStartYear + 1}`;
};

const EDGE_SEASON = getCurrentSeasonId();
const EDGE_GROUP = '2';
const EDGE_GAME_TYPE = '2';
const SKATER_MIN_GP = 10;
const GOALIE_MIN_GP = 10;

const GAME_TYPE_LABELS: Record<number, string> = {
    1: 'Preseason',
    2: 'Regular season',
    3: 'Playoffs',
};

const formatSeasonLabel = (season: number) => {
    const value = String(season);
    if (value.length === 8) {
        return `${value.slice(0, 4)}-${value.slice(6)}`;
    }
    return value;
};

const formatKeyLabel = (value: string) =>
    value
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());

const formatStatValue = (
    value: unknown,
    format?: 'pct',
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

const formatEdgeGameTypes = (gameTypes: number[]) => {
    if (!gameTypes.length) {
        return 'All';
    }
    return gameTypes
        .map((type) => GAME_TYPE_LABELS[type] ?? `Type ${type}`)
        .join(', ');
};

const formatTeamRecord = (team: StandingsRow) => {
    if (team.record) {
        return team.record;
    }
    if (team.wins !== null && team.wins !== undefined) {
        const losses = team.losses ?? 0;
        if (team.otLosses !== null && team.otLosses !== undefined) {
            return `${team.wins}-${losses}-${team.otLosses}`;
        }
        return `${team.wins}-${losses}`;
    }
    return '';
};

const formatStandingsMeta = (team: StandingsRow) => {
    const parts: string[] = [];
    if (team.l10Wins !== null && team.l10Wins !== undefined) {
        const losses = team.l10Losses ?? 0;
        const otLosses = team.l10OtLosses;
        const record =
            otLosses !== null && otLosses !== undefined
                ? `${team.l10Wins}-${losses}-${otLosses}`
                : `${team.l10Wins}-${losses}`;
        parts.push(`L10 ${record}`);
    }
    if (team.streakCode && team.streakCount !== null && team.streakCount !== undefined) {
        parts.push(`Streak ${team.streakCode}${team.streakCount}`);
    }
    if (team.clinchIndicator) {
        parts.push(`Clinch ${team.clinchIndicator}`);
    }
    return parts.join(' | ');
};

const formatBroadcastSummary = (game: ScheduleGame) => {
    const detailLabels = (game.broadcastDetails ?? [])
        .map((detail) => detail.label)
        .filter(Boolean);
    const groupLabels = [
        ...(game.broadcastGroups?.tv ?? []),
        ...(game.broadcastGroups?.radio ?? []),
    ];
    const labels =
        detailLabels.length > 0
            ? detailLabels
            : groupLabels.length > 0
              ? groupLabels
              : game.broadcasts ?? [];
    if (!labels.length) {
        return '';
    }
    const uniqueLabels = Array.from(new Set(labels)).slice(0, 3);
    return `Broadcasts: ${uniqueLabels.join(', ')}`;
};

const formatLiveSituations = (game: ScheduleGame) => {
    if (!game.liveSituations?.home && !game.liveSituations?.away) {
        return '';
    }
    const parts = [
        game.liveSituations.home
            ? `H ${game.liveSituations.home}`
            : '',
        game.liveSituations.away
            ? `A ${game.liveSituations.away}`
            : '',
    ].filter(Boolean);
    return parts.length ? `Situations ${parts.join(' / ')}` : '';
};

const formatScoreLabel = (game: ScheduleGame) => {
    if (game.away.score === null || game.away.score === undefined) {
        return '';
    }
    if (game.home.score === null || game.home.score === undefined) {
        return '';
    }
    return `Score ${game.away.score}-${game.home.score}`;
};

const getGameLinks = (game: ScheduleGame) => {
    const links = game.links;
    if (!links) {
        return [];
    }
    return [
        links.gamecenter ? { label: 'Gamecenter', url: links.gamecenter } : null,
        links.recap ? { label: 'Recap', url: links.recap } : null,
        links.tickets ? { label: 'Tickets', url: links.tickets } : null,
        links.condensedGame
            ? { label: 'Condensed', url: links.condensedGame }
            : null,
        links.threeMinRecap
            ? { label: '3-min recap', url: links.threeMinRecap }
            : null,
    ].filter(
        (entry): entry is { label: string; url: string } =>
            entry !== null && entry.url.length > 0,
    );
};

const formatGameMeta = (game: ScheduleGame) => {
    const parts: string[] = [];
    const statusLabel = game.statusFlags?.postponed
        ? 'Postponed'
        : game.status;
    if (statusLabel) {
        parts.push(statusLabel);
    }
    if (game.statusFlags?.tbd) {
        parts.push('Time TBD');
    }
    if (game.eventFlags?.specialEvent) {
        parts.push(game.eventFlags.specialEvent);
    }
    if (game.eventFlags?.neutralSite) {
        parts.push('Neutral site');
    }
    const scoreLabel = formatScoreLabel(game);
    if (scoreLabel) {
        parts.push(scoreLabel);
    }
    const venueLabel = game.venueDetail || game.venue;
    if (venueLabel) {
        parts.push(`Venue: ${venueLabel}`);
    }
    const broadcastLabel = formatBroadcastSummary(game);
    if (broadcastLabel) {
        parts.push(broadcastLabel);
    }
    const situationsLabel = formatLiveSituations(game);
    if (situationsLabel) {
        parts.push(situationsLabel);
    }
    return parts.join(' · ');
};

const parseToiSeconds = (value?: string | number | null) => {
    if (value === null || value === undefined) {
        return null;
    }
    if (typeof value === 'number') {
        return Number.isNaN(value) ? null : value;
    }
    const trimmed = value.trim();
    if (!trimmed) {
        return null;
    }
    const parts = trimmed.split(':').map((part) => Number(part));
    if (parts.length === 2 && parts.every((part) => !Number.isNaN(part))) {
        return parts[0] * 60 + parts[1];
    }
    if (parts.length === 3 && parts.every((part) => !Number.isNaN(part))) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    const numeric = Number(trimmed);
    return Number.isNaN(numeric) ? null : numeric;
};

export default function LabHockeyIQ() {
    const scheduleQuery = useQuery({
        queryKey: ['nhl', 'schedule'],
        queryFn: () => fetchNhl('schedule'),
        staleTime: 60_000,
    });

    const standingsQuery = useQuery({
        queryKey: ['nhl', 'standings'],
        queryFn: () => fetchNhl('standings'),
        staleTime: 60_000,
    });

    const skatersQuery = useQuery({
        queryKey: ['nhl', 'edge', 'skater-landing', EDGE_SEASON, EDGE_GROUP],
        queryFn: () =>
            fetchNhl(
                `edge/skater-landing?season=${EDGE_SEASON}&group=${EDGE_GROUP}`,
            ),
        staleTime: 300_000,
    });
    const skaterLeadersQuery = useQuery({
        queryKey: ['nhl', 'skater-leaders', EDGE_SEASON, EDGE_GAME_TYPE],
        queryFn: () =>
            fetchNhl(
                `skater-leaders?season=${EDGE_SEASON}&gameType=${EDGE_GAME_TYPE}`,
            ),
        staleTime: 300_000,
    });

    const goalieLeadersQuery = useQuery({
        queryKey: ['nhl', 'goalie-leaders', EDGE_SEASON, EDGE_GAME_TYPE],
        queryFn: () =>
            fetchNhl(
                `goalie-leaders?season=${EDGE_SEASON}&gameType=${EDGE_GAME_TYPE}`,
            ),
        staleTime: 300_000,
    });

    const schedule = useMemo(
        () => parseSchedule(scheduleQuery.data ?? {}),
        [scheduleQuery.data],
    );
    const standings = useMemo(
        () => parseStandings(standingsQuery.data ?? {}),
        [standingsQuery.data],
    );
    const skaters = useMemo(
        () => parseSkaterLanding(skatersQuery.data ?? {}),
        [skatersQuery.data],
    );
    const skaterLeaders = useMemo(
        () => parseSkaterLeaders(skaterLeadersQuery.data ?? {}),
        [skaterLeadersQuery.data],
    );
    const goalieLeaders = useMemo(
        () => parseGoalieLeaders(goalieLeadersQuery.data ?? {}),
        [goalieLeadersQuery.data],
    );
    const teamNameByAbbrev = useMemo(() => {
        const map = new Map<string, string>();
        standings.forEach((row) => {
            if (row.abbrev) {
                map.set(row.abbrev.toUpperCase(), row.name);
            }
        });
        return map;
    }, [standings]);
    const teamLogoByAbbrev = useMemo(() => {
        const map = new Map<string, string>();
        standings.forEach((row) => {
            if (row.abbrev && row.logo) {
                map.set(row.abbrev.toUpperCase(), row.logo);
            }
        });
        return map;
    }, [standings]);

    const resolveTeamName = (value?: string | null) => {
        if (!value) {
            return 'Team';
        }
        return teamNameByAbbrev.get(value.toUpperCase()) ?? value;
    };

    const resolveTeamLogo = (value?: string | null) => {
        if (!value) {
            return null;
        }
        return teamLogoByAbbrev.get(value.toUpperCase()) ?? null;
    };

    const allGames = useMemo(
        () => schedule.flatMap((day) => day.games),
        [schedule],
    );

    const strengthOfSchedule = useMemo(() => {
        const counts = new Map<string, number>();
        allGames.forEach((game) => {
            const home = game.home.name || game.home.abbrev || 'Home';
            const away = game.away.name || game.away.abbrev || 'Away';
            counts.set(home, (counts.get(home) ?? 0) + 1);
            counts.set(away, (counts.get(away) ?? 0) + 1);
        });

        return [...counts.entries()]
            .map(
                ([team, games]) =>
                    ({
                        team,
                        games,
                    }) satisfies ScheduleLoad,
            )
            .sort((a, b) => b.games - a.games)
            .slice(0, 8);
    }, [allGames]);

    const restTracker = useMemo(() => {
        const now = Date.now();
        const teamNext = new Map<string, RestEntry>();

        allGames.forEach((game) => {
            if (!game.startTime) {
                return;
            }

            const gameDate = new Date(game.startTime);
            if (Number.isNaN(gameDate.getTime())) {
                return;
            }

            const hoursUntil = (gameDate.getTime() - now) / 36e5;
            if (hoursUntil < 0) {
                return;
            }

            const teams = [
                game.home.name || game.home.abbrev || 'Home',
                game.away.name || game.away.abbrev || 'Away',
            ];

            teams.forEach((team) => {
                const current = teamNext.get(team);
                if (!current || hoursUntil < current.hoursUntil) {
                    teamNext.set(team, {
                        team,
                        nextGame: gameDate,
                        hoursUntil,
                    });
                }
            });
        });

        return [...teamNext.values()]
            .sort((a, b) => a.hoursUntil - b.hoursUntil)
            .slice(0, 8);
    }, [allGames]);

    const draftOutlook = useMemo(() => {
        return [...standings]
            .sort((a, b) => (a.points ?? 0) - (b.points ?? 0))
            .slice(0, 6);
    }, [standings]);

    const playoffsBracket = useMemo(() => {
        return [...standings]
            .sort((a, b) => (b.points ?? 0) - (a.points ?? 0))
            .slice(0, 8);
    }, [standings]);

    const skatersWithMinGames = useMemo(
        () =>
            skaters.filter(
                (player) => {
                    if (
                        player.gamesPlayed === null ||
                        player.gamesPlayed === undefined
                    ) {
                        return true;
                    }
                    return player.gamesPlayed >= SKATER_MIN_GP;
                },
            ),
        [skaters],
    );

    const leagueSkatersWithMinGames = useMemo(
        () =>
            skaterLeaders.filter((player) => {
                if (
                    player.gamesPlayed === null ||
                    player.gamesPlayed === undefined
                ) {
                    return true;
                }
                return player.gamesPlayed >= SKATER_MIN_GP;
            }),
        [skaterLeaders],
    );

    const leagueSkaterLeaders = useMemo(() => {
        return [...leagueSkatersWithMinGames]
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
                const aAssists = a.assists ?? -1;
                const bAssists = b.assists ?? -1;
                if (aAssists !== bAssists) {
                    return bAssists - aAssists;
                }
                return a.name.localeCompare(b.name);
            })
            .slice(0, 12);
    }, [leagueSkatersWithMinGames]);

    const pointsLeaders = useMemo(
        () =>
            [...skatersWithMinGames]
                .filter((player) => player.points !== null && player.points !== undefined)
                .sort((a, b) => (b.points ?? -1) - (a.points ?? -1))
                .slice(0, 8),
        [skatersWithMinGames],
    );
    const assistsLeaders = useMemo(
        () =>
            [...skatersWithMinGames]
                .filter((player) => player.assists !== null && player.assists !== undefined)
                .sort((a, b) => (b.assists ?? -1) - (a.assists ?? -1))
                .slice(0, 8),
        [skatersWithMinGames],
    );
    const goalsLeaders = useMemo(
        () =>
            [...skatersWithMinGames]
                .filter((player) => player.goals !== null && player.goals !== undefined)
                .sort((a, b) => (b.goals ?? -1) - (a.goals ?? -1))
                .slice(0, 8),
        [skatersWithMinGames],
    );
    const shotsLeaders = useMemo(
        () =>
            [...skatersWithMinGames]
                .filter((player) => player.shots !== null && player.shots !== undefined)
                .sort((a, b) => (b.shots ?? -1) - (a.shots ?? -1))
                .slice(0, 8),
        [skatersWithMinGames],
    );
    const plusMinusLeaders = useMemo(
        () =>
            [...skatersWithMinGames]
                .filter(
                    (player) =>
                        player.plusMinus !== null && player.plusMinus !== undefined,
                )
                .sort((a, b) => (b.plusMinus ?? -999) - (a.plusMinus ?? -999))
                .slice(0, 8),
        [skatersWithMinGames],
    );
    const powerPlayGoalsLeaders = useMemo(
        () =>
            [...skatersWithMinGames]
                .filter(
                    (player) =>
                        player.powerPlayGoals !== null &&
                        player.powerPlayGoals !== undefined,
                )
                .sort(
                    (a, b) =>
                        (b.powerPlayGoals ?? -1) - (a.powerPlayGoals ?? -1),
                )
                .slice(0, 8),
        [skatersWithMinGames],
    );
    const powerPlayPointsLeaders = useMemo(
        () =>
            [...skatersWithMinGames]
                .filter(
                    (player) =>
                        player.powerPlayPoints !== null &&
                        player.powerPlayPoints !== undefined,
                )
                .sort(
                    (a, b) =>
                        (b.powerPlayPoints ?? -1) -
                        (a.powerPlayPoints ?? -1),
                )
                .slice(0, 8),
        [skatersWithMinGames],
    );
    const shortHandedGoalsLeaders = useMemo(
        () =>
            [...skatersWithMinGames]
                .filter(
                    (player) =>
                        player.shortHandedGoals !== null &&
                        player.shortHandedGoals !== undefined,
                )
                .sort(
                    (a, b) =>
                        (b.shortHandedGoals ?? -1) -
                        (a.shortHandedGoals ?? -1),
                )
                .slice(0, 8),
        [skatersWithMinGames],
    );
    const gameWinningGoalsLeaders = useMemo(
        () =>
            [...skatersWithMinGames]
                .filter(
                    (player) =>
                        player.gameWinningGoals !== null &&
                        player.gameWinningGoals !== undefined,
                )
                .sort(
                    (a, b) =>
                        (b.gameWinningGoals ?? -1) -
                        (a.gameWinningGoals ?? -1),
                )
                .slice(0, 8),
        [skatersWithMinGames],
    );
    const overtimeGoalsLeaders = useMemo(
        () =>
            [...skatersWithMinGames]
                .filter(
                    (player) =>
                        player.overtimeGoals !== null &&
                        player.overtimeGoals !== undefined,
                )
                .sort(
                    (a, b) =>
                        (b.overtimeGoals ?? -1) -
                        (a.overtimeGoals ?? -1),
                )
                .slice(0, 8),
        [skatersWithMinGames],
    );
    const penaltyMinutesLeaders = useMemo(
        () =>
            [...skatersWithMinGames]
                .filter(
                    (player) =>
                        player.penaltyMinutes !== null &&
                        player.penaltyMinutes !== undefined,
                )
                .sort(
                    (a, b) =>
                        (b.penaltyMinutes ?? -1) -
                        (a.penaltyMinutes ?? -1),
                )
                .slice(0, 8),
        [skatersWithMinGames],
    );
    const faceoffWinPctLeaders = useMemo(
        () =>
            [...skatersWithMinGames]
                .filter(
                    (player) =>
                        player.faceoffWinPct !== null &&
                        player.faceoffWinPct !== undefined,
                )
                .sort(
                    (a, b) =>
                        (b.faceoffWinPct ?? -1) - (a.faceoffWinPct ?? -1),
                )
                .slice(0, 8),
        [skatersWithMinGames],
    );
    const takeawaysLeaders = useMemo(
        () =>
            [...skatersWithMinGames]
                .filter(
                    (player) =>
                        player.takeaways !== null && player.takeaways !== undefined,
                )
                .sort((a, b) => (b.takeaways ?? -1) - (a.takeaways ?? -1))
                .slice(0, 8),
        [skatersWithMinGames],
    );
    const giveawaysLeaders = useMemo(
        () =>
            [...skatersWithMinGames]
                .filter(
                    (player) =>
                        player.giveaways !== null && player.giveaways !== undefined,
                )
                .sort((a, b) => (b.giveaways ?? -1) - (a.giveaways ?? -1))
                .slice(0, 8),
        [skatersWithMinGames],
    );
    const shootingPctLeaders = useMemo(
        () =>
            [...skatersWithMinGames]
                .filter(
                    (player) =>
                        player.shootingPct !== null &&
                        player.shootingPct !== undefined,
                )
                .sort(
                    (a, b) =>
                        (b.shootingPct ?? -1) - (a.shootingPct ?? -1),
                )
                .slice(0, 8),
        [skatersWithMinGames],
    );
    const toiLeaders = useMemo(() => {
        return [...skatersWithMinGames]
            .map((player) => ({
                player,
                toiSeconds: parseToiSeconds(player.toi),
            }))
            .filter((entry) => entry.toiSeconds !== null)
            .sort(
                (a, b) =>
                    (b.toiSeconds ?? -1) - (a.toiSeconds ?? -1),
            )
            .slice(0, 8)
            .map((entry) => entry.player);
    }, [skatersWithMinGames]);
    const hitsLeaders = useMemo(
        () =>
            [...skatersWithMinGames]
                .filter((player) => player.hits !== null && player.hits !== undefined)
                .sort((a, b) => (b.hits ?? -1) - (a.hits ?? -1))
                .slice(0, 8),
        [skatersWithMinGames],
    );
    const blocksLeaders = useMemo(
        () =>
            [...skatersWithMinGames]
                .filter((player) => player.blocks !== null && player.blocks !== undefined)
                .sort((a, b) => (b.blocks ?? -1) - (a.blocks ?? -1))
                .slice(0, 8),
        [skatersWithMinGames],
    );
    const rawSkaterLeaderGroups = useMemo(
        () => [
            {
                key: 'points',
                title: 'Points',
                statLabel: 'PTS',
                leaders: pointsLeaders,
                getValue: (player: (typeof pointsLeaders)[number]) => player.points,
            },
            {
                key: 'goals',
                title: 'Goals',
                statLabel: 'G',
                leaders: goalsLeaders,
                getValue: (player: (typeof goalsLeaders)[number]) => player.goals,
            },
            {
                key: 'assists',
                title: 'Assists',
                statLabel: 'A',
                leaders: assistsLeaders,
                getValue: (player: (typeof assistsLeaders)[number]) => player.assists,
            },
            {
                key: 'shots',
                title: 'Shots',
                statLabel: 'SOG',
                leaders: shotsLeaders,
                getValue: (player: (typeof shotsLeaders)[number]) => player.shots,
            },
            {
                key: 'plus-minus',
                title: 'Plus/minus',
                statLabel: '+/-',
                leaders: plusMinusLeaders,
                getValue: (player: (typeof plusMinusLeaders)[number]) =>
                    player.plusMinus,
            },
            {
                key: 'pp-goals',
                title: 'Power play goals',
                statLabel: 'PPG',
                leaders: powerPlayGoalsLeaders,
                getValue: (player: (typeof powerPlayGoalsLeaders)[number]) =>
                    player.powerPlayGoals,
            },
            {
                key: 'pp-points',
                title: 'Power play points',
                statLabel: 'PP PTS',
                leaders: powerPlayPointsLeaders,
                getValue: (player: (typeof powerPlayPointsLeaders)[number]) =>
                    player.powerPlayPoints,
            },
            {
                key: 'sh-goals',
                title: 'Short-handed goals',
                statLabel: 'SHG',
                leaders: shortHandedGoalsLeaders,
                getValue: (player: (typeof shortHandedGoalsLeaders)[number]) =>
                    player.shortHandedGoals,
            },
            {
                key: 'gw-goals',
                title: 'Game-winning goals',
                statLabel: 'GWG',
                leaders: gameWinningGoalsLeaders,
                getValue: (player: (typeof gameWinningGoalsLeaders)[number]) =>
                    player.gameWinningGoals,
            },
            {
                key: 'ot-goals',
                title: 'Overtime goals',
                statLabel: 'OTG',
                leaders: overtimeGoalsLeaders,
                getValue: (player: (typeof overtimeGoalsLeaders)[number]) =>
                    player.overtimeGoals,
            },
            {
                key: 'pim',
                title: 'Penalty minutes',
                statLabel: 'PIM',
                leaders: penaltyMinutesLeaders,
                getValue: (player: (typeof penaltyMinutesLeaders)[number]) =>
                    player.penaltyMinutes,
            },
            {
                key: 'faceoff-pct',
                title: 'Faceoff win rate',
                statLabel: 'FO%',
                leaders: faceoffWinPctLeaders,
                getValue: (player: (typeof faceoffWinPctLeaders)[number]) =>
                    player.faceoffWinPct,
                formatValue: (value?: number | string | null) =>
                    formatStatValue(value, 'pct'),
            },
            {
                key: 'takeaways',
                title: 'Takeaways',
                statLabel: 'TK',
                leaders: takeawaysLeaders,
                getValue: (player: (typeof takeawaysLeaders)[number]) =>
                    player.takeaways,
            },
            {
                key: 'giveaways',
                title: 'Giveaways',
                statLabel: 'GV',
                leaders: giveawaysLeaders,
                getValue: (player: (typeof giveawaysLeaders)[number]) =>
                    player.giveaways,
            },
            {
                key: 'shooting-pct',
                title: 'Shooting percentage',
                statLabel: 'SH%',
                leaders: shootingPctLeaders,
                getValue: (player: (typeof shootingPctLeaders)[number]) =>
                    player.shootingPct,
                formatValue: (value?: number | string | null) =>
                    formatStatValue(value, 'pct'),
            },
            {
                key: 'toi',
                title: 'Time on Ice',
                statLabel: 'TOI',
                leaders: toiLeaders,
                getValue: (player: (typeof toiLeaders)[number]) => player.toi,
            },
            {
                key: 'hits',
                title: 'Hits',
                statLabel: 'HIT',
                leaders: hitsLeaders,
                getValue: (player: (typeof hitsLeaders)[number]) => player.hits,
            },
            {
                key: 'blocks',
                title: 'Blocks',
                statLabel: 'BLK',
                leaders: blocksLeaders,
                getValue: (player: (typeof blocksLeaders)[number]) => player.blocks,
            },
        ],
        [
            assistsLeaders,
            blocksLeaders,
            faceoffWinPctLeaders,
            gameWinningGoalsLeaders,
            giveawaysLeaders,
            goalsLeaders,
            hitsLeaders,
            overtimeGoalsLeaders,
            penaltyMinutesLeaders,
            plusMinusLeaders,
            pointsLeaders,
            powerPlayGoalsLeaders,
            powerPlayPointsLeaders,
            shootingPctLeaders,
            shortHandedGoalsLeaders,
            shotsLeaders,
            takeawaysLeaders,
            toiLeaders,
        ],
    );
    const extraLeaderGroups = useMemo(() => {
        const keys = new Set<string>();
        skatersWithMinGames.forEach((player) => {
            Object.keys(player.extraStats ?? {}).forEach((key) => {
                keys.add(key);
            });
        });

        return [...keys]
            .sort((a, b) => a.localeCompare(b))
            .map((key) => {
                const label = formatKeyLabel(key);
                const lowerKey = key.toLowerCase();
                const formatValue = /pct|percent|percentage|rate/.test(lowerKey)
                    ? (value?: number | string | null) =>
                          formatStatValue(value, 'pct', key)
                    : undefined;
                const leaders = [...skatersWithMinGames]
                    .filter(
                        (player) =>
                            player.extraStats?.[key] !== null &&
                            player.extraStats?.[key] !== undefined,
                    )
                    .sort(
                        (a, b) =>
                            (b.extraStats?.[key] ?? -1) -
                            (a.extraStats?.[key] ?? -1),
                    )
                    .slice(0, 8);
                const shortLabel =
                    label.length > 12
                        ? `${label.slice(0, 11)}...`
                        : label;

                return {
                    key: `extra-${key}`,
                    title: label || key,
                    statLabel: shortLabel.toUpperCase(),
                    leaders,
                    getValue: (player: (typeof skaters)[number]) =>
                        player.extraStats?.[key],
                    formatValue,
                };
            })
            .filter((group) => group.leaders.length > 0);
    }, [skatersWithMinGames]);
    const skaterLeaderGroups = useMemo(
        () =>
            [...rawSkaterLeaderGroups, ...extraLeaderGroups].filter(
                (group) => group.leaders.length > 0,
            ),
        [extraLeaderGroups, rawSkaterLeaderGroups],
    );
    const hasSkaterLeaders = skaterLeaderGroups.length > 0;

    const skaterOptions = useMemo(() => {
        return [...skaters].sort((a, b) => {
            const aPoints = a.points ?? -1;
            const bPoints = b.points ?? -1;
            if (aPoints !== bPoints) {
                return bPoints - aPoints;
            }
            return a.name.localeCompare(b.name);
        });
    }, [skaters]);

    const goalieOptions = useMemo(() => {
        return [...goalieLeaders]
            .filter(
                (goalie) =>
                    goalie.gamesPlayed !== null &&
                    goalie.gamesPlayed !== undefined &&
                    goalie.gamesPlayed >= GOALIE_MIN_GP,
            )
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
                const aGaa = a.goalsAgainstAverage ?? 999;
                const bGaa = b.goalsAgainstAverage ?? 999;
                if (aGaa !== bGaa) {
                    return aGaa - bGaa;
                }
                return a.name.localeCompare(b.name);
            });
    }, [goalieLeaders]);

    const topGoalies = useMemo(
        () => goalieOptions.slice(0, 8),
        [goalieOptions],
    );

    const [selectedSkaterId, setSelectedSkaterId] = useState('');
    const [selectedGoalieId, setSelectedGoalieId] = useState('');

    useEffect(() => {
        if (!selectedSkaterId && skaterOptions.length > 0) {
            setSelectedSkaterId(skaterOptions[0].id);
        }
    }, [selectedSkaterId, skaterOptions]);

    useEffect(() => {
        if (!selectedGoalieId && goalieOptions.length > 0) {
            setSelectedGoalieId(goalieOptions[0].id);
        }
    }, [selectedGoalieId, goalieOptions]);

    const featuredSkater = useMemo(() => {
        if (selectedSkaterId) {
            return (
                skaterOptions.find((player) => player.id === selectedSkaterId) ??
                pointsLeaders[0] ??
                null
            );
        }
        return pointsLeaders[0] ?? null;
    }, [pointsLeaders, selectedSkaterId, skaterOptions]);

    const featuredGoalie = useMemo(() => {
        if (selectedGoalieId) {
            return (
                goalieOptions.find((goalie) => goalie.id === selectedGoalieId) ??
                topGoalies[0] ??
                null
            );
        }
        return topGoalies[0] ?? null;
    }, [goalieOptions, selectedGoalieId, topGoalies]);

    const skaterDetailQuery = useQuery({
        queryKey: [
            'nhl',
            'edge',
            'skater-detail',
            featuredSkater?.id,
            EDGE_SEASON,
            EDGE_GROUP,
        ],
        queryFn: () =>
            fetchNhl(
                `edge/skater-detail/${featuredSkater?.id}?season=${EDGE_SEASON}&group=${EDGE_GROUP}`,
            ),
        enabled: Boolean(featuredSkater?.id),
        staleTime: 300_000,
    });

    const goalieDetailQuery = useQuery({
        queryKey: [
            'nhl',
            'edge',
            'goalie-detail',
            featuredGoalie?.id,
            EDGE_SEASON,
            EDGE_GROUP,
        ],
        queryFn: () =>
            fetchNhl(
                `edge/goalie-detail/${featuredGoalie?.id}?season=${EDGE_SEASON}&group=${EDGE_GROUP}`,
            ),
        enabled: Boolean(featuredGoalie?.id),
        staleTime: 300_000,
    });

    const goalieFallback = useMemo(() => {
        if (!featuredGoalie) {
            return undefined;
        }
        return {
            id: featuredGoalie.id,
            name: featuredGoalie.name,
            team: featuredGoalie.team,
            position: 'G',
            gamesPlayed: featuredGoalie.gamesPlayed ?? null,
        };
    }, [featuredGoalie]);

    const skaterDetail = useMemo(
        () => parseSkaterDetail(skaterDetailQuery.data ?? {}, featuredSkater ?? undefined),
        [featuredSkater, skaterDetailQuery.data],
    );
    const goalieDetail = useMemo(
        () => parseGoalieDetail(goalieDetailQuery.data ?? {}, goalieFallback),
        [goalieDetailQuery.data, goalieFallback],
    );

    const buildPlayerLink = (player: { id: string; team?: string | null }) => {
        if (!player.team) {
            return `/lab/players/${player.id}`;
        }
        return `/lab/players/${player.id}?team=${player.team}&season=${EDGE_SEASON}&gameType=${EDGE_GAME_TYPE}`;
    };

    const skaterTracking = skaterDetail?.skaterTracking;
    const goalieTracking = goalieDetail?.goalieTracking;

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

    const skaterEdgeSeasons = useMemo(() => {
        return (
            skaterDetail?.edgeSeasons?.map(
                (entry) =>
                    `${formatSeasonLabel(entry.seasonId)} (${formatEdgeGameTypes(entry.gameTypes)})`,
            ) ?? []
        );
    }, [skaterDetail?.edgeSeasons]);

    const goalieEdgeSeasons = useMemo(() => {
        return (
            goalieDetail?.edgeSeasons?.map(
                (entry) =>
                    `${formatSeasonLabel(entry.seasonId)} (${formatEdgeGameTypes(entry.gameTypes)})`,
            ) ?? []
        );
    }, [goalieDetail?.edgeSeasons]);
    const skaterLandingAttributes = useMemo(() => {
        if (!featuredSkater?.extraFields) {
            return [];
        }
        return Object.entries(featuredSkater.extraFields)
            .map(([key, value]) => ({
                key,
                label: formatKeyLabel(key),
                value,
            }))
            .filter((entry) => entry.value !== '')
            .sort((a, b) => a.label.localeCompare(b.label));
    }, [featuredSkater]);

    const matchupDay = schedule[0];

    return (
        <>
            <Head title="Hockey IQ" />
            <LabLayout active="hockey-iq">
                <section className="overflow-hidden rounded-lg bg-white shadow-sm">
                    <div className="border-b border-gray-100 px-6 py-4">
                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                            NHL Edge
                        </p>
                        <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                            Skater leaders
                        </h2>
                        <p className="mt-1 text-xs text-gray-500">
                            Minimum GP {SKATER_MIN_GP} (when available)
                        </p>
                    </div>
                    <div className="px-6 py-4">
                        {skatersQuery.isLoading && (
                            <p className="text-sm text-gray-600">
                                Loading NHL Edge data...
                            </p>
                        )}
                        {skatersQuery.isError && (
                            <p className="text-sm text-gray-600">
                                NHL Edge data is unavailable.
                            </p>
                        )}
                        {!skatersQuery.isLoading &&
                            !skatersQuery.isError &&
                            !hasSkaterLeaders && (
                                <p className="text-sm text-gray-600">
                                    No NHL Edge data yet.
                                </p>
                            )}
                        {!skatersQuery.isLoading &&
                            !skatersQuery.isError &&
                            hasSkaterLeaders && (
                                <div className="grid gap-4 md:grid-cols-3">
                                    {skaterLeaderGroups.map((group) => (
                                        <div
                                            key={group.key}
                                            className="rounded-lg border border-gray-100 bg-gray-50/70 p-4"
                                        >
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-sm font-semibold text-gray-900">
                                                    {group.title}
                                                </h3>
                                                <span className="text-xs font-semibold text-gray-500">
                                                    {group.statLabel}
                                                </span>
                                            </div>
                                            <div className="mt-4 space-y-3">
                                                {group.leaders.length === 0 && (
                                                    <p className="text-xs text-gray-500">
                                                        No data yet.
                                                    </p>
                                                )}
                                                {group.leaders.map((player) => {
                                                    const logo =
                                                        resolveTeamLogo(player.team);
                                                    const value =
                                                        group.getValue(player);
                                                    const landingAttributes = Object.entries(
                                                        player.extraFields ?? {},
                                                    )
                                                        .sort(([a], [b]) =>
                                                            a.localeCompare(b),
                                                        )
                                                        .slice(0, 2)
                                                        .map(
                                                            ([key, entryValue]) =>
                                                                `${formatKeyLabel(key)}: ${entryValue}`,
                                                        );
                                                    const statValue =
                                                        group.formatValue
                                                            ? group.formatValue(value)
                                                            : value === null ||
                                                                value === undefined ||
                                                                value === ''
                                                              ? '--'
                                                              : value;
                                                    return (
                                                        <div
                                                            key={player.id}
                                                            className="flex items-center justify-between gap-3 text-sm"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                {logo && (
                                                                    <img
                                                                        src={logo}
                                                                        alt={`${resolveTeamName(player.team)} logo`}
                                                                        className="h-8 w-8 object-contain"
                                                                        loading="lazy"
                                                                    />
                                                                )}
                                                                <div>
                                                                    <Link
                                                                        href={buildPlayerLink(
                                                                            player,
                                                                        )}
                                                                        className="font-semibold text-gray-900 transition hover:text-indigo-600"
                                                                    >
                                                                        {player.name}
                                                                    </Link>
                                                                    <p className="text-xs text-gray-500">
                                                                        {resolveTeamName(
                                                                            player.team,
                                                                        )}{' '}
                                                                        |{' '}
                                                                        {player.position ??
                                                                            'POS'}
                                                                    </p>
                                                                    {landingAttributes.length > 0 && (
                                                                        <p className="text-[10px] text-gray-400">
                                                                            {landingAttributes.join(
                                                                                ' | ',
                                                                            )}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="text-right text-xs text-gray-500">
                                                                <p className="text-sm font-semibold text-gray-900">
                                                                    {group.statLabel}{' '}
                                                                    {statValue}
                                                                </p>
                                                                <p>
                                                                    GP{' '}
                                                                    {player.gamesPlayed ??
                                                                        '--'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                    </div>
                </section>

                <section className="overflow-hidden rounded-lg bg-white shadow-sm">
                    <div className="border-b border-gray-100 px-6 py-4">
                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                            NHL Stats API
                        </p>
                        <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                            League skater leaders
                        </h2>
                        <p className="mt-1 text-xs text-gray-500">
                            Season {formatSeasonLabel(Number(EDGE_SEASON))} | {GAME_TYPE_LABELS[Number(EDGE_GAME_TYPE)] ?? 'Regular season'} | Minimum GP {SKATER_MIN_GP}
                        </p>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {skaterLeadersQuery.isLoading && (
                            <p className="px-6 py-4 text-sm text-gray-600">
                                Loading skater leaders...
                            </p>
                        )}
                        {skaterLeadersQuery.isError && (
                            <p className="px-6 py-4 text-sm text-gray-600">
                                Skater leaders are unavailable.
                            </p>
                        )}
                        {!skaterLeadersQuery.isLoading &&
                            !skaterLeadersQuery.isError &&
                            leagueSkaterLeaders.length === 0 && (
                                <p className="px-6 py-4 text-sm text-gray-600">
                                    No skater leaders yet.
                                </p>
                            )}
                        {leagueSkaterLeaders.map((player) => {
                            const logo = resolveTeamLogo(player.team);
                            return (
                                <div
                                    key={player.id}
                                    className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 text-sm"
                                >
                                    <div className="flex items-start gap-3">
                                        {logo && (
                                            <img
                                                src={logo}
                                                alt={`${resolveTeamName(player.team)} logo`}
                                                className="h-8 w-8 object-contain"
                                                loading="lazy"
                                            />
                                        )}
                                        <div>
                                            <Link
                                                href={buildPlayerLink(player)}
                                                className="font-semibold text-gray-900 transition hover:text-indigo-600"
                                            >
                                                {player.name}
                                            </Link>
                                            <p className="text-xs text-gray-500">
                                                {resolveTeamName(player.team)} | {player.position ?? 'POS'} | GP {player.gamesPlayed ?? '--'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right text-xs text-gray-500">
                                        <p className="text-xs font-semibold text-gray-900">
                                            PTS {player.points ?? '--'}
                                        </p>
                                        <p>G {player.goals ?? '--'}</p>
                                        <p>A {player.assists ?? '--'}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <section className="overflow-hidden rounded-lg bg-white shadow-sm">
                    <div className="border-b border-gray-100 px-6 py-4">
                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                            NHL Edge
                        </p>
                        <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                            Goalie leaders
                        </h2>
                        <p className="mt-1 text-xs text-gray-500">
                            Minimum GP {GOALIE_MIN_GP}
                        </p>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {goalieLeadersQuery.isLoading && (
                            <p className="px-6 py-4 text-sm text-gray-600">
                                Loading goalie leaders...
                            </p>
                        )}
                        {goalieLeadersQuery.isError && (
                            <p className="px-6 py-4 text-sm text-gray-600">
                                Goalie stats are unavailable.
                            </p>
                        )}
                        {!goalieLeadersQuery.isLoading &&
                            !goalieLeadersQuery.isError &&
                            topGoalies.length === 0 && (
                                <p className="px-6 py-4 text-sm text-gray-600">
                                    No goalie stats yet.
                                </p>
                            )}
                        {topGoalies.map((goalie) => {
                            const logo = resolveTeamLogo(goalie.team);
                            const savePct =
                                goalie.savePercentage !== null &&
                                goalie.savePercentage !== undefined
                                    ? goalie.savePercentage.toFixed(3)
                                    : '--';
                            const gaa =
                                goalie.goalsAgainstAverage !== null &&
                                goalie.goalsAgainstAverage !== undefined
                                    ? goalie.goalsAgainstAverage.toFixed(2)
                                    : '--';
                            const record =
                                goalie.wins !== null &&
                                goalie.wins !== undefined &&
                                goalie.losses !== null &&
                                goalie.losses !== undefined
                                    ? `${goalie.wins}-${goalie.losses}`
                                    : '--';
                            const extraStatEntries = Object.entries(
                                goalie.extraStats ?? {},
                            )
                                .sort(([a], [b]) => a.localeCompare(b))
                                .slice(0, 2)
                                .map(
                                    ([key, value]) =>
                                        `${formatKeyLabel(key)} ${formatStatValue(
                                            value,
                                            undefined,
                                            key,
                                        )}`,
                                );
                            const extraFieldEntries = Object.entries(
                                goalie.extraFields ?? {},
                            )
                                .sort(([a], [b]) => a.localeCompare(b))
                                .slice(0, 1)
                                .map(
                                    ([key, value]) =>
                                        `${formatKeyLabel(key)} ${value}`,
                                );
                            const extraEntries = [
                                ...extraStatEntries,
                                ...extraFieldEntries,
                            ].slice(0, 2);
                            return (
                                <div
                                    key={goalie.id}
                                    className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 text-sm"
                                >
                                    <div className="flex items-start gap-3">
                                        {logo && (
                                            <img
                                                src={logo}
                                                alt={`${resolveTeamName(goalie.team)} logo`}
                                                className="h-8 w-8 object-contain"
                                                loading="lazy"
                                            />
                                        )}
                                        <div>
                                            <Link
                                                href={buildPlayerLink(goalie)}
                                                className="font-semibold text-gray-900 transition hover:text-indigo-600"
                                            >
                                                {goalie.name}
                                            </Link>
                                            <p className="text-xs text-gray-500">
                                                {resolveTeamName(goalie.team)} | GP{' '}
                                                {goalie.gamesPlayed ?? '--'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right text-xs text-gray-500">
                                        <p className="text-xs font-semibold text-gray-900">
                                            W-L {record}
                                        </p>
                                        <p>SV% {savePct}</p>
                                        <p>GAA {gaa}</p>
                                        {goalie.shutouts !== null &&
                                            goalie.shutouts !== undefined && (
                                                <p>SO {goalie.shutouts}</p>
                                            )}
                                        {extraEntries.map((entry) => (
                                            <p
                                                key={entry}
                                                className="text-[10px] text-gray-400"
                                            >
                                                {entry}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-2">
                    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                NHL Edge spotlight
                            </p>
                            <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                                Featured skater
                            </h2>
                            <p className="mt-1 text-xs text-gray-500">
                                Season {formatSeasonLabel(Number(EDGE_SEASON))} | Group {EDGE_GROUP}
                            </p>
                        </div>
                        <div className="space-y-6 px-6 py-5 text-sm">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                    Goalie
                                </span>
                                <select
                                    value={featuredGoalie?.id ?? ''}
                                    onChange={(event) => setSelectedGoalieId(event.target.value)}
                                    className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:w-72"
                                >
                                    <option value="" disabled>
                                        Select a goalie
                                    </option>
                                    {goalieOptions.map((goalie) => (
                                        <option key={goalie.id} value={goalie.id}>
                                            {goalie.name} | {resolveTeamName(goalie.team)}
                                            {goalie.wins !== null &&
                                            goalie.wins !== undefined
                                                ? ` (${goalie.wins} W)`
                                                : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                    Skater
                                </span>
                                <select
                                    value={featuredSkater?.id ?? ''}
                                    onChange={(event) => setSelectedSkaterId(event.target.value)}
                                    className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:w-72"
                                >
                                    <option value="" disabled>
                                        Select a skater
                                    </option>
                                    {skaterOptions.map((player) => (
                                        <option key={player.id} value={player.id}>
                                            {player.name} | {resolveTeamName(player.team)}
                                            {player.points !== null &&
                                            player.points !== undefined
                                                ? ` (${player.points} PTS)`
                                                : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {!featuredSkater && (
                                <p className="text-gray-600">
                                    No skater data available yet.
                                </p>
                            )}
                            {skaterDetailQuery.isLoading && (
                                <p className="text-gray-600">
                                    Loading skater Edge detail...
                                </p>
                            )}
                            {skaterDetailQuery.isError && (
                                <p className="text-gray-600">
                                    Skater Edge detail is unavailable.
                                </p>
                            )}
                            {skaterDetail && (
                                <div className="space-y-6">
                                    <div className="flex items-start gap-3">
                                    {(skaterDetail.teamLogoLight ||
                                        skaterDetail.teamLogoDark) && (
                                        <div className="flex items-center gap-2">
                                            {skaterDetail.teamLogoLight && (
                                                <img
                                                    src={skaterDetail.teamLogoLight}
                                                    alt={`${resolveTeamName(skaterDetail.team)} logo`}
                                                    className="h-10 w-10 object-contain"
                                                    loading="lazy"
                                                />
                                            )}
                                            {skaterDetail.teamLogoDark && (
                                                <span className="rounded-md bg-gray-900 p-1">
                                                    <img
                                                        src={skaterDetail.teamLogoDark}
                                                        alt={`${resolveTeamName(skaterDetail.team)} logo (dark)`}
                                                        className="h-8 w-8 object-contain"
                                                        loading="lazy"
                                                    />
                                                </span>
                                            )}
                                        </div>
                                    )}
                                        <div>
                                            <Link
                                                href={buildPlayerLink(skaterDetail)}
                                                className="text-lg font-semibold text-gray-900 transition hover:text-indigo-600"
                                            >
                                                {skaterDetail.name}
                                            </Link>
                                            <p className="text-xs text-gray-500">
                                                {resolveTeamName(skaterDetail.team)} |{' '}
                                                {skaterDetail.position ?? 'POS'}
                                            </p>
                                        </div>
                                    </div>
                                    {skaterEdgeSeasons.length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                                Edge seasons available
                                            </p>
                                            <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                                {skaterEdgeSeasons.map((season) => (
                                                    <span
                                                        key={season}
                                                        className="rounded-full bg-gray-100 px-3 py-1 text-gray-600"
                                                    >
                                                        {season}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {skaterDetail.metrics.length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                                Skater metrics
                                            </p>
                                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                                {skaterDetail.metrics.map((metric) => (
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
                                    {skaterLandingAttributes.length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                                Landing attributes
                                            </p>
                                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                                {skaterLandingAttributes.map((entry) => (
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
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {skaterSpeedCards && (
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                                Tracking highlights
                                            </p>
                                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                                {skaterSpeedCards.topShotSpeed && (
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
                                                {skaterSpeedCards.speedMax && (
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
                                                {skaterSpeedCards.totalDistance && (
                                                    <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                                                        <p className="text-[10px] uppercase tracking-widest text-gray-500">
                                                            Total distance
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
                                                {skaterSpeedCards.distanceMaxGame && (
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
                                                {skaterSpeedCards.burstsOver20 && (
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
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                NHL Edge spotlight
                            </p>
                            <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                                Featured goalie
                            </h2>
                            <p className="mt-1 text-xs text-gray-500">
                                Season {formatSeasonLabel(Number(EDGE_SEASON))} | Group {EDGE_GROUP}
                            </p>
                        </div>
                        <div className="space-y-6 px-6 py-5 text-sm">
                            {!featuredGoalie && (
                                <p className="text-gray-600">
                                    No goalie data available yet.
                                </p>
                            )}
                            {goalieDetailQuery.isLoading && (
                                <p className="text-gray-600">
                                    Loading goalie Edge detail...
                                </p>
                            )}
                            {goalieDetailQuery.isError && (
                                <p className="text-gray-600">
                                    Goalie Edge detail is unavailable.
                                </p>
                            )}
                            {goalieDetail && (
                                <div className="space-y-6">
                                    <div className="flex items-start gap-3">
                                    {(goalieDetail.teamLogoLight ||
                                        goalieDetail.teamLogoDark) && (
                                        <div className="flex items-center gap-2">
                                            {goalieDetail.teamLogoLight && (
                                                <img
                                                    src={goalieDetail.teamLogoLight}
                                                    alt={`${resolveTeamName(goalieDetail.team)} logo`}
                                                    className="h-10 w-10 object-contain"
                                                    loading="lazy"
                                                />
                                            )}
                                            {goalieDetail.teamLogoDark && (
                                                <span className="rounded-md bg-gray-900 p-1">
                                                    <img
                                                        src={goalieDetail.teamLogoDark}
                                                        alt={`${resolveTeamName(goalieDetail.team)} logo (dark)`}
                                                        className="h-8 w-8 object-contain"
                                                        loading="lazy"
                                                    />
                                                </span>
                                            )}
                                        </div>
                                    )}
                                        <div>
                                            <Link
                                                href={buildPlayerLink(goalieDetail)}
                                                className="text-lg font-semibold text-gray-900 transition hover:text-indigo-600"
                                            >
                                                {goalieDetail.name}
                                            </Link>
                                            <p className="text-xs text-gray-500">
                                                {resolveTeamName(goalieDetail.team)} | G
                                            </p>
                                        </div>
                                    </div>
                                    {goalieEdgeSeasons.length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                                Edge seasons available
                                            </p>
                                            <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                                {goalieEdgeSeasons.map((season) => (
                                                    <span
                                                        key={season}
                                                        className="rounded-full bg-gray-100 px-3 py-1 text-gray-600"
                                                    >
                                                        {season}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {goalieDetail.metrics.length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                                Goalie metrics
                                            </p>
                                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                                {goalieDetail.metrics.map((metric) => (
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
                                    {goalieStatEntries.length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                                Goalie tracking
                                            </p>
                                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
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
                                                            <th className="pb-3 text-right">Saves pctile</th>
                                                            <th className="pb-3 text-right">SV%</th>
                                                            <th className="pb-3 text-right">SV% pctile</th>
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
                                                                    {formatEdgePercent(entry.savesPercentile)}
                                                                </td>
                                                                <td className="py-3 text-right text-gray-500">
                                                                    {formatEdgePercent(entry.savePct)}
                                                                </td>
                                                                <td className="py-3 text-right text-gray-500">
                                                                    {formatEdgePercent(
                                                                        entry.savePctPercentile,
                                                                    )}
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
                    </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-2">
                    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                Draft outlook
                            </p>
                            <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                                Lowest points
                            </h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {draftOutlook.map((team) => {
                                const recordLabel = formatTeamRecord(team);
                                const metaLabel = formatStandingsMeta(team);
                                return (
                                    <div
                                        key={team.id}
                                        className="flex items-center justify-between px-6 py-3 text-sm"
                                    >
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {team.name || team.abbrev}
                                            </p>
                                            {recordLabel && (
                                                <p className="text-xs text-gray-500">
                                                    Record {recordLabel}
                                                </p>
                                            )}
                                            {metaLabel && (
                                                <p className="text-[10px] text-gray-400">
                                                    {metaLabel}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right text-xs text-gray-500">
                                            <p>PTS {team.points ?? '--'}</p>
                                            {team.goalDifferential !== null &&
                                                team.goalDifferential !==
                                                    undefined && (
                                                    <p>
                                                        GD{' '}
                                                        {team.goalDifferential}
                                                    </p>
                                                )}
                                        </div>
                                    </div>
                                );
                            })}
                            {!draftOutlook.length && (
                                <p className="px-6 py-4 text-sm text-gray-600">
                                    Draft outlook data is unavailable.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                Strength of schedule
                            </p>
                            <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                                Upcoming game load
                            </h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {strengthOfSchedule.map((row) => (
                                <div
                                    key={row.team}
                                    className="flex items-center justify-between px-6 py-3 text-sm"
                                >
                                    <span className="font-semibold text-gray-900">
                                        {row.team}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {row.games} games
                                    </span>
                                </div>
                            ))}
                            {!strengthOfSchedule.length && (
                                <p className="px-6 py-4 text-sm text-gray-600">
                                    Strength of schedule data is unavailable.
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-2">
                    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                Rest tracker
                            </p>
                            <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                                Next game timing
                            </h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {restTracker.map((entry) => (
                                <div
                                    key={entry.team}
                                    className="flex items-center justify-between px-6 py-3 text-sm"
                                >
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {entry.team}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {normalizeDate(
                                                entry.nextGame.toISOString(),
                                            )}{' '}
                                            ·{' '}
                                            {normalizeTime(
                                                entry.nextGame.toISOString(),
                                            )}
                                        </p>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {entry.hoursUntil.toFixed(1)}h
                                    </span>
                                </div>
                            ))}
                            {!restTracker.length && (
                                <p className="px-6 py-4 text-sm text-gray-600">
                                    Rest tracker data is unavailable.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                Injury report
                            </p>
                            <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                                Data source needed
                            </h2>
                        </div>
                        <div className="px-6 py-5 text-sm text-gray-600">
                            NHL Edge does not expose injuries. Provide a source
                            and I can connect it here.
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-2">
                    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                Playoffs bracket
                            </p>
                            <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                                Top eight
                            </h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {playoffsBracket.map((team, index) => {
                                const recordLabel = formatTeamRecord(team);
                                const metaLabel = formatStandingsMeta(team);
                                return (
                                    <div
                                        key={team.id}
                                        className="flex items-center justify-between px-6 py-3 text-sm"
                                    >
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {index + 1}.{' '}
                                                {team.name || team.abbrev}
                                            </p>
                                            {recordLabel && (
                                                <p className="text-xs text-gray-500">
                                                    Record {recordLabel}
                                                </p>
                                            )}
                                            {metaLabel && (
                                                <p className="text-[10px] text-gray-400">
                                                    {metaLabel}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right text-xs text-gray-500">
                                            <p>PTS {team.points ?? '--'}</p>
                                            {team.goalDifferential !== null &&
                                                team.goalDifferential !==
                                                    undefined && (
                                                    <p>
                                                        GD{' '}
                                                        {team.goalDifferential}
                                                    </p>
                                                )}
                                        </div>
                                    </div>
                                );
                            })}
                            {!playoffsBracket.length && (
                                <p className="px-6 py-4 text-sm text-gray-600">
                                    Playoffs bracket data is unavailable.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                Team matchup
                            </p>
                            <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                                Next slate
                            </h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {matchupDay?.games?.length ? (
                                matchupDay.games.slice(0, 6).map((game) => {
                                    const metaLabel = formatGameMeta(game);
                                    const linkItems = getGameLinks(game);
                                    return (
                                        <div
                                            key={game.id}
                                            className="flex items-center justify-between px-6 py-3 text-sm"
                                        >
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {game.away.name ||
                                                        game.away.abbrev}
                                                    <span className="text-xs text-gray-500">
                                                        {' '}
                                                        @{' '}
                                                    </span>
                                                    {game.home.name ||
                                                        game.home.abbrev}
                                                </p>
                                                {metaLabel && (
                                                    <p className="text-xs text-gray-500">
                                                        {metaLabel}
                                                    </p>
                                                )}
                                                {linkItems.length > 0 && (
                                                    <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-indigo-600">
                                                        {linkItems.map((link) => (
                                                            <a
                                                                key={link.label}
                                                                href={link.url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="rounded-full bg-indigo-50 px-2 py-0.5 transition hover:bg-indigo-100"
                                                            >
                                                                {link.label}
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                {normalizeTime(
                                                    game.startTime,
                                                )}
                                            </span>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="px-6 py-4 text-sm text-gray-600">
                                    Matchup data is unavailable.
                                </p>
                            )}
                        </div>
                    </div>
                </section>
            </LabLayout>
        </>
    );
}
