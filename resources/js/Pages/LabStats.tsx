import { Head } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import LabLayout from '@/Layouts/LabLayout';
import {
    fetchNhl,
    parseSkaterDetail,
    parseSkaterLanding,
    parseStandings,
    parseTeams,
} from '@/lib/nhl';

const EDGE_SEASON = '20242025';
const EDGE_GROUP = '2';

export default function LabStats() {
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

    const skatersQuery = useQuery({
        queryKey: ['nhl', 'edge', 'skater-landing', EDGE_SEASON, EDGE_GROUP],
        queryFn: () =>
            fetchNhl(
                `edge/skater-landing?season=${EDGE_SEASON}&group=${EDGE_GROUP}`,
            ),
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
    const skaters = useMemo(
        () => parseSkaterLanding(skatersQuery.data ?? {}),
        [skatersQuery.data],
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

    const resolveTeamName = (value?: string | null) => {
        if (!value) {
            return 'Team';
        }
        return teamNameByAbbrev.get(value.toUpperCase()) ?? value;
    };

    const sortedStandings = useMemo(() => {
        return [...standings].sort(
            (a, b) => (b.points ?? -1) - (a.points ?? -1),
        );
    }, [standings]);

    const leagueTotals = useMemo(() => {
        const totals = standings.reduce(
            (acc, row) => {
                acc.points += row.points ?? 0;
                acc.games += row.gamesPlayed ?? 0;
                return acc;
            },
            { points: 0, games: 0 },
        );
        const teamsCount = teams.length || standings.length;
        const avgPoints =
            teamsCount > 0 ? totals.points / teamsCount : null;

        return {
            points: totals.points,
            games: totals.games,
            teams: teamsCount,
            avgPoints,
        };
    }, [standings, teams.length]);

    const topSkaters = useMemo(() => {
        return [...skaters]
            .sort((a, b) => (b.points ?? -1) - (a.points ?? -1))
            .slice(0, 15);
    }, [skaters]);

    const featuredSkater = topSkaters[0] ?? null;

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

    const skaterDetail = useMemo(
        () => parseSkaterDetail(skaterDetailQuery.data ?? {}, featuredSkater ?? undefined),
        [featuredSkater, skaterDetailQuery.data],
    );

    return (
        <>
            <Head title="Stats" />
            <LabLayout active="stats">
                <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                Team Stats
                            </p>
                            <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                                Points leaders
                            </h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {standingsQuery.isLoading && (
                                <p className="px-6 py-4 text-sm text-gray-600">
                                    Loading team stats...
                                </p>
                            )}
                            {standingsQuery.isError && (
                                <p className="px-6 py-4 text-sm text-gray-600">
                                    Team stats are unavailable.
                                </p>
                            )}
                            {!standingsQuery.isLoading &&
                                sortedStandings.length === 0 && (
                                    <p className="px-6 py-4 text-sm text-gray-600">
                                        No team stats data yet.
                                    </p>
                                )}
                            {sortedStandings.slice(0, 16).map((row) => (
                                <div
                                    key={row.id}
                                    className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 text-sm"
                                >
                                    <span className="font-semibold text-gray-900">
                                        {row.name || row.abbrev}
                                    </span>
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <span>GP {row.gamesPlayed ?? '--'}</span>
                                        <span>PTS {row.points ?? '--'}</span>
                                        <span>{row.record ?? '---'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                            <div className="border-b border-gray-100 px-6 py-4">
                                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                    League Totals
                                </p>
                                <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                                    Snapshot
                                </h2>
                            </div>
                            <div className="grid gap-4 px-6 py-5">
                                <div>
                                    <p className="text-xs uppercase tracking-widest text-gray-500">
                                        Teams
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-gray-900">
                                        {leagueTotals.teams || '--'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-widest text-gray-500">
                                        Total points
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-gray-900">
                                        {leagueTotals.points || '--'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-widest text-gray-500">
                                        Games played
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-gray-900">
                                        {leagueTotals.games || '--'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-widest text-gray-500">
                                        Avg points
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-gray-900">
                                        {leagueTotals.avgPoints !== null
                                            ? leagueTotals.avgPoints.toFixed(1)
                                            : '--'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                            <div className="border-b border-gray-100 px-6 py-4">
                                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                    Player Stats
                                </p>
                                <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                                    NHL Edge leaders
                                </h2>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {skatersQuery.isLoading && (
                                    <p className="px-6 py-4 text-sm text-gray-600">
                                        Loading player stats...
                                    </p>
                                )}
                                {skatersQuery.isError && (
                                    <p className="px-6 py-4 text-sm text-gray-600">
                                        Player stats are unavailable.
                                    </p>
                                )}
                                {!skatersQuery.isLoading &&
                                    topSkaters.length === 0 && (
                                        <p className="px-6 py-4 text-sm text-gray-600">
                                            No player stats data yet.
                                        </p>
                                    )}
                                {topSkaters.map((player) => (
                                    <div
                                        key={player.id}
                                        className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 text-sm"
                                    >
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {player.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {resolveTeamName(player.team)} ·{' '}
                                                {player.position ?? 'POS'}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <span>PTS {player.points ?? '--'}</span>
                                            <span>G {player.goals ?? '--'}</span>
                                            <span>A {player.assists ?? '--'}</span>
                                            <span>GP {player.gamesPlayed ?? '--'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                            <div className="border-b border-gray-100 px-6 py-4">
                                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                    NHL Edge
                                </p>
                                <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                                    Skater detail
                                </h2>
                            </div>
                            <div className="px-6 py-5">
                                {!featuredSkater && (
                                    <p className="text-sm text-gray-600">
                                        No skater detail available yet.
                                    </p>
                                )}
                                {skaterDetailQuery.isLoading && (
                                    <p className="text-sm text-gray-600">
                                        Loading skater detail...
                                    </p>
                                )}
                                {skaterDetailQuery.isError && (
                                    <p className="text-sm text-gray-600">
                                        Skater detail is unavailable.
                                    </p>
                                )}
                                {skaterDetail && (
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-lg font-semibold text-gray-900">
                                                {skaterDetail.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {resolveTeamName(skaterDetail.team)} ·{' '}
                                                {skaterDetail.position ?? 'POS'}
                                            </p>
                                        </div>
                                        {skaterDetail.metrics.length > 0 ? (
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                {skaterDetail.metrics
                                                    .slice(0, 6)
                                                    .map((metric) => (
                                                        <div
                                                            key={metric.label}
                                                            className="rounded-lg border border-gray-200 px-4 py-3 text-sm"
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
                                        ) : (
                                            <p className="text-sm text-gray-600">
                                                No detail metrics returned by the
                                                endpoint yet.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </LabLayout>
        </>
    );
}
