import { Head, Link } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import LabLayout from '@/Layouts/LabLayout';
import { fetchNhl, parseStandings, parseTeams } from '@/lib/nhl';

const VIEWS = ['League', 'Pacific', 'Central', 'Atlantic', 'Metropolitan'] as const;
type ViewKey = (typeof VIEWS)[number];
const COLUMN_LAYOUT =
    'grid grid-cols-[minmax(0,1fr)_88px_72px_96px] items-center gap-3';
const slugify = (value: string) =>
    value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

export default function LabStandings() {
    const [view, setView] = useState<ViewKey>('League');

    const standingsQuery = useQuery({
        queryKey: ['nhl', 'standings'],
        queryFn: () => fetchNhl('standings'),
        staleTime: 60_000,
    });

    const standings = useMemo(
        () => parseStandings(standingsQuery.data ?? {}),
        [standingsQuery.data],
    );
    const teamsQuery = useQuery({
        queryKey: ['nhl', 'teams'],
        queryFn: () => fetchNhl('teams'),
        staleTime: 300_000,
    });
    const teams = useMemo(
        () => parseTeams(teamsQuery.data ?? {}),
        [teamsQuery.data],
    );
    const teamNameByAbbrev = useMemo(() => {
        const map = new Map<string, string>();
        teams.forEach((team) => {
            if (team.abbrev) {
                map.set(team.abbrev.toUpperCase(), team.name);
            }
        });
        return map;
    }, [teams]);
    const filteredStandings = useMemo(() => {
        const rows =
            view === 'League'
                ? standings
                : standings.filter((row) => row.divisionName === view);
        const sorted = [...rows].sort((a, b) => {
            const aSequence =
                view === 'League'
                    ? a.leagueSequence
                    : a.divisionSequence ?? a.conferenceSequence;
            const bSequence =
                view === 'League'
                    ? b.leagueSequence
                    : b.divisionSequence ?? b.conferenceSequence;
            if (aSequence !== null && bSequence !== null && aSequence !== undefined && bSequence !== undefined) {
                return aSequence - bSequence;
            }
            return (b.points ?? -1) - (a.points ?? -1);
        });

        return sorted;
    }, [standings, view]);
    return (
        <>
            <Head title="Standings" />
            <LabLayout active="standings">
                <section className="overflow-hidden rounded-lg bg-white shadow-sm">
                    <div className="border-b border-gray-100 px-6 py-4">
                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                            Standings
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            {VIEWS.map((label) => (
                                <button
                                    key={label}
                                    type="button"
                                    onClick={() => setView(label)}
                                    className={
                                        label === view
                                            ? 'rounded-md bg-gray-900 px-3 py-1 text-xs font-semibold text-white'
                                            : 'rounded-md border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-50'
                                    }
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
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
                            filteredStandings.length === 0 && (
                                <p className="px-6 py-4 text-sm text-gray-600">
                                    No standings data for this view.
                                </p>
                            )}
                        {!standingsQuery.isLoading &&
                            filteredStandings.length > 0 && (
                                <div
                                    className={`${COLUMN_LAYOUT} border-b border-gray-100 bg-gray-50 px-6 py-2 text-[10px] font-semibold uppercase tracking-widest text-gray-500`}
                                >
                                    <span>Team Name</span>
                                    <span className="text-right">Games Played</span>
                                    <span className="text-right">Points</span>
                                    <span className="text-right">W/L/O</span>
                                </div>
                            )}
                        {filteredStandings.map((row) => {
                            const wildCardLabel =
                                row.wildcardSequence === 1
                                    ? 'WC1'
                                    : row.wildcardSequence === 2
                                      ? 'WC2'
                                      : null;

                            const fallbackName =
                                row.name || row.abbrev || 'Team';
                            const maybeAbbrev =
                                row.abbrev ?? (fallbackName.length <= 4 ? fallbackName : null);
                            const displayName =
                                (maybeAbbrev
                                    ? teamNameByAbbrev.get(
                                          maybeAbbrev.toUpperCase(),
                                      )
                                    : null) ?? fallbackName;
                            const teamSlug = row.abbrev
                                ? row.abbrev.toLowerCase()
                                : slugify(displayName);

                            return (
                                <div key={row.id} className="px-6 py-3">
                                    <div className={`${COLUMN_LAYOUT} text-sm`}>
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-white">
                                                {row.logo ? (
                                                    <img
                                                        src={row.logo}
                                                        alt={displayName}
                                                        className="h-full w-full object-contain"
                                                    />
                                                ) : (
                                                    <span className="text-[10px] font-semibold text-gray-500">
                                                        {displayName
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
                                            <Link
                                                href={`/lab/teams/${teamSlug}`}
                                                className="text-sm font-semibold text-gray-900 transition hover:text-indigo-600 sm:text-base"
                                            >
                                                {displayName}
                                            </Link>
                                            {wildCardLabel && (
                                                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                                                    {wildCardLabel}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-right text-xs text-gray-500">
                                            {row.gamesPlayed ?? '--'}
                                        </span>
                                        <span className="text-right text-xs text-gray-500">
                                            {row.points ?? '--'}
                                        </span>
                                        <span className="text-right text-xs text-gray-500">
                                            {row.record ?? '---'}
                                        </span>
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
