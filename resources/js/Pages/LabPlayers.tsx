import { Head, Link } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import LabLayout from '@/Layouts/LabLayout';
import {
    fetchNhl,
    parseRoster,
    parseSeasonList,
    parseTeams,
    type RosterPlayer,
} from '@/lib/nhl';
import { getTeamColor } from '@/lib/teamColors';

const ROSTER_FILTERS = ['All', 'Forwards', 'Defensemen', 'Goalies'] as const;
type RosterFilter = (typeof ROSTER_FILTERS)[number];

const GAME_TYPE_OPTIONS = [
    { value: '2', label: 'Regular season' },
    { value: '3', label: 'Playoffs' },
    { value: '1', label: 'Preseason' },
] as const;
type GameTypeValue = (typeof GAME_TYPE_OPTIONS)[number]['value'];

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

const toNumber = (value: string | number | null | undefined) => {
    if (typeof value === 'number') {
        return value;
    }
    if (typeof value === 'string') {
        const parsed = Number(value);
        return Number.isNaN(parsed) ? null : parsed;
    }
    return null;
};

const sortRoster = (players: RosterPlayer[]) => {
    return [...players].sort((a, b) => {
        const aNumber = toNumber(a.number);
        const bNumber = toNumber(b.number);
        if (aNumber !== null && bNumber !== null && aNumber !== bNumber) {
            return aNumber - bNumber;
        }
        return a.name.localeCompare(b.name);
    });
};

const filterPlayers = (players: RosterPlayer[], query: string) => {
    if (!query) {
        return players;
    }
    return players.filter((player) => {
        const haystack = [
            player.name,
            player.position ?? '',
            player.number ?? '',
            player.shoots ?? '',
        ]
            .join(' ')
            .toLowerCase();
        return haystack.includes(query);
    });
};

export default function LabPlayers() {
    const teamsQuery = useQuery({
        queryKey: ['nhl', 'teams'],
        queryFn: () => fetchNhl('teams'),
        staleTime: 60_000,
    });

    const teams = useMemo(
        () =>
            parseTeams(teamsQuery.data ?? {}).sort((a, b) =>
                a.name.localeCompare(b.name),
            ),
        [teamsQuery.data],
    );

    const [selectedTeam, setSelectedTeam] = useState('');
    const [selectedSeason, setSelectedSeason] = useState('');
    const [selectedGameType, setSelectedGameType] =
        useState<GameTypeValue>('2');
    const [rosterFilter, setRosterFilter] =
        useState<RosterFilter>('All');
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (!selectedTeam && teams.length > 0) {
            setSelectedTeam(teams[0].abbrev ?? teams[0].id);
        }
    }, [selectedTeam, teams]);

    const selectedTeamRow = useMemo(
        () =>
            teams.find(
                (team) =>
                    team.abbrev === selectedTeam ||
                    team.id === selectedTeam,
            ),
        [selectedTeam, teams],
    );
    const teamAbbrev = selectedTeamRow?.abbrev ?? selectedTeam;
    const teamColor = getTeamColor(teamAbbrev);

    const rosterSeasonQuery = useQuery({
        queryKey: ['nhl', 'roster-season', teamAbbrev],
        queryFn: () => fetchNhl(`roster-season/${teamAbbrev}`),
        enabled: Boolean(teamAbbrev),
    });

    const rosterSeasons = useMemo(
        () =>
            parseSeasonList(rosterSeasonQuery.data ?? {}).sort(
                (a, b) => b.season - a.season,
            ),
        [rosterSeasonQuery.data],
    );

    useEffect(() => {
        if (rosterSeasons.length === 0) {
            return;
        }
        const current = selectedSeason || String(rosterSeasons[0].season);
        const exists = rosterSeasons.some(
            (season) => String(season.season) === current,
        );
        if (!exists) {
            setSelectedSeason(String(rosterSeasons[0].season));
        } else if (!selectedSeason) {
            setSelectedSeason(current);
        }
    }, [rosterSeasons, selectedSeason]);

    const seasonValue =
        selectedSeason ||
        (rosterSeasons[0]?.season
            ? String(rosterSeasons[0].season)
            : '');

    const rosterQuery = useQuery({
        queryKey: ['nhl', 'roster', teamAbbrev, seasonValue, selectedGameType],
        queryFn: () =>
            fetchNhl(
                `roster/${teamAbbrev}?season=${seasonValue}&gameType=${selectedGameType}`,
            ),
        enabled: Boolean(teamAbbrev && seasonValue),
    });

    const roster = useMemo(
        () => parseRoster(rosterQuery.data ?? {}),
        [rosterQuery.data],
    );

    const rosterCount =
        roster.forwards.length +
        roster.defensemen.length +
        roster.goalies.length;
    const searchQuery = search.trim().toLowerCase();

    const rosterGroups = useMemo(() => {
        return [
            {
                label: 'Forwards',
                players: filterPlayers(
                    sortRoster(roster.forwards),
                    searchQuery,
                ),
            },
            {
                label: 'Defensemen',
                players: filterPlayers(
                    sortRoster(roster.defensemen),
                    searchQuery,
                ),
            },
            {
                label: 'Goalies',
                players: filterPlayers(
                    sortRoster(roster.goalies),
                    searchQuery,
                ),
            },
        ];
    }, [roster.defensemen, roster.forwards, roster.goalies, searchQuery]);

    const allPlayers = useMemo(
        () =>
            filterPlayers(
                sortRoster([
                    ...roster.forwards,
                    ...roster.defensemen,
                    ...roster.goalies,
                ]),
                searchQuery,
            ),
        [roster.defensemen, roster.forwards, roster.goalies, searchQuery],
    );

    const filteredPlayers = useMemo(() => {
        if (rosterFilter === 'Forwards') {
            return rosterGroups[0].players;
        }
        if (rosterFilter === 'Defensemen') {
            return rosterGroups[1].players;
        }
        if (rosterFilter === 'Goalies') {
            return rosterGroups[2].players;
        }
        return allPlayers;
    }, [allPlayers, rosterFilter, rosterGroups]);

    const gameTypeLabel =
        GAME_TYPE_OPTIONS.find((option) => option.value === selectedGameType)
            ?.label ?? 'Regular season';

    return (
        <>
            <Head title="Players" />
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
                        <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                            Team roster explorer
                        </h2>
                        <p className="mt-2 text-sm text-gray-500">
                            Pick a team, season, and game type to explore the
                            full roster. Use the filters to drill down by
                            position.
                        </p>

                        <div className="mt-4 grid gap-3 md:grid-cols-4">
                            <label className="block">
                                <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                    Team
                                </span>
                                <select
                                    value={selectedTeam}
                                    onChange={(event) =>
                                        setSelectedTeam(event.target.value)
                                    }
                                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200"
                                >
                                    {teams.map((team) => (
                                        <option
                                            key={team.id}
                                            value={team.abbrev ?? team.id}
                                        >
                                            {team.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
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
                                    {rosterSeasons.length === 0 && (
                                        <option value={seasonValue}>
                                            {seasonValue
                                                ? formatSeasonLabel(
                                                      Number(seasonValue),
                                                  )
                                                : 'Loading'}
                                        </option>
                                    )}
                                    {rosterSeasons.map((season) => (
                                        <option
                                            key={season.season}
                                            value={String(season.season)}
                                        >
                                            {formatSeasonLabel(season.season)}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="block">
                                <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                    Game type
                                </span>
                                <select
                                    value={selectedGameType}
                                    onChange={(event) =>
                                        setSelectedGameType(
                                            event.target
                                                .value as GameTypeValue,
                                        )
                                    }
                                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200"
                                >
                                    {GAME_TYPE_OPTIONS.map((option) => (
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
                                    Search
                                </span>
                                <input
                                    type="search"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Search roster"
                                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200"
                                />
                            </label>
                        </div>

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
                        <p className="mt-3 text-xs text-gray-500">
                            {selectedTeamRow?.name ?? 'Selected team'} |{' '}
                            {seasonValue
                                ? formatSeasonLabel(Number(seasonValue))
                                : 'Season'}{' '}
                            | {gameTypeLabel} | {filteredPlayers.length}{' '}
                            players
                        </p>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {teamsQuery.isLoading && (
                            <p className="px-6 py-4 text-sm text-gray-600">
                                Loading teams...
                            </p>
                        )}
                        {teamsQuery.isError && (
                            <p className="px-6 py-4 text-sm text-gray-600">
                                Team data is unavailable.
                            </p>
                        )}
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
                                            {rosterGroups.map((group) => (
                                                <div key={group.label}>
                                                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                                        {group.label} (
                                                        {group.players.length})
                                                    </p>
                                                    {group.players.length ===
                                                        0 && (
                                                        <p className="mt-3 text-sm text-gray-600">
                                                            No{' '}
                                                            {group.label.toLowerCase()}{' '}
                                                            data.
                                                        </p>
                                                    )}
                                                    <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                                        {group.players.map(
                                                            (player) => {
                                                                const playerHref =
                                                                    teamAbbrev &&
                                                                    seasonValue
                                                                        ? `/lab/players/${player.id}?team=${teamAbbrev}&season=${seasonValue}&gameType=${selectedGameType}`
                                                                        : `/lab/players/${player.id}`;
                                                                return (
                                                                    <div
                                                                        key={`${group.label}-${player.id}`}
                                                                        className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm"
                                                                    >
                                                                        <div className="flex items-start gap-3">
                                                                            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-600">
                                                                                {player.headshot ? (
                                                                                    <img
                                                                                        src={
                                                                                            player.headshot
                                                                                        }
                                                                                        alt={
                                                                                            player.name
                                                                                        }
                                                                                        className="h-full w-full object-cover"
                                                                                    />
                                                                                ) : (
                                                                                    <span>
                                                                                        {getInitials(
                                                                                            player.name,
                                                                                        )}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            <div className="flex-1">
                                                                                <Link
                                                                                    href={
                                                                                        playerHref
                                                                                    }
                                                                                    className="font-semibold text-gray-900 transition hover:text-gray-700"
                                                                                >
                                                                                    {player.name}
                                                                                </Link>
                                                                                <p className="text-xs text-gray-500">
                                                                                    #
                                                                                    {player.number ??
                                                                                        '--'}{' '}
                                                                                    |{' '}
                                                                                    {player.position ??
                                                                                        'POS'}{' '}
                                                                                    |{' '}
                                                                                    {player.shoots ??
                                                                                        '--'}
                                                                                </p>
                                                                            </div>
                                                                            <span className="text-xs font-semibold text-gray-500">
                                                                                {player.position ??
                                                                                    '--'}
                                                                            </span>
                                                                        </div>
                                                                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                                                                            <span>
                                                                                {player.height ??
                                                                                    '--'}
                                                                            </span>
                                                                            <span>
                                                                                {player.weight
                                                                                    ? `${player.weight} lb`
                                                                                    : '--'}
                                                                            </span>
                                                                            {player.birthDate && (
                                                                                <span>
                                                                                    {
                                                                                        player.birthDate
                                                                                    }
                                                                                </span>
                                                                            )}
                                                                            {player.hometown && (
                                                                                <span>
                                                                                    {
                                                                                        player.hometown
                                                                                    }
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            },
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                                {rosterFilter} (
                                                {filteredPlayers.length})
                                            </p>
                                            {filteredPlayers.length === 0 && (
                                                <p className="mt-3 text-sm text-gray-600">
                                                    No players available.
                                                </p>
                                            )}
                                            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                                {filteredPlayers.map(
                                                    (player) => {
                                                        const playerHref =
                                                            teamAbbrev &&
                                                            seasonValue
                                                                ? `/lab/players/${player.id}?team=${teamAbbrev}&season=${seasonValue}&gameType=${selectedGameType}`
                                                                : `/lab/players/${player.id}`;
                                                        return (
                                                            <div
                                                                key={player.id}
                                                                className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm"
                                                            >
                                                                <div className="flex items-start gap-3">
                                                                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-600">
                                                                        {player.headshot ? (
                                                                            <img
                                                                                src={
                                                                                    player.headshot
                                                                                }
                                                                                alt={
                                                                                    player.name
                                                                                }
                                                                                className="h-full w-full object-cover"
                                                                            />
                                                                        ) : (
                                                                            <span>
                                                                                {getInitials(
                                                                                    player.name,
                                                                                )}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <Link
                                                                            href={
                                                                                playerHref
                                                                            }
                                                                            className="font-semibold text-gray-900 transition hover:text-gray-700"
                                                                        >
                                                                            {player.name}
                                                                        </Link>
                                                                        <p className="text-xs text-gray-500">
                                                                            #
                                                                            {player.number ??
                                                                                '--'}{' '}
                                                                            |{' '}
                                                                            {player.position ??
                                                                                'POS'}{' '}
                                                                            |{' '}
                                                                            {player.shoots ??
                                                                                '--'}
                                                                        </p>
                                                                    </div>
                                                                    <span className="text-xs font-semibold text-gray-500">
                                                                        {player.position ??
                                                                            '--'}
                                                                    </span>
                                                                </div>
                                                                <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                                                                    <span>
                                                                        {player.height ??
                                                                            '--'}
                                                                    </span>
                                                                    <span>
                                                                        {player.weight
                                                                            ? `${player.weight} lb`
                                                                            : '--'}
                                                                    </span>
                                                                    {player.birthDate && (
                                                                        <span>
                                                                            {
                                                                                player.birthDate
                                                                            }
                                                                        </span>
                                                                    )}
                                                                    {player.hometown && (
                                                                        <span>
                                                                            {
                                                                                player.hometown
                                                                            }
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    },
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                    </div>
                </section>
            </LabLayout>
        </>
    );
}
