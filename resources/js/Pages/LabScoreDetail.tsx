import { Head, Link, usePage } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import LabLayout from '@/Layouts/LabLayout';
import {
    fetchNhl,
    normalizeDate,
    normalizeTime,
    parseBoxscore,
    parseOddsPartners,
    parsePlayByPlay,
    parsePlayByPlayMeta,
    parseRightRail,
    parseSchedule,
    parseScoreGoals,
    parseStandings,
    parseScoreboard,
} from '@/lib/nhl';
import { getTeamColor } from '@/lib/teamColors';

type PageProps = {
    gameId: string;
};

const GAME_TYPE_LABELS: Record<number, string> = {
    1: 'Preseason',
    2: 'Regular season',
    3: 'Playoffs',
};

const normalizeDateKey = (value: string) => {
    if (!value) {
        return '';
    }
    const trimmed = value.trim();
    if (trimmed.includes('T')) {
        return trimmed.split('T')[0];
    }
    if (/^\d{8}$/.test(trimmed)) {
        return `${trimmed.slice(0, 4)}-${trimmed.slice(4, 6)}-${trimmed.slice(6, 8)}`;
    }
    const match = trimmed.match(/^\d{4}-\d{2}-\d{2}/);
    if (match) {
        return match[0];
    }
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
        return parsed.toISOString().slice(0, 10);
    }
    return trimmed;
};

const normalizeStrengthLabel = (value?: string) => {
    const normalized = value?.trim().toLowerCase() ?? '';
    if (!normalized) {
        return 'EV';
    }
    if (normalized.includes('even') || normalized === 'ev') {
        return 'EV';
    }
    if (normalized.includes('power') || normalized.includes('pp')) {
        return 'PP';
    }
    if (normalized.includes('short') || normalized.includes('sh')) {
        return 'SH';
    }
    if (normalized.includes('shoot') || normalized.includes('so')) {
        return 'SO';
    }
    if (normalized.includes('ot')) {
        return 'OT';
    }
    return normalized.toUpperCase();
};

const formatZoneLabel = (value?: string) => {
    const normalized = value?.trim().toUpperCase() ?? '';
    if (normalized === 'O') {
        return 'Offensive';
    }
    if (normalized === 'D') {
        return 'Defensive';
    }
    if (normalized === 'N') {
        return 'Neutral';
    }
    return normalized || 'Other';
};

export default function LabScoreDetail() {
    const { props } = usePage<PageProps>();
    const gameId = props.gameId;
    const [selectedPeriod, setSelectedPeriod] = useState<number | 'all'>('all');
    const [eventFilter, setEventFilter] = useState<
        'All' | 'Goal' | 'Penalty' | 'Shot'
    >('All');
    const [showAllEvents, setShowAllEvents] = useState(true);
    const formatNumber = (value?: number | null, digits = 0) => {
        if (value === null || value === undefined) {
            return '--';
        }
        return digits > 0 ? value.toFixed(digits) : String(value);
    };
    const formatPlusMinus = (value?: number | null) => {
        if (value === null || value === undefined) {
            return '--';
        }
        return value > 0 ? `+${value}` : String(value);
    };
    const formatPct = (value?: number | null) => {
        if (value === null || value === undefined) {
            return '--';
        }
        const normalized = value > 1 ? value : value * 100;
        return `${normalized.toFixed(1)}%`;
    };

    const boxscoreQuery = useQuery({
        queryKey: ['nhl', 'boxscore', gameId],
        queryFn: () => fetchNhl(`gamecenter/${gameId}/boxscore`),
        enabled: Boolean(gameId),
        staleTime: 15_000,
    });
    const playByPlayQuery = useQuery({
        queryKey: ['nhl', 'play-by-play', gameId],
        queryFn: () => fetchNhl(`gamecenter/${gameId}/play-by-play`),
        enabled: Boolean(gameId),
        staleTime: 15_000,
    });
    const standingsQuery = useQuery({
        queryKey: ['nhl', 'standings'],
        queryFn: () => fetchNhl('standings'),
        staleTime: 60_000,
    });

    const boxscore = useMemo(
        () => parseBoxscore(boxscoreQuery.data ?? {}),
        [boxscoreQuery.data],
    );
    const playByPlay = useMemo(
        () => parsePlayByPlay(playByPlayQuery.data ?? {}),
        [playByPlayQuery.data],
    );
    const playByPlayMeta = useMemo(
        () => parsePlayByPlayMeta(playByPlayQuery.data ?? {}),
        [playByPlayQuery.data],
    );
    const standings = useMemo(
        () => parseStandings(standingsQuery.data ?? {}),
        [standingsQuery.data],
    );
    const gameDateKey = useMemo(
        () => normalizeDateKey(boxscore?.gameDate ?? boxscore?.startTime ?? ''),
        [boxscore?.gameDate, boxscore?.startTime],
    );
    const scoreboardQuery = useQuery({
        queryKey: ['nhl', 'scoreboard', gameDateKey || 'now'],
        queryFn: () =>
            fetchNhl(
                gameDateKey
                    ? `scoreboard?date=${gameDateKey}`
                    : 'scoreboard',
            ),
        enabled: Boolean(gameId),
        staleTime: 15_000,
    });
    const rightRailQuery = useQuery({
        queryKey: ['nhl', 'right-rail', gameId],
        queryFn: () => fetchNhl(`gamecenter/${gameId}/right-rail`),
        enabled: Boolean(gameId),
        staleTime: 15_000,
    });
    const scheduleQuery = useQuery({
        queryKey: ['nhl', 'schedule', gameDateKey],
        queryFn: () => fetchNhl(`schedule?date=${gameDateKey}`),
        enabled: Boolean(gameDateKey),
        staleTime: 60_000,
    });
    const scoreboard = useMemo(
        () => parseScoreboard(scoreboardQuery.data ?? {}),
        [scoreboardQuery.data],
    );
    const rightRail = useMemo(
        () => parseRightRail(rightRailQuery.data ?? {}),
        [rightRailQuery.data],
    );
    const schedule = useMemo(
        () => parseSchedule(scheduleQuery.data ?? {}),
        [scheduleQuery.data],
    );
    const oddsPartners = useMemo(
        () => parseOddsPartners(scoreboardQuery.data ?? {}),
        [scoreboardQuery.data],
    );
    const scoreboardEntry = scoreboard.get(gameId);
    const teamMeta = useMemo(() => {
        const map = new Map<
            string,
            {
                name: string;
                abbrev?: string;
                logo?: string;
            }
        >();
        standings.forEach((row) => {
            const key = row.abbrev?.toUpperCase();
            if (!key) {
                return;
            }
            map.set(key, {
                name: row.name,
                abbrev: row.abbrev,
                logo: row.logo,
            });
        });
        return map;
    }, [standings]);
    const scheduleGame = useMemo(() => {
        if (!schedule.length) {
            return undefined;
        }
        for (const day of schedule) {
            const directMatch = day.games.find(
                (game) => game.id === gameId,
            );
            if (directMatch) {
                return directMatch;
            }
        }
        const awayAbbrev = boxscore?.away.abbrev?.toUpperCase();
        const homeAbbrev = boxscore?.home.abbrev?.toUpperCase();
        const startTime = boxscore?.startTime;
        if (!awayAbbrev || !homeAbbrev || !startTime) {
            return undefined;
        }
        return schedule
            .flatMap((day) => day.games)
            .find(
                (game) =>
                    game.away.abbrev?.toUpperCase() === awayAbbrev &&
                    game.home.abbrev?.toUpperCase() === homeAbbrev &&
                    game.startTime === startTime,
            );
    }, [
        boxscore?.away.abbrev,
        boxscore?.home.abbrev,
        boxscore?.startTime,
        gameId,
        schedule,
    ]);
    const awayAbbrev =
        boxscore?.away.abbrev ?? scheduleGame?.away.abbrev ?? '';
    const homeAbbrev =
        boxscore?.home.abbrev ?? scheduleGame?.home.abbrev ?? '';
    const awayColor = getTeamColor(awayAbbrev);
    const homeColor = getTeamColor(homeAbbrev);
    const gameTypeLabel =
        scheduleGame?.gameTypeId !== null &&
        scheduleGame?.gameTypeId !== undefined
            ? GAME_TYPE_LABELS[scheduleGame.gameTypeId]
            : null;
    const statusFlag = scheduleGame?.statusFlags?.postponed
        ? 'Postponed'
        : scheduleGame?.statusFlags?.tbd
          ? 'TBD'
          : null;
    const eventFlag = scheduleGame?.eventFlags?.specialEvent
        ? scheduleGame.eventFlags.specialEvent
        : scheduleGame?.eventFlags?.neutralSite
          ? 'Neutral site'
          : null;
    const boxscoreSeason =
        boxscore?.season !== null && boxscore?.season !== undefined
            ? String(boxscore.season)
            : null;
    const boxscoreGameTypeLabel =
        boxscore?.gameType !== null && boxscore?.gameType !== undefined
            ? GAME_TYPE_LABELS[boxscore.gameType] ??
              `Type ${boxscore.gameType}`
            : null;
    const limitedScoringLabel =
        boxscore?.limitedScoring !== undefined
            ? boxscore.limitedScoring
                ? 'Yes'
                : 'No'
            : null;
    const gameScheduleState = boxscore?.gameScheduleState ?? null;
    const easternUtcOffsetLine =
        boxscore?.easternUTCOffset !== null &&
        boxscore?.easternUTCOffset !== undefined
            ? `UTC${boxscore.easternUTCOffset >= 0 ? '+' : ''}${boxscore.easternUTCOffset}`
            : null;
    const venueUtcOffsetLine =
        boxscore?.venueUTCOffset !== null &&
        boxscore?.venueUTCOffset !== undefined
            ? `UTC${boxscore.venueUTCOffset >= 0 ? '+' : ''}${boxscore.venueUTCOffset}`
            : null;
    const venueDetail = scheduleGame?.venueDetail ?? null;
    const playByPlayVenue = playByPlayMeta.venue ?? null;
    const broadcastGroups = scheduleGame?.broadcastGroups;
    const tvBroadcasts = broadcastGroups?.tv ?? [];
    const radioBroadcasts = broadcastGroups?.radio ?? [];
    const broadcastLabel = scheduleGame?.broadcasts?.length
        ? scheduleGame.broadcasts.join(' | ')
        : '';
    const tvLabel = tvBroadcasts.length
        ? `TV: ${tvBroadcasts.join(' | ')}`
        : '';
    const radioLabel = radioBroadcasts.length
        ? `Radio: ${radioBroadcasts.join(' | ')}`
        : '';
    const broadcastSummary = [tvLabel, radioLabel, broadcastLabel]
        .filter(Boolean)
        .join(' | ');
    const broadcastDetails = scheduleGame?.broadcastDetails ?? [];
    const scoreboardLinks = scoreboardEntry?.links;
    const scoreboardTvBroadcasts = scoreboardEntry?.tvBroadcasts ?? [];
    const scoreboardNeutralSite = scoreboardEntry?.neutralSite;
    const scoreboardVenueTimezone = scoreboardEntry?.venueTimezone ?? null;
    const boxscoreBroadcasts = boxscore?.tvBroadcasts ?? [];
    const fallbackBroadcastSummary =
        !broadcastSummary && boxscoreBroadcasts.length
            ? `TV (boxscore): ${boxscoreBroadcasts.join(' | ')}`
            : '';
    const scoreboardBroadcastSummary =
        !broadcastSummary &&
        !fallbackBroadcastSummary &&
        scoreboardTvBroadcasts.length
            ? `TV (scoreboard): ${scoreboardTvBroadcasts.join(' | ')}`
            : '';
    const playByPlayBroadcasts = playByPlayMeta.tvBroadcasts ?? [];
    const playByPlayBroadcastSummary =
        !broadcastSummary &&
        !fallbackBroadcastSummary &&
        !scoreboardBroadcastSummary &&
        playByPlayBroadcasts.length
            ? `TV (play-by-play): ${playByPlayBroadcasts.join(' | ')}`
            : '';
    const playByPlayStatusLine =
        !boxscore?.status && !gameScheduleState
            ? [playByPlayMeta.gameState, playByPlayMeta.gameScheduleState]
                  .filter(Boolean)
                  .join(' | ')
            : '';
    const clockLine = boxscore?.clock?.timeRemaining
        ? `${boxscore.clock.timeRemaining}${
              boxscore.clock.running === undefined
                  ? ''
                  : boxscore.clock.running
                    ? ' (running)'
                    : ' (stopped)'
          }${
              boxscore.clock.inIntermission
                  ? ' - Intermission'
                  : ''
          }`
        : '';
    const periodLine =
        boxscore?.periodDescriptor?.number !== null &&
        boxscore?.periodDescriptor?.number !== undefined
            ? `P${boxscore.periodDescriptor.number}${
                  boxscore.periodDescriptor.periodType
                      ? ` ${boxscore.periodDescriptor.periodType}`
                      : ''
              }`
            : '';
    const maxPeriodsLine =
        boxscore?.periodDescriptor?.maxRegulationPeriods !== null &&
        boxscore?.periodDescriptor?.maxRegulationPeriods !== undefined
            ? `Regulation: ${boxscore.periodDescriptor.maxRegulationPeriods}`
            : '';
    const outcomeLine = boxscore?.gameOutcome?.lastPeriodType
        ? boxscore.gameOutcome.lastPeriodType
        : '';
    const neutralSiteLine = !eventFlag && scoreboardNeutralSite
        ? 'Yes'
        : '';
    const venueTimezoneLine = scoreboardVenueTimezone ?? '';
    const scoreboardLiveLine = (() => {
        const live = scoreboardEntry?.live;
        if (!live) {
            return '';
        }
        if (live.inIntermission) {
            const label = live.intermissionLabel
                ? `Intermission (${live.intermissionLabel})`
                : 'Intermission';
            const time = live.intermissionTimeRemaining ?? live.clock ?? '';
            return time ? `${label} - ${time}` : label;
        }
        if (live.period !== null && live.period !== undefined) {
            const periodType = live.periodType ? ` ${live.periodType}` : '';
            const clock = live.clock ? ` - ${live.clock}` : '';
            return `P${live.period}${periodType}${clock}`;
        }
        return live.clock ?? '';
    })();
    const playByPlayLineParts = [
        playByPlayMeta.otInUse ? 'OT in use' : null,
        playByPlayMeta.shootoutInUse ? 'Shootout in use' : null,
        playByPlayMeta.tiesInUse ? 'Ties in use' : null,
        playByPlayMeta.displayPeriod !== null &&
        playByPlayMeta.displayPeriod !== undefined
            ? `Display period: ${playByPlayMeta.displayPeriod}`
            : null,
        playByPlayMeta.maxPeriods !== null &&
        playByPlayMeta.maxPeriods !== undefined
            ? `Max periods: ${playByPlayMeta.maxPeriods}`
            : null,
    ].filter(Boolean);
    const linkItems = [
        {
            label: 'Gamecenter',
            url: scheduleGame?.links?.gamecenter ?? scoreboardLinks?.gamecenter,
        },
        {
            label: 'Recap',
            url: scheduleGame?.links?.recap ?? scoreboardLinks?.recap,
        },
        {
            label: '3-min recap',
            url:
                scheduleGame?.links?.threeMinRecap ??
                scoreboardLinks?.threeMinRecap,
        },
        {
            label: '3-min recap (FR)',
            url:
                scheduleGame?.links?.threeMinRecapFr ??
                scoreboardLinks?.threeMinRecapFr,
        },
        {
            label: 'Condensed game',
            url:
                scheduleGame?.links?.condensedGame ??
                scoreboardLinks?.condensedGame,
        },
        {
            label: 'Condensed game (FR)',
            url:
                scheduleGame?.links?.condensedGameFr ??
                scoreboardLinks?.condensedGameFr,
        },
        {
            label: 'Tickets',
            url: scheduleGame?.links?.tickets ?? scoreboardLinks?.tickets,
        },
    ].filter(
        (
            link,
        ): link is {
            label: string;
            url: string;
        } => typeof link.url === 'string' && link.url.length > 0,
    );
    const playByPlayStats = useMemo(() => {
        if (!playByPlay.length) {
            return null;
        }
        const awayKey = awayAbbrev;
        const homeKey = homeAbbrev;
        const totals = new Map<
            string,
            {
                shotsOnGoal: number;
                shotAttempts: number;
                missedShots: number;
                hits: number;
                blocks: number;
                faceoffWins: number;
                giveaways: number;
                takeaways: number;
                pim: number;
                penalties: number;
                faceoffWinPct?: number;
            }
        >();
        const ensure = (team: string | undefined) => {
            if (!team) {
                return null;
            }
            const key = team.toUpperCase();
            if (!totals.has(key)) {
                totals.set(key, {
                    shotsOnGoal: 0,
                    shotAttempts: 0,
                    missedShots: 0,
                    hits: 0,
                    blocks: 0,
                    faceoffWins: 0,
                    giveaways: 0,
                    takeaways: 0,
                    pim: 0,
                    penalties: 0,
                });
            }
            return totals.get(key) ?? null;
        };
        const add = (
            team: string | undefined,
            key:
                | 'shotsOnGoal'
                | 'shotAttempts'
                | 'missedShots'
                | 'hits'
                | 'blocks'
                | 'faceoffWins'
                | 'giveaways'
                | 'takeaways'
                | 'pim'
                | 'penalties',
            value = 1,
        ) => {
            const entry = ensure(team);
            if (!entry) {
                return;
            }
            entry[key] += value;
        };

        let totalFaceoffs = 0;
        playByPlay.forEach((event) => {
            const type = (event.type ?? '').toLowerCase();
            const team = event.team;
            if (!type || !team) {
                return;
            }
            if (type === 'shot-on-goal') {
                add(team, 'shotsOnGoal');
                add(team, 'shotAttempts');
            } else if (type === 'goal') {
                add(team, 'shotsOnGoal');
                add(team, 'shotAttempts');
            } else if (type === 'missed-shot') {
                add(team, 'missedShots');
                add(team, 'shotAttempts');
            } else if (type === 'blocked-shot') {
                add(team, 'shotAttempts');
                if (event.blockedByTeam) {
                    add(event.blockedByTeam, 'blocks');
                }
            } else if (type === 'hit') {
                add(team, 'hits');
            } else if (type === 'faceoff') {
                add(team, 'faceoffWins');
                totalFaceoffs += 1;
            } else if (type === 'giveaway') {
                add(team, 'giveaways');
            } else if (type === 'takeaway') {
                add(team, 'takeaways');
            } else if (type === 'shot-on-goal' || type === 'goal') {
            } else if (type === 'penalty') {
                const minutes =
                    event.penaltyMinutes !== null &&
                    event.penaltyMinutes !== undefined
                        ? event.penaltyMinutes
                        : 0;
                add(team, 'pim', minutes);
                add(team, 'penalties');
            }
        });

        if (totalFaceoffs > 0) {
            totals.forEach((value) => {
                value.faceoffWinPct = (value.faceoffWins / totalFaceoffs) * 100;
            });
        }

        const away = ensure(awayKey);
        const home = ensure(homeKey);
        if (!away && !home) {
            return null;
        }
        return {
            away,
            home,
        };
    }, [
        awayAbbrev,
        homeAbbrev,
        playByPlay,
    ]);
    const availablePeriods = useMemo(() => {
        const periods = new Set<number>();
        playByPlay.forEach((event) => {
            if (event.period !== null && event.period !== undefined) {
                periods.add(event.period);
            }
        });
        return Array.from(periods).sort((a, b) => a - b);
    }, [playByPlay]);
    const filteredEvents = useMemo(() => {
        return playByPlay.filter((event) => {
            if (
                selectedPeriod !== 'all' &&
                event.period !== selectedPeriod
            ) {
                return false;
            }
            if (eventFilter === 'All') {
                return true;
            }
            return event.category === eventFilter;
        });
    }, [eventFilter, playByPlay, selectedPeriod]);
    const eventsToShow = useMemo(() => {
        const ordered = [...filteredEvents];
        const slice = showAllEvents ? ordered : ordered.slice(-10);
        return slice.reverse();
    }, [filteredEvents, showAllEvents]);
    const statsRows = useMemo(() => {
        const baseRows = boxscore?.stats ?? [];
        const rows = [...baseRows];
        const byLabel = new Map(rows.map((row) => [row.label, row]));
        const formatValue = (value?: number | null) =>
            value === null || value === undefined ? '--' : String(value);
        const formatPercent = (value?: number | null) => {
            if (value === null || value === undefined) {
                return null;
            }
            return Math.round(value * 10) / 10;
        };
        const addRow = (label: string, away?: number | null, home?: number | null) => {
            if (away === null && home === null) {
                return;
            }
            const awayValue = formatValue(away);
            const homeValue = formatValue(home);
            if (awayValue === '--' && homeValue === '--') {
                return;
            }
            const existing = byLabel.get(label);
            const nextRow = { label, away: awayValue, home: homeValue };
            if (existing) {
                if (existing.away === '--' && existing.home === '--') {
                    const index = rows.indexOf(existing);
                    if (index >= 0) {
                        rows[index] = nextRow;
                    }
                    byLabel.set(label, nextRow);
                }
                return;
            }
            rows.push(nextRow);
            byLabel.set(label, nextRow);
        };

        if (playByPlayStats) {
            addRow(
                'Shots',
                playByPlayStats.away?.shotsOnGoal ?? null,
                playByPlayStats.home?.shotsOnGoal ?? null,
            );
            addRow(
                'Shot Attempts',
                playByPlayStats.away?.shotAttempts ?? null,
                playByPlayStats.home?.shotAttempts ?? null,
            );
            addRow(
                'Missed Shots',
                playByPlayStats.away?.missedShots ?? null,
                playByPlayStats.home?.missedShots ?? null,
            );
            addRow(
                'Hits',
                playByPlayStats.away?.hits ?? null,
                playByPlayStats.home?.hits ?? null,
            );
            addRow(
                'Blocked Shots',
                playByPlayStats.away?.blocks ?? null,
                playByPlayStats.home?.blocks ?? null,
            );
            addRow(
                'Faceoff Wins',
                playByPlayStats.away?.faceoffWins ?? null,
                playByPlayStats.home?.faceoffWins ?? null,
            );
            addRow(
                'Faceoff Win %',
                formatPercent(playByPlayStats.away?.faceoffWinPct ?? null),
                formatPercent(playByPlayStats.home?.faceoffWinPct ?? null),
            );
            addRow(
                'Giveaways',
                playByPlayStats.away?.giveaways ?? null,
                playByPlayStats.home?.giveaways ?? null,
            );
            addRow(
                'Takeaways',
                playByPlayStats.away?.takeaways ?? null,
                playByPlayStats.home?.takeaways ?? null,
            );
            addRow(
                'Penalties',
                playByPlayStats.away?.penalties ?? null,
                playByPlayStats.home?.penalties ?? null,
            );
            addRow(
                'PIM',
                playByPlayStats.away?.pim ?? null,
                playByPlayStats.home?.pim ?? null,
            );
        }

        return rows;
    }, [boxscore?.stats, playByPlayStats]);
    const scoreGoals = useMemo(
        () => parseScoreGoals(scoreboardQuery.data ?? {}, gameId),
        [gameId, scoreboardQuery.data],
    );
    const resolvePeriodLabels = (
        period: number | null | undefined,
        periodType?: string,
        maxRegulationPeriods?: number | null,
    ) => {
        const resolvedPeriod = period ?? null;
        const normalizedType = (periodType ?? '').toUpperCase();
        const resolvedMax =
            maxRegulationPeriods ??
            boxscore?.periodDescriptor?.maxRegulationPeriods ??
            3;
        if (
            normalizedType.includes('SO') ||
            normalizedType.includes('SHOOT')
        ) {
            const sortKey = resolvedPeriod ?? resolvedMax + 1;
            return {
                groupLabel: 'SO',
                shortLabel: 'SO',
                sortKey,
            };
        }
        const isOvertime =
            normalizedType.includes('OT') ||
            normalizedType.includes('OVER') ||
            (!normalizedType &&
                resolvedPeriod !== null &&
                resolvedMax !== null &&
                resolvedPeriod > resolvedMax);
        if (isOvertime) {
            const otNumber =
                resolvedPeriod !== null && resolvedMax !== null
                    ? resolvedPeriod - resolvedMax
                    : null;
            const otLabel =
                otNumber && otNumber > 1 ? `OT${otNumber}` : 'OT';
            const sortKey = resolvedPeriod ?? resolvedMax + 1;
            return {
                groupLabel: otLabel,
                shortLabel: otLabel,
                sortKey,
            };
        }
        if (resolvedPeriod !== null) {
            return {
                groupLabel: `Period ${resolvedPeriod}`,
                shortLabel: `P${resolvedPeriod}`,
                sortKey: resolvedPeriod,
            };
        }
        return {
            groupLabel: 'Scoring',
            shortLabel: 'Scoring',
            sortKey: 99,
        };
    };
    const playByPlayGoals = useMemo(
        () =>
            playByPlay
                .filter((event) => {
                    const type = (event.type ?? '').toLowerCase();
                    return event.category === 'Goal' || type === 'goal';
                })
                .map((event, index) => {
                    const scorerPlayer = event.players?.find((player) =>
                        player.type
                            ? /scorer|goal/i.test(player.type)
                            : false,
                    );
                    const assistPlayers =
                        event.players?.filter((player) =>
                            player.type
                                ? /assist/i.test(player.type)
                                : false,
                        ) ?? [];
                    return {
                        id: event.id ?? String(index),
                        period: event.period ?? null,
                        time: event.time,
                        team: event.team,
                        strength: event.strength,
                        goalType: undefined,
                        score: event.score ?? null,
                        description: event.description ?? 'Goal',
                        videoUrl: event.videoUrl,
                        scorer: scorerPlayer
                            ? { name: scorerPlayer.name }
                            : undefined,
                        assists: assistPlayers.length
                            ? assistPlayers.map((player) => ({
                                  name: player.name,
                              }))
                            : undefined,
                    };
                }),
        [playByPlay],
    );
    const scoringSummary = useMemo(
        () =>
            boxscore?.scoringSummary?.length
                ? boxscore.scoringSummary
                : scoreGoals.length
                  ? scoreGoals
                  : playByPlayGoals,
        [boxscore?.scoringSummary, playByPlayGoals, scoreGoals],
    );
    const scoringByPeriod = useMemo(() => {
        const parseTimeSeconds = (value?: string) => {
            if (!value) {
                return null;
            }
            const parts = value.split(':').map((part) => Number(part));
            if (parts.length !== 2 || parts.some((part) => Number.isNaN(part))) {
                return null;
            }
            return parts[0] * 60 + parts[1];
        };
        const sorted = [...scoringSummary].sort((a, b) => {
            const aPeriod = a.period ?? 0;
            const bPeriod = b.period ?? 0;
            if (aPeriod !== bPeriod) {
                return aPeriod - bPeriod;
            }
            const aTime = parseTimeSeconds(a.time);
            const bTime = parseTimeSeconds(b.time);
            if (aTime !== null && bTime !== null) {
                return aTime - bTime;
            }
            if (aTime !== null) {
                return -1;
            }
            if (bTime !== null) {
                return 1;
            }
            return 0;
        });
        const groups = new Map<string, typeof sorted>();
        sorted.forEach((item) => {
            const labels = resolvePeriodLabels(
                item.period,
                item.periodType,
                item.maxRegulationPeriods,
            );
            const key = labels.groupLabel || 'Scoring';
            const list = groups.get(key) ?? [];
            list.push(item);
            groups.set(key, list);
        });
        return Array.from(groups.entries()).map(([label, items]) => ({
            label,
            items,
        }));
    }, [resolvePeriodLabels, scoringSummary]);
    const goalsByPeriod = useMemo(() => {
        if (!scoringSummary.length) {
            return [];
        }
        const totals = new Map<
            string,
            { label: string; sortKey: number; away: number; home: number }
        >();
        scoringSummary.forEach((item) => {
            const period = item.period ?? null;
            if (period === null) {
                return;
            }
            const team = item.team?.toUpperCase();
            if (!team) {
                return;
            }
            const labels = resolvePeriodLabels(
                period,
                item.periodType,
                item.maxRegulationPeriods,
            );
            const entry = totals.get(labels.shortLabel) ?? {
                label: labels.shortLabel,
                sortKey: labels.sortKey,
                away: 0,
                home: 0,
            };
            if (team === awayAbbrev.toUpperCase()) {
                entry.away += 1;
            } else if (team === homeAbbrev.toUpperCase()) {
                entry.home += 1;
            }
            totals.set(labels.shortLabel, entry);
        });
        return Array.from(totals.values())
            .sort((a, b) => a.sortKey - b.sortKey)
            .map((entry) => ({
                label: entry.label,
                away: entry.away,
                home: entry.home,
            }));
    }, [awayAbbrev, homeAbbrev, resolvePeriodLabels, scoringSummary]);
    const strengthBreakdown = useMemo(() => {
        if (!scoringSummary.length) {
            return [];
        }
        const totals = new Map<string, { away: number; home: number }>();
        scoringSummary.forEach((item) => {
            const team = item.team?.toUpperCase();
            if (!team) {
                return;
            }
            const strength = normalizeStrengthLabel(item.strength);
            const entry = totals.get(strength) ?? { away: 0, home: 0 };
            if (team === awayAbbrev.toUpperCase()) {
                entry.away += 1;
            } else if (team === homeAbbrev.toUpperCase()) {
                entry.home += 1;
            }
            totals.set(strength, entry);
        });
        const order = ['EV', 'PP', 'SH', 'OT', 'SO'];
        return Array.from(totals.entries())
            .sort(([a], [b]) => {
                const aIndex = order.indexOf(a);
                const bIndex = order.indexOf(b);
                if (aIndex === -1 && bIndex === -1) {
                    return a.localeCompare(b);
                }
                if (aIndex === -1) {
                    return 1;
                }
                if (bIndex === -1) {
                    return -1;
                }
                return aIndex - bIndex;
            })
            .map(([label, value]) => ({
                label,
                away: value.away,
                home: value.home,
            }));
    }, [awayAbbrev, homeAbbrev, scoringSummary]);
    const specialTeamsRows = useMemo(() => {
        const penaltyTotals = {
            away: { minutes: 0, penalties: 0 },
            home: { minutes: 0, penalties: 0 },
        };
        playByPlay.forEach((event) => {
            if ((event.type ?? '').toLowerCase() !== 'penalty') {
                return;
            }
            const team = event.team?.toUpperCase();
            if (!team) {
                return;
            }
            const minutes =
                event.penaltyMinutes !== null &&
                event.penaltyMinutes !== undefined
                    ? event.penaltyMinutes
                    : 0;
            if (team === awayAbbrev.toUpperCase()) {
                penaltyTotals.away.minutes += minutes;
                penaltyTotals.away.penalties += 1;
            } else if (team === homeAbbrev.toUpperCase()) {
                penaltyTotals.home.minutes += minutes;
                penaltyTotals.home.penalties += 1;
            }
        });
        const ppGoals = { away: 0, home: 0 };
        const shGoals = { away: 0, home: 0 };
        scoringSummary.forEach((item) => {
            const team = item.team?.toUpperCase();
            if (!team) {
                return;
            }
            const strength = normalizeStrengthLabel(item.strength);
            if (strength === 'PP') {
                if (team === awayAbbrev.toUpperCase()) {
                    ppGoals.away += 1;
                } else if (team === homeAbbrev.toUpperCase()) {
                    ppGoals.home += 1;
                }
            }
            if (strength === 'SH') {
                if (team === awayAbbrev.toUpperCase()) {
                    shGoals.away += 1;
                } else if (team === homeAbbrev.toUpperCase()) {
                    shGoals.home += 1;
                }
            }
        });
        return [
            {
                label: 'Power-play goals',
                away: ppGoals.away,
                home: ppGoals.home,
            },
            {
                label: 'Short-handed goals',
                away: shGoals.away,
                home: shGoals.home,
            },
            {
                label: 'PP chances (est.)',
                away: penaltyTotals.home.penalties,
                home: penaltyTotals.away.penalties,
            },
            {
                label: 'PP minutes (est.)',
                away: penaltyTotals.home.minutes,
                home: penaltyTotals.away.minutes,
            },
            {
                label: 'PK minutes (est.)',
                away: penaltyTotals.away.minutes,
                home: penaltyTotals.home.minutes,
            },
        ];
    }, [awayAbbrev, homeAbbrev, playByPlay, scoringSummary]);
    const shotEvents = useMemo(() => {
        return playByPlay.filter((event) => {
            const type = (event.type ?? '').toLowerCase();
            return (
                type === 'shot-on-goal' ||
                type === 'goal' ||
                type === 'missed-shot' ||
                type === 'blocked-shot'
            );
        });
    }, [playByPlay]);
    const shotZoneRows = useMemo(() => {
        if (!shotEvents.length) {
            return [];
        }
        const totals = new Map<string, { away: number; home: number }>();
        shotEvents.forEach((event) => {
            const team = event.team?.toUpperCase();
            if (!team) {
                return;
            }
            const zone = formatZoneLabel(event.zone);
            const entry = totals.get(zone) ?? { away: 0, home: 0 };
            if (team === awayAbbrev.toUpperCase()) {
                entry.away += 1;
            } else if (team === homeAbbrev.toUpperCase()) {
                entry.home += 1;
            }
            totals.set(zone, entry);
        });
        const order = ['Offensive', 'Neutral', 'Defensive', 'Other'];
        return Array.from(totals.entries())
            .sort(([a], [b]) => {
                const aIndex = order.indexOf(a);
                const bIndex = order.indexOf(b);
                if (aIndex === -1 && bIndex === -1) {
                    return a.localeCompare(b);
                }
                if (aIndex === -1) {
                    return 1;
                }
                if (bIndex === -1) {
                    return -1;
                }
                return aIndex - bIndex;
            })
            .map(([label, value]) => ({
                label,
                away: value.away,
                home: value.home,
            }));
    }, [awayAbbrev, homeAbbrev, shotEvents]);
    const shotMapPoints = useMemo(() => {
        if (!shotEvents.length) {
            return [];
        }
        const xMin = -100;
        const xMax = 100;
        const yMin = -42.5;
        const yMax = 42.5;
        const clamp = (value: number, min: number, max: number) =>
            Math.min(max, Math.max(min, value));
        return shotEvents
            .map((event) => {
                const x = event.coordinates?.x;
                const y = event.coordinates?.y;
                if (x === null || x === undefined || y === null || y === undefined) {
                    return null;
                }
                const left = ((clamp(x, xMin, xMax) - xMin) / (xMax - xMin)) * 100;
                const top = ((yMax - clamp(y, yMin, yMax)) / (yMax - yMin)) * 100;
                const team = event.team?.toUpperCase() ?? '';
                const isGoal = (event.type ?? '').toLowerCase() === 'goal';
                return {
                    id: event.id,
                    left,
                    top,
                    team,
                    isGoal,
                };
            })
            .filter(
                (point): point is { id: string; left: number; top: number; team: string; isGoal: boolean } =>
                    point !== null,
            );
    }, [shotEvents]);
    const goalsByPeriodTotals = useMemo(
        () =>
            goalsByPeriod.reduce(
                (totals, row) => ({
                    away: totals.away + row.away,
                    home: totals.home + row.home,
                }),
                { away: 0, home: 0 },
            ),
        [goalsByPeriod],
    );
    const strengthTotals = useMemo(
        () =>
            strengthBreakdown.reduce(
                (totals, row) => ({
                    away: totals.away + row.away,
                    home: totals.home + row.home,
                }),
                { away: 0, home: 0 },
            ),
        [strengthBreakdown],
    );
    const scoringSplitAvailable =
        goalsByPeriod.length > 0 || strengthBreakdown.length > 0;
    const shotLocationAvailable =
        shotZoneRows.length > 0 || shotMapPoints.length > 0;
    const hasSpecialTeamsData =
        playByPlay.length > 0 || scoringSummary.length > 0;

    const headerTitle = boxscore
        ? `${boxscore.away.name} @ ${boxscore.home.name}`
        : `Game ${gameId}`;
    const headerTime = boxscore?.startTime
        ? `${normalizeDate(boxscore.startTime)} · ${normalizeTime(
              boxscore.startTime,
          )}`
        : null;
    const derivedLinescore = useMemo(() => {
        if (!playByPlay.length) {
            return null;
        }
        const away = awayAbbrev.toUpperCase();
        const home = homeAbbrev.toUpperCase();
        if (!away || !home) {
            return null;
        }
        const maxRegulation =
            boxscore?.periodDescriptor?.maxRegulationPeriods ?? 3;
        const lastPeriodType = boxscore?.gameOutcome?.lastPeriodType
            ? boxscore.gameOutcome.lastPeriodType.toUpperCase()
            : '';
        const useShootoutLabel =
            playByPlayMeta.shootoutInUse || lastPeriodType === 'SO';
        const formatPeriodLabel = (period: number) => {
            if (period <= maxRegulation) {
                return `P${period}`;
            }
            const overtimeIndex = period - maxRegulation;
            if (useShootoutLabel && overtimeIndex === 2) {
                return 'SO';
            }
            if (overtimeIndex === 1) {
                return 'OT';
            }
            return `OT${overtimeIndex}`;
        };
        const periodSet = new Set<number>();
        const goalMap = new Map<number, { away: number; home: number }>();
        const sogCountMap = new Map<number, { away: number; home: number }>();
        const sogMaxMap = new Map<
            number,
            { away?: number | null; home?: number | null }
        >();
        let hasSogMax = false;
        const isGoalEvent = (event: (typeof playByPlay)[number]) =>
            event.category === 'Goal' ||
            (event.type ?? '').toLowerCase() === 'goal';
        const isSogEvent = (event: (typeof playByPlay)[number]) => {
            const type = (event.type ?? '').toLowerCase();
            return type === 'shot-on-goal' || type === 'goal';
        };

        playByPlay.forEach((event) => {
            const period = event.period;
            if (period === null || period === undefined) {
                return;
            }
            periodSet.add(period);
            const team = event.team?.toUpperCase() ?? '';
            if (isGoalEvent(event)) {
                const entry = goalMap.get(period) ?? { away: 0, home: 0 };
                if (team === away) {
                    entry.away += 1;
                } else if (team === home) {
                    entry.home += 1;
                }
                goalMap.set(period, entry);
            }
            if (isSogEvent(event)) {
                const entry = sogCountMap.get(period) ?? { away: 0, home: 0 };
                if (team === away) {
                    entry.away += 1;
                } else if (team === home) {
                    entry.home += 1;
                }
                sogCountMap.set(period, entry);
            }
            if (
                (event.awaySog !== null && event.awaySog !== undefined) ||
                (event.homeSog !== null && event.homeSog !== undefined)
            ) {
                hasSogMax = true;
                const entry = sogMaxMap.get(period) ?? {
                    away: null,
                    home: null,
                };
                if (event.awaySog !== null && event.awaySog !== undefined) {
                    entry.away = Math.max(entry.away ?? -Infinity, event.awaySog);
                }
                if (event.homeSog !== null && event.homeSog !== undefined) {
                    entry.home = Math.max(entry.home ?? -Infinity, event.homeSog);
                }
                sogMaxMap.set(period, entry);
            }
        });

        const periodNumbers = Array.from(periodSet).sort((a, b) => a - b);
        if (!periodNumbers.length) {
            return null;
        }
        let previousAwayMax = 0;
        let previousHomeMax = 0;
        const periods = periodNumbers.map((period) => {
            const goals = goalMap.get(period) ?? { away: 0, home: 0 };
            const counts = sogCountMap.get(period) ?? { away: 0, home: 0 };
            let shotsAway = counts.away;
            let shotsHome = counts.home;
            if (hasSogMax) {
                const maxEntry = sogMaxMap.get(period);
                if (maxEntry?.away !== null && maxEntry?.away !== undefined) {
                    shotsAway = Math.max(maxEntry.away - previousAwayMax, 0);
                    previousAwayMax = maxEntry.away;
                }
                if (maxEntry?.home !== null && maxEntry?.home !== undefined) {
                    shotsHome = Math.max(maxEntry.home - previousHomeMax, 0);
                    previousHomeMax = maxEntry.home;
                }
            }
            return {
                label: formatPeriodLabel(period),
                away: goals.away,
                home: goals.home,
                shotsAway,
                shotsHome,
            };
        });
        const shotTotals = periods.reduce(
            (totals, period) => ({
                away: totals.away + (period.shotsAway ?? 0),
                home: totals.home + (period.shotsHome ?? 0),
            }),
            { away: 0, home: 0 },
        );
        return {
            periods,
            shots: shotTotals,
        };
    }, [
        playByPlay,
        awayAbbrev,
        homeAbbrev,
        boxscore?.periodDescriptor?.maxRegulationPeriods,
        boxscore?.gameOutcome?.lastPeriodType,
        playByPlayMeta.shootoutInUse,
    ]);
    const derivedSituation = useMemo(() => {
        if (!playByPlay.length) {
            return null;
        }
        for (let index = playByPlay.length - 1; index >= 0; index -= 1) {
            const event = playByPlay[index];
            if (
                event.onIceStrength ||
                event.situationCode ||
                event.goaliePulled
            ) {
                const parts = [
                    event.onIceStrength ?? event.situationCode ?? null,
                    event.goaliePulled
                        ? `Goalie pulled: ${event.goaliePulled}`
                        : null,
                ].filter(Boolean);
                return parts.length ? parts.join(' | ') : null;
            }
        }
        return null;
    }, [playByPlay]);
    const seriesStatus = scoreboardEntry?.series ?? null;
    const scoreboardLinescore = scoreboardEntry?.linescore;
    const rightRailPeriods = rightRail?.linescore?.periods ?? [];
    const rightRailShots = rightRail?.linescore?.shots;
    const scoreboardPeriods = scoreboardLinescore?.periods ?? [];
    const scoreboardShots = scoreboardLinescore?.shots;
    const derivedPeriods = derivedLinescore?.periods ?? [];
    const derivedShots = derivedLinescore?.shots;
    const linescorePeriods =
        scoreboardPeriods.length > 0
            ? scoreboardPeriods
            : rightRailPeriods.length > 0
              ? rightRailPeriods
              : derivedPeriods;
    const displayShots =
        scoreboardShots ?? rightRailShots ?? derivedShots;
    const displayLinescore =
        linescorePeriods.length > 0 || displayShots
            ? {
                  periods: linescorePeriods,
                  shots: displayShots,
              }
            : undefined;
    const hasScoreboardLinescore = linescorePeriods.length > 0;
    const hasLinescoreShots =
        (displayLinescore?.shots?.away !== null &&
            displayLinescore?.shots?.away !== undefined) ||
        (displayLinescore?.shots?.home !== null &&
            displayLinescore?.shots?.home !== undefined);
    const scoreboardSituations = scoreboardEntry?.situations;
    const hasScoreboardSituations =
        Boolean(scoreboardSituations?.away || scoreboardSituations?.home);
    const situationLine = hasScoreboardSituations
        ? `${awayAbbrev || 'Away'} ${scoreboardSituations?.away ?? '--'} | ${
              homeAbbrev || 'Home'
          } ${scoreboardSituations?.home ?? '--'}`
        : derivedSituation;
    const hasSituations = Boolean(situationLine);
    const scoreboardLoading =
        scoreboardQuery.isLoading || rightRailQuery.isLoading;
    const scoreboardError =
        scoreboardQuery.isError && rightRailQuery.isError;
    const rightRailTeamStats = rightRail?.teamStats ?? [];
    const seasonSeries = rightRail?.seasonSeries;
    const officials = rightRail?.officials;
    const teamInfo = rightRail?.teams;
    const reportLinks = rightRail?.reports ?? [];
    const gameVideo = rightRail?.video;
    const videoLinkItems = [
        {
            label: '3-min recap (ID)',
            id: gameVideo?.threeMinRecapId,
        },
        {
            label: '3-min recap (FR) (ID)',
            id: gameVideo?.threeMinRecapFrId,
        },
        {
            label: 'Condensed game (ID)',
            id: gameVideo?.condensedGameId,
        },
        {
            label: 'Condensed game (FR) (ID)',
            id: gameVideo?.condensedGameFrId,
        },
    ]
        .filter(
            (
                item,
            ): item is {
                label: string;
                id: number;
            } => item.id !== null && item.id !== undefined,
        )
        .map((item) => ({
            label: `${item.label}: ${item.id}`,
            url: `https://www.nhl.com/video/${item.id}`,
        }));
    const seasonSeriesSummary =
        seasonSeries?.awayWins !== null &&
        seasonSeries?.awayWins !== undefined &&
        seasonSeries?.homeWins !== null &&
        seasonSeries?.homeWins !== undefined
            ? `${awayAbbrev || 'Away'} ${seasonSeries.awayWins}-${
                  seasonSeries.homeWins
              } ${homeAbbrev || 'Home'}`
            : null;
    const seasonSeriesGames = seasonSeries?.games ?? [];
    const hasSeasonSeries = Boolean(
        seasonSeriesSummary || seasonSeriesGames.length,
    );
    const hasOfficials =
        Boolean(officials?.referees?.length || officials?.linesmen?.length);
    const hasTeamInfo = Boolean(
        teamInfo?.away?.headCoach ||
            teamInfo?.home?.headCoach ||
            teamInfo?.away?.scratches?.length ||
            teamInfo?.home?.scratches?.length,
    );
    const hasReports = reportLinks.length > 0;
    const hasRightRailStats = rightRailTeamStats.length > 0;
    const hasGameVideo = videoLinkItems.length > 0;
    const hasOddsPartners = oddsPartners.length > 0;
    const summaryPenalties = boxscore?.summaryPenalties ?? [];
    const threeStars = boxscore?.threeStars ?? [];
    const shootoutSummary = boxscore?.shootoutSummary ?? [];
    const hasSummary =
        summaryPenalties.length > 0 ||
        threeStars.length > 0 ||
        shootoutSummary.length > 0;
    const formatStarLabel = (value?: number | null) => {
        if (value === 1) {
            return '1st star';
        }
        if (value === 2) {
            return '2nd star';
        }
        if (value === 3) {
            return '3rd star';
        }
        return value ? `Star ${value}` : 'Star';
    };
    const awayMeta = boxscore?.away.abbrev
        ? teamMeta.get(boxscore.away.abbrev.toUpperCase())
        : undefined;
    const homeMeta = boxscore?.home.abbrev
        ? teamMeta.get(boxscore.home.abbrev.toUpperCase())
        : undefined;
    const awayLogo =
        awayMeta?.logo ??
        boxscore?.away.logo ??
        boxscore?.away.darkLogo;
    const homeLogo =
        homeMeta?.logo ??
        boxscore?.home.logo ??
        boxscore?.home.darkLogo;

    return (
        <>
            <Head title="Score Detail" />
            <LabLayout active="scores">
                <section className="space-y-6">
                    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                        Game detail
                                    </p>
                                    <h1 className="mt-1 text-2xl font-semibold text-gray-900">
                                        {headerTitle}
                                    </h1>
                                    {headerTime && (
                                        <p className="mt-2 text-xs text-gray-500">
                                            {headerTime}
                                        </p>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500">
                                        {boxscore?.venue ??
                                            playByPlayVenue ??
                                            'Venue'}
                                    </p>
                                    {seriesStatus && (
                                        <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-emerald-600">
                                            {seriesStatus}
                                        </p>
                                    )}
                                </div>
                                <Link
                                    href="/lab/scores"
                                    className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-500"
                                >
                                    Back to Scores
                                </Link>
                            </div>
                        </div>
                        <div className="px-6 py-5">
                            {boxscoreQuery.isLoading && (
                                <p className="text-sm text-gray-600">
                                    Loading boxscore...
                                </p>
                            )}
                            {boxscoreQuery.isError && (
                                <p className="text-sm text-gray-600">
                                    Boxscore data is unavailable.
                                </p>
                            )}
                            {!boxscoreQuery.isLoading &&
                                !boxscoreQuery.isError &&
                                !boxscore && (
                                    <p className="text-sm text-gray-600">
                                        Game details are unavailable.
                                    </p>
                                )}
                            {boxscore && (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
                                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                            Away
                                        </p>
                                        <div className="mt-3 flex items-center gap-3">
                                            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-white text-xs font-semibold text-gray-500">
                                                {awayLogo ? (
                                                    <img
                                                        src={awayLogo}
                                                        alt={boxscore.away.name}
                                                        className="h-full w-full object-contain"
                                                    />
                                                ) : (
                                                    <span>
                                                        {boxscore.away.abbrev ??
                                                            boxscore.away.name
                                                                .slice(0, 2)
                                                                .toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-lg font-semibold text-gray-900">
                                                    {boxscore.away.name}
                                                </p>
                                                <p className="mt-1 text-2xl font-semibold text-gray-900">
                                                    {boxscore.away.score ?? '--'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
                                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                            Home
                                        </p>
                                        <div className="mt-3 flex items-center gap-3">
                                            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-white text-xs font-semibold text-gray-500">
                                                {homeLogo ? (
                                                    <img
                                                        src={homeLogo}
                                                        alt={boxscore.home.name}
                                                        className="h-full w-full object-contain"
                                                    />
                                                ) : (
                                                    <span>
                                                        {boxscore.home.abbrev ??
                                                            boxscore.home.name
                                                                .slice(0, 2)
                                                                .toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-lg font-semibold text-gray-900">
                                                    {boxscore.home.name}
                                                </p>
                                                <p className="mt-1 text-2xl font-semibold text-gray-900">
                                                    {boxscore.home.score ?? '--'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {boxscore?.status && (
                                <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
                                    {boxscore.status}
                                </p>
                            )}
                            {(gameTypeLabel ||
                                boxscoreGameTypeLabel ||
                                boxscoreSeason ||
                                statusFlag ||
                                eventFlag ||
                                neutralSiteLine ||
                                gameScheduleState ||
                                limitedScoringLabel ||
                                venueDetail ||
                                boxscore?.venueLocation ||
                                venueTimezoneLine ||
                                easternUtcOffsetLine ||
                                venueUtcOffsetLine ||
                                clockLine ||
                                periodLine ||
                                maxPeriodsLine ||
                                outcomeLine ||
                                playByPlayStatusLine ||
                                playByPlayLineParts.length > 0 ||
                                scoreboardLiveLine ||
                                broadcastSummary ||
                                fallbackBroadcastSummary ||
                                scoreboardBroadcastSummary ||
                                playByPlayBroadcastSummary ||
                                broadcastDetails.length > 0 ||
                                linkItems.length > 0) && (
                                <div className="mt-4 space-y-2 text-xs text-gray-600">
                                    {gameTypeLabel && (
                                        <p>
                                            <span className="font-semibold uppercase tracking-widest text-gray-500">
                                                Game type:
                                            </span>{' '}
                                            {gameTypeLabel}
                                        </p>
                                    )}
                                    {boxscoreGameTypeLabel && (
                                        <p>
                                            <span className="font-semibold uppercase tracking-widest text-gray-500">
                                                Game type (boxscore):
                                            </span>{' '}
                                            {boxscoreGameTypeLabel}
                                        </p>
                                    )}
                                    {boxscoreSeason && (
                                        <p>
                                            <span className="font-semibold uppercase tracking-widest text-gray-500">
                                                Season:
                                            </span>{' '}
                                            {boxscoreSeason}
                                        </p>
                                    )}
                                    {statusFlag && (
                                        <p>
                                            <span className="font-semibold uppercase tracking-widest text-gray-500">
                                                Status:
                                            </span>{' '}
                                            {statusFlag}
                                        </p>
                                    )}
                                    {eventFlag && (
                                        <p>
                                            <span className="font-semibold uppercase tracking-widest text-gray-500">
                                                Event:
                                            </span>{' '}
                                            {eventFlag}
                                        </p>
                                    )}
                                    {neutralSiteLine && (
                                        <p>
                                            <span className="font-semibold uppercase tracking-widest text-gray-500">
                                                Neutral site:
                                            </span>{' '}
                                            {neutralSiteLine}
                                        </p>
                                    )}
                                    {gameScheduleState && (
                                        <p>
                                            <span className="font-semibold uppercase tracking-widest text-gray-500">
                                                Schedule state:
                                            </span>{' '}
                                            {gameScheduleState}
                                        </p>
                                    )}
                                    {limitedScoringLabel && (
                                        <p>
                                            <span className="font-semibold uppercase tracking-widest text-gray-500">
                                                Limited scoring:
                                            </span>{' '}
                                            {limitedScoringLabel}
                                        </p>
                                    )}
                                    {venueDetail && (
                                        <p>
                                            <span className="font-semibold uppercase tracking-widest text-gray-500">
                                                Venue detail:
                                            </span>{' '}
                                            {venueDetail}
                                        </p>
                                    )}
                                    {boxscore?.venueLocation && (
                                        <p>
                                            <span className="font-semibold uppercase tracking-widest text-gray-500">
                                                Venue location:
                                            </span>{' '}
                                            {boxscore.venueLocation}
                                        </p>
                                    )}
                                    {venueTimezoneLine && (
                                        <p>
                                            <span className="font-semibold uppercase tracking-widest text-gray-500">
                                                Venue timezone:
                                            </span>{' '}
                                            {venueTimezoneLine}
                                        </p>
                                    )}
                                    {easternUtcOffsetLine && (
                                        <p>
                                            <span className="font-semibold uppercase tracking-widest text-gray-500">
                                                Eastern UTC offset:
                                            </span>{' '}
                                            {easternUtcOffsetLine}
                                        </p>
                                    )}
                                    {venueUtcOffsetLine && (
                                        <p>
                                            <span className="font-semibold uppercase tracking-widest text-gray-500">
                                                Venue UTC offset:
                                            </span>{' '}
                                            {venueUtcOffsetLine}
                                        </p>
                                    )}
                                    {clockLine && (
                                        <p>
                                            <span className="font-semibold uppercase tracking-widest text-gray-500">
                                                Game clock:
                                            </span>{' '}
                                            {clockLine}
                                        </p>
                                    )}
                                    {periodLine && (
                                        <p>
                                            <span className="font-semibold uppercase tracking-widest text-gray-500">
                                                Period:
                                            </span>{' '}
                                            {periodLine}
                                        </p>
                                    )}
                                    {maxPeriodsLine && (
                                        <p>
                                            <span className="font-semibold uppercase tracking-widest text-gray-500">
                                                Periods:
                                            </span>{' '}
                                            {maxPeriodsLine}
                                        </p>
                                    )}
                                    {outcomeLine && (
                                        <p>
                                            <span className="font-semibold uppercase tracking-widest text-gray-500">
                                                Outcome:
                                            </span>{' '}
                                            {outcomeLine}
                                        </p>
                                    )}
                                    {playByPlayStatusLine && (
                                        <p>
                                            <span className="font-semibold uppercase tracking-widest text-gray-500">
                                                Play-by-play status:
                                            </span>{' '}
                                            {playByPlayStatusLine}
                                        </p>
                                    )}
                                    {playByPlayLineParts.length > 0 && (
                                        <p>
                                            <span className="font-semibold uppercase tracking-widest text-gray-500">
                                                Play-by-play:
                                            </span>{' '}
                                            {playByPlayLineParts.join(' | ')}
                                        </p>
                                    )}
                                    {scoreboardLiveLine && (
                                        <p>
                                            <span className="font-semibold uppercase tracking-widest text-gray-500">
                                                Live status:
                                            </span>{' '}
                                            {scoreboardLiveLine}
                                        </p>
                                    )}
                                    {broadcastSummary && (
                                        <p>
                                            <span className="font-semibold uppercase tracking-widest text-gray-500">
                                                Broadcasts:
                                            </span>{' '}
                                            {broadcastSummary}
                                        </p>
                                    )}
                                    {fallbackBroadcastSummary && (
                                        <p>
                                            <span className="font-semibold uppercase tracking-widest text-gray-500">
                                                Broadcasts:
                                            </span>{' '}
                                            {fallbackBroadcastSummary}
                                        </p>
                                    )}
                                    {scoreboardBroadcastSummary && (
                                        <p>
                                            <span className="font-semibold uppercase tracking-widest text-gray-500">
                                                Broadcasts:
                                            </span>{' '}
                                            {scoreboardBroadcastSummary}
                                        </p>
                                    )}
                                    {playByPlayBroadcastSummary && (
                                        <p>
                                            <span className="font-semibold uppercase tracking-widest text-gray-500">
                                                Broadcasts:
                                            </span>{' '}
                                            {playByPlayBroadcastSummary}
                                        </p>
                                    )}
                                    {broadcastDetails.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {broadcastDetails.map((detail, index) => {
                                                const metaParts = [
                                                    detail.kind
                                                        ? detail.kind.toUpperCase()
                                                        : null,
                                                    detail.scope,
                                                    detail.market,
                                                    detail.language
                                                        ? detail.language.toUpperCase()
                                                        : null,
                                                    detail.team,
                                                    detail.feed,
                                                ].filter(Boolean);
                                                const label = metaParts.length
                                                    ? `${detail.label} (${metaParts.join(
                                                          ', ',
                                                      )})`
                                                    : detail.label;
                                                return (
                                                    <span
                                                        key={`${detail.label}-${index}`}
                                                        className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-gray-500"
                                                    >
                                                        {label}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    )}
                                    {linkItems.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {linkItems.map((link) => (
                                                <a
                                                    key={link.label}
                                                    href={link.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-gray-500 transition hover:border-gray-300 hover:text-gray-700"
                                                >
                                                    {link.label}
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                Scoreboard
                            </p>
                            <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                                Linescore & situations
                            </h2>
                        </div>
                        <div className="px-6 py-4">
                            {scoreboardLoading && (
                                <p className="text-sm text-gray-600">
                                    Loading scoreboard...
                                </p>
                            )}
                            {scoreboardError && (
                                <p className="text-sm text-gray-600">
                                    Scoreboard data is unavailable.
                                </p>
                            )}
                            {!scoreboardLoading &&
                                !scoreboardError &&
                                !hasScoreboardLinescore &&
                                !hasSituations && (
                                    <p className="text-sm text-gray-600">
                                        No scoreboard context available.
                                    </p>
                                )}
                            {hasScoreboardLinescore && (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="text-[10px] uppercase tracking-widest text-gray-500">
                                            <tr>
                                                <th className="py-2 text-left font-semibold">
                                                    Period
                                                </th>
                                                <th className="py-2 text-right font-semibold">
                                                    {awayAbbrev || 'Away'}
                                                </th>
                                                <th className="py-2 text-right font-semibold">
                                                    {homeAbbrev || 'Home'}
                                                </th>
                                                <th className="py-2 text-right font-semibold">
                                                    {awayAbbrev || 'Away'} SOG
                                                </th>
                                                <th className="py-2 text-right font-semibold">
                                                    {homeAbbrev || 'Home'} SOG
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-gray-700">
                                            {linescorePeriods.map(
                                                (period, index) => (
                                                    <tr
                                                        key={`${period.label}-${index}`}
                                                        className="border-t border-gray-100"
                                                    >
                                                        <td className="py-2 pr-3 font-semibold text-gray-900">
                                                            {period.label}
                                                        </td>
                                                        <td className="py-2 text-right">
                                                            {period.away ?? '--'}
                                                        </td>
                                                        <td className="py-2 text-right">
                                                            {period.home ?? '--'}
                                                        </td>
                                                        <td className="py-2 text-right">
                                                            {period.shotsAway ??
                                                                '--'}
                                                        </td>
                                                        <td className="py-2 text-right">
                                                            {period.shotsHome ??
                                                                '--'}
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            {hasLinescoreShots && (
                                <p className="mt-2 text-xs text-gray-500">
                                    Total SOG:{' '}
                                    {displayLinescore?.shots?.away ?? '--'}-
                                    {displayLinescore?.shots?.home ?? '--'}
                                </p>
                            )}
                            {hasSituations && (
                                <p className="mt-3 text-xs text-gray-600">
                                    <span className="font-semibold uppercase tracking-widest text-gray-500">
                                        Situations:
                                    </span>{' '}
                                    {situationLine}
                                </p>
                            )}
                        </div>
                    </div>

                    {hasSeasonSeries && (
                        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                            <div className="border-b border-gray-100 px-6 py-4">
                                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                    Season series
                                </p>
                                <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                                    Matchups & results
                                </h2>
                            </div>
                            <div className="px-6 py-4">
                                {seasonSeriesSummary && (
                                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                        {seasonSeriesSummary}
                                    </p>
                                )}
                                {seasonSeriesGames.length === 0 && (
                                    <p className="mt-3 text-sm text-gray-600">
                                        No season series details available.
                                    </p>
                                )}
                                {seasonSeriesGames.length > 0 && (
                                    <div className="mt-3 space-y-3">
                                        {seasonSeriesGames.map((game) => {
                                            const away = game.away.abbrev ?? 'Away';
                                            const home = game.home.abbrev ?? 'Home';
                                            const hasScore =
                                                game.away.score !== null &&
                                                game.away.score !== undefined &&
                                                game.home.score !== null &&
                                                game.home.score !== undefined;
                                            const scoreLabel = hasScore
                                                ? `${game.away.score}-${game.home.score}`
                                                : 'TBD';
                                            const dateLabel = game.gameDate
                                                ? normalizeDate(game.gameDate)
                                                : game.startTime
                                                  ? normalizeDate(game.startTime)
                                                  : 'TBD';
                                            const timeLabel = game.startTime
                                                ? normalizeTime(game.startTime)
                                                : '';
                                            const statusLabel = (() => {
                                                const state =
                                                    game.gameState?.toUpperCase() ??
                                                    '';
                                                const scheduleState =
                                                    game.gameScheduleState?.toUpperCase() ??
                                                    '';
                                                const periodNumber =
                                                    game.periodDescriptor?.number;
                                                const periodType = game.periodDescriptor
                                                    ?.periodType
                                                    ? ` ${game.periodDescriptor.periodType}`
                                                    : '';
                                                const isLive =
                                                    state === 'LIVE' ||
                                                    scheduleState === 'LIVE';
                                                const isFinal =
                                                    state === 'OFF' ||
                                                    state === 'FINAL' ||
                                                    scheduleState === 'FINAL';
                                                const isFuture = state === 'FUT';
                                                if (isLive && periodNumber !== null &&
                                                    periodNumber !== undefined) {
                                                    return `Live P${periodNumber}${periodType}`;
                                                }
                                                if (isLive) {
                                                    return 'Live';
                                                }
                                                if (isFinal) {
                                                    const outcome =
                                                        game.gameOutcome?.lastPeriodType;
                                                    if (
                                                        outcome &&
                                                        outcome.toUpperCase() !== 'REG'
                                                    ) {
                                                        return `Final (${outcome})`;
                                                    }
                                                    return 'Final';
                                                }
                                                if (isFuture) {
                                                    return 'Upcoming';
                                                }
                                                return state || scheduleState || null;
                                            })();
                                            const linkContent = (
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <div>
                                                        <p className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                                                            {game.away.logo ? (
                                                                <img
                                                                    src={game.away.logo}
                                                                    alt={away}
                                                                    className="h-5 w-5 object-contain"
                                                                />
                                                            ) : null}
                                                            <span>{away}</span>
                                                            <span className="text-xs text-gray-400">@</span>
                                                            {game.home.logo ? (
                                                                <img
                                                                    src={game.home.logo}
                                                                    alt={home}
                                                                    className="h-5 w-5 object-contain"
                                                                />
                                                            ) : null}
                                                            <span>{home}</span>
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {dateLabel}
                                                            {timeLabel
                                                                ? ` · ${timeLabel}`
                                                                : ''}
                                                            {statusLabel
                                                                ? ` · ${statusLabel}`
                                                                : ''}
                                                        </p>
                                                    </div>
                                                    <span className="text-sm font-semibold text-gray-700">
                                                        {scoreLabel}
                                                    </span>
                                                </div>
                                            );
                                            return game.gameCenterLink ? (
                                                <a
                                                    key={game.id}
                                                    href={game.gameCenterLink}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="block rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 transition hover:border-gray-200"
                                                >
                                                    {linkContent}
                                                </a>
                                            ) : (
                                                <div
                                                    key={game.id}
                                                    className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3"
                                                >
                                                    {linkContent}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {(hasOfficials || hasTeamInfo || hasReports || hasGameVideo) && (
                        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                            <div className="border-b border-gray-100 px-6 py-4">
                                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                    Game info
                                </p>
                                <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                                    Officials, coaches & reports
                                </h2>
                            </div>
                            <div className="space-y-4 px-6 py-4 text-sm text-gray-600">
                                {hasOfficials && (
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                            Officials
                                        </p>
                                        {officials?.referees?.length && (
                                            <p className="mt-2">
                                                Referees:{' '}
                                                {officials.referees.join(', ')}
                                            </p>
                                        )}
                                        {officials?.linesmen?.length && (
                                            <p className="mt-1">
                                                Linesmen:{' '}
                                                {officials.linesmen.join(', ')}
                                            </p>
                                        )}
                                    </div>
                                )}
                                {hasTeamInfo && (
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                                {awayAbbrev || 'Away'}
                                            </p>
                                            {teamInfo?.away?.headCoach && (
                                                <p className="mt-2">
                                                    Coach: {teamInfo.away.headCoach}
                                                </p>
                                            )}
                                            {teamInfo?.away?.scratches?.length && (
                                                <p className="mt-1 text-xs text-gray-500">
                                                    Scratches:{' '}
                                                    {teamInfo.away.scratches
                                                        .map((scratch) => {
                                                            const parts = [
                                                                scratch.name,
                                                                scratch.position
                                                                    ? scratch.position
                                                                    : null,
                                                                scratch.id
                                                                    ? `#${scratch.id}`
                                                                    : null,
                                                            ].filter(Boolean);
                                                            return parts.join(' ');
                                                        })
                                                        .join(', ')}
                                                </p>
                                            )}
                                        </div>
                                        <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                                {homeAbbrev || 'Home'}
                                            </p>
                                            {teamInfo?.home?.headCoach && (
                                                <p className="mt-2">
                                                    Coach: {teamInfo.home.headCoach}
                                                </p>
                                            )}
                                            {teamInfo?.home?.scratches?.length && (
                                                <p className="mt-1 text-xs text-gray-500">
                                                    Scratches:{' '}
                                                    {teamInfo.home.scratches
                                                        .map((scratch) => {
                                                            const parts = [
                                                                scratch.name,
                                                                scratch.position
                                                                    ? scratch.position
                                                                    : null,
                                                                scratch.id
                                                                    ? `#${scratch.id}`
                                                                    : null,
                                                            ].filter(Boolean);
                                                            return parts.join(' ');
                                                        })
                                                        .join(', ')}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {hasReports && (
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                            Game reports
                                        </p>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {reportLinks.map((link) => (
                                                <a
                                                    key={link.label}
                                                    href={link.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-gray-500 transition hover:border-gray-300 hover:text-gray-700"
                                                >
                                                    {link.label}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {hasGameVideo && (
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                            Game video
                                        </p>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {videoLinkItems.map((item) => (
                                                <a
                                                    key={item.label}
                                                    href={item.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-gray-500 transition hover:border-gray-300 hover:text-gray-700"
                                                >
                                                    {item.label}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {hasOddsPartners && (
                        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                            <div className="border-b border-gray-100 px-6 py-4">
                                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                    Odds partners
                                </p>
                                <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                                    Betting feeds
                                </h2>
                            </div>
                            <div className="px-6 py-4">
                                <div className="flex flex-wrap gap-3">
                                    {oddsPartners.map((partner) => {
                                        const hasBrandColors = Boolean(
                                            partner.bgColor ||
                                                partner.textColor ||
                                                partner.accentColor,
                                        );
                                        const partnerStyle = hasBrandColors
                                            ? {
                                                  backgroundColor: partner.bgColor,
                                                  color: partner.textColor,
                                                  borderColor:
                                                      partner.accentColor ??
                                                      partner.bgColor,
                                              }
                                            : undefined;
                                        const partnerClass = hasBrandColors
                                            ? 'rounded-full border px-3 py-2 text-[10px] font-semibold uppercase tracking-widest transition'
                                            : 'rounded-full border border-gray-200 bg-white px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-gray-500 transition hover:border-gray-300 hover:text-gray-700';
                                        const labelParts = [
                                            partner.name,
                                            partner.country
                                                ? partner.country.toUpperCase()
                                                : null,
                                        ].filter(Boolean);
                                        const label = labelParts.join(' · ');
                                        const content = (
                                            <div className="flex items-center gap-2">
                                                {partner.imageUrl ? (
                                                    <img
                                                        src={partner.imageUrl}
                                                        alt={partner.name}
                                                        className="h-6 w-6 object-contain"
                                                    />
                                                ) : null}
                                                <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                                    {label}
                                                </span>
                                            </div>
                                        );
                                        const contentWithBrand = hasBrandColors ? (
                                            <div className="flex items-center gap-2">
                                                {partner.imageUrl ? (
                                                    <img
                                                        src={partner.imageUrl}
                                                        alt={partner.name}
                                                        className="h-6 w-6 object-contain"
                                                    />
                                                ) : null}
                                                <span className="text-xs font-semibold uppercase tracking-widest">
                                                    {label}
                                                </span>
                                            </div>
                                        ) : (
                                            content
                                        );
                                        return partner.siteUrl ? (
                                            <a
                                                key={`${partner.name}-${partner.country ?? ''}`}
                                                href={partner.siteUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className={partnerClass}
                                                style={partnerStyle}
                                            >
                                                {contentWithBrand}
                                            </a>
                                        ) : (
                                            <div
                                                key={`${partner.name}-${partner.country ?? ''}`}
                                                className={partnerClass}
                                                style={partnerStyle}
                                            >
                                                {contentWithBrand}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {hasSummary && (
                        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                            <div className="border-b border-gray-100 px-6 py-4">
                                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                    Game summary
                                </p>
                                <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                                    Three stars & penalties
                                </h2>
                            </div>
                            <div className="space-y-4 px-6 py-4 text-sm text-gray-600">
                                {threeStars.length > 0 && (
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                            Three stars
                                        </p>
                                        <div className="mt-2 grid gap-3 sm:grid-cols-3">
                                            {threeStars.map((star, index) => {
                                                const statParts = [
                                                    star.goals !== null &&
                                                    star.goals !== undefined
                                                        ? `G${star.goals}`
                                                        : null,
                                                    star.assists !== null &&
                                                    star.assists !== undefined
                                                        ? `A${star.assists}`
                                                        : null,
                                                    star.points !== null &&
                                                    star.points !== undefined
                                                        ? `P${star.points}`
                                                        : null,
                                                ].filter(Boolean);
                                                const metaParts = [
                                                    star.team,
                                                    star.position,
                                                    star.id ? `ID ${star.id}` : null,
                                                ].filter(Boolean);
                                                return (
                                                    <div
                                                        key={`${star.name}-${index}`}
                                                        className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {star.headshot && (
                                                                <img
                                                                    src={star.headshot}
                                                                    alt={star.name}
                                                                    className="h-10 w-10 rounded-full border border-gray-200 object-cover"
                                                                />
                                                            )}
                                                            <div>
                                                                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                                                    {formatStarLabel(
                                                                        star.star,
                                                                    )}
                                                                </p>
                                                                <p className="mt-1 text-sm font-semibold text-gray-900">
                                                                    {star.name}
                                                                </p>
                                                                {metaParts.length >
                                                                    0 && (
                                                                    <p className="mt-1 text-xs text-gray-500">
                                                                        {metaParts.join(
                                                                            ' · ',
                                                                        )}
                                                                    </p>
                                                                )}
                                                                {statParts.length >
                                                                    0 && (
                                                                    <p className="mt-1 text-xs text-gray-500">
                                                                        {statParts.join(
                                                                            ' ',
                                                                        )}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                                {summaryPenalties.length > 0 && (
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                            Penalty summary
                                        </p>
                                        <div className="mt-2 overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead className="text-[10px] uppercase tracking-widest text-gray-500">
                                                    <tr>
                                                        <th className="py-2 text-left font-semibold">
                                                            Period
                                                        </th>
                                                        <th className="py-2 text-left font-semibold">
                                                            Time
                                                        </th>
                                                        <th className="py-2 text-left font-semibold">
                                                            Team
                                                        </th>
                                                        <th className="py-2 text-left font-semibold">
                                                            Penalty
                                                        </th>
                                                        <th className="py-2 text-right font-semibold">
                                                            Min
                                                        </th>
                                                        <th className="py-2 text-left font-semibold">
                                                            Player
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-gray-700">
                                                    {summaryPenalties.map(
                                                        (penalty, index) => {
                                                            const label =
                                                                penalty.infraction ||
                                                                penalty.description ||
                                                                'Penalty';
                                                            const playerLabel =
                                                                penalty.player
                                                                    ? `${penalty.player}${
                                                                          penalty.playerId
                                                                              ? ` (ID ${penalty.playerId})`
                                                                              : ''
                                                                      }`
                                                                    : penalty.playerId
                                                                      ? `ID ${penalty.playerId}`
                                                                      : '--';
                                                            const periodLabel =
                                                                penalty.period !== null &&
                                                                penalty.period !==
                                                                    undefined
                                                                    ? resolvePeriodLabels(
                                                                          penalty.period,
                                                                          penalty.periodType,
                                                                          penalty.maxRegulationPeriods,
                                                                      ).shortLabel
                                                                    : '--';
                                                            return (
                                                                <tr
                                                                    key={`${label}-${index}`}
                                                                    className="border-t border-gray-100"
                                                                >
                                                                    <td className="py-2 pr-3 font-semibold text-gray-900">
                                                                        {periodLabel}
                                                                    </td>
                                                                    <td className="py-2">
                                                                        {penalty.time ??
                                                                            '--'}
                                                                    </td>
                                                                    <td className="py-2">
                                                                        {penalty.team ??
                                                                            '--'}
                                                                    </td>
                                                                    <td className="py-2">
                                                                        {label}
                                                                    </td>
                                                                    <td className="py-2 text-right">
                                                                        {penalty.minutes !==
                                                                            null &&
                                                                        penalty.minutes !==
                                                                            undefined
                                                                            ? penalty.minutes
                                                                            : '--'}
                                                                    </td>
                                                                    <td className="py-2">
                                                                        {playerLabel}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        },
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                                {shootoutSummary.length > 0 && (
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                            Shootout
                                        </p>
                                        <div className="mt-2 space-y-2">
                                            {shootoutSummary.map(
                                                (attempt, index) => {
                                                    const order =
                                                        attempt.sequence ??
                                                        index + 1;
                                                    const parts = [
                                                        attempt.shooter ??
                                                            'Shooter',
                                                        attempt.team
                                                            ? `(${attempt.team})`
                                                            : null,
                                                        attempt.goalie
                                                            ? `vs ${attempt.goalie}`
                                                            : null,
                                                        attempt.result
                                                            ? `- ${attempt.result}`
                                                            : null,
                                                    ].filter(Boolean);
                                                    return (
                                                        <div
                                                            key={`${order}-${index}`}
                                                            className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-2 text-xs text-gray-600"
                                                        >
                                                            <span className="font-semibold text-gray-900">
                                                                #{order}
                                                            </span>{' '}
                                                            {parts.join(' ')}
                                                        </div>
                                                    );
                                                },
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {hasRightRailStats && (
                        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                            <div className="border-b border-gray-100 px-6 py-4">
                                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                    NHL game stats
                                </p>
                                <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                                    Official team metrics
                                </h2>
                            </div>
                            <div className="px-6 py-4">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="text-[10px] uppercase tracking-widest text-gray-500">
                                            <tr>
                                                <th className="py-2 text-left font-semibold">
                                                    Stat
                                                </th>
                                                <th className="py-2 text-right font-semibold">
                                                    {awayAbbrev || 'Away'}
                                                </th>
                                                <th className="py-2 text-right font-semibold">
                                                    {homeAbbrev || 'Home'}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-gray-700">
                                            {rightRailTeamStats.map((row) => (
                                                <tr
                                                    key={row.label}
                                                    className="border-t border-gray-100"
                                                >
                                                    <td className="py-2 pr-3 font-semibold text-gray-900">
                                                        {row.label}
                                                    </td>
                                                    <td className="py-2 text-right">
                                                        {row.away}
                                                    </td>
                                                    <td className="py-2 text-right">
                                                        {row.home}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                Boxscore
                            </p>
                            <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                                Team stats
                            </h2>
                        </div>
                        <div className="px-6 py-4">
                            {boxscoreQuery.isLoading && (
                                <p className="text-sm text-gray-600">
                                    Loading team stats...
                                </p>
                            )}
                            {boxscoreQuery.isError && (
                                <p className="text-sm text-gray-600">
                                    Team stats are unavailable.
                                </p>
                            )}
                            {!boxscoreQuery.isLoading &&
                                !boxscoreQuery.isError &&
                                statsRows.length === 0 && (
                                    <p className="text-sm text-gray-600">
                                        No team stats available.
                                    </p>
                                )}
                            {statsRows.length > 0 && (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="text-[10px] uppercase tracking-widest text-gray-500">
                                            <tr>
                                                <th className="py-2 text-left font-semibold">
                                                    Stat
                                                </th>
                                                <th className="py-2 text-right font-semibold">
                                                    {awayAbbrev || 'Away'}
                                                </th>
                                                <th className="py-2 text-right font-semibold">
                                                    {homeAbbrev || 'Home'}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-gray-700">
                                            {statsRows.map((row) => (
                                                <tr
                                                    key={row.label}
                                                    className="border-t border-gray-100"
                                                >
                                                    <td className="py-2 pr-3 font-semibold text-gray-900">
                                                        {row.label}
                                                    </td>
                                                    <td className="py-2 text-right">
                                                        {row.away}
                                                    </td>
                                                    <td className="py-2 text-right">
                                                        {row.home}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                Scoring breakdown
                            </p>
                            <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                                Goals by period and strength
                            </h2>
                        </div>
                        <div className="px-6 py-4">
                            {!scoringSplitAvailable && (
                                <p className="text-sm text-gray-600">
                                    No scoring breakdown available.
                                </p>
                            )}
                            {scoringSplitAvailable && (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
                                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                            Goals by period
                                        </p>
                                        {goalsByPeriod.length === 0 && (
                                            <p className="mt-3 text-xs text-gray-500">
                                                No period data available.
                                            </p>
                                        )}
                                        {goalsByPeriod.length > 0 && (
                                            <div className="mt-3 overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead className="text-[10px] uppercase tracking-widest text-gray-500">
                                                        <tr>
                                                            <th className="py-2 text-left font-semibold">
                                                                Period
                                                            </th>
                                                            <th className="py-2 text-right font-semibold">
                                                                {awayAbbrev || 'Away'}
                                                            </th>
                                                            <th className="py-2 text-right font-semibold">
                                                                {homeAbbrev || 'Home'}
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="text-gray-700">
                                                        {goalsByPeriod.map((row) => (
                                                            <tr
                                                                key={row.label}
                                                                className="border-t border-gray-100"
                                                            >
                                                                <td className="py-2 pr-3 font-semibold text-gray-900">
                                                                    {row.label}
                                                                </td>
                                                                <td className="py-2 text-right">
                                                                    {row.away}
                                                                </td>
                                                                <td className="py-2 text-right">
                                                                    {row.home}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        <tr className="border-t border-gray-200 font-semibold text-gray-900">
                                                            <td className="py-2 pr-3">
                                                                Total
                                                            </td>
                                                            <td className="py-2 text-right">
                                                                {goalsByPeriodTotals.away}
                                                            </td>
                                                            <td className="py-2 text-right">
                                                                {goalsByPeriodTotals.home}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
                                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                            Goals by strength
                                        </p>
                                        {strengthBreakdown.length === 0 && (
                                            <p className="mt-3 text-xs text-gray-500">
                                                No strength data available.
                                            </p>
                                        )}
                                        {strengthBreakdown.length > 0 && (
                                            <div className="mt-3 overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead className="text-[10px] uppercase tracking-widest text-gray-500">
                                                        <tr>
                                                            <th className="py-2 text-left font-semibold">
                                                                Strength
                                                            </th>
                                                            <th className="py-2 text-right font-semibold">
                                                                {awayAbbrev || 'Away'}
                                                            </th>
                                                            <th className="py-2 text-right font-semibold">
                                                                {homeAbbrev || 'Home'}
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="text-gray-700">
                                                        {strengthBreakdown.map((row) => (
                                                            <tr
                                                                key={row.label}
                                                                className="border-t border-gray-100"
                                                            >
                                                                <td className="py-2 pr-3 font-semibold text-gray-900">
                                                                    {row.label}
                                                                </td>
                                                                <td className="py-2 text-right">
                                                                    {row.away}
                                                                </td>
                                                                <td className="py-2 text-right">
                                                                    {row.home}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        <tr className="border-t border-gray-200 font-semibold text-gray-900">
                                                            <td className="py-2 pr-3">
                                                                Total
                                                            </td>
                                                            <td className="py-2 text-right">
                                                                {strengthTotals.away}
                                                            </td>
                                                            <td className="py-2 text-right">
                                                                {strengthTotals.home}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                Special teams
                            </p>
                            <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                                Power play and penalty kill
                            </h2>
                        </div>
                        <div className="px-6 py-4">
                            {!hasSpecialTeamsData && (
                                <p className="text-sm text-gray-600">
                                    No special teams data available.
                                </p>
                            )}
                            {hasSpecialTeamsData && (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="text-[10px] uppercase tracking-widest text-gray-500">
                                                <tr>
                                                    <th className="py-2 text-left font-semibold">
                                                        Metric
                                                    </th>
                                                    <th className="py-2 text-right font-semibold">
                                                        {awayAbbrev || 'Away'}
                                                    </th>
                                                    <th className="py-2 text-right font-semibold">
                                                        {homeAbbrev || 'Home'}
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-gray-700">
                                                {specialTeamsRows.map((row) => (
                                                    <tr
                                                        key={row.label}
                                                        className="border-t border-gray-100"
                                                    >
                                                        <td className="py-2 pr-3 font-semibold text-gray-900">
                                                            {row.label}
                                                        </td>
                                                        <td className="py-2 text-right">
                                                            {row.away}
                                                        </td>
                                                        <td className="py-2 text-right">
                                                            {row.home}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <p className="mt-3 text-xs text-gray-500">
                                        PP chances and minutes are estimated from opponent penalties.
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                Shot locations
                            </p>
                            <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                                Zones and shot map
                            </h2>
                        </div>
                        <div className="px-6 py-4">
                            {!shotLocationAvailable && (
                                <p className="text-sm text-gray-600">
                                    No shot location data available.
                                </p>
                            )}
                            {shotLocationAvailable && (
                                <div className="grid gap-4 lg:grid-cols-2">
                                    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
                                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                            Shot zones
                                        </p>
                                        {shotZoneRows.length === 0 && (
                                            <p className="mt-3 text-xs text-gray-500">
                                                No zone data available.
                                            </p>
                                        )}
                                        {shotZoneRows.length > 0 && (
                                            <div className="mt-3 overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead className="text-[10px] uppercase tracking-widest text-gray-500">
                                                        <tr>
                                                            <th className="py-2 text-left font-semibold">
                                                                Zone
                                                            </th>
                                                            <th className="py-2 text-right font-semibold">
                                                                {awayAbbrev || 'Away'}
                                                            </th>
                                                            <th className="py-2 text-right font-semibold">
                                                                {homeAbbrev || 'Home'}
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="text-gray-700">
                                                        {shotZoneRows.map((row) => (
                                                            <tr
                                                                key={row.label}
                                                                className="border-t border-gray-100"
                                                            >
                                                                <td className="py-2 pr-3 font-semibold text-gray-900">
                                                                    {row.label}
                                                                </td>
                                                                <td className="py-2 text-right">
                                                                    {row.away}
                                                                </td>
                                                                <td className="py-2 text-right">
                                                                    {row.home}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
                                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                            Shot map
                                        </p>
                                        {shotMapPoints.length === 0 && (
                                            <p className="mt-3 text-xs text-gray-500">
                                                No shot coordinates available.
                                            </p>
                                        )}
                                        {shotMapPoints.length > 0 && (
                                            <>
                                                <div
                                                    className="relative mt-3 w-full overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-slate-50 to-white"
                                                    style={{ aspectRatio: '200 / 85' }}
                                                >
                                                    <div className="absolute inset-y-0 left-1/2 w-px bg-gray-200" />
                                                    <div className="absolute inset-y-0 left-[12%] w-px bg-gray-200/70" />
                                                    <div className="absolute inset-y-0 right-[12%] w-px bg-gray-200/70" />
                                                    {shotMapPoints.map((point) => {
                                                        const isAway =
                                                            point.team ===
                                                            awayAbbrev.toUpperCase();
                                                        const isHome =
                                                            point.team ===
                                                            homeAbbrev.toUpperCase();
                                                        const color = isAway
                                                            ? awayColor
                                                            : isHome
                                                              ? homeColor
                                                              : '#9CA3AF';
                                                        return (
                                                            <span
                                                                key={point.id}
                                                                className={
                                                                    point.isGoal
                                                                        ? 'absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-white'
                                                                        : 'absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-80'
                                                                }
                                                                style={{
                                                                    left: `${point.left}%`,
                                                                    top: `${point.top}%`,
                                                                    backgroundColor: point.isGoal
                                                                        ? '#FFFFFF'
                                                                        : color,
                                                                    borderColor: color,
                                                                }}
                                                                title={`${point.team} ${
                                                                    point.isGoal ? 'Goal' : 'Shot'
                                                                }`}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                                <div className="mt-3 flex flex-wrap gap-3 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <span
                                                            className="inline-block h-2 w-2 rounded-full"
                                                            style={{
                                                                backgroundColor: awayColor,
                                                            }}
                                                        />
                                                        {awayAbbrev || 'Away'}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <span
                                                            className="inline-block h-2 w-2 rounded-full"
                                                            style={{
                                                                backgroundColor: homeColor,
                                                            }}
                                                        />
                                                        {homeAbbrev || 'Home'}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <span className="inline-block h-2 w-2 rounded-full border-2 border-gray-400 bg-white" />
                                                        Goal
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                Scoring summary
                            </p>
                            <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                                Goals by period
                            </h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {boxscoreQuery.isLoading && (
                                <p className="px-6 py-4 text-sm text-gray-600">
                                    Loading scoring summary...
                                </p>
                            )}
                            {boxscoreQuery.isError && (
                                <p className="px-6 py-4 text-sm text-gray-600">
                                    Scoring summary is unavailable.
                                </p>
                            )}
                            {!boxscoreQuery.isLoading &&
                                !boxscoreQuery.isError &&
                                scoringSummary.length === 0 && (
                                    <p className="px-6 py-4 text-sm text-gray-600">
                                        No scoring summary available.
                                    </p>
                                )}
                            {scoringByPeriod.map((group) => (
                                <div key={group.label} className="px-6 py-4">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                        {group.label}
                                    </p>
                                    <div className="mt-3 divide-y divide-gray-100 rounded-lg border border-gray-100">
                                    {group.items.map((goal) => {
                                        const scorerLine = (() => {
                                            if (!goal.scorer?.name) {
                                                return null;
                                            }
                                            const scorerParts = [
                                                goal.scorer.goalsToDate !== null &&
                                                goal.scorer.goalsToDate !== undefined
                                                    ? `G${goal.scorer.goalsToDate}`
                                                    : null,
                                                goal.scorer.id
                                                    ? `ID ${goal.scorer.id}`
                                                    : null,
                                            ].filter(Boolean);
                                            return `Scorer: ${goal.scorer.name}${
                                                scorerParts.length
                                                    ? ` (${scorerParts.join(', ')})`
                                                    : ''
                                            }`;
                                        })();
                                        const assistLine = (() => {
                                            if (!goal.assists?.length) {
                                                return null;
                                            }
                                            const assistLabels = goal.assists.map(
                                                (assist) => {
                                                    const assistParts = [
                                                        assist.assistsToDate !== null &&
                                                        assist.assistsToDate !== undefined
                                                            ? `A${assist.assistsToDate}`
                                                            : null,
                                                        assist.id
                                                            ? `ID ${assist.id}`
                                                            : null,
                                                    ].filter(Boolean);
                                                    return `${assist.name}${
                                                        assistParts.length
                                                            ? ` (${assistParts.join(', ')})`
                                                            : ''
                                                    }`;
                                                },
                                            );
                                            return `Assists: ${assistLabels.join(', ')}`;
                                        })();
                                        const clipLinks = [
                                            goal.videoUrl
                                                ? {
                                                      label: 'Watch clip',
                                                      url: goal.videoUrl,
                                                  }
                                                : null,
                                            goal.videoUrlFr
                                                ? {
                                                      label: 'Watch clip (FR)',
                                                      url: goal.videoUrlFr,
                                                  }
                                                : null,
                                        ].filter(
                                            (
                                                link,
                                            ): link is { label: string; url: string } =>
                                                link !== null,
                                        );
                                        const clipIdParts = [
                                            goal.highlightClipId !== null &&
                                            goal.highlightClipId !== undefined
                                                ? `Clip ${goal.highlightClipId}`
                                                : null,
                                            goal.highlightClipFrId !== null &&
                                            goal.highlightClipFrId !== undefined
                                                ? `Clip FR ${goal.highlightClipFrId}`
                                                : null,
                                            goal.discreteClipId !== null &&
                                            goal.discreteClipId !== undefined
                                                ? `Discrete ${goal.discreteClipId}`
                                                : null,
                                            goal.discreteClipFrId !== null &&
                                            goal.discreteClipFrId !== undefined
                                                ? `Discrete FR ${goal.discreteClipFrId}`
                                                : null,
                                        ].filter(Boolean);
                                        const clipIdLine = clipIdParts.length
                                            ? `Clip IDs: ${clipIdParts.join(
                                                  ' | ',
                                              )}`
                                            : null;

                                        return (
                                            <div
                                                key={goal.id}
                                                className="flex items-start justify-between gap-4 px-4 py-3 text-sm"
                                            >
                                                <div className="flex items-start gap-3">
                                                    {goal.scorer?.mugshot && (
                                                        <img
                                                            src={goal.scorer.mugshot}
                                                            alt={goal.scorer.name}
                                                            className="h-10 w-10 rounded-full border border-gray-200 object-cover"
                                                        />
                                                    )}
                                                    <div>
                                                        <p className="font-semibold text-gray-900">
                                                            {goal.description ??
                                                                'Goal'}
                                                        </p>
                                                        <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500">
                                                            {goal.team && (
                                                                <span>
                                                                    {goal.team}
                                                                </span>
                                                            )}
                                                            {goal.strength && (
                                                                <span>
                                                                    {goal.strength}
                                                                </span>
                                                            )}
                                                            {goal.goalType && (
                                                                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600">
                                                                    {goal.goalType}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {(scorerLine ||
                                                            assistLine) && (
                                                            <div className="mt-2 text-xs text-gray-500">
                                                                {scorerLine && (
                                                                    <p>
                                                                        {scorerLine}
                                                                    </p>
                                                                )}
                                                                {assistLine && (
                                                                    <p>
                                                                        {assistLine}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}
                                                        {clipIdLine && (
                                                            <p className="mt-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                                                                {clipIdLine}
                                                            </p>
                                                        )}
                                                        {clipLinks.length > 0 && (
                                                            <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-widest text-indigo-600">
                                                                {clipLinks.map(
                                                                    (link) => (
                                                                        <a
                                                                            key={link.label}
                                                                            href={link.url}
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            className="transition hover:text-indigo-500"
                                                                        >
                                                                            {link.label}
                                                                        </a>
                                                                    ),
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right text-xs text-gray-500">
                                                    <p>{goal.time ?? '--'}</p>
                                                    {goal.score && (
                                                        <p>{goal.score}</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                        </div>
                    </div>

                    {boxscore?.leaders && (
                        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                            <div className="border-b border-gray-100 px-6 py-4">
                                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                    Team leaders
                                </p>
                                <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                                    Goals, assists, points
                                </h2>
                            </div>
                            <div className="grid gap-4 px-6 py-4 sm:grid-cols-2">
                                {[
                                    {
                                        label: boxscore.away.abbrev ?? 'Away',
                                        entries: boxscore.leaders.away,
                                    },
                                    {
                                        label: boxscore.home.abbrev ?? 'Home',
                                        entries: boxscore.leaders.home,
                                    },
                                ].map((team) => (
                                    <div
                                        key={team.label}
                                        className="rounded-lg border border-gray-200 bg-white px-4 py-3"
                                    >
                                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                            {team.label}
                                        </p>
                                        <div className="mt-3 space-y-2 text-sm">
                                            {team.entries.length === 0 && (
                                                <p className="text-xs text-gray-500">
                                                    No leader data.
                                                </p>
                                            )}
                                            {team.entries.map((entry) => (
                                                <div
                                                    key={entry.label}
                                                    className="flex items-center justify-between gap-3"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-white text-xs font-semibold text-gray-500">
                                                            {entry.headshot ? (
                                                                <img
                                                                    src={entry.headshot}
                                                                    alt={entry.player ?? entry.label}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <span>
                                                                    {(entry.player ?? entry.label)
                                                                        .split(' ')
                                                                        .filter(Boolean)
                                                                        .slice(0, 2)
                                                                        .map((part) =>
                                                                            part[0]?.toUpperCase(),
                                                                        )
                                                                        .join('')}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs uppercase tracking-widest text-gray-400">
                                                                {entry.label}
                                                            </p>
                                                            <p className="font-semibold text-gray-900">
                                                                {entry.player ?? '--'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className="text-sm font-semibold text-gray-900">
                                                        {entry.value ?? '--'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {boxscore?.skaters && (
                        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                            <div className="border-b border-gray-100 px-6 py-4">
                                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                    Player stats
                                </p>
                                <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                                    Skater stat lines
                                </h2>
                            </div>
                            <div className="px-6 py-4">
                                <div className="grid gap-4">
                                    {[
                                        {
                                            label: awayAbbrev || 'Away',
                                            players: boxscore.skaters.away,
                                        },
                                        {
                                            label: homeAbbrev || 'Home',
                                            players: boxscore.skaters.home,
                                        },
                                    ].map((team) => (
                                        <div
                                            key={team.label}
                                            className="rounded-lg border border-gray-200 bg-white px-4 py-3"
                                        >
                                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                                {team.label}
                                            </p>
                                            {team.players.length === 0 && (
                                                <p className="mt-3 text-xs text-gray-500">
                                                    No skater stats available.
                                                </p>
                                            )}
                                            {team.players.length > 0 && (
                                                <div className="mt-3 overflow-x-auto">
                                                    <table className="min-w-[1040px] w-full text-xs">
                                                        <thead className="text-[10px] uppercase tracking-widest text-gray-500">
                                                            <tr>
                                                                <th className="py-2 text-left font-semibold">
                                                                    #
                                                                </th>
                                                                <th className="py-2 text-left font-semibold">
                                                                    Player
                                                                </th>
                                                                <th className="py-2 text-left font-semibold">
                                                                    Pos
                                                                </th>
                                                                <th className="py-2 text-right font-semibold">
                                                                    G
                                                                </th>
                                                                <th className="py-2 text-right font-semibold">
                                                                    A
                                                                </th>
                                                                <th className="py-2 text-right font-semibold">
                                                                    P
                                                                </th>
                                                                <th className="py-2 text-right font-semibold">
                                                                    +/-
                                                                </th>
                                                                <th className="py-2 text-right font-semibold">
                                                                    PIM
                                                                </th>
                                                                <th className="py-2 text-right font-semibold">
                                                                    SOG
                                                                </th>
                                                                <th className="py-2 text-right font-semibold">
                                                                    PPG
                                                                </th>
                                                                <th className="py-2 text-right font-semibold">
                                                                    HIT
                                                                </th>
                                                                <th className="py-2 text-right font-semibold">
                                                                    BLK
                                                                </th>
                                                                <th className="py-2 text-right font-semibold">
                                                                    FO%
                                                                </th>
                                                                <th className="py-2 text-right font-semibold">
                                                                    GV
                                                                </th>
                                                                <th className="py-2 text-right font-semibold">
                                                                    TK
                                                                </th>
                                                                <th className="py-2 text-right font-semibold">
                                                                    Shifts
                                                                </th>
                                                                <th className="py-2 text-right font-semibold">
                                                                    TOI
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="text-gray-700">
                                                            {team.players.map((player) => (
                                                                <tr
                                                                    key={player.id}
                                                                    className="border-t border-gray-100"
                                                                >
                                                                    <td className="py-2 pr-3 text-left font-semibold text-gray-900">
                                                                        {player.sweaterNumber ??
                                                                            '--'}
                                                                    </td>
                                                                    <td className="py-2 pr-3 text-left font-semibold text-gray-900">
                                                                        {player.name}
                                                                    </td>
                                                                    <td className="py-2 pr-3 text-left">
                                                                        {player.position ?? '--'}
                                                                    </td>
                                                                    <td className="py-2 text-right">
                                                                        {formatNumber(
                                                                            player.goals,
                                                                        )}
                                                                    </td>
                                                                    <td className="py-2 text-right">
                                                                        {formatNumber(
                                                                            player.assists,
                                                                        )}
                                                                    </td>
                                                                    <td className="py-2 text-right">
                                                                        {formatNumber(
                                                                            player.points,
                                                                        )}
                                                                    </td>
                                                                    <td className="py-2 text-right">
                                                                        {formatPlusMinus(
                                                                            player.plusMinus,
                                                                        )}
                                                                    </td>
                                                                    <td className="py-2 text-right">
                                                                        {formatNumber(
                                                                            player.pim,
                                                                        )}
                                                                    </td>
                                                                    <td className="py-2 text-right">
                                                                        {formatNumber(
                                                                            player.shots,
                                                                        )}
                                                                    </td>
                                                                    <td className="py-2 text-right">
                                                                        {formatNumber(
                                                                            player.powerPlayGoals,
                                                                        )}
                                                                    </td>
                                                                    <td className="py-2 text-right">
                                                                        {formatNumber(
                                                                            player.hits,
                                                                        )}
                                                                    </td>
                                                                    <td className="py-2 text-right">
                                                                        {formatNumber(
                                                                            player.blocks,
                                                                        )}
                                                                    </td>
                                                                    <td className="py-2 text-right">
                                                                        {formatPct(
                                                                            player.faceoffWinPct,
                                                                        )}
                                                                    </td>
                                                                    <td className="py-2 text-right">
                                                                        {formatNumber(
                                                                            player.giveaways,
                                                                        )}
                                                                    </td>
                                                                    <td className="py-2 text-right">
                                                                        {formatNumber(
                                                                            player.takeaways,
                                                                        )}
                                                                    </td>
                                                                    <td className="py-2 text-right">
                                                                        {formatNumber(
                                                                            player.shifts,
                                                                        )}
                                                                    </td>
                                                                    <td className="py-2 text-right">
                                                                        {player.toi ?? '--'}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {boxscore?.goalies && (
                        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                            <div className="border-b border-gray-100 px-6 py-4">
                                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                    Goalie stats
                                </p>
                                <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                                    Save percentage and shots
                                </h2>
                            </div>
                            <div className="px-6 py-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {[
                                        {
                                            label: boxscore.away.abbrev ?? 'Away',
                                            goalies: boxscore.goalies.away,
                                        },
                                        {
                                            label: boxscore.home.abbrev ?? 'Home',
                                            goalies: boxscore.goalies.home,
                                        },
                                    ].map((team) => (
                                        <div
                                            key={team.label}
                                            className="rounded-lg border border-gray-200 bg-white px-4 py-3"
                                        >
                                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                                {team.label}
                                            </p>
                                            {team.goalies.length === 0 && (
                                                <p className="mt-3 text-xs text-gray-500">
                                                    No goalie stats available.
                                                </p>
                                            )}
                                            {team.goalies.length > 0 && (
                                                <div className="mt-3 space-y-3 text-sm">
                                                    {team.goalies.map((goalie) => {
                                                        const extraDetails = [
                                                            goalie.saveShotsAgainst
                                                                ? `Shots ${goalie.saveShotsAgainst}`
                                                                : null,
                                                            goalie.evenStrengthShotsAgainst
                                                                ? `EV ${goalie.evenStrengthShotsAgainst}`
                                                                : null,
                                                            goalie.powerPlayShotsAgainst
                                                                ? `PP ${goalie.powerPlayShotsAgainst}`
                                                                : null,
                                                            goalie.shorthandedShotsAgainst
                                                                ? `SH ${goalie.shorthandedShotsAgainst}`
                                                                : null,
                                                            goalie.evenStrengthGoalsAgainst !==
                                                                null &&
                                                            goalie.evenStrengthGoalsAgainst !==
                                                                undefined
                                                                ? `GA EV ${goalie.evenStrengthGoalsAgainst}`
                                                                : null,
                                                            goalie.powerPlayGoalsAgainst !==
                                                                null &&
                                                            goalie.powerPlayGoalsAgainst !==
                                                                undefined
                                                                ? `GA PP ${goalie.powerPlayGoalsAgainst}`
                                                                : null,
                                                            goalie.shorthandedGoalsAgainst !==
                                                                null &&
                                                            goalie.shorthandedGoalsAgainst !==
                                                                undefined
                                                                ? `GA SH ${goalie.shorthandedGoalsAgainst}`
                                                                : null,
                                                            goalie.decision
                                                                ? `Dec ${goalie.decision}`
                                                                : null,
                                                            goalie.starter !== undefined
                                                                ? goalie.starter
                                                                    ? 'Starter'
                                                                    : 'Relief'
                                                                : null,
                                                            goalie.pim !== null &&
                                                            goalie.pim !== undefined
                                                                ? `PIM ${goalie.pim}`
                                                                : null,
                                                        ].filter(Boolean);

                                                        return (
                                                            <div
                                                                key={goalie.id}
                                                                className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
                                                            >
                                                                <p className="font-semibold text-gray-900">
                                                                    {goalie.name}
                                                                </p>
                                                                <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                                                                    <span>
                                                                        SV%{' '}
                                                                        {goalie.savePct !== null &&
                                                                        goalie.savePct !== undefined
                                                                            ? goalie.savePct.toFixed(3)
                                                                            : '--'}
                                                                    </span>
                                                                    <span>
                                                                        SA{' '}
                                                                        {goalie.shots ?? '--'}
                                                                    </span>
                                                                    <span>
                                                                        SV{' '}
                                                                        {goalie.saves ?? '--'}
                                                                    </span>
                                                                    <span>
                                                                        GA{' '}
                                                                        {goalie.goalsAgainst ?? '--'}
                                                                    </span>
                                                                    <span>
                                                                        TOI{' '}
                                                                        {goalie.toi ?? '--'}
                                                                    </span>
                                                                </div>
                                                                {extraDetails.length > 0 && (
                                                                    <div className="mt-2 flex flex-wrap gap-3 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                                                                        {extraDetails.map(
                                                                            (item) => (
                                                                                <span
                                                                                    key={
                                                                                        item as string
                                                                                    }
                                                                                >
                                                                                    {item}
                                                                                </span>
                                                                            ),
                                                                        )}
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
                            </div>
                        </div>
                    )}

                    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                Play-by-play
                            </p>
                            <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                                {showAllEvents ? 'All events' : 'Recent events'}
                            </h2>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedPeriod('all')}
                                    className={
                                        selectedPeriod === 'all'
                                            ? 'rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white'
                                            : 'rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600 transition hover:bg-gray-100'
                                    }
                                >
                                    All periods
                                </button>
                                {availablePeriods.map((period) => (
                                    <button
                                        key={period}
                                        type="button"
                                        onClick={() => setSelectedPeriod(period)}
                                        className={
                                            selectedPeriod === period
                                                ? 'rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white'
                                                : 'rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600 transition hover:bg-gray-100'
                                        }
                                    >
                                        P{period}
                                    </button>
                                ))}
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {['All', 'Goal', 'Penalty', 'Shot'].map(
                                    (filter) => (
                                        <button
                                            key={filter}
                                            type="button"
                                            onClick={() =>
                                                setEventFilter(
                                                    filter as 'All' | 'Goal' | 'Penalty' | 'Shot',
                                                )
                                            }
                                            className={
                                                eventFilter === filter
                                                    ? 'rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white'
                                                    : 'rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-600 transition hover:bg-gray-50'
                                            }
                                        >
                                            {filter}
                                        </button>
                                    ),
                                )}
                            </div>
                            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                <span>
                                    Showing {eventsToShow.length} of{' '}
                                    {filteredEvents.length} events
                                </span>
                                {filteredEvents.length > 10 && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowAllEvents((prev) => !prev)
                                        }
                                        className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-gray-500 transition hover:border-gray-300 hover:text-gray-700"
                                    >
                                        {showAllEvents
                                            ? 'Show recent'
                                            : 'Show all'}
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {playByPlayQuery.isLoading && (
                                <p className="px-6 py-4 text-sm text-gray-600">
                                    Loading play-by-play...
                                </p>
                            )}
                            {playByPlayQuery.isError && (
                                <p className="px-6 py-4 text-sm text-gray-600">
                                    Play-by-play data is unavailable.
                                </p>
                            )}
                            {!playByPlayQuery.isLoading &&
                                !playByPlayQuery.isError &&
                                eventsToShow.length === 0 && (
                                    <p className="px-6 py-4 text-sm text-gray-600">
                                        No play-by-play events yet.
                                    </p>
                                )}
                            {eventsToShow.map((event) => {
                                const participantLine = event.players?.length
                                    ? `Participants: ${event.players
                                          .map((player) => {
                                              const role = player.type
                                                  ? `${player.type}: `
                                                  : '';
                                              const team = player.team
                                                  ? ` (${player.team})`
                                                  : '';
                                              const metaParts = [
                                                  player.position,
                                                  player.sweaterNumber !== null &&
                                                  player.sweaterNumber !== undefined
                                                      ? `#${player.sweaterNumber}`
                                                      : null,
                                                  player.id
                                                      ? `ID ${player.id}`
                                                      : null,
                                              ].filter(Boolean);
                                              const meta = metaParts.length
                                                  ? ` [${metaParts.join(' ')}]`
                                                  : '';
                                              return `${role}${player.name}${team}${meta}`;
                                          })
                                          .join(' | ')}`
                                    : null;
                                const goalTotalsLine = event.goalTotals?.length
                                    ? `Totals: ${event.goalTotals
                                          .map(
                                              (item) =>
                                                  `${item.name} ${item.kind}${item.total}`,
                                          )
                                          .join(' | ')}`
                                    : null;
                                const hasSog =
                                    (event.awaySog !== null &&
                                        event.awaySog !== undefined) ||
                                    (event.homeSog !== null &&
                                        event.homeSog !== undefined);
                                const sogLine = hasSog
                                    ? `SOG: ${event.awaySog ?? '--'}-${event.homeSog ?? '--'}`
                                    : null;
                                const onIceLine = event.onIceStrength
                                    ? `On-ice: ${event.onIceStrength}`
                                    : null;
                                const goaliePulledLine = event.goaliePulled
                                    ? `Goalie pulled: ${event.goaliePulled}`
                                    : null;
                                const goalieLine = event.goalieInNetName
                                    ? `Goalie: ${event.goalieInNetName}`
                                    : null;
                                const goalieIdLine = event.goalieInNetId
                                    ? `Goalie ID: ${event.goalieInNetId}`
                                    : null;
                                const sortOrderLine =
                                    event.sortOrder !== null &&
                                    event.sortOrder !== undefined
                                        ? `Sort: ${event.sortOrder}`
                                        : null;
                                const defendingLine = event.homeDefendingSide
                                    ? `Defending: ${event.homeDefendingSide}`
                                    : null;
                                const situationLine =
                                    event.situationCode && !event.onIceStrength
                                        ? `Situation: ${event.situationCode}`
                                        : null;
                                const detailParts = [
                                    event.playerSummary,
                                    goalTotalsLine,
                                    participantLine,
                                    event.score ? `Score ${event.score}` : null,
                                    sogLine,
                                    onIceLine,
                                    goaliePulledLine,
                                    goalieLine,
                                    goalieIdLine,
                                    sortOrderLine,
                                    defendingLine,
                                    situationLine,
                                    event.strength
                                        ? `Strength: ${event.strength}`
                                        : null,
                                    event.shotType
                                        ? `Shot: ${event.shotType}`
                                        : null,
                                    event.infraction
                                        ? `Infraction: ${event.infraction}`
                                        : null,
                                    event.penaltyMinutes !== null &&
                                    event.penaltyMinutes !== undefined
                                        ? `Minutes: ${event.penaltyMinutes}`
                                        : null,
                                    event.committedBy
                                        ? `Committed: ${event.committedBy}`
                                        : null,
                                    event.drawnBy
                                        ? `Drawn: ${event.drawnBy}`
                                        : null,
                                    event.blockedByTeam
                                        ? `Blocked by: ${event.blockedByTeam}`
                                        : null,
                                    event.reason
                                        ? `Reason: ${event.reason}`
                                        : null,
                                    event.zone ? `Zone: ${event.zone}` : null,
                                    event.coordinates
                                        ? `Loc: ${event.coordinates.x ?? '--'},${event.coordinates.y ?? '--'}`
                                        : null,
                                ].filter(Boolean);
                                const detailLine = detailParts.join(' | ');
                                const videoLinks = [
                                    event.videoUrl
                                        ? {
                                              label: 'Watch clip',
                                              url: event.videoUrl,
                                          }
                                        : null,
                                    event.pptReplayUrl
                                        ? {
                                              label: 'PPT replay',
                                              url: event.pptReplayUrl,
                                          }
                                        : null,
                                ].filter(
                                    (
                                        link,
                                    ): link is { label: string; url: string } =>
                                        link !== null,
                                );

                                return (
                                    <div
                                        key={event.id}
                                        className="px-6 py-3 text-sm"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-3">
                                                {event.category &&
                                                    event.category !==
                                                        'Other' && (
                                                        <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm">
                                                            {event.category ===
                                                            'Goal'
                                                                ? '🏒'
                                                                : event.category ===
                                                                    'Penalty'
                                                                  ? '🚫'
                                                                  : '🎯'}
                                                        </span>
                                                    )}
                                                <div>
                                                    <p className="font-semibold text-gray-900">
                                                        {event.description ??
                                                            event.type ??
                                                            'Event'}
                                                    </p>
                                                    {event.team && (
                                                        <p className="mt-1 text-xs text-gray-500">
                                                            {event.team}
                                                        </p>
                                                    )}
                                                    {detailLine && (
                                                        <p className="mt-1 text-xs text-gray-500">
                                                            {detailLine}
                                                        </p>
                                                    )}
                                                    {videoLinks.length > 0 && (
                                                        <div className="mt-1 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-widest text-indigo-600">
                                                            {videoLinks.map(
                                                                (link) => (
                                                                    <a
                                                                        key={
                                                                            link.label
                                                                        }
                                                                        href={
                                                                            link.url
                                                                        }
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="transition hover:text-indigo-500"
                                                                    >
                                                                        {
                                                                            link.label
                                                                        }
                                                                    </a>
                                                                ),
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right text-xs text-gray-500">
                                                <p>
                                                    {event.period !== null &&
                                                    event.period !==
                                                        undefined
                                                        ? `P${event.period}`
                                                        : '--'}
                                                </p>
                                                <p>{event.time ?? '--'}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            </LabLayout>
        </>
    );
}
