import { Head, Link } from '@inertiajs/react';
import { useQueries, useQuery } from '@tanstack/react-query';
import {
    useEffect,
    useMemo,
    useState,
    type ChangeEvent,
    type MouseEvent,
} from 'react';

import LabLayout from '@/Layouts/LabLayout';
import {
    fetchNhl,
    normalizeDate,
    normalizeTime,
    parseBoxscore,
    parsePlayByPlay,
    parseSchedule,
    parseScoreboard,
    parseStandings,
} from '@/lib/nhl';
import { getTeamColor } from '@/lib/teamColors';

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

const formatDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const addDays = (value: string, offset: number) => {
    const normalized = normalizeDateKey(value);
    if (!normalized) {
        return '';
    }
    const [year, month, day] = normalized.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + offset);
    return formatDateKey(date);
};

const buildRange = (anchor: string, rangeDays: number) => ({
    start: addDays(anchor, -rangeDays),
    end: addDays(anchor, rangeDays),
});

const getSectionEmptyMessage = (title: string, selection?: string) => {
    if (selection) {
        return `No games scheduled on ${normalizeDate(selection)}.`;
    }
    if (title === 'Today') {
        return 'No games scheduled today.';
    }
    if (title === 'Recent') {
        return 'No recent games yet.';
    }
    if (title === 'Upcoming') {
        return 'No upcoming games scheduled.';
    }
    return 'No games available.';
};

const getSectionTitle = (title: string) => {
    if (title === 'Today') {
        return "Today's Games";
    }
    if (title === 'Recent') {
        return 'Recent Games';
    }
    if (title === 'Upcoming') {
        return 'Upcoming Games';
    }
    return `${title} Games`;
};

export default function LabScores() {
    const rangeWindow = 30;
    const [scheduleRange, setScheduleRange] = useState(() =>
        buildRange(formatDateKey(new Date()), rangeWindow),
    );

    const scheduleQuery = useQuery({
        queryKey: ['nhl', 'schedule', scheduleRange.start, scheduleRange.end],
        queryFn: () =>
            fetchNhl(
                `schedule?start=${scheduleRange.start}&end=${scheduleRange.end}`,
            ),
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
        staleTime: 15_000,
    });

    const schedule = useMemo(
        () => parseSchedule(scheduleQuery.data ?? {}),
        [scheduleQuery.data],
    );
    const standings = useMemo(
        () => parseStandings(standingsQuery.data ?? {}),
        [standingsQuery.data],
    );
    const scoreboard = useMemo(
        () => parseScoreboard(scoreboardQuery.data ?? {}),
        [scoreboardQuery.data],
    );
    const teamMeta = useMemo(() => {
        const map = new Map<
            string,
            {
                name: string;
                abbrev?: string;
                logo?: string;
                record?: string;
            }
        >();
        standings.forEach((row) => {
            const key = row.abbrev?.toUpperCase();
            if (!key) {
                return;
            }
            const record =
                row.wins !== null &&
                row.wins !== undefined &&
                row.losses !== null &&
                row.losses !== undefined
                    ? `${row.wins}-${row.losses}-${row.otLosses ?? 0}`
                    : null;
            map.set(key, {
                name: row.name,
                abbrev: row.abbrev,
                logo: row.logo,
                record: record ?? undefined,
            });
        });
        return map;
    }, [standings]);
    const scoreboardFallback = useMemo(() => {
        const map = new Map<string, string>();
        scoreboard.forEach((value, id) => {
            const away = value.away?.toUpperCase();
            const home = value.home?.toUpperCase();
            if (!value.startTime || !away || !home) {
                return;
            }
            const key = `${away}-${home}-${value.startTime}`;
            map.set(key, id);
        });
        return map;
    }, [scoreboard]);

    const resolveGameId = (game: {
        id?: string;
        home: { abbrev?: string };
        away: { abbrev?: string };
        startTime?: string;
    }) => {
        const rawId = game.id;
        if (rawId && scoreboard.has(rawId)) {
            return rawId;
        }
        const awayAbbrev = game.away.abbrev?.toUpperCase();
        const homeAbbrev = game.home.abbrev?.toUpperCase();
        if (awayAbbrev && homeAbbrev && game.startTime) {
            const fallbackKey = `${awayAbbrev}-${homeAbbrev}-${game.startTime}`;
            const fallbackId = scoreboardFallback.get(fallbackKey);
            if (fallbackId) {
                return fallbackId;
            }
        }
        return rawId;
    };

    const handleLinkClick = (
        event: MouseEvent<HTMLButtonElement>,
        url: string,
    ) => {
        event.preventDefault();
        event.stopPropagation();
        if (typeof window !== 'undefined') {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    const todayKey = useMemo(() => {
        return formatDateKey(new Date());
    }, []);
    const { recentDays, todaysDays, futureDays } = useMemo(() => {
        const recent: typeof schedule = [];
        const today: typeof schedule = [];
        const future: typeof schedule = [];

        schedule.forEach((day) => {
            const key = normalizeDateKey(day.date);
            if (!key) {
                return;
            }
            if (key === todayKey) {
                today.push(day);
            } else if (key < todayKey) {
                recent.push(day);
            } else if (key > todayKey) {
                future.push(day);
            }
        });

        recent.sort((a, b) =>
            normalizeDateKey(b.date).localeCompare(
                normalizeDateKey(a.date),
            ),
        );
        future.sort((a, b) =>
            normalizeDateKey(a.date).localeCompare(
                normalizeDateKey(b.date),
            ),
        );

        return { recentDays: recent, todaysDays: today, futureDays: future };
    }, [schedule, todayKey]);

    const recentDayKeys = useMemo(
        () =>
            recentDays
                .map((day) => normalizeDateKey(day.date))
                .filter(Boolean),
        [recentDays],
    );
    const upcomingDayKeys = useMemo(
        () =>
            futureDays
                .map((day) => normalizeDateKey(day.date))
                .filter(Boolean),
        [futureDays],
    );

    const [recentSelection, setRecentSelection] = useState('');
    const [upcomingSelection, setUpcomingSelection] = useState('');

    useEffect(() => {
        if (!recentSelection && recentDayKeys.length > 0) {
            setRecentSelection(recentDayKeys[0]);
        }
    }, [recentDayKeys, recentSelection]);

    useEffect(() => {
        if (!upcomingSelection && upcomingDayKeys.length > 0) {
            setUpcomingSelection(upcomingDayKeys[0]);
        }
    }, [upcomingDayKeys, upcomingSelection]);

    const selectedRecentDay = useMemo(
        () =>
            recentDays.find(
                (day) => normalizeDateKey(day.date) === recentSelection,
            ),
        [recentDays, recentSelection],
    );
    const selectedUpcomingDay = useMemo(
        () =>
            futureDays.find(
                (day) => normalizeDateKey(day.date) === upcomingSelection,
            ),
        [futureDays, upcomingSelection],
    );

    const ensureRangeContains = (value: string) => {
        const normalized = normalizeDateKey(value);
        if (!normalized) {
            return;
        }
        if (
            normalized < scheduleRange.start ||
            normalized > scheduleRange.end
        ) {
            setScheduleRange(buildRange(normalized, rangeWindow));
        }
    };

    const handleDateChange =
        (setter: (value: string) => void) =>
        (event: ChangeEvent<HTMLInputElement>) => {
            const nextValue = normalizeDateKey(event.target.value);
            ensureRangeContains(nextValue);
            setter(nextValue);
        };

    const shiftSelection = (
        keys: string[],
        selection: string,
        offset: number,
        setter: (value: string) => void,
    ) => {
        if (!keys.length) {
            return;
        }
        const index = keys.indexOf(selection);
        if (index === -1) {
            setter(keys[0]);
            return;
        }
        const nextIndex = index + offset;
        if (nextIndex >= 0 && nextIndex < keys.length) {
            setter(keys[nextIndex]);
        }
    };

    const sectionDays = useMemo(
        () => ({
            Today: todaysDays,
            Recent: selectedRecentDay ? [selectedRecentDay] : [],
            Upcoming: selectedUpcomingDay ? [selectedUpcomingDay] : [],
        }),
        [todaysDays, selectedRecentDay, selectedUpcomingDay],
    );

    const visibleGames = useMemo(
        () =>
            Object.values(sectionDays).flatMap((days) =>
                days.flatMap((day) => day.games),
            ),
        [sectionDays],
    );

    const gamecenterIds = useMemo(() => {
        const ids = new Set<string>();
        visibleGames.forEach((game) => {
            const resolvedId = resolveGameId(game);
            if (!resolvedId) {
                return;
            }
            const statusText = (game.status ?? '').toLowerCase();
            const hasScore =
                game.home.score !== null &&
                game.away.score !== null &&
                game.home.score !== undefined &&
                game.away.score !== undefined;
            const isLive =
                scoreboard.has(resolvedId) ||
                statusText.includes('live') ||
                statusText.includes('in progress') ||
                statusText.includes('ot') ||
                statusText.includes('so');
            const isFinal = statusText.includes('final');
            if (hasScore || isLive || isFinal) {
                ids.add(resolvedId);
            }
        });
        return Array.from(ids);
    }, [resolveGameId, scoreboard, visibleGames]);

    const boxscoreQueries = useQueries({
        queries: gamecenterIds.map((id) => ({
            queryKey: ['nhl', 'gamecenter-boxscore', id],
            queryFn: () => fetchNhl(`gamecenter/${id}/boxscore`),
            staleTime: 30_000,
            enabled: Boolean(id),
        })),
    });

    const playByPlayQueries = useQueries({
        queries: gamecenterIds.map((id) => ({
            queryKey: ['nhl', 'gamecenter-playbyplay', id],
            queryFn: () => fetchNhl(`gamecenter/${id}/play-by-play`),
            staleTime: 15_000,
            enabled: Boolean(id),
        })),
    });

    const boxscoreMap = useMemo(() => {
        const map = new Map<string, ReturnType<typeof parseBoxscore>>();
        gamecenterIds.forEach((id, index) => {
            const data = boxscoreQueries[index]?.data;
            if (!data) {
                return;
            }
            const parsed = parseBoxscore(data as Record<string, unknown>);
            if (parsed) {
                map.set(id, parsed);
            }
        });
        return map;
    }, [boxscoreQueries, gamecenterIds]);

    const playByPlayMap = useMemo(() => {
        const map = new Map<string, ReturnType<typeof parsePlayByPlay>>();
        gamecenterIds.forEach((id, index) => {
            const data = playByPlayQueries[index]?.data;
            if (!data) {
                return;
            }
            map.set(id, parsePlayByPlay(data as Record<string, unknown>));
        });
        return map;
    }, [gamecenterIds, playByPlayQueries]);

    return (
        <>
            <Head title="Scores" />
            <LabLayout active="scores">
                <div className="space-y-6">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                            Scores
                        </p>
                        <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                            Today + recent + upcoming
                        </h2>
                    </div>

                    <div className="space-y-6">
                        {[
                            { title: 'Today', days: todaysDays },
                            { title: 'Recent', days: recentDays },
                            { title: 'Upcoming', days: futureDays },
                        ].map((section) => {
                            const isToday = section.title === 'Today';
                            const isRecent = section.title === 'Recent';
                            const isUpcoming = section.title === 'Upcoming';
                            const selection = isRecent
                                ? recentSelection
                                : isUpcoming
                                  ? upcomingSelection
                                  : '';
                            const keys = isRecent
                                ? recentDayKeys
                                : isUpcoming
                                  ? upcomingDayKeys
                                  : [];
                            const setSelection = isRecent
                                ? setRecentSelection
                                : setUpcomingSelection;
                            const selectedDay = isRecent
                                ? selectedRecentDay
                                : isUpcoming
                                  ? selectedUpcomingDay
                                  : null;
                            const daysToRender = isToday
                                ? section.days
                                : selectedDay
                                  ? [selectedDay]
                                  : [];
                            const selectionIndex = keys.indexOf(selection);
                            const prevOffset = isRecent ? 1 : -1;
                            const nextOffset = isRecent ? -1 : 1;
                            const canShift = (offset: number) => {
                                const nextIndex = selectionIndex + offset;
                                return (
                                    selectionIndex !== -1 &&
                                    nextIndex >= 0 &&
                                    nextIndex < keys.length
                                );
                            };

                            return (
                                <section
                                    key={section.title}
                                    className="overflow-hidden rounded-lg bg-white shadow-sm"
                                >
                                <div className="border-b border-gray-100 px-6 py-4">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                                {section.title}
                                            </p>
                                            <h3 className="mt-1 text-xl font-semibold text-gray-900">
                                                {getSectionTitle(section.title)}
                                            </h3>
                                        </div>
                                        {!isToday && (
                                            <div className="flex flex-wrap items-center gap-2">
                                                <button
                                                    type="button"
                                                    disabled={!canShift(prevOffset)}
                                                    onClick={() =>
                                                        shiftSelection(
                                                            keys,
                                                            selection,
                                                            prevOffset,
                                                            setSelection,
                                                        )
                                                    }
                                                    className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition ${
                                                        canShift(prevOffset)
                                                            ? 'border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-700'
                                                            : 'border-gray-100 text-gray-300'
                                                    }`}
                                                >
                                                    {isRecent ? 'Older' : 'Tomorrow'}
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={!canShift(nextOffset)}
                                                    onClick={() =>
                                                        shiftSelection(
                                                            keys,
                                                            selection,
                                                            nextOffset,
                                                            setSelection,
                                                        )
                                                    }
                                                    className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition ${
                                                        canShift(nextOffset)
                                                            ? 'border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-700'
                                                            : 'border-gray-100 text-gray-300'
                                                    }`}
                                                >
                                                    {isRecent ? 'Newer' : 'Later'}
                                                </button>
                                                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                                    <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                                                        Pick date
                                                    </span>
                                                    <input
                                                        type="date"
                                                        value={selection}
                                                        onChange={handleDateChange(
                                                            setSelection,
                                                        )}
                                                        className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="px-6 py-5">
                                    {scheduleQuery.isLoading ? (
                                        <p className="text-sm text-gray-600">
                                            Loading games...
                                        </p>
                                    ) : scheduleQuery.isError ? (
                                        <p className="text-sm text-gray-600">
                                            Scores data is unavailable.
                                        </p>
                                    ) : daysToRender.length === 0 ? (
                                        <p className="text-sm text-gray-600">
                                            {getSectionEmptyMessage(
                                                section.title,
                                                isToday ? undefined : selection,
                                            )}
                                        </p>
                                    ) : (
                                        <div className="space-y-6">
                                            {daysToRender.map((day) => (
                                                <div
                                                    key={
                                                        day.date ||
                                                        day.games[0]?.id
                                                    }
                                                >
                                                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                                        {normalizeDate(
                                                            day.date,
                                                        )}
                                                    </p>
                                                    <div className="mt-3 grid gap-4 sm:grid-cols-2">
                                                        {day.games.map(
                                                            (game) => {
                                        const hasScore =
                                            game.home.score !== null &&
                                            game.away.score !== null &&
                                            game.home.score !== undefined &&
                                            game.away.score !== undefined;
                                        const awayKey = game.away.abbrev
                                            ? game.away.abbrev.toUpperCase()
                                            : '';
                                        const homeKey = game.home.abbrev
                                            ? game.home.abbrev.toUpperCase()
                                            : '';
                                        const awayMeta = awayKey
                                            ? teamMeta.get(awayKey)
                                            : undefined;
                                        const homeMeta = homeKey
                                            ? teamMeta.get(homeKey)
                                            : undefined;
                                        const gameTypeLabel =
                                            game.gameTypeId !== null &&
                                            game.gameTypeId !== undefined
                                                ? GAME_TYPE_LABELS[
                                                      game.gameTypeId
                                                  ] ??
                                                  `Game type ${game.gameTypeId}`
                                                : null;
                                        const tvBroadcasts =
                                            game.broadcastGroups?.tv ?? [];
                                        const radioBroadcasts =
                                            game.broadcastGroups?.radio ?? [];
                                        const broadcastDetails =
                                            game.broadcastDetails ?? [];
                                        const formatBroadcastDetail = (
                                            detail: typeof broadcastDetails[number],
                                        ) => {
                                            const tags = [
                                                detail.language?.toUpperCase(),
                                                detail.scope,
                                                detail.team,
                                                detail.market,
                                                detail.feed,
                                            ].filter(Boolean);
                                            return tags.length
                                                ? `${detail.label} (${tags.join(', ')})`
                                                : detail.label;
                                        };
                                        const tvDetailLabel = broadcastDetails
                                            .filter(
                                                (detail) =>
                                                    detail.kind === 'tv',
                                            )
                                            .map(formatBroadcastDetail)
                                            .join(' | ');
                                        const radioDetailLabel = broadcastDetails
                                            .filter(
                                                (detail) =>
                                                    detail.kind === 'radio',
                                            )
                                            .map(formatBroadcastDetail)
                                            .join(' | ');
                                        const streamDetailLabel = broadcastDetails
                                            .filter(
                                                (detail) =>
                                                    detail.kind === 'stream',
                                            )
                                            .map(formatBroadcastDetail)
                                            .join(' | ');
                                        const otherDetailLabel = broadcastDetails
                                            .filter(
                                                (detail) =>
                                                    !detail.kind ||
                                                    detail.kind === 'other',
                                            )
                                            .map(formatBroadcastDetail)
                                            .join(' | ');
                                        const tvLabel = tvDetailLabel
                                            ? tvDetailLabel
                                            : tvBroadcasts.length
                                              ? tvBroadcasts.join(' | ')
                                              : null;
                                        const radioLabel = radioDetailLabel
                                            ? radioDetailLabel
                                            : radioBroadcasts.length
                                              ? radioBroadcasts.join(' | ')
                                              : null;
                                        const streamLabel = streamDetailLabel
                                            ? streamDetailLabel
                                            : null;
                                        const otherBroadcastLabel =
                                            otherDetailLabel || null;
                                        const broadcasts =
                                            !tvLabel &&
                                            !radioLabel &&
                                            game.broadcasts?.length
                                                ? game.broadcasts.join(' | ')
                                                : null;
                                        const venueDetail =
                                            game.venueDetail ?? null;
                                        const statusFlags = game.statusFlags;
                                        const eventFlags = game.eventFlags;
                                        const statusFlag = statusFlags?.postponed
                                            ? 'Postponed'
                                            : statusFlags?.tbd
                                              ? 'TBD'
                                              : null;
                                        const linkItems = [
                                            {
                                                label: 'Gamecenter',
                                                url: game.links?.gamecenter,
                                            },
                                            {
                                                label: 'Recap',
                                                url: game.links?.recap,
                                            },
                                            {
                                                label: 'Tickets',
                                                url: game.links?.tickets,
                                            },
                                        ].filter(
                                            (
                                                link,
                                            ): link is {
                                                label: string;
                                                url: string;
                                            } =>
                                                typeof link.url === 'string' &&
                                                link.url.length > 0,
                                        );
                                        const resolvedId = resolveGameId(game);
                                        const livePayload = resolvedId
                                            ? scoreboard.get(resolvedId)
                                            : undefined;
                                        const liveStatus =
                                            livePayload?.status ?? null;
                                        const liveDetails =
                                            livePayload?.live ?? null;
                                        const liveSituations =
                                            livePayload?.situations ?? null;
                                        const series = livePayload?.series ?? null;
                                        const linescore =
                                            livePayload?.linescore ?? null;
                                        const linescoreSummary =
                                            linescore?.periods?.length
                                                ? linescore.periods
                                                      .map((period) => {
                                                          const awayValue =
                                                              period.away ??
                                                              '--';
                                                          const homeValue =
                                                              period.home ??
                                                              '--';
                                                          return `${period.label} ${awayValue}-${homeValue}`;
                                                      })
                                                      .join(' | ')
                                                : null;
                                        const shotsByPeriodSummary =
                                            linescore?.periods?.length
                                                ? linescore.periods
                                                      .map((period) => {
                                                          const awayValue =
                                                              period.shotsAway;
                                                          const homeValue =
                                                              period.shotsHome;
                                                          if (
                                                              awayValue ==
                                                                  null &&
                                                              homeValue ==
                                                                  null
                                                          ) {
                                                              return null;
                                                          }
                                                          return `${period.label} ${awayValue ?? '--'}-${homeValue ?? '--'}`;
                                                      })
                                                      .filter(Boolean)
                                                      .join(' | ')
                                                : null;
                                        const shots = linescore?.shots ?? null;
                                        const shotsSummary =
                                            shots &&
                                            (shots.away !== null ||
                                                shots.home !== null)
                                                ? `Shots: ${shots.away ?? '--'}-${shots.home ?? '--'}`
                                                : null;
                                        const liveClockLabel = liveDetails
                                            ? liveDetails.inIntermission
                                                ? `Intermission${
                                                      liveDetails.intermissionLabel
                                                          ? ` (${liveDetails.intermissionLabel})`
                                                          : ''
                                                  }${
                                                      liveDetails.intermissionTimeRemaining
                                                          ? ` - ${liveDetails.intermissionTimeRemaining}`
                                                          : ''
                                                  }`
                                                : liveDetails.period !== null &&
                                                    liveDetails.period !== undefined
                                                  ? `P${liveDetails.period}${
                                                        liveDetails.periodType &&
                                                        liveDetails.periodType.toLowerCase() !==
                                                            'regular'
                                                            ? ` ${liveDetails.periodType.toUpperCase()}`
                                                            : ''
                                                    }${
                                                        liveDetails.clock
                                                            ? ` - ${liveDetails.clock}`
                                                            : ''
                                                    }`
                                                  : liveDetails.clock
                                                    ? liveDetails.clock
                                                    : null
                                            : null;
                                        const normalizeSituation = (
                                            value?: string,
                                        ) => {
                                            if (!value) {
                                                return null;
                                            }
                                            const normalized = value
                                                .replace(/\s+/g, '')
                                                .toUpperCase();
                                            if (
                                                normalized.includes('PP') ||
                                                normalized.includes('PWR') ||
                                                normalized.includes('POWERPLAY')
                                            ) {
                                                return 'PP';
                                            }
                                            if (
                                                normalized.includes('SH') ||
                                                normalized.includes('SHORT')
                                            ) {
                                                return 'SH';
                                            }
                                            if (
                                                normalized.includes('EN') ||
                                                normalized.includes('EMPTY')
                                            ) {
                                                return 'EN';
                                            }
                                            if (
                                                normalized.includes('GP') ||
                                                normalized.includes('PULL') ||
                                                normalized.includes('GOALIEPULLED')
                                            ) {
                                                return 'GP';
                                            }
                                            return null;
                                        };
                                        const awayBadge = normalizeSituation(
                                            liveSituations?.away,
                                        );
                                        const homeBadge = normalizeSituation(
                                            liveSituations?.home,
                                        );
                                        const situationSummary = [
                                            liveSituations?.away
                                                ? `Away ${liveSituations.away}`
                                                : null,
                                            liveSituations?.home
                                                ? `Home ${liveSituations.home}`
                                                : null,
                                        ]
                                            .filter(Boolean)
                                            .join(' | ');
                                        const boxscore = resolvedId
                                            ? boxscoreMap.get(resolvedId)
                                            : undefined;
                                        const playByPlay = resolvedId
                                            ? playByPlayMap.get(resolvedId)
                                            : undefined;
                                        const recentEvents = playByPlay
                                            ? [...playByPlay]
                                                  .reverse()
                                                  .filter(
                                                      (event) =>
                                                          event.description &&
                                                          event.category !==
                                                              'Shot',
                                                  )
                                                  .slice(0, 3)
                                            : [];
                                        const latestGoal = playByPlay
                                            ? [...playByPlay]
                                                  .reverse()
                                                  .find(
                                                      (event) =>
                                                          event.category ===
                                                          'Goal',
                                                  )
                                            : null;
                                        const latestPenalty = playByPlay
                                            ? [...playByPlay]
                                                  .reverse()
                                                  .find(
                                                      (event) =>
                                                          event.category ===
                                                          'Penalty',
                                                  )
                                            : null;
                                        const awayLeader =
                                            boxscore?.leaders?.away?.[0];
                                        const homeLeader =
                                            boxscore?.leaders?.home?.[0];
                                        const awayGoalie =
                                            boxscore?.goalies?.away?.[0];
                                        const homeGoalie =
                                            boxscore?.goalies?.home?.[0];
                                        const scoringSummaryList =
                                            boxscore?.scoringSummary ?? [];
                                        const teamStatsRows =
                                            boxscore?.stats ?? [];
                                        const fallbackScoring =
                                            playByPlay
                                                ?.filter(
                                                    (event) =>
                                                        event.category ===
                                                        'Goal',
                                                )
                                                .map((event) => ({
                                                    id: event.id,
                                                    period: event.period ?? null,
                                                    time: event.time ?? undefined,
                                                    team: event.team,
                                                    description:
                                                        event.description ||
                                                        event.playerSummary ||
                                                        event.type,
                                                    goalType: undefined,
                                                    score: undefined,
                                                })) ?? [];
                                        const scoringSource =
                                            scoringSummaryList.length > 0
                                                ? scoringSummaryList
                                                : fallbackScoring;
                                        const scoringSnippets =
                                            scoringSource.slice(0, 3);
                                        const statsToShow = teamStatsRows.slice(
                                            0,
                                            5,
                                        );
                                        const formatPlayDetail = (
                                            event: NonNullable<typeof latestGoal>,
                                        ) => {
                                            const summaryParts = [
                                                event.description ||
                                                    event.type ||
                                                    'Play',
                                            ];
                                            const timeParts = [
                                                event.period !== null &&
                                                event.period !== undefined
                                                    ? `P${event.period}`
                                                    : null,
                                                event.time ?? null,
                                            ]
                                                .filter(Boolean)
                                                .join(' ');
                                            if (timeParts) {
                                                summaryParts.push(timeParts);
                                            }
                                            if (event.team) {
                                                summaryParts.push(event.team);
                                            }
                                            if (event.playerSummary) {
                                                summaryParts.push(event.playerSummary);
                                            } else if (
                                                event.players &&
                                                event.players.length > 0
                                            ) {
                                                const playerNames = event.players
                                                    .map((player) => player.name)
                                                    .filter(Boolean)
                                                    .join(', ');
                                                if (playerNames) {
                                                    summaryParts.push(playerNames);
                                                }
                                            }
                                            return summaryParts.join(' - ');
                                        };
                                        const formatLeader = (
                                            leader: typeof awayLeader,
                                            abbrev?: string,
                                        ) => {
                                            if (!leader) {
                                                return null;
                                            }
                                            const value =
                                                leader.value !== null &&
                                                leader.value !== undefined
                                                    ? ` ${leader.value}`
                                                    : '';
                                            return `${abbrev ?? ''} ${leader.label}: ${leader.player ?? '-'}${value}`.trim();
                                        };
                                        const formatGoalie = (
                                            goalie: typeof awayGoalie,
                                            abbrev?: string,
                                        ) => {
                                            if (!goalie) {
                                                return null;
                                            }
                                            const statParts: string[] = [];
                                            if (
                                                goalie.saves !== null &&
                                                goalie.saves !== undefined &&
                                                goalie.shots !== null &&
                                                goalie.shots !== undefined
                                            ) {
                                                statParts.push(
                                                    `${goalie.saves}/${goalie.shots}`,
                                                );
                                            } else if (
                                                goalie.savePct !== null &&
                                                goalie.savePct !== undefined
                                            ) {
                                                statParts.push(
                                                    `SV% ${goalie.savePct}`,
                                                );
                                            }
                                            if (
                                                goalie.goalsAgainst !== null &&
                                                goalie.goalsAgainst !==
                                                    undefined
                                            ) {
                                                statParts.push(
                                                    `GA ${goalie.goalsAgainst}`,
                                                );
                                            }
                                            const detail = statParts.length
                                                ? ` (${statParts.join(', ')})`
                                                : '';
                                            return `${abbrev ?? ''} G: ${goalie.name}${detail}`.trim();
                                        };
                                        const awayColor = getTeamColor(
                                            game.away.abbrev ??
                                                awayMeta?.abbrev,
                                        );
                                        const homeColor = getTeamColor(
                                            game.home.abbrev ??
                                                homeMeta?.abbrev,
                                        );
                                        const cardClass =
                                            'overflow-hidden rounded-lg border border-gray-200 bg-white transition hover:shadow-sm';
                                        const cardContent = (
                                            <div className="flex flex-col">
                                                <div className="flex h-1 w-full">
                                                    <div
                                                        className="w-1/2"
                                                        style={{
                                                            backgroundColor:
                                                                awayColor,
                                                        }}
                                                    />
                                                    <div
                                                        className="w-1/2"
                                                        style={{
                                                            backgroundColor:
                                                                homeColor,
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between gap-3 p-4">
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-white text-xs font-semibold text-gray-500">
                                                            {awayMeta?.logo ? (
                                                                <img
                                                                    src={awayMeta.logo}
                                                                    alt={awayMeta.name}
                                                                    className="h-full w-full object-contain"
                                                                />
                                                            ) : (
                                                                <span>
                                                                    {(game.away.abbrev ??
                                                                        game.away.name)
                                                                        ?.slice(0, 2)
                                                                        .toUpperCase()}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-900">
                                                                {game.away.name ||
                                                                    game.away.abbrev}
                                                            </p>
                                                            {awayMeta?.record && (
                                                                <p className="text-xs text-gray-500">
                                                                    {awayMeta.record}
                                                                </p>
                                                            )}
                                                            {awayBadge && (
                                                                <span className="mt-1 inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                                                                    {awayBadge}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-white text-xs font-semibold text-gray-500">
                                                            {homeMeta?.logo ? (
                                                                <img
                                                                    src={homeMeta.logo}
                                                                    alt={homeMeta.name}
                                                                    className="h-full w-full object-contain"
                                                                />
                                                            ) : (
                                                                <span>
                                                                    {(game.home.abbrev ??
                                                                        game.home.name)
                                                                        ?.slice(0, 2)
                                                                        .toUpperCase()}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-900">
                                                                {game.home.name ||
                                                                    game.home.abbrev}
                                                            </p>
                                                            {homeMeta?.record && (
                                                                <p className="text-xs text-gray-500">
                                                                    {homeMeta.record}
                                                                </p>
                                                            )}
                                                            {homeBadge && (
                                                                <span className="mt-1 inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                                                                    {homeBadge}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {situationSummary && (
                                                        <p className="text-[11px] text-gray-500">
                                                            Situations:{' '}
                                                            {situationSummary}
                                                        </p>
                                                    )}
                                                    <div>
                                                        <p className="text-xs text-gray-500">
                                                            {game.venue ?? 'Venue'}
                                                            {venueDetail && (
                                                                <span className="text-xs text-gray-400">
                                                                    {` - ${venueDetail}`}
                                                                </span>
                                                            )}
                                                        </p>
                                                        {(eventFlags?.neutralSite ||
                                                            eventFlags?.specialEvent) && (
                                                            <div className="mt-2 flex flex-wrap gap-2">
                                                                {eventFlags?.neutralSite && (
                                                                    <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                                                                        Neutral
                                                                        site
                                                                    </span>
                                                                )}
                                                                {eventFlags?.specialEvent && (
                                                                    <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                                                                        {
                                                                            eventFlags.specialEvent
                                                                        }
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                        {tvLabel && (
                                                            <p className="mt-1 text-[11px] text-gray-500">
                                                                TV: {tvLabel}
                                                            </p>
                                                        )}
                                                        {radioLabel && (
                                                            <p className="mt-1 text-[11px] text-gray-500">
                                                                Radio:{' '}
                                                                {radioLabel}
                                                            </p>
                                                        )}
                                                        {streamLabel && (
                                                            <p className="mt-1 text-[11px] text-gray-500">
                                                                Stream:{' '}
                                                                {streamLabel}
                                                            </p>
                                                        )}
                                                        {otherBroadcastLabel && (
                                                            <p className="mt-1 text-[11px] text-gray-500">
                                                                Feeds:{' '}
                                                                {otherBroadcastLabel}
                                                            </p>
                                                        )}
                                                        {broadcasts && (
                                                            <p className="mt-1 text-[11px] text-gray-500">
                                                                Broadcast: {broadcasts}
                                                            </p>
                                                        )}
                                                        {linkItems.length > 0 && (
                                                            <div className="mt-2 flex flex-wrap gap-2">
                                                                {linkItems.map(
                                                                    (link) => (
                                                                        <button
                                                                            key={
                                                                                link.label
                                                                            }
                                                                            type="button"
                                                                            onClick={(
                                                                                event,
                                                                            ) =>
                                                                                handleLinkClick(
                                                                                    event,
                                                                                    link.url,
                                                                                )
                                                                            }
                                                                            className="rounded-full border border-gray-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                                                                        >
                                                                            {
                                                                                link.label
                                                                            }
                                                                        </button>
                                                                    ),
                                                                )}
                                                            </div>
                                                        )}
                                                        {(latestGoal ||
                                                            latestPenalty ||
                                                            awayLeader ||
                                                            homeLeader ||
                                                            awayGoalie ||
                                                            homeGoalie) && (
                                                            <div className="mt-3 space-y-1 text-[11px] text-gray-500">
                                                                {latestGoal && (
                                                                    <p>
                                                                        Last
                                                                        goal:{' '}
                                                                        {formatPlayDetail(
                                                                            latestGoal,
                                                                        )}
                                                                    </p>
                                                                )}
                                                                {latestPenalty && (
                                                                    <p>
                                                                        Last
                                                                        penalty:{' '}
                                                                        {formatPlayDetail(
                                                                            latestPenalty,
                                                                        )}
                                                                    </p>
                                                                )}
                                                                {(awayLeader ||
                                                                    homeLeader) && (
                                                                    <p>
                                                                        Leaders:{' '}
                                                                        {[
                                                                            formatLeader(
                                                                                awayLeader,
                                                                                awayMeta?.abbrev ??
                                                                                    game
                                                                                        .away
                                                                                        .abbrev,
                                                                            ),
                                                                            formatLeader(
                                                                                homeLeader,
                                                                                homeMeta?.abbrev ??
                                                                                    game
                                                                                        .home
                                                                                        .abbrev,
                                                                            ),
                                                                        ]
                                                                            .filter(
                                                                                Boolean,
                                                                            )
                                                                            .join(
                                                                                ' | ',
                                                                            )}
                                                                    </p>
                                                                )}
                                                                {(awayGoalie ||
                                                                    homeGoalie) && (
                                                                    <p>
                                                                        Goalies:{' '}
                                                                        {[
                                                                            formatGoalie(
                                                                                awayGoalie,
                                                                                awayMeta?.abbrev ??
                                                                                    game
                                                                                        .away
                                                                                        .abbrev,
                                                                            ),
                                                                            formatGoalie(
                                                                                homeGoalie,
                                                                                homeMeta?.abbrev ??
                                                                                    game
                                                                                        .home
                                                                                        .abbrev,
                                                                            ),
                                                                        ]
                                                                            .filter(
                                                                                Boolean,
                                                                            )
                                                                            .join(
                                                                                ' | ',
                                                                            )}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}
                                                        {recentEvents.length > 0 && (
                                                            <div className="mt-3 space-y-1 text-[11px] text-gray-500">
                                                                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                                                                    Recent events
                                                                </p>
                                                                <ul className="space-y-1">
                                                                    {recentEvents.map(
                                                                        (event) => (
                                                                            <li
                                                                                key={
                                                                                    event.id
                                                                                }
                                                                            >
                                                                                {formatPlayDetail(
                                                                                    event,
                                                                                )}
                                                                            </li>
                                                                        ),
                                                                    )}
                                                                </ul>
                                                            </div>
                                                        )}
                                                        {scoringSnippets.length >
                                                            0 && (
                                                            <div className="mt-3 space-y-1 text-[11px] text-gray-500">
                                                                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                                                                    Scoring summary
                                                                </p>
                                                                <div className="space-y-1">
                                                                    {scoringSnippets.map(
                                                                        (item) => {
                                                                            const labelParts = [
                                                                                item.team,
                                                                                item.description,
                                                                            ]
                                                                                .filter(
                                                                                    Boolean,
                                                                                )
                                                                                .join(
                                                                                    ' – ',
                                                                                );
                                                                            const timeLabel = item.time
                                                                                ? item.period
                                                                                    ? `P${item.period} ${item.time}`
                                                                                    : item.time
                                                                                : item.period
                                                                                    ? `P${item.period}`
                                                                                    : undefined;
                                                                            return (
                                                                                <p
                                                                                    key={
                                                                                        item.id ??
                                                                                        `${item.period ?? '0'}-${item.time ?? '0'}`
                                                                                    }
                                                                                >
                                                                                    {timeLabel && (
                                                                                        <span className="font-semibold text-gray-900">
                                                                                            {
                                                                                                `${timeLabel}:`
                                                                                            }
                                                                                        </span>
                                                                                    )}
                                                                                    <span className="ml-1">
                                                                                        {labelParts ||
                                                                                            item.score ||
                                                                                            'Goal'}
                                                                                    </span>
                                                                                    {item.score &&
                                                                                        labelParts && (
                                                                                            <span className="ml-1 text-gray-500">
                                                                                                (
                                                                                                {
                                                                                                    item.score
                                                                                                }
                                                                                                )
                                                                                            </span>
                                                                                        )}
                                                                                </p>
                                                                            );
                                                                        },
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {statsToShow.length > 0 && (
                                                            <div className="mt-3 text-[11px] text-gray-500">
                                                                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                                                                    Team stats
                                                                </p>
                                                                <div className="mt-1 grid gap-1">
                                                                    {statsToShow.map(
                                                                        (stat) => (
                                                                            <div
                                                                                key={`${stat.label}-${stat.away}-${stat.home}`}
                                                                                className="grid grid-cols-[auto_1fr_auto] items-center text-[11px]"
                                                                            >
                                                                                <span className="text-right text-gray-900">
                                                                                    {
                                                                                        stat.away
                                                                                    }
                                                                                </span>
                                                                                <span className="text-center text-gray-500">
                                                                                    {
                                                                                        stat.label
                                                                                    }
                                                                                </span>
                                                                                <span className="text-left text-gray-900">
                                                                                    {
                                                                                        stat.home
                                                                                    }
                                                                                </span>
                                                                            </div>
                                                                        ),
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    {gameTypeLabel && (
                                                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                                                            {gameTypeLabel}
                                                        </p>
                                                    )}
                                                    {liveStatus && (
                                                        <p className="mt-1 text-xs font-semibold text-emerald-600">
                                                            {liveStatus}
                                                        </p>
                                                    )}
                                                    {liveClockLabel &&
                                                        liveClockLabel !==
                                                            liveStatus && (
                                                            <p className="mt-1 text-[11px] font-semibold text-emerald-600">
                                                                {liveClockLabel}
                                                            </p>
                                                        )}
                                                    {series && (
                                                        <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                                                            {series}
                                                        </p>
                                                    )}
                                                    {statusFlag && (
                                                        <span className="mt-2 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                                                            {statusFlag}
                                                        </span>
                                                    )}
                                                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                                        {game.status || 'Scheduled'}
                                                    </p>
                                                    <p className="mt-1 text-lg font-semibold text-gray-900">
                                                        {hasScore
                                                            ? `${game.away.score} - ${game.home.score}`
                                                            : normalizeTime(
                                                                  game.startTime,
                                                              )}
                                                    </p>
                                                    {linescoreSummary && (
                                                        <p className="mt-2 text-[11px] text-gray-500">
                                                            Linescore:{' '}
                                                            {linescoreSummary}
                                                        </p>
                                                    )}
                                                    {shotsByPeriodSummary && (
                                                        <p className="text-[11px] text-gray-500">
                                                            Shots by period:{' '}
                                                            {
                                                                shotsByPeriodSummary
                                                            }
                                                        </p>
                                                    )}
                                                    {shotsSummary && (
                                                        <p className="text-[11px] text-gray-500">
                                                            {shotsSummary}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        );

                                        const fallbackKey = `${day.date ?? 'day'}-${awayKey || 'away'}-${homeKey || 'home'}`;
                                        const cardKey = game.id || resolvedId || fallbackKey;

                                        return resolvedId ? (
                                            <Link
                                                key={cardKey}
                                                href={`/lab/scores/${resolvedId}`}
                                                className={cardClass}
                                            >
                                                {cardContent}
                                            </Link>
                                        ) : (
                                            <div key={cardKey} className={cardClass}>
                                                {cardContent}
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
                            );
                        })}
                </div>
            </div>
            </LabLayout>
        </>
    );
}
