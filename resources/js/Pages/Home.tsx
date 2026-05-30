import { Head, Link } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import {
    fetchNhl,
    normalizeDate,
    normalizeTime,
    parseSchedule,
    parseStandings,
    parseTeams,
} from '@/lib/nhl';

export default function Home() {
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
    const teamsQuery = useQuery({
        queryKey: ['nhl', 'teams'],
        queryFn: () => fetchNhl('teams'),
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
    const teams = useMemo(
        () => parseTeams(teamsQuery.data ?? {}),
        [teamsQuery.data],
    );

    const totalGames = useMemo(
        () => schedule.reduce((sum, day) => sum + day.games.length, 0),
        [schedule],
    );

    const nextGame = useMemo(() => {
        const now = Date.now();
        const games = schedule.flatMap((day) => day.games);
        const upcoming = games
            .map((game) => ({
                game,
                time: game.startTime ? new Date(game.startTime).getTime() : null,
            }))
            .filter(
                (entry) =>
                    entry.time !== null && !Number.isNaN(entry.time),
            )
            .filter((entry) => (entry.time as number) >= now)
            .sort((a, b) => (a.time as number) - (b.time as number));

        return upcoming[0]?.game ?? null;
    }, [schedule]);

    const topStanding = useMemo(() => {
        if (!standings.length) {
            return null;
        }
        return [...standings].sort(
            (a, b) => (b.points ?? -1) - (a.points ?? -1),
        )[0];
    }, [standings]);

    const leaders = useMemo(() => {
        return [...standings]
            .sort((a, b) => (b.points ?? -1) - (a.points ?? -1))
            .slice(0, 5);
    }, [standings]);

    const upcomingDay = schedule[0];
    const upcomingGames = upcomingDay?.games?.slice(0, 4) ?? [];

    return (
        <>
            <Head title="The Hockey Lab" />
            <div className="min-h-screen bg-gray-100">
                <nav className="border-b border-gray-100 bg-white">
                    <div className="mx-auto h-16 max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-full items-center">
                            <div className="w-48">
                                <Link
                                    href="/"
                                    className="flex items-center gap-2 text-lg font-semibold text-gray-900"
                                >
                                    <img
                                        src="/brand/logo-transparent.png"
                                        alt="The Hockey Lab logo"
                                        className="h-9 w-9 object-contain"
                                    />
                                    <span>The Hockey Lab</span>
                                </Link>
                            </div>
                            <div className="flex flex-1 justify-center">
                                <div className="flex items-center gap-6 text-sm text-gray-600">
                                    <Link
                                        href="/lab"
                                        className="transition hover:text-gray-900"
                                    >
                                        Highlights
                                    </Link>
                                    <Link
                                        href="/lab/scores"
                                        className="transition hover:text-gray-900"
                                    >
                                        Scores
                                    </Link>
                                    <Link
                                        href="/lab/standings"
                                        className="transition hover:text-gray-900"
                                    >
                                        Standings
                                    </Link>
                                    <Link
                                        href="/lab/teams"
                                        className="transition hover:text-gray-900"
                                    >
                                        Teams
                                    </Link>
                                    <Link
                                        href="/lab/stats"
                                        className="transition hover:text-gray-900"
                                    >
                                        Stats
                                    </Link>
                                    <Link
                                        href="/lab/hockey-iq"
                                        className="transition hover:text-gray-900"
                                    >
                                        Hockey IQ
                                    </Link>
                                </div>
                            </div>
                            <div className="w-48" />
                        </div>
                    </div>
                </nav>

                <main className="pb-10 pt-4">
                    <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-center">
                            <img
                                src="/brand/logo-transparent.png"
                                alt="The Hockey Lab logo"
                                className="h-96 w-auto"
                            />
                        </div>
                        <section className="overflow-hidden rounded-lg bg-white shadow-sm">
                            <div className="p-6">
                                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                    The Hockey Lab
                                </p>
                                <h1 className="mt-2 text-2xl font-semibold text-gray-900">
                                    NHL schedules, standings, and teams in one
                                    clean view.
                                </h1>
                                <p className="mt-2 text-gray-600">
                                    Use the Lab to track scores, standings, and
                                    team info without extra noise.
                                </p>
                                <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                                    {scheduleQuery.isLoading && (
                                        <span>Loading next matchup...</span>
                                    )}
                                    {scheduleQuery.isError && (
                                        <span>
                                            Next matchup is unavailable.
                                        </span>
                                    )}
                                    {!scheduleQuery.isLoading &&
                                        !scheduleQuery.isError && (
                                            <span>
                                                Next puck drop:{' '}
                                                {nextGame
                                                    ? `${nextGame.away.name} @ ${nextGame.home.name} - ${normalizeDate(nextGame.startTime || '')} ${normalizeTime(nextGame.startTime)}`
                                                    : 'No upcoming games.'}
                                            </span>
                                        )}
                                </div>
                                <div className="mt-6 flex flex-wrap gap-3">
                                    <Link
                                        href="/lab/scores"
                                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
                                    >
                                        View scores
                                    </Link>
                                    <Link
                                        href="/lab/standings"
                                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                                    >
                                        See standings
                                    </Link>
                                </div>
                            </div>
                        </section>

                        <section className="grid gap-6 md:grid-cols-3">
                            {[
                                {
                                    label: 'Games on slate',
                                    value: totalGames ? String(totalGames) : '--',
                                    note: 'Next 3 days',
                                },
                                {
                                    label: 'Top points',
                                    value:
                                        topStanding?.points !== null &&
                                        topStanding?.points !== undefined
                                            ? String(topStanding.points)
                                            : '--',
                                    note: topStanding
                                        ? topStanding.name
                                        : 'No standings yet',
                                },
                                {
                                    label: 'Teams tracked',
                                    value: teams.length ? String(teams.length) : '--',
                                    note: 'League total',
                                },
                            ].map((card) => (
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

                        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                            <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                                <div className="border-b border-gray-100 px-6 py-4">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                        Upcoming games
                                    </p>
                                    <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                                        Today + next
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
                                        upcomingGames.length === 0 && (
                                            <p className="text-gray-600">
                                                No games scheduled.
                                            </p>
                                        )}
                                    {upcomingGames.map((game) => (
                                        <div
                                            key={game.id}
                                            className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3"
                                        >
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {game.away.name} @{' '}
                                                    {game.home.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {game.venue ?? 'Venue'}
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
                                        Standings leaders
                                    </p>
                                    <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                                        Top 5 points
                                    </h2>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {standingsQuery.isLoading && (
                                        <p className="px-6 py-4 text-sm text-gray-600">
                                            Loading standings...
                                        </p>
                                    )}
                                    {standingsQuery.isError && (
                                        <p className="px-6 py-4 text-sm text-gray-600">
                                            Standings data is unavailable.
                                        </p>
                                    )}
                                    {!standingsQuery.isLoading &&
                                        !standingsQuery.isError &&
                                        leaders.length === 0 && (
                                            <p className="px-6 py-4 text-sm text-gray-600">
                                                No standings data yet.
                                            </p>
                                        )}
                                    {leaders.map((team) => (
                                        <div
                                            key={team.id}
                                            className="flex items-center justify-between px-6 py-3 text-sm"
                                        >
                                            <span className="font-semibold text-gray-900">
                                                {team.name}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                PTS {team.points ?? '--'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <section className="grid gap-6 lg:grid-cols-3">
                            {[
                                {
                                    title: 'Scores',
                                    copy: 'Live and upcoming matchups in one place.',
                                    href: '/lab/scores',
                                },
                                {
                                    title: 'Standings',
                                    copy: 'League snapshot with points and records.',
                                    href: '/lab/standings',
                                },
                                {
                                    title: 'Teams',
                                    copy: 'Full team list with splits and streaks.',
                                    href: '/lab/teams',
                                },
                                {
                                    title: 'Stats',
                                    copy: 'Team stats, player stats, and league totals.',
                                    href: '/lab/stats',
                                },
                                {
                                    title: 'Hockey IQ',
                                    copy: 'Edge data, draft outlook, and matchup intel.',
                                    href: '/lab/hockey-iq',
                                },
                            ].map((card) => (
                                <Link
                                    key={card.title}
                                    href={card.href}
                                    className="block overflow-hidden rounded-lg bg-white shadow-sm transition hover:shadow"
                                >
                                    <div className="p-6">
                                        <p className="text-lg font-semibold text-gray-900">
                                            {card.title}
                                        </p>
                                        <p className="mt-2 text-sm text-gray-600">
                                            {card.copy}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </section>
                    </div>
                </main>
            </div>
        </>
    );
}
