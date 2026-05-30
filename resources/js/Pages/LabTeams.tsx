import { Head, Link } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import LabLayout from '@/Layouts/LabLayout';
import { fetchNhl, parseStandings } from '@/lib/nhl';
import { getTeamColor } from '@/lib/teamColors';

const CONFERENCE_FILTERS = ['All', 'Eastern', 'Western'] as const;
const DIVISION_FILTERS = [
    'All',
    'Atlantic',
    'Metropolitan',
    'Central',
    'Pacific',
] as const;

const SORT_OPTIONS = [
    { value: 'points', label: 'Points' },
    { value: 'pointPctg', label: 'Point %' },
    { value: 'goalDiff', label: 'Goal diff' },
    { value: 'streak', label: 'Streak' },
    { value: 'last10', label: 'Last 10 pts' },
    { value: 'goalsFor', label: 'Goals for' },
    { value: 'alpha', label: 'Alphabetical' },
] as const;

type SortKey = (typeof SORT_OPTIONS)[number]['value'];

const toRgba = (hex: string, alpha: number) => {
    const normalized = hex.replace('#', '');
    const clamped = Math.max(0, Math.min(1, alpha));
    if (normalized.length !== 6) {
        return `rgba(17, 24, 39, ${clamped})`;
    }
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${clamped})`;
};

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

const formatLast10 = (
    wins?: number | null,
    losses?: number | null,
    ot?: number | null,
) => {
    if (wins === null || wins === undefined) {
        return '--';
    }
    return `${wins}-${losses ?? 0}-${ot ?? 0}`;
};

const getStreakValue = (code?: string, count?: number | null) => {
    if (!code || count === null || count === undefined) {
        return 0;
    }
    if (code.startsWith('W')) {
        return count;
    }
    if (code.startsWith('L')) {
        return -count;
    }
    return 0;
};

const getLast10Points = (
    wins?: number | null,
    ot?: number | null,
) => {
    if (wins === null || wins === undefined) {
        return null;
    }
    return wins * 2 + (ot ?? 0);
};

const toTeamParam = (teamName: string, abbrev?: string | null) => {
    if (abbrev) {
        return abbrev.toLowerCase();
    }
    return teamName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
};

export default function LabTeams() {
    const standingsQuery = useQuery({
        queryKey: ['nhl', 'standings'],
        queryFn: () => fetchNhl('standings'),
        staleTime: 60_000,
    });

    const standings = useMemo(
        () => parseStandings(standingsQuery.data ?? {}),
        [standingsQuery.data],
    );

    const [conferenceFilter, setConferenceFilter] = useState<
        (typeof CONFERENCE_FILTERS)[number]
    >('All');
    const [divisionFilter, setDivisionFilter] = useState<
        (typeof DIVISION_FILTERS)[number]
    >('All');
    const [sortKey, setSortKey] = useState<SortKey>('points');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [search, setSearch] = useState('');
    const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

    const filteredTeams = useMemo(() => {
        const query = search.trim().toLowerCase();
        return standings.filter((team) => {
            if (
                conferenceFilter !== 'All' &&
                team.conferenceName !== conferenceFilter
            ) {
                return false;
            }
            if (
                divisionFilter !== 'All' &&
                team.divisionName !== divisionFilter
            ) {
                return false;
            }
            if (query) {
                const haystack = `${team.name} ${team.abbrev ?? ''}`.toLowerCase();
                if (!haystack.includes(query)) {
                    return false;
                }
            }
            return true;
        });
    }, [conferenceFilter, divisionFilter, search, standings]);

    const sortedTeams = useMemo(() => {
        const direction = sortDir === 'asc' ? 1 : -1;
        return [...filteredTeams].sort((a, b) => {
            if (sortKey === 'alpha') {
                return direction * a.name.localeCompare(b.name);
            }

            const aValue =
                sortKey === 'points'
                    ? a.points
                    : sortKey === 'pointPctg'
                      ? a.pointPctg
                      : sortKey === 'goalDiff'
                        ? a.goalDifferential
                        : sortKey === 'streak'
                          ? getStreakValue(a.streakCode, a.streakCount)
                          : sortKey === 'last10'
                            ? getLast10Points(a.l10Wins, a.l10OtLosses)
                            : sortKey === 'goalsFor'
                              ? a.goalsFor
                              : null;

            const bValue =
                sortKey === 'points'
                    ? b.points
                    : sortKey === 'pointPctg'
                      ? b.pointPctg
                      : sortKey === 'goalDiff'
                        ? b.goalDifferential
                        : sortKey === 'streak'
                          ? getStreakValue(b.streakCode, b.streakCount)
                          : sortKey === 'last10'
                            ? getLast10Points(b.l10Wins, b.l10OtLosses)
                            : sortKey === 'goalsFor'
                              ? b.goalsFor
                              : null;

            const aNumber =
                typeof aValue === 'number'
                    ? aValue
                    : sortDir === 'asc'
                      ? Number.POSITIVE_INFINITY
                      : Number.NEGATIVE_INFINITY;
            const bNumber =
                typeof bValue === 'number'
                    ? bValue
                    : sortDir === 'asc'
                      ? Number.POSITIVE_INFINITY
                      : Number.NEGATIVE_INFINITY;

            if (aNumber === bNumber) {
                return a.name.localeCompare(b.name);
            }

            return direction * (aNumber - bNumber);
        });
    }, [filteredTeams, sortDir, sortKey]);

    return (
        <>
            <Head title="Teams" />
            <LabLayout active="teams">
                <section className="overflow-hidden rounded-lg bg-white shadow-sm">
                    <div className="border-b border-gray-100 px-6 py-4">
                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                            Teams
                        </p>
                        <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                            All teams + quick stats
                        </h2>

                        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-center">
                            <label className="block">
                                <span className="sr-only">Search teams</span>
                                <input
                                    type="search"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Search teams"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200"
                                />
                            </label>
                            <label className="block">
                                <span className="sr-only">Sort teams</span>
                                <select
                                    value={sortKey}
                                    onChange={(event) =>
                                        setSortKey(event.target.value as SortKey)
                                    }
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200"
                                >
                                    {SORT_OPTIONS.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <button
                                type="button"
                                onClick={() =>
                                    setSortDir((current) =>
                                        current === 'asc' ? 'desc' : 'asc',
                                    )
                                }
                                className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                            >
                                Sort: {sortDir === 'asc' ? 'Asc' : 'Desc'}
                            </button>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            {CONFERENCE_FILTERS.map((label) => (
                                <button
                                    key={label}
                                    type="button"
                                    onClick={() => setConferenceFilter(label)}
                                    className={
                                        label === conferenceFilter
                                            ? 'rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white'
                                            : 'rounded-full border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-50'
                                    }
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {DIVISION_FILTERS.map((label) => (
                                <button
                                    key={label}
                                    type="button"
                                    onClick={() => setDivisionFilter(label)}
                                    className={
                                        label === divisionFilter
                                            ? 'rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white'
                                            : 'rounded-full border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-50'
                                    }
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        <p className="mt-3 text-xs text-gray-500">
                            Showing {sortedTeams.length} teams
                        </p>
                    </div>

                    <div className="grid gap-4 px-6 py-5 sm:grid-cols-2 lg:grid-cols-3">
                        {standingsQuery.isLoading && (
                            <p className="text-sm text-gray-600">
                                Loading teams...
                            </p>
                        )}
                        {standingsQuery.isError && (
                            <p className="text-sm text-gray-600">
                                Team data is unavailable.
                            </p>
                        )}
                        {!standingsQuery.isLoading &&
                            !standingsQuery.isError &&
                            sortedTeams.length === 0 && (
                                <p className="text-sm text-gray-600">
                                    No teams data yet.
                                </p>
                            )}
                        {sortedTeams.map((team) => {
                            const color = getTeamColor(team.abbrev);
                            const background = `linear-gradient(135deg, ${toRgba(
                                color,
                                0.12,
                            )} 0%, #ffffff 60%)`;
                            const isExpanded = expandedTeamId === team.id;
                            const teamParam = toTeamParam(team.name, team.abbrev);
                            const goalDiffClass =
                                team.goalDifferential === null ||
                                team.goalDifferential === undefined
                                    ? 'text-gray-900'
                                    : team.goalDifferential > 0
                                      ? 'text-emerald-600'
                                      : team.goalDifferential < 0
                                        ? 'text-rose-600'
                                        : 'text-gray-900';

                            return (
                                <div
                                    key={team.id}
                                    className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
                                >
                                    <div
                                        className="h-1"
                                        style={{ backgroundColor: color }}
                                    />
                                    <div
                                        className="p-4"
                                        style={{ background }}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm"
                                                    style={{
                                                        border: `2px solid ${color}`,
                                                    }}
                                                >
                                                    {team.logo ? (
                                                        <img
                                                            src={team.logo}
                                                            alt={`${team.name} logo`}
                                                            className="h-9 w-9 object-contain"
                                                        />
                                                    ) : (
                                                        <span className="text-xs font-semibold text-gray-700">
                                                            {team.abbrev ?? '--'}
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <Link
                                                        href={`/lab/teams/${teamParam}`}
                                                        className="text-sm font-semibold text-gray-900 transition hover:text-gray-700"
                                                    >
                                                        {team.name}
                                                    </Link>
                                                    <p className="text-xs text-gray-500">
                                                        {team.abbrev ?? '--'} |{' '}
                                                        {team.conferenceName ??
                                                            'Conference'}{' '}
                                                        |{' '}
                                                        {team.divisionName ??
                                                            'Division'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/lab/teams/${teamParam}`}
                                                    className="text-xs font-semibold text-indigo-600 transition hover:text-indigo-500"
                                                >
                                                    Team page
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setExpandedTeamId(
                                                            (current) =>
                                                                current ===
                                                                team.id
                                                                    ? null
                                                                    : team.id,
                                                        )
                                                    }
                                                    className="text-xs font-semibold text-gray-600 transition hover:text-gray-900"
                                                    aria-expanded={isExpanded}
                                                >
                                                    {isExpanded
                                                        ? 'Hide'
                                                        : 'Details'}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                                            <div className="rounded-md border border-gray-200 bg-white px-3 py-2">
                                                <p className="text-[10px] uppercase tracking-widest text-gray-500">
                                                    PTS
                                                </p>
                                                <p className="mt-1 text-sm font-semibold text-gray-900">
                                                    {team.points ?? '--'}
                                                </p>
                                            </div>
                                            <div className="rounded-md border border-gray-200 bg-white px-3 py-2">
                                                <p className="text-[10px] uppercase tracking-widest text-gray-500">
                                                    PCT
                                                </p>
                                                <p className="mt-1 text-sm font-semibold text-gray-900">
                                                    {formatPct(team.pointPctg)}
                                                </p>
                                            </div>
                                            <div className="rounded-md border border-gray-200 bg-white px-3 py-2">
                                                <p className="text-[10px] uppercase tracking-widest text-gray-500">
                                                    GD
                                                </p>
                                                <p
                                                    className={`mt-1 text-sm font-semibold ${goalDiffClass}`}
                                                >
                                                    {formatGoalDiff(
                                                        team.goalDifferential,
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-600">
                                            <span>
                                                Record{' '}
                                                {formatRecord(
                                                    team.wins,
                                                    team.losses,
                                                    team.otLosses,
                                                )}
                                            </span>
                                            <span>
                                                GF/GA {team.goalsFor ?? '--'}/
                                                {team.goalsAgainst ?? '--'}
                                            </span>
                                            <span>
                                                Streak{' '}
                                                {formatStreak(
                                                    team.streakCode,
                                                    team.streakCount,
                                                )}
                                            </span>
                                            <span>
                                                L10{' '}
                                                {formatLast10(
                                                    team.l10Wins,
                                                    team.l10Losses,
                                                    team.l10OtLosses,
                                                )}
                                            </span>
                                        </div>

                                        {isExpanded && (
                                            <div className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-600">
                                                <div className="grid gap-2 sm:grid-cols-2">
                                                    <div>
                                                        Games played{' '}
                                                        {team.gamesPlayed ?? '--'}
                                                    </div>
                                                    <div>
                                                        Goals for{' '}
                                                        {team.goalsFor ?? '--'}
                                                    </div>
                                                    <div>
                                                        Goals against{' '}
                                                        {team.goalsAgainst ?? '--'}
                                                    </div>
                                                    <div>
                                                        Home{' '}
                                                        {formatRecord(
                                                            team.homeWins,
                                                            team.homeLosses,
                                                            team.homeOtLosses,
                                                        )}
                                                    </div>
                                                    <div>
                                                        Road{' '}
                                                        {formatRecord(
                                                            team.roadWins,
                                                            team.roadLosses,
                                                            team.roadOtLosses,
                                                        )}
                                                    </div>
                                                    <div>
                                                        Point %{' '}
                                                        {formatPct(
                                                            team.pointPctg,
                                                        )}
                                                    </div>
                                                    <div>
                                                        Goal diff{' '}
                                                        {formatGoalDiff(
                                                            team.goalDifferential,
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </LabLayout>
        </>
    );
}
