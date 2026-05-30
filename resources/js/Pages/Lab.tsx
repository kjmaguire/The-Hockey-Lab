import { Head, Link } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import LabLayout from '@/Layouts/LabLayout';
import {
    fetchNhl,
    type LinescoreSnapshot,
    normalizeDate,
    normalizeTime,
    parseGoalieLeaders,
    parseSchedule,
    parseScoreboard,
    parseSkaterLanding,
    parseStandings,
    parseTeams,
} from '@/lib/nhl';

const EDGE_SEASON = '20242025';
const EDGE_GROUP = '2';
const EDGE_GAME_TYPE = '2';
const GOALIE_MIN_GP = 10;

const formatStreak = (code?: string, count?: number | null) => {
    if (!code || count === null || count === undefined) {
        return '--';
    }
    return `${code}${count}`;
};

const formatGoalDiff = (value?: number | null) => {
    if (value === null || value === undefined) {
        return '--';
    }
    return `${value > 0 ? '+' : ''}${value}`;
};

const formatGap = (value?: number | null) => {
    if (value === null || value === undefined) {
        return '--';
    }
    return `${value > 0 ? '+' : ''}${value}`;
};

const formatRecord = (record?: {
    record?: string;
    wins?: number | null;
    losses?: number | null;
    otLosses?: number | null;
}) => {
    if (!record) {
        return '--';
    }
    if (record.record) {
        return record.record;
    }
    const wins = record.wins;
    const losses = record.losses;
    const otLosses = record.otLosses;
    if (wins === null || wins === undefined || losses === null || losses === undefined) {
        return '--';
    }
    if (otLosses === null || otLosses === undefined) {
        return `${wins}-${losses}`;
    }
    return `${wins}-${losses}-${otLosses}`;
};

const formatPerGame = (value?: number | null) => {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return '--';
    }
    return value.toFixed(2);
};

const resolveLinescoreTotals = (linescore?: LinescoreSnapshot) => {
    if (!linescore?.periods?.length) {
        return { away: null, home: null };
    }
    let awayTotal: number | null = null;
    let homeTotal: number | null = null;
    linescore.periods.forEach((period) => {
        if (period.away !== null && period.away !== undefined) {
            awayTotal = (awayTotal ?? 0) + period.away;
        }
        if (period.home !== null && period.home !== undefined) {
            homeTotal = (homeTotal ?? 0) + period.home;
        }
    });
    return { away: awayTotal, home: homeTotal };
};

const formatLinescoreSummary = (linescore?: LinescoreSnapshot) => {
    if (!linescore?.periods?.length) {
        return '';
    }
    return linescore.periods
        .map((period) => {
            const away = period.away ?? '-';
            const home = period.home ?? '-';
            return `${period.label} ${away}-${home}`;
        })
        .join(' · ');
};

export default function Lab() {
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
    const scoreboardQuery = useQuery({
        queryKey: ['nhl', 'scoreboard'],
        queryFn: () => fetchNhl('scoreboard'),
        staleTime: 30_000,
    });
    const teamsQuery = useQuery({
        queryKey: ['nhl', 'teams'],
        queryFn: () => fetchNhl('teams'),
        staleTime: 300_000,
    });
    const skatersQuery = useQuery({
        queryKey: ['nhl', 'edge', 'skater-landing', EDGE_SEASON, EDGE_GROUP],
        queryFn: () =>
            fetchNhl(
                `edge/skater-landing?season=${EDGE_SEASON}&group=${EDGE_GROUP}`,
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
    const scoreboardMap = useMemo(
        () => parseScoreboard(scoreboardQuery.data ?? {}),
        [scoreboardQuery.data],
    );
    const teams = useMemo(
        () => parseTeams(teamsQuery.data ?? {}),
        [teamsQuery.data],
    );
    const skaters = useMemo(
        () => parseSkaterLanding(skatersQuery.data ?? {}),
        [skatersQuery.data],
    );
    const goalieLeaders = useMemo(
        () => parseGoalieLeaders(goalieLeadersQuery.data ?? {}),
        [goalieLeadersQuery.data],
    );

    const teamNameByAbbrev = useMemo(() => {
        const map = new Map<string, string>();
        teams.forEach((team) => {
            if (team.abbrev) {
                map.set(team.abbrev.toUpperCase(), team.name);
            }
        });
        standings.forEach((row) => {
            if (row.abbrev) {
                map.set(row.abbrev.toUpperCase(), row.name);
            }
        });
        return map;
    }, [standings, teams]);

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

    const scoreboardEntries = useMemo(() => {
        const entries = Array.from(scoreboardMap.entries()).map(
            ([id, data]) => {
                const startTime = data.startTime
                    ? new Date(data.startTime).getTime()
                    : null;
                const totals = resolveLinescoreTotals(data.linescore);
                const homeAbbrev = data.home ?? '';
                const awayAbbrev = data.away ?? '';
                return {
                    id,
                    startTime,
                    status: data.status,
                    live: data.live,
                    situations: data.situations,
                    linescore: data.linescore,
                    series: data.series,
                    links: data.links,
                    tvBroadcasts: data.tvBroadcasts,
                    homeAbbrev,
                    awayAbbrev,
                    homeName: resolveTeamName(homeAbbrev),
                    awayName: resolveTeamName(awayAbbrev),
                    homeScore: totals.home,
                    awayScore: totals.away,
                };
            },
        );
        return entries.sort((a, b) => {
            if (a.startTime === null && b.startTime === null) {
                return 0;
            }
            if (a.startTime === null) {
                return 1;
            }
            if (b.startTime === null) {
                return -1;
            }
            return a.startTime - b.startTime;
        });
    }, [resolveTeamName, scoreboardMap]);

    const allGames = useMemo(
        () => schedule.flatMap((day) => day.games),
        [schedule],
    );

    const next24Games = useMemo(() => {
        const now = Date.now();
        const cutoff = now + 24 * 60 * 60 * 1000;
        return allGames
            .map((game) => ({
                game,
                time: game.startTime ? new Date(game.startTime).getTime() : null,
            }))
            .filter(
                (entry) =>
                    entry.time !== null && !Number.isNaN(entry.time),
            )
            .filter((entry) => (entry.time as number) >= now)
            .filter((entry) => (entry.time as number) <= cutoff)
            .sort((a, b) => (a.time as number) - (b.time as number))
            .map((entry) => entry.game)
            .slice(0, 6);
    }, [allGames]);

    const restTracker = useMemo(() => {
        const now = Date.now();
        const nextByTeam = new Map<
            string,
            { team: string; nextGame: Date; hoursUntil: number }
        >();

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
            [game.home.name, game.away.name].forEach((team) => {
                if (!team) {
                    return;
                }
                const current = nextByTeam.get(team);
                if (!current || hoursUntil < current.hoursUntil) {
                    nextByTeam.set(team, {
                        team,
                        nextGame: gameDate,
                        hoursUntil,
                    });
                }
            });
        });

        return [...nextByTeam.values()]
            .sort((a, b) => a.hoursUntil - b.hoursUntil)
            .slice(0, 6);
    }, [allGames]);

    const topStanding = useMemo(() => {
        if (!standings.length) {
            return null;
        }
        return [...standings].sort(
            (a, b) => (b.points ?? -1) - (a.points ?? -1),
        )[0];
    }, [standings]);

    const winStreaks = useMemo(() => {
        return standings
            .filter(
                (row) =>
                    row.streakCode?.startsWith('W') &&
                    (row.streakCount ?? 0) > 0,
            )
            .sort((a, b) => (b.streakCount ?? 0) - (a.streakCount ?? 0))
            .slice(0, 3);
    }, [standings]);

    const lossStreaks = useMemo(() => {
        return standings
            .filter(
                (row) =>
                    row.streakCode?.startsWith('L') &&
                    (row.streakCount ?? 0) > 0,
            )
            .sort((a, b) => (b.streakCount ?? 0) - (a.streakCount ?? 0))
            .slice(0, 3);
    }, [standings]);

    const goalDiffLeaders = useMemo(() => {
        const withDiff = standings.filter(
            (row) => row.goalDifferential !== null && row.goalDifferential !== undefined,
        );
        const best = [...withDiff]
            .sort(
                (a, b) =>
                    (b.goalDifferential ?? -9999) -
                    (a.goalDifferential ?? -9999),
            )
            .slice(0, 3);
        const worst = [...withDiff]
            .sort(
                (a, b) =>
                    (a.goalDifferential ?? 9999) -
                    (b.goalDifferential ?? 9999),
            )
            .slice(0, 3);
        return { best, worst };
    }, [standings]);

    const offenseLeaders = useMemo(() => {
        return standings
            .map((row) => {
                const games = row.gamesPlayed ?? 0;
                const goalsFor = row.goalsFor;
                const perGame =
                    goalsFor !== null &&
                    goalsFor !== undefined &&
                    games > 0
                        ? goalsFor / games
                        : null;
                return { row, perGame };
            })
            .filter((entry) => entry.perGame !== null)
            .sort((a, b) => (b.perGame ?? -1) - (a.perGame ?? -1))
            .slice(0, 3);
    }, [standings]);

    const defenseLeaders = useMemo(() => {
        return standings
            .map((row) => {
                const games = row.gamesPlayed ?? 0;
                const goalsAgainst = row.goalsAgainst;
                const perGame =
                    goalsAgainst !== null &&
                    goalsAgainst !== undefined &&
                    games > 0
                        ? goalsAgainst / games
                        : null;
                return { row, perGame };
            })
            .filter((entry) => entry.perGame !== null)
            .sort((a, b) => (a.perGame ?? 999) - (b.perGame ?? 999))
            .slice(0, 3);
    }, [standings]);

    const wildcardRace = useMemo(() => {
        const conferences = ['Eastern', 'Western'];
        return conferences.map((conference) => {
            const conferenceTeams = standings.filter(
                (row) => row.conferenceName === conference,
            );
            const wildcardSorted = [...conferenceTeams]
                .filter(
                    (row) =>
                        row.wildcardSequence !== null &&
                        row.wildcardSequence !== undefined,
                )
                .sort(
                    (a, b) =>
                        (a.wildcardSequence ?? 99) -
                        (b.wildcardSequence ?? 99),
                );
            const wc1 = wildcardSorted.find(
                (row) => row.wildcardSequence === 1,
            );
            const wc2 = wildcardSorted.find(
                (row) => row.wildcardSequence === 2,
            );
            const next =
                wildcardSorted.find(
                    (row) => row.wildcardSequence === 3,
                ) ??
                wildcardSorted.find(
                    (row) => (row.wildcardSequence ?? 99) > 2,
                );

            const gapPoints =
                wc2?.points !== null &&
                wc2?.points !== undefined &&
                next?.points !== null &&
                next?.points !== undefined
                    ? wc2.points - next.points
                    : null;
            const gapGames =
                wc2?.gamesPlayed !== null &&
                wc2?.gamesPlayed !== undefined &&
                next?.gamesPlayed !== null &&
                next?.gamesPlayed !== undefined
                    ? wc2.gamesPlayed - next.gamesPlayed
                    : null;

            return {
                conference,
                wc1,
                wc2,
                next,
                gapPoints,
                gapGames,
            };
        });
    }, [standings]);

    const pointsLeaders = useMemo(
        () =>
            [...skaters]
                .filter((player) => player.points !== null && player.points !== undefined)
                .sort((a, b) => (b.points ?? -1) - (a.points ?? -1))
                .slice(0, 5),
        [skaters],
    );
    const goalsLeaders = useMemo(
        () =>
            [...skaters]
                .filter((player) => player.goals !== null && player.goals !== undefined)
                .sort((a, b) => (b.goals ?? -1) - (a.goals ?? -1))
                .slice(0, 5),
        [skaters],
    );
    const shotsLeaders = useMemo(
        () =>
            [...skaters]
                .filter((player) => player.shots !== null && player.shots !== undefined)
                .sort((a, b) => (b.shots ?? -1) - (a.shots ?? -1))
                .slice(0, 5),
        [skaters],
    );

    const topGoalies = useMemo(() => {
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
            })
            .slice(0, 5);
    }, [goalieLeaders]);

    const liveGames = useMemo(
        () => scoreboardEntries.filter((entry) => Boolean(entry.live)),
        [scoreboardEntries],
    );

    const recentFinals = useMemo(() => {
        const now = Date.now();
        const cutoff = now - 24 * 60 * 60 * 1000;
        return scoreboardEntries
            .filter(
                (entry) =>
                    entry.startTime !== null &&
                    entry.startTime >= cutoff &&
                    entry.startTime <= now &&
                    !entry.live,
            )
            .sort((a, b) => (b.startTime ?? 0) - (a.startTime ?? 0))
            .slice(0, 6);
    }, [scoreboardEntries]);

    const teamCount = teams.length || standings.length;

    const buildPlayerLink = (player: { id: string; team?: string | null }) => {
        if (!player.team) {
            return `/lab/players/${player.id}`;
        }
        return `/lab/players/${player.id}?team=${player.team}&season=${EDGE_SEASON}&gameType=${EDGE_GAME_TYPE}`;
    };

    const highlightCards = useMemo(() => {
        const topSkater = pointsLeaders[0];
        return [
            {
                label: 'Standings lead',
                value:
                    topStanding?.points !== null &&
                    topStanding?.points !== undefined
                        ? String(topStanding.points)
                        : '--',
                note: topStanding
                    ? `${topStanding.name} | ${formatRecord(topStanding)}`
                    : teamCount
                      ? `${teamCount} teams tracked`
                      : 'No standings yet',
            },
            {
                label: 'Live now',
                value: liveGames.length ? String(liveGames.length) : '--',
                note: liveGames.length ? 'Games in progress' : 'No live games',
            },
            {
                label: 'Next 24h',
                value: next24Games.length ? String(next24Games.length) : '--',
                note: 'Games scheduled',
            },
            {
                label: 'Points leader',
                value:
                    topSkater?.points !== null &&
                    topSkater?.points !== undefined
                        ? String(topSkater.points)
                        : '--',
                note: topSkater
                    ? `${topSkater.name} (${resolveTeamName(topSkater.team)})`
                    : 'No skater data',
            },
        ];
    }, [
        liveGames.length,
        next24Games.length,
        pointsLeaders,
        resolveTeamName,
        teamCount,
        topStanding,
    ]);

    return (
        <>
            <Head title="Lab Highlights" />
            <LabLayout active="highlights">
                <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {highlightCards.map((card) => (
                        <div
                            key={card.label}
                            className="overflow-hidden rounded-lg bg-white shadow-sm"
                        >
                            <div className="p-6">
                                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                    {card.label}
                                </p>
                                <p className="mt-3 text-3xl font-semibold text-gray-900">
                                    {card.value}
                                </p>
                                <p className="mt-2 text-sm text-gray-600">
                                    {card.note}
                                </p>
                            </div>
                        </div>
                    ))}
                </section>

                <section className="grid gap-6 lg:grid-cols-2">
                    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                Scoreboard
                            </p>
                            <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                                Live now
                            </h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {scoreboardQuery.isLoading && (
                                <p className="px-6 py-4 text-sm text-gray-600">
                                    Loading scoreboard...
                                </p>
                            )}
                            {scoreboardQuery.isError && (
                                <p className="px-6 py-4 text-sm text-gray-600">
                                    Scoreboard data is unavailable.
                                </p>
                            )}
                            {!scoreboardQuery.isLoading &&
                                !scoreboardQuery.isError &&
                                liveGames.length === 0 && (
                                    <p className="px-6 py-4 text-sm text-gray-600">
                                        No live games right now.
                                    </p>
                                )}
                            {liveGames.map((game) => {
                                const scoreLabel =
                                    game.awayScore !== null &&
                                    game.awayScore !== undefined &&
                                    game.homeScore !== null &&
                                    game.homeScore !== undefined
                                        ? `${game.awayScore}-${game.homeScore}`
                                        : '--';
                                const statusLabel =
                                    game.status ?? 'In progress';
                                const situationLabel =
                                    game.situations?.away || game.situations?.home
                                        ? `${game.situations?.away ?? '--'} / ${game.situations?.home ?? '--'}`
                                        : '';
                                const liveClock = game.live?.inIntermission
                                    ? game.live?.intermissionLabel ?? 'Intermission'
                                    : game.live?.clock ?? '';
                                const livePeriod =
                                    game.live?.periodType
                                        ? `${game.live.periodType}${game.live?.period ? ` ${game.live.period}` : ''}`
                                        : game.live?.period
                                          ? `P${game.live.period}`
                                          : '';
                                const liveDetail = [liveClock, livePeriod]
                                    .filter(Boolean)
                                    .join(' | ');
                                const linescoreSummary = formatLinescoreSummary(
                                    game.linescore,
                                );
                                const shotsAway = game.linescore?.shots?.away;
                                const shotsHome = game.linescore?.shots?.home;
                                const shotsLabel =
                                    shotsAway !== null &&
                                    shotsAway !== undefined &&
                                    shotsHome !== null &&
                                    shotsHome !== undefined
                                        ? `SOG ${shotsAway}-${shotsHome}`
                                        : '';
                                const broadcastLabel = game.tvBroadcasts?.length
                                    ? `TV ${game.tvBroadcasts.join(', ')}`
                                    : '';
                                return (
                                    <div
                                        key={game.id}
                                        className="px-6 py-4 text-sm"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <Link
                                                    href={`/lab/scores/${game.id}`}
                                                    className="font-semibold text-gray-900 transition hover:text-indigo-600"
                                                >
                                                    {game.awayName} @ {game.homeName}
                                                </Link>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {statusLabel}
                                                    {game.series ? ` | ${game.series}` : ''}
                                                </p>
                                                {liveDetail && (
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        {liveDetail}
                                                    </p>
                                                )}
                                                {situationLabel && (
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        Strength {situationLabel}
                                                    </p>
                                                )}
                                                {broadcastLabel && (
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        {broadcastLabel}
                                                    </p>
                                                )}
                                                {linescoreSummary && (
                                                    <p className="mt-1 text-xs text-gray-400">
                                                        {linescoreSummary}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-semibold text-gray-900">
                                                    {scoreLabel}
                                                </p>
                                                {shotsLabel && (
                                                    <p className="text-xs text-gray-500">
                                                        {shotsLabel}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                Scoreboard
                            </p>
                            <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                                Recent finals
                            </h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {scoreboardQuery.isLoading && (
                                <p className="px-6 py-4 text-sm text-gray-600">
                                    Loading recent finals...
                                </p>
                            )}
                            {scoreboardQuery.isError && (
                                <p className="px-6 py-4 text-sm text-gray-600">
                                    Scoreboard data is unavailable.
                                </p>
                            )}
                            {!scoreboardQuery.isLoading &&
                                !scoreboardQuery.isError &&
                                recentFinals.length === 0 && (
                                    <p className="px-6 py-4 text-sm text-gray-600">
                                        No finals in the last 24 hours.
                                    </p>
                                )}
                            {recentFinals.map((game) => {
                                const scoreLabel =
                                    game.awayScore !== null &&
                                    game.awayScore !== undefined &&
                                    game.homeScore !== null &&
                                    game.homeScore !== undefined
                                        ? `${game.awayScore}-${game.homeScore}`
                                        : '--';
                                const linescoreSummary = formatLinescoreSummary(
                                    game.linescore,
                                );
                                const shotsAway = game.linescore?.shots?.away;
                                const shotsHome = game.linescore?.shots?.home;
                                const shotsLabel =
                                    shotsAway !== null &&
                                    shotsAway !== undefined &&
                                    shotsHome !== null &&
                                    shotsHome !== undefined
                                        ? `SOG ${shotsAway}-${shotsHome}`
                                        : '';
                                const broadcastLabel = game.tvBroadcasts?.length
                                    ? `TV ${game.tvBroadcasts.join(', ')}`
                                    : '';
                                return (
                                    <div
                                        key={game.id}
                                        className="px-6 py-4 text-sm"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <Link
                                                    href={`/lab/scores/${game.id}`}
                                                    className="font-semibold text-gray-900 transition hover:text-indigo-600"
                                                >
                                                    {game.awayName} @ {game.homeName}
                                                </Link>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    Final
                                                    {game.series ? ` | ${game.series}` : ''}
                                                </p>
                                                {broadcastLabel && (
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        {broadcastLabel}
                                                    </p>
                                                )}
                                                {linescoreSummary && (
                                                    <p className="mt-1 text-xs text-gray-400">
                                                        {linescoreSummary}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-semibold text-gray-900">
                                                    {scoreLabel}
                                                </p>
                                                {shotsLabel && (
                                                    <p className="text-xs text-gray-500">
                                                        {shotsLabel}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-2">
                    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                Next 24 hours
                            </p>
                            <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                                Upcoming slate
                            </h2>
                        </div>
                        <div className="space-y-3 px-6 py-4 text-sm">
                            {scheduleQuery.isLoading && (
                                <p className="text-gray-600">
                                    Loading schedule...
                                </p>
                            )}
                            {scheduleQuery.isError && (
                                <p className="text-gray-600">
                                    Schedule data is unavailable.
                                </p>
                            )}
                            {!scheduleQuery.isLoading &&
                                !scheduleQuery.isError &&
                                next24Games.length === 0 && (
                                    <p className="text-gray-600">
                                        No games in the next 24 hours.
                                    </p>
                                )}
                            {next24Games.map((game) => (
                                <div
                                    key={game.id}
                                    className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3"
                                >
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {game.away.name} @ {game.home.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {normalizeDate(game.startTime || '')}
                                        </p>
                                    </div>
                                    <div className="text-right text-xs text-gray-500">
                                        <p>{game.status ?? 'Scheduled'}</p>
                                        <p className="mt-1 text-sm font-semibold text-gray-900">
                                            {normalizeTime(game.startTime)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                Rest tracker
                            </p>
                            <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                                Shortest turnaround
                            </h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {scheduleQuery.isLoading && (
                                <p className="px-6 py-4 text-sm text-gray-600">
                                    Loading rest tracker...
                                </p>
                            )}
                            {scheduleQuery.isError && (
                                <p className="px-6 py-4 text-sm text-gray-600">
                                    Rest tracker data is unavailable.
                                </p>
                            )}
                            {!scheduleQuery.isLoading &&
                                !scheduleQuery.isError &&
                                restTracker.length === 0 && (
                                    <p className="px-6 py-4 text-sm text-gray-600">
                                        No upcoming games to track.
                                    </p>
                                )}
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
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-2">
                    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                Top streaks
                            </p>
                            <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                                Hot + cold runs
                            </h2>
                        </div>
                        <div className="grid gap-4 px-6 py-4 text-sm sm:grid-cols-2">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                    Hot streaks
                                </p>
                                <div className="mt-3 space-y-2">
                                    {winStreaks.length === 0 && (
                                        <p className="text-sm text-gray-600">
                                            No win streaks yet.
                                        </p>
                                    )}
                                    {winStreaks.map((team) => {
                                        const logo = resolveTeamLogo(team.abbrev);
                                        return (
                                            <div
                                                key={team.id}
                                                className="flex items-center justify-between text-sm"
                                            >
                                                <div className="flex items-center gap-2">
                                                    {logo && (
                                                        <img
                                                            src={logo}
                                                            alt={`${team.name} logo`}
                                                            className="h-5 w-5 object-contain"
                                                            loading="lazy"
                                                        />
                                                    )}
                                                    <span className="font-semibold text-gray-900">
                                                        {team.name}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    {formatStreak(
                                                        team.streakCode,
                                                        team.streakCount,
                                                    )}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                    Cold streaks
                                </p>
                                <div className="mt-3 space-y-2">
                                    {lossStreaks.length === 0 && (
                                        <p className="text-sm text-gray-600">
                                            No loss streaks yet.
                                        </p>
                                    )}
                                    {lossStreaks.map((team) => {
                                        const logo = resolveTeamLogo(team.abbrev);
                                        return (
                                            <div
                                                key={team.id}
                                                className="flex items-center justify-between text-sm"
                                            >
                                                <div className="flex items-center gap-2">
                                                    {logo && (
                                                        <img
                                                            src={logo}
                                                            alt={`${team.name} logo`}
                                                            className="h-5 w-5 object-contain"
                                                            loading="lazy"
                                                        />
                                                    )}
                                                    <span className="font-semibold text-gray-900">
                                                        {team.name}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    {formatStreak(
                                                        team.streakCode,
                                                        team.streakCount,
                                                    )}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                Team benchmarks
                            </p>
                            <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                                Goal swing + rates
                            </h2>
                        </div>
                        <div className="grid gap-4 px-6 py-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                    Best GD
                                </p>
                                <div className="mt-3 space-y-2">
                                    {goalDiffLeaders.best.length === 0 && (
                                        <p className="text-sm text-gray-600">
                                            No data yet.
                                        </p>
                                    )}
                                    {goalDiffLeaders.best.map((team) => {
                                        const logo = resolveTeamLogo(team.abbrev);
                                        return (
                                            <div
                                                key={team.id}
                                                className="flex items-center justify-between text-sm"
                                            >
                                                <div className="flex items-center gap-2">
                                                    {logo && (
                                                        <img
                                                            src={logo}
                                                            alt={`${team.name} logo`}
                                                            className="h-5 w-5 object-contain"
                                                            loading="lazy"
                                                        />
                                                    )}
                                                    <span className="font-semibold text-gray-900">
                                                        {team.name}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    {formatGoalDiff(
                                                        team.goalDifferential,
                                                    )}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                    Worst GD
                                </p>
                                <div className="mt-3 space-y-2">
                                    {goalDiffLeaders.worst.length === 0 && (
                                        <p className="text-sm text-gray-600">
                                            No data yet.
                                        </p>
                                    )}
                                    {goalDiffLeaders.worst.map((team) => {
                                        const logo = resolveTeamLogo(team.abbrev);
                                        return (
                                            <div
                                                key={team.id}
                                                className="flex items-center justify-between text-sm"
                                            >
                                                <div className="flex items-center gap-2">
                                                    {logo && (
                                                        <img
                                                            src={logo}
                                                            alt={`${team.name} logo`}
                                                            className="h-5 w-5 object-contain"
                                                            loading="lazy"
                                                        />
                                                    )}
                                                    <span className="font-semibold text-gray-900">
                                                        {team.name}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    {formatGoalDiff(
                                                        team.goalDifferential,
                                                    )}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                    Best offense
                                </p>
                                <div className="mt-3 space-y-2">
                                    {offenseLeaders.length === 0 && (
                                        <p className="text-sm text-gray-600">
                                            No data yet.
                                        </p>
                                    )}
                                    {offenseLeaders.map((entry) => {
                                        const logo = resolveTeamLogo(entry.row.abbrev);
                                        return (
                                            <div
                                                key={entry.row.id}
                                                className="flex items-center justify-between text-sm"
                                            >
                                                <div className="flex items-center gap-2">
                                                    {logo && (
                                                        <img
                                                            src={logo}
                                                            alt={`${entry.row.name} logo`}
                                                            className="h-5 w-5 object-contain"
                                                            loading="lazy"
                                                        />
                                                    )}
                                                    <span className="font-semibold text-gray-900">
                                                        {entry.row.name}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    GF/G {formatPerGame(entry.perGame)}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                    Best defense
                                </p>
                                <div className="mt-3 space-y-2">
                                    {defenseLeaders.length === 0 && (
                                        <p className="text-sm text-gray-600">
                                            No data yet.
                                        </p>
                                    )}
                                    {defenseLeaders.map((entry) => {
                                        const logo = resolveTeamLogo(entry.row.abbrev);
                                        return (
                                            <div
                                                key={entry.row.id}
                                                className="flex items-center justify-between text-sm"
                                            >
                                                <div className="flex items-center gap-2">
                                                    {logo && (
                                                        <img
                                                            src={logo}
                                                            alt={`${entry.row.name} logo`}
                                                            className="h-5 w-5 object-contain"
                                                            loading="lazy"
                                                        />
                                                    )}
                                                    <span className="font-semibold text-gray-900">
                                                        {entry.row.name}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    GA/G {formatPerGame(entry.perGame)}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-2">
                    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                Wild card race
                            </p>
                            <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                                WC1 + WC2 snapshots
                            </h2>
                        </div>
                        <div className="space-y-4 px-6 py-4 text-sm">
                            {wildcardRace.map((conference) => (
                                <div
                                    key={conference.conference}
                                    className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3"
                                >
                                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                        {conference.conference}
                                    </p>
                                    <div className="mt-2 space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                {conference.wc1 && resolveTeamLogo(conference.wc1.abbrev) && (
                                                    <img
                                                        src={resolveTeamLogo(conference.wc1.abbrev) ?? ''}
                                                        alt={`${conference.wc1.name} logo`}
                                                        className="h-5 w-5 object-contain"
                                                        loading="lazy"
                                                    />
                                                )}
                                                <span className="font-semibold text-gray-900">
                                                    WC1{' '}
                                                    {conference.wc1
                                                        ? conference.wc1.name
                                                        : 'TBD'}
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                PTS{' '}
                                                {conference.wc1?.points ?? '--'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                {conference.wc2 && resolveTeamLogo(conference.wc2.abbrev) && (
                                                    <img
                                                        src={resolveTeamLogo(conference.wc2.abbrev) ?? ''}
                                                        alt={`${conference.wc2.name} logo`}
                                                        className="h-5 w-5 object-contain"
                                                        loading="lazy"
                                                    />
                                                )}
                                                <span className="font-semibold text-gray-900">
                                                    WC2{' '}
                                                    {conference.wc2
                                                        ? conference.wc2.name
                                                        : 'TBD'}
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                PTS{' '}
                                                {conference.wc2?.points ?? '--'}
                                            </span>
                                        </div>
                                        {conference.next && (
                                            <p className="text-xs text-gray-500">
                                                Gap to next: {formatGap(conference.gapPoints)}{' '}
                                                pts | GP {formatGap(conference.gapGames)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                Players + Edge
                            </p>
                            <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                                Skater leaders
                            </h2>
                        </div>
                        <div className="px-6 py-4 text-sm">
                            {skatersQuery.isLoading && (
                                <p className="text-gray-600">
                                    Loading NHL Edge data...
                                </p>
                            )}
                            {skatersQuery.isError && (
                                <p className="text-gray-600">
                                    NHL Edge data is unavailable.
                                </p>
                            )}
                            {!skatersQuery.isLoading &&
                                !skatersQuery.isError &&
                                pointsLeaders.length === 0 &&
                                goalsLeaders.length === 0 &&
                                shotsLeaders.length === 0 && (
                                    <p className="text-gray-600">
                                        No NHL Edge data yet.
                                    </p>
                                )}
                            {!skatersQuery.isLoading &&
                                !skatersQuery.isError &&
                                (pointsLeaders.length > 0 ||
                                    goalsLeaders.length > 0 ||
                                    shotsLeaders.length > 0) && (
                                    <div className="grid gap-4 sm:grid-cols-3">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                                Points
                                            </p>
                                            <div className="mt-3 space-y-2">
                                                {pointsLeaders.map((player) => {
                                                    const logo = resolveTeamLogo(player.team);
                                                    return (
                                                        <div
                                                            key={player.id}
                                                            className="flex items-center justify-between text-sm"
                                                        >
                                                            <div className="flex items-start gap-2">
                                                                {logo && (
                                                                    <img
                                                                        src={logo}
                                                                        alt={`${resolveTeamName(player.team)} logo`}
                                                                        className="h-6 w-6 object-contain"
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
                                                                        {resolveTeamName(
                                                                            player.team,
                                                                        )}{' '}
                                                                        |{' '}
                                                                        {player.position ??
                                                                            'POS'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-xs font-semibold text-gray-900">
                                                                    PTS{' '}
                                                                    {player.points ??
                                                                        '--'}
                                                                </p>
                                                                {player.gamesPlayed !==
                                                                    null &&
                                                                    player.gamesPlayed !==
                                                                        undefined && (
                                                                        <p className="text-xs text-gray-500">
                                                                            GP{' '}
                                                                            {player.gamesPlayed}
                                                                        </p>
                                                                    )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                                Goals
                                            </p>
                                            <div className="mt-3 space-y-2">
                                                {goalsLeaders.map((player) => {
                                                    const logo = resolveTeamLogo(player.team);
                                                    return (
                                                        <div
                                                            key={player.id}
                                                            className="flex items-center justify-between text-sm"
                                                        >
                                                            <div className="flex items-start gap-2">
                                                                {logo && (
                                                                    <img
                                                                        src={logo}
                                                                        alt={`${resolveTeamName(player.team)} logo`}
                                                                        className="h-6 w-6 object-contain"
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
                                                                        {resolveTeamName(
                                                                            player.team,
                                                                        )}{' '}
                                                                        |{' '}
                                                                        {player.position ??
                                                                            'POS'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-xs font-semibold text-gray-900">
                                                                    G{' '}
                                                                    {player.goals ??
                                                                        '--'}
                                                                </p>
                                                                {player.gamesPlayed !==
                                                                    null &&
                                                                    player.gamesPlayed !==
                                                                        undefined && (
                                                                        <p className="text-xs text-gray-500">
                                                                            GP{' '}
                                                                            {player.gamesPlayed}
                                                                        </p>
                                                                    )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                                Shots
                                            </p>
                                            <div className="mt-3 space-y-2">
                                                {shotsLeaders.map((player) => {
                                                    const logo = resolveTeamLogo(player.team);
                                                    return (
                                                        <div
                                                            key={player.id}
                                                            className="flex items-center justify-between text-sm"
                                                        >
                                                            <div className="flex items-start gap-2">
                                                                {logo && (
                                                                    <img
                                                                        src={logo}
                                                                        alt={`${resolveTeamName(player.team)} logo`}
                                                                        className="h-6 w-6 object-contain"
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
                                                                        {resolveTeamName(
                                                                            player.team,
                                                                        )}{' '}
                                                                        |{' '}
                                                                        {player.position ??
                                                                            'POS'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-xs font-semibold text-gray-900">
                                                                    SOG{' '}
                                                                    {player.shots ??
                                                                        '--'}
                                                                </p>
                                                                {player.gamesPlayed !==
                                                                    null &&
                                                                    player.gamesPlayed !==
                                                                        undefined && (
                                                                        <p className="text-xs text-gray-500">
                                                                            GP{' '}
                                                                            {player.gamesPlayed}
                                                                        </p>
                                                                    )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-2">
                    <div className="overflow-hidden rounded-lg bg-white shadow-sm lg:col-span-2">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                Goalies
                            </p>
                            <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                                Top performers
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
