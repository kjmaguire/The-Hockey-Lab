export type TeamSnapshot = {
    name: string;
    abbrev?: string;
    score?: number | null;
};

export type ScheduleGame = {
    id: string;
    home: TeamSnapshot;
    away: TeamSnapshot;
    startTime?: string;
    status?: string;
    venue?: string;
    broadcasts?: string[];
    gameTypeId?: number | null;
};

export type ScheduleDay = {
    date: string;
    games: ScheduleGame[];
};

export type TeamRow = {
    id: string;
    name: string;
    abbrev?: string;
};

export type StandingsRow = {
    id: string;
    name: string;
    abbrev?: string;
    logo?: string;
    clinchIndicator?: string;
    conferenceName?: string;
    divisionName?: string;
    seasonId?: number | null;
    leagueSequence?: number | null;
    conferenceSequence?: number | null;
    divisionSequence?: number | null;
    wildcardSequence?: number | null;
    points?: number | null;
    gamesPlayed?: number | null;
    record?: string;
    pointPctg?: number | null;
    goalDifferential?: number | null;
    goalsFor?: number | null;
    goalsAgainst?: number | null;
    wins?: number | null;
    losses?: number | null;
    otLosses?: number | null;
    streakCode?: string;
    streakCount?: number | null;
    l10Wins?: number | null;
    l10Losses?: number | null;
    l10OtLosses?: number | null;
    homeWins?: number | null;
    homeLosses?: number | null;
    homeOtLosses?: number | null;
    roadWins?: number | null;
    roadLosses?: number | null;
    roadOtLosses?: number | null;
};

export type PlayerRow = {
    id: string;
    name: string;
    team?: string;
    position?: string;
    gamesPlayed?: number | null;
    goals?: number | null;
    assists?: number | null;
    points?: number | null;
    shots?: number | null;
};

export type SkaterDetail = {
    id: string;
    name: string;
    team?: string;
    position?: string;
    metrics: Array<{ label: string; value: string | number }>;
};

export type RosterPlayer = {
    id: string;
    name: string;
    headshot?: string;
    number?: string;
    position?: string;
    shoots?: string;
    height?: string;
    heightInInches?: number | null;
    weight?: number | null;
    birthDate?: string;
    hometown?: string;
};

export type RosterGroups = {
    forwards: RosterPlayer[];
    defensemen: RosterPlayer[];
    goalies: RosterPlayer[];
};

export type ClubSkater = {
    id: string;
    name: string;
    position?: string;
    gamesPlayed?: number | null;
    goals?: number | null;
    assists?: number | null;
    points?: number | null;
    shots?: number | null;
};

export type ClubGoalie = {
    id: string;
    name: string;
    gamesPlayed?: number | null;
    wins?: number | null;
    losses?: number | null;
    savePercentage?: number | null;
    goalsAgainstAverage?: number | null;
    shutouts?: number | null;
};

export type ClubStats = {
    skaters: ClubSkater[];
    goalies: ClubGoalie[];
};

export type ProspectPlayer = {
    id: string;
    name: string;
    position?: string;
    shoots?: string;
    height?: string;
    weight?: number | null;
    birthDate?: string;
    birthCountry?: string;
    hometown?: string;
    league?: string;
    team?: string;
    status?: string;
    draftYear?: number | null;
    draftRound?: number | null;
    draftPick?: number | null;
    draftTeam?: string;
    headshot?: string;
};

export type ProspectGroups = {
    forwards: ProspectPlayer[];
    defensemen: ProspectPlayer[];
    goalies: ProspectPlayer[];
};

export type SeasonEntry = {
    season: number;
    gameTypes?: number[];
};

export type TeamStatsSummary = {
    teamId?: number | null;
    teamName?: string;
    gamesPlayed?: number | null;
    wins?: number | null;
    losses?: number | null;
    otLosses?: number | null;
    points?: number | null;
    pointPct?: number | null;
    goalsFor?: number | null;
    goalsAgainst?: number | null;
    goalsForPerGame?: number | null;
    goalsAgainstPerGame?: number | null;
    shotsForPerGame?: number | null;
    shotsAgainstPerGame?: number | null;
    powerPlayPct?: number | null;
    penaltyKillPct?: number | null;
    powerPlayNetPct?: number | null;
    penaltyKillNetPct?: number | null;
    regulationAndOtWins?: number | null;
    winsInRegulation?: number | null;
    winsInShootout?: number | null;
    teamShutouts?: number | null;
    faceoffWinPct?: number | null;
};

export type TeamStatsGoalie = {
    savePct?: number | null;
    goalsAgainstAverage?: number | null;
    shotsAgainst?: number | null;
    saves?: number | null;
    goalsAgainst?: number | null;
    shutouts?: number | null;
};

export type TeamStatsPercentages = {
    satPct?: number | null;
    usatPct?: number | null;
    shootingPct5v5?: number | null;
    savePct5v5?: number | null;
    shootingPlusSavePct5v5?: number | null;
    zoneStartPct5v5?: number | null;
};

export type TeamStatsSummaryShooting = {
    satFor?: number | null;
    satAgainst?: number | null;
    usatFor?: number | null;
    usatAgainst?: number | null;
    shots5v5?: number | null;
};

export type TeamStatsPowerPlay = {
    powerPlayGoalsFor?: number | null;
    powerPlayPct?: number | null;
    powerPlayNetPct?: number | null;
    ppGoalsPerGame?: number | null;
    ppNetGoals?: number | null;
    ppOpportunities?: number | null;
    ppOpportunitiesPerGame?: number | null;
    ppTimeOnIcePerGame?: number | null;
    shGoalsAgainst?: number | null;
};

export type TeamStatsPenaltyKill = {
    penaltyKillPct?: number | null;
    penaltyKillNetPct?: number | null;
    pkNetGoals?: number | null;
    pkTimeOnIcePerGame?: number | null;
    timesShorthanded?: number | null;
    timesShorthandedPerGame?: number | null;
    ppGoalsAgainst?: number | null;
    shGoalsFor?: number | null;
};

export type TeamStatsSeason = {
    id?: number | null;
    numberOfGames?: number | null;
};

export type TeamStatsReport = Record<string, unknown>;

export type TeamStatsSnapshot = {
    summary?: TeamStatsSummary | null;
    savePercentage?: TeamStatsGoalie | null;
    percentages?: TeamStatsPercentages | null;
    summaryShooting?: TeamStatsSummaryShooting | null;
    powerPlay?: TeamStatsPowerPlay | null;
    penaltyKill?: TeamStatsPenaltyKill | null;
    season?: TeamStatsSeason | null;
    faceoffPercentages?: TeamStatsReport | null;
    faceoffWins?: TeamStatsReport | null;
    penalties?: TeamStatsReport | null;
    goalsByPeriod?: TeamStatsReport | null;
    goalsForByStrength?: TeamStatsReport | null;
    goalsAgainstByStrength?: TeamStatsReport | null;
    goalsForByStrengthGoaliePull?: TeamStatsReport | null;
    goalsAgainstByStrengthGoaliePull?: TeamStatsReport | null;
    leadingTrailing?: TeamStatsReport | null;
    scoreTrailFirst?: TeamStatsReport | null;
    shootout?: TeamStatsReport | null;
    shotType?: TeamStatsReport | null;
    realtime?: TeamStatsReport | null;
    outshootOutshot?: TeamStatsReport | null;
    goalGames?: TeamStatsReport | null;
    powerPlayTime?: TeamStatsReport | null;
    penaltyKillTime?: TeamStatsReport | null;
    ranks?: {
        powerPlayPct?: number | null;
        penaltyKillPct?: number | null;
        pointPct?: number | null;
        goalsForPerGame?: number | null;
        goalsAgainstPerGame?: number | null;
        shotsForPerGame?: number | null;
        shotsAgainstPerGame?: number | null;
        faceoffWinPct?: number | null;
        satPct?: number | null;
        usatPct?: number | null;
        shootingPct5v5?: number | null;
        savePct5v5?: number | null;
        shootingPlusSavePct5v5?: number | null;
        zoneStartPct5v5?: number | null;
    };
};

const asRecord = (value: unknown): Record<string, unknown> =>
    value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

const asArray = (value: unknown) => (Array.isArray(value) ? value : []);
const asString = (value: unknown) =>
    typeof value === 'string' ? value : '';
const asNumber = (value: unknown) => {
    if (typeof value === 'number') {
        return value;
    }
    if (typeof value === 'string') {
        const parsed = Number(value);
        return Number.isNaN(parsed) ? null : parsed;
    }
    return null;
};

const pickText = (...values: unknown[]) => {
    for (const value of values) {
        if (typeof value === 'string' && value.trim()) {
            return value;
        }
    }
    return '';
};

const pickTeamName = (team: Record<string, unknown>) =>
    pickText(
        (team.name as { default?: string })?.default,
        (team.teamName as { default?: string })?.default,
        (team.commonName as { default?: string })?.default,
        (team.placeName as { default?: string })?.default,
        team.name,
        (team.team as { name?: string })?.name,
        (team.team as { shortName?: string })?.shortName,
        team.abbrev,
        (team.team as { abbreviation?: string })?.abbreviation,
    );

const pickTeamFullName = (team: Record<string, unknown>) => {
    const placeName = pickText(
        (team.placeName as { default?: string })?.default,
        team.placeName,
    );
    const commonName = pickText(
        (team.commonName as { default?: string })?.default,
        team.commonName,
    );
    if (placeName && commonName) {
        return `${placeName} ${commonName}`;
    }
    return pickTeamName(team);
};

const pickTeamAbbrev = (team: Record<string, unknown>) =>
    pickText(
        team.abbrev,
        (team.teamAbbrev as { default?: string })?.default,
        (team.abbreviation as string) ?? '',
        (team.team as { abbreviation?: string })?.abbreviation,
    );

const pickScore = (team: Record<string, unknown>) =>
    asNumber(team.score ?? team.goals);

const pickBroadcastLabel = (record: Record<string, unknown>) =>
    pickText(
        record.network,
        record.name,
        record.shortName,
        record.callLetters,
        record.station,
        record.market,
    );

const pickBroadcasts = (gameRecord: Record<string, unknown>) => {
    const broadcastsRecord = asRecord(gameRecord.broadcasts);
    const candidates = [
        gameRecord.tvBroadcasts,
        gameRecord.broadcasts,
        broadcastsRecord.tv,
        broadcastsRecord.radio,
        broadcastsRecord.tvBroadcasts,
        broadcastsRecord.radioBroadcasts,
    ];
    const items = candidates.flatMap((candidate) => asArray(candidate));
    const labels = items
        .map((item) => pickBroadcastLabel(asRecord(item)))
        .filter(Boolean);
    return Array.from(new Set(labels));
};

const pickGameTypeId = (gameRecord: Record<string, unknown>) => {
    const raw =
        gameRecord.gameTypeId ??
        gameRecord.gameType ??
        (gameRecord.gameType as { id?: unknown })?.id ??
        (gameRecord.gameType as { gameTypeId?: unknown })?.gameTypeId;
    const numeric = asNumber(raw);
    if (numeric !== null) {
        return numeric;
    }
    if (typeof raw === 'string') {
        const normalized = raw.toLowerCase();
        if (normalized.startsWith('pre')) {
            return 1;
        }
        if (normalized.startsWith('r')) {
            return 2;
        }
        if (normalized.startsWith('p')) {
            return 3;
        }
    }
    return null;
};

const pickPersonName = (record: Record<string, unknown>) =>
    pickText(
        (record.fullName as { default?: string })?.default,
        record.fullName,
        record.name,
        record.skaterFullName,
        record.playerName,
        record.playerFullName,
        record.displayName,
        (record.firstName as { default?: string })?.default &&
            (record.lastName as { default?: string })?.default
            ? `${(record.firstName as { default?: string })?.default} ${(record.lastName as { default?: string })?.default}`
            : '',
        record.firstName && record.lastName
            ? `${record.firstName} ${record.lastName}`
            : '',
    );

const pickTeamLabel = (record: Record<string, unknown>) =>
    pickText(
        (record.teamAbbrev as { default?: string })?.default,
        record.teamAbbrev,
        record.teamAbbreviation,
        record.team,
        record.teamCode,
        record.teamName,
    );

const pickPosition = (record: Record<string, unknown>) =>
    pickText(
        record.position,
        (record.position as { name?: string })?.name,
        (record.primaryPosition as { abbreviation?: string })?.abbreviation,
        (record.position as { abbreviation?: string })?.abbreviation,
    );

export const normalizeDate = (value: string) => {
    if (!value) {
        return '';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    return date.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });
};

export const normalizeTime = (value?: string) => {
    if (!value) {
        return 'TBD';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    return date.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
    });
};

export const fetchNhl = async (path: string) => {
    const response = await fetch(`/api/nhl/${path}`);
    if (!response.ok) {
        throw new Error('Failed to reach the NHL API.');
    }
    return response.json() as Promise<Record<string, unknown>>;
};

export const parseSchedule = (payload: Record<string, unknown>): ScheduleDay[] => {
    const gameWeek = asArray(payload.gameWeek);
    if (gameWeek.length) {
        return gameWeek
            .map((day) => {
                const dayRecord = asRecord(day);
                const games = asArray(dayRecord.games).map((game) => {
                    const gameRecord = asRecord(game);
                    const teams = asRecord(gameRecord.teams);
                const home = asRecord(gameRecord.homeTeam ?? teams.home);
                const away = asRecord(gameRecord.awayTeam ?? teams.away);
                const startTime = pickText(
                    gameRecord.startTimeUTC,
                    gameRecord.gameDate,
                    gameRecord.startTime,
                );
                const status = asRecord(gameRecord.status);
                const venue = asRecord(gameRecord.venue);
                const broadcasts = pickBroadcasts(gameRecord);
                const gameTypeId = pickGameTypeId(gameRecord);

                return {
                    id: String(
                        gameRecord.id ??
                                gameRecord.gamePk ??
                                `${pickTeamAbbrev(home)}-${pickTeamAbbrev(
                                    away,
                                )}-${startTime}`,
                        ),
                        startTime,
                        status: pickText(
                            gameRecord.gameState,
                            status.detailedState,
                        ),
                        venue: pickText(venue.default, venue.name),
                        broadcasts: broadcasts.length ? broadcasts : undefined,
                        gameTypeId,
                        home: {
                            name: pickTeamName(home) || 'Home',
                            abbrev: pickTeamAbbrev(home),
                            score: pickScore(home),
                        },
                        away: {
                            name: pickTeamName(away) || 'Away',
                            abbrev: pickTeamAbbrev(away),
                            score: pickScore(away),
                        },
                    } satisfies ScheduleGame;
                });

                return {
                    date: pickText(dayRecord.date, dayRecord.gameDate),
                    games,
                } satisfies ScheduleDay;
            })
            .filter((day) => day.games.length);
    }

    const games = asArray(payload.games);
    if (games.length) {
        const grouped = new Map<string, ScheduleGame[]>();

        games.forEach((game, index) => {
            const gameRecord = asRecord(game);
            const home = asRecord(gameRecord.homeTeam ?? gameRecord.home);
            const away = asRecord(gameRecord.awayTeam ?? gameRecord.away);
            const startTime = pickText(
                gameRecord.startTimeUTC,
                gameRecord.gameDate,
                gameRecord.startTime,
            );
            const status = asRecord(gameRecord.status);
            const venue = asRecord(gameRecord.venue);
            const broadcasts = pickBroadcasts(gameRecord);
            const gameTypeId = pickGameTypeId(gameRecord);
            const homeName = pickTeamFullName(home) || 'Home';
            const awayName = pickTeamFullName(away) || 'Away';
            const id = String(
                gameRecord.id ??
                    gameRecord.gameId ??
                    gameRecord.gamePk ??
                    `${pickTeamAbbrev(home)}-${pickTeamAbbrev(away)}-${startTime || index}`,
            );
            const gameItem = {
                id,
                startTime,
                status: pickText(
                    gameRecord.gameState,
                    status.detailedState,
                ),
                venue: pickText(venue.default, venue.name),
                broadcasts: broadcasts.length ? broadcasts : undefined,
                gameTypeId,
                home: {
                    name: homeName,
                    abbrev: pickTeamAbbrev(home),
                    score: pickScore(home),
                },
                away: {
                    name: awayName,
                    abbrev: pickTeamAbbrev(away),
                    score: pickScore(away),
                },
            } satisfies ScheduleGame;

            let dateKey = '';
            if (startTime) {
                const parsedDate = new Date(startTime);
                if (!Number.isNaN(parsedDate.getTime())) {
                    dateKey = parsedDate.toISOString().slice(0, 10);
                } else if (startTime.includes('T')) {
                    dateKey = startTime.split('T')[0];
                } else {
                    dateKey = startTime;
                }
            }
            const key = dateKey || String(gameRecord.gameDate ?? index);
            const dayGames = grouped.get(key) ?? [];
            dayGames.push(gameItem);
            grouped.set(key, dayGames);
        });

        return Array.from(grouped.entries())
            .map(([date, dayGames]) => ({
                date,
                games: dayGames,
            }))
            .filter((day) => day.games.length)
            .sort((a, b) => a.date.localeCompare(b.date));
    }

    const dates = asArray(payload.dates);
    if (dates.length) {
        return dates
            .map((day) => {
                const dayRecord = asRecord(day);
                const games = asArray(dayRecord.games).map((game) => {
                    const gameRecord = asRecord(game);
                    const teams = asRecord(gameRecord.teams);
                    const home = asRecord(teams.home);
                    const away = asRecord(teams.away);
                    const status = asRecord(gameRecord.status);
                    const venue = asRecord(gameRecord.venue);
                    const broadcasts = pickBroadcasts(gameRecord);
                    const homeTeam = asRecord(home.team ?? home);
                    const awayTeam = asRecord(away.team ?? away);
                    const gameTypeId = pickGameTypeId(gameRecord);

                    return {
                        id: String(
                            gameRecord.gamePk ??
                                `${pickTeamAbbrev(homeTeam)}-${pickTeamAbbrev(
                                    awayTeam,
                                )}-${gameRecord.gameDate}`,
                        ),
                        startTime: asString(gameRecord.gameDate),
                        status: pickText(status.detailedState),
                        venue: pickText(venue.name, venue.default),
                        broadcasts: broadcasts.length ? broadcasts : undefined,
                        gameTypeId,
                        home: {
                            name: pickTeamName(homeTeam) || 'Home',
                            abbrev: pickTeamAbbrev(homeTeam),
                            score: pickScore(home),
                        },
                        away: {
                            name: pickTeamName(awayTeam) || 'Away',
                            abbrev: pickTeamAbbrev(awayTeam),
                            score: pickScore(away),
                        },
                    } satisfies ScheduleGame;
                });

                return {
                    date: asString(dayRecord.date),
                    games,
                } satisfies ScheduleDay;
            })
            .filter((day) => day.games.length);
    }

    return [];
};

export const parseTeams = (payload: Record<string, unknown>): TeamRow[] => {
    const teams = asArray(payload.teams).length
        ? asArray(payload.teams)
        : asArray(payload.data);

    return teams
        .map((team, index) => {
            const record = asRecord(team);
            const teamRef = asRecord(record.team);
            const name = pickTeamName(record);
            const abbrev = pickTeamAbbrev(record);
            const id = String(
                record.id ??
                    record.teamId ??
                    teamRef.id ??
                    abbrev ??
                    name ??
                    index,
            );

            return {
                id,
                name: name || 'Unknown',
                abbrev,
            };
        })
        .filter((team) => team.name);
};

export const parseStandings = (
    payload: Record<string, unknown>,
): StandingsRow[] => {
    const standings = asArray(payload.standings);
    if (standings.length) {
        return standings.map((row, index) => {
            const record = asRecord(row);
            const name = pickTeamName(record);
            const abbrev = pickTeamAbbrev(record);
            const wins = asNumber(record.wins);
            const losses = asNumber(record.losses);
            const otLosses = asNumber(record.otLosses ?? record.otl);
            const clinchIndicator = pickText(
                record.clinchIndicator,
                record.clinchedIndicator,
                record.playoffIndicator,
                record.playoffStatus,
                record.clinchStatus,
                record.clinch,
            );
            const clinchedFlag =
                record.clinched === true
                    ? 'x'
                    : record.clinched === false
                      ? ''
                      : '';

            return {
                id: String(
                    record.teamId ??
                        abbrev ??
                        name ??
                        record.teamAbbrev ??
                        index,
                ),
                name: name || 'Unknown',
                abbrev,
                logo: pickText(
                    record.teamLogo,
                    (record.teamLogo as { default?: string })?.default,
                ),
                clinchIndicator:
                    clinchIndicator || clinchedFlag || undefined,
                conferenceName: pickText(record.conferenceName),
                divisionName: pickText(record.divisionName),
                seasonId: asNumber(record.seasonId),
                leagueSequence: asNumber(record.leagueSequence),
                conferenceSequence: asNumber(record.conferenceSequence),
                divisionSequence: asNumber(record.divisionSequence),
                wildcardSequence: asNumber(record.wildcardSequence),
                points: asNumber(record.points ?? record.pts),
                gamesPlayed: asNumber(record.gamesPlayed ?? record.gp),
                record:
                    wins !== null && losses !== null
                        ? `${wins}-${losses}-${otLosses ?? 0}`
                        : undefined,
                pointPctg: asNumber(record.pointPctg),
                goalDifferential: asNumber(record.goalDifferential),
                goalsFor: asNumber(record.goalFor ?? record.goalsFor),
                goalsAgainst: asNumber(record.goalAgainst ?? record.goalsAgainst),
                wins,
                losses,
                otLosses,
                streakCode: pickText(record.streakCode),
                streakCount: asNumber(record.streakCount),
                l10Wins: asNumber(record.l10Wins),
                l10Losses: asNumber(record.l10Losses),
                l10OtLosses: asNumber(record.l10OtLosses),
                homeWins: asNumber(record.homeWins),
                homeLosses: asNumber(record.homeLosses),
                homeOtLosses: asNumber(record.homeOtLosses),
                roadWins: asNumber(record.roadWins),
                roadLosses: asNumber(record.roadLosses),
                roadOtLosses: asNumber(record.roadOtLosses),
            };
        });
    }

    const records = asArray(payload.records);
    if (records.length) {
        return records.flatMap((division) => {
            const divisionRecord = asRecord(division);
            const divisionInfo = asRecord(divisionRecord.division);
            const conferenceInfo = asRecord(divisionRecord.conference);
            const divisionName = pickText(
                divisionInfo.name,
                divisionInfo.nameShort,
                divisionInfo.abbreviation,
                divisionInfo.id,
            );
            const conferenceName = pickText(
                conferenceInfo.name,
                conferenceInfo.nameShort,
                conferenceInfo.abbreviation,
                conferenceInfo.id,
            );

            return asArray(divisionRecord.teamRecords).map((row, index) => {
                const record = asRecord(row);
                const team = asRecord(record.team ?? record);
                const leagueRecord = asRecord(record.leagueRecord);
                const homeRecord = asRecord(record.home);
                const roadRecord = asRecord(record.away);
                const streak = asRecord(record.streak);
                const clinchIndicator = pickText(
                    record.clinchIndicator,
                    record.clinchedIndicator,
                    record.playoffIndicator,
                    record.playoffStatus,
                    record.clinchStatus,
                    record.clinch,
                );
                const clinchedFlag =
                    record.clinched === true
                        ? 'x'
                        : record.clinched === false
                          ? ''
                          : '';
                const wins = asNumber(leagueRecord.wins);
                const losses = asNumber(leagueRecord.losses);
                const otLosses = asNumber(leagueRecord.ot);
                const goalsFor = asNumber(
                    record.goalsScored ?? record.goalsFor,
                );
                const goalsAgainst = asNumber(record.goalsAgainst);
                const goalDifferential =
                    goalsFor !== null && goalsAgainst !== null
                        ? goalsFor - goalsAgainst
                        : asNumber(record.goalDifferential);

                return {
                    id: String(
                        team.id ??
                            team.abbrev ??
                            team.name ??
                            record.teamId ??
                            index,
                    ),
                    name: pickTeamName(team) || 'Unknown',
                    abbrev: pickTeamAbbrev(team),
                    clinchIndicator:
                        clinchIndicator || clinchedFlag || undefined,
                    conferenceName,
                    divisionName,
                    seasonId: asNumber(record.seasonId),
                    leagueSequence: asNumber(record.leagueSequence),
                    conferenceSequence: asNumber(record.conferenceSequence),
                    divisionSequence: asNumber(record.divisionSequence),
                    wildcardSequence: asNumber(record.wildcardSequence),
                    points: asNumber(record.points),
                    gamesPlayed: asNumber(record.gamesPlayed),
                    record:
                        wins !== null && losses !== null
                            ? `${wins}-${losses}-${otLosses ?? 0}`
                            : undefined,
                    pointPctg: asNumber(record.pointPctg),
                    goalDifferential,
                    goalsFor,
                    goalsAgainst,
                    wins,
                    losses,
                    otLosses,
                    streakCode: pickText(streak.streakCode),
                    streakCount: asNumber(streak.streakNumber),
                    l10Wins: asNumber(record.lastTenWins),
                    l10Losses: asNumber(record.lastTenLosses),
                    l10OtLosses: asNumber(record.lastTenOt),
                    homeWins: asNumber(homeRecord.wins),
                    homeLosses: asNumber(homeRecord.losses),
                    homeOtLosses: asNumber(homeRecord.ot),
                    roadWins: asNumber(roadRecord.wins),
                    roadLosses: asNumber(roadRecord.losses),
                    roadOtLosses: asNumber(roadRecord.ot),
                };
            });
        });
    }

    return [];
};

export const parseTeamStats = (
    payload: Record<string, unknown>,
): TeamStatsSnapshot => {
    const summaryRecord = asRecord(payload.summary);
    const saveRecord = asRecord(payload.savePercentage);
    const percentagesRecord = asRecord(payload.percentages);
    const summaryShootingRecord = asRecord(payload.summaryShooting);
    const powerPlayRecord = asRecord(payload.powerPlay);
    const penaltyKillRecord = asRecord(payload.penaltyKill);
    const faceoffPercentagesRecord = asRecord(payload.faceoffPercentages);
    const faceoffWinsRecord = asRecord(payload.faceoffWins);
    const penaltiesRecord = asRecord(payload.penalties);
    const goalsByPeriodRecord = asRecord(payload.goalsByPeriod);
    const goalsForByStrengthRecord = asRecord(payload.goalsForByStrength);
    const goalsAgainstByStrengthRecord = asRecord(payload.goalsAgainstByStrength);
    const goalsForByStrengthPullRecord = asRecord(payload.goalsForByStrengthGoaliePull);
    const goalsAgainstByStrengthPullRecord = asRecord(payload.goalsAgainstByStrengthGoaliePull);
    const leadingTrailingRecord = asRecord(payload.leadingTrailing);
    const scoreTrailFirstRecord = asRecord(payload.scoreTrailFirst);
    const shootoutRecord = asRecord(payload.shootout);
    const shotTypeRecord = asRecord(payload.shotType);
    const realtimeRecord = asRecord(payload.realtime);
    const outshootRecord = asRecord(payload.outshootOutshot);
    const goalGamesRecord = asRecord(payload.goalGames);
    const powerPlayTimeRecord = asRecord(payload.powerPlayTime);
    const penaltyKillTimeRecord = asRecord(payload.penaltyKillTime);
    const seasonRecord = asRecord(payload.season);
    const ranks = asRecord(payload.ranks);

    const summary =
        Object.keys(summaryRecord).length > 0
            ? ({
                  teamId: asNumber(summaryRecord.teamId),
                  teamName: pickText(summaryRecord.teamFullName),
                  gamesPlayed: asNumber(summaryRecord.gamesPlayed),
                  wins: asNumber(summaryRecord.wins),
                  losses: asNumber(summaryRecord.losses),
                  otLosses: asNumber(summaryRecord.otLosses),
                  points: asNumber(summaryRecord.points),
                  pointPct: asNumber(summaryRecord.pointPct),
                  goalsFor: asNumber(summaryRecord.goalsFor),
                  goalsAgainst: asNumber(summaryRecord.goalsAgainst),
                  goalsForPerGame: asNumber(summaryRecord.goalsForPerGame),
                  goalsAgainstPerGame: asNumber(
                      summaryRecord.goalsAgainstPerGame,
                  ),
                  shotsForPerGame: asNumber(summaryRecord.shotsForPerGame),
                  shotsAgainstPerGame: asNumber(
                      summaryRecord.shotsAgainstPerGame,
                  ),
                  powerPlayPct: asNumber(summaryRecord.powerPlayPct),
                  penaltyKillPct: asNumber(summaryRecord.penaltyKillPct),
                  powerPlayNetPct: asNumber(summaryRecord.powerPlayNetPct),
                  penaltyKillNetPct: asNumber(summaryRecord.penaltyKillNetPct),
                  regulationAndOtWins: asNumber(
                      summaryRecord.regulationAndOtWins,
                  ),
                  winsInRegulation: asNumber(summaryRecord.winsInRegulation),
                  winsInShootout: asNumber(summaryRecord.winsInShootout),
                  teamShutouts: asNumber(summaryRecord.teamShutouts),
                  faceoffWinPct: asNumber(summaryRecord.faceoffWinPct),
              } satisfies TeamStatsSummary)
            : null;

    const savePercentage =
        Object.keys(saveRecord).length > 0
            ? ({
                  savePct: asNumber(saveRecord.savePct),
                  goalsAgainstAverage: asNumber(
                      saveRecord.goalsAgainstAverage,
                  ),
                  shotsAgainst: asNumber(saveRecord.shotsAgainst),
                  saves: asNumber(saveRecord.saves),
                  goalsAgainst: asNumber(saveRecord.goalsAgainst),
                  shutouts: asNumber(saveRecord.shutouts),
              } satisfies TeamStatsGoalie)
            : null;

    const percentages =
        Object.keys(percentagesRecord).length > 0
            ? ({
                  satPct: asNumber(percentagesRecord.satPct),
                  usatPct: asNumber(percentagesRecord.usatPct),
                  shootingPct5v5: asNumber(percentagesRecord.shootingPct5v5),
                  savePct5v5: asNumber(percentagesRecord.savePct5v5),
                  shootingPlusSavePct5v5: asNumber(
                      percentagesRecord.shootingPlusSavePct5v5,
                  ),
                  zoneStartPct5v5: asNumber(
                      percentagesRecord.zoneStartPct5v5,
                  ),
              } satisfies TeamStatsPercentages)
            : null;

    const summaryShooting =
        Object.keys(summaryShootingRecord).length > 0
            ? ({
                  satFor: asNumber(summaryShootingRecord.satFor),
                  satAgainst: asNumber(summaryShootingRecord.satAgainst),
                  usatFor: asNumber(summaryShootingRecord.usatFor),
                  usatAgainst: asNumber(summaryShootingRecord.usatAgainst),
                  shots5v5: asNumber(summaryShootingRecord.shots5v5),
              } satisfies TeamStatsSummaryShooting)
            : null;

    const powerPlay =
        Object.keys(powerPlayRecord).length > 0
            ? ({
                  powerPlayGoalsFor: asNumber(
                      powerPlayRecord.powerPlayGoalsFor,
                  ),
                  powerPlayPct: asNumber(powerPlayRecord.powerPlayPct),
                  powerPlayNetPct: asNumber(powerPlayRecord.powerPlayNetPct),
                  ppGoalsPerGame: asNumber(powerPlayRecord.ppGoalsPerGame),
                  ppNetGoals: asNumber(powerPlayRecord.ppNetGoals),
                  ppOpportunities: asNumber(
                      powerPlayRecord.ppOpportunities,
                  ),
                  ppOpportunitiesPerGame: asNumber(
                      powerPlayRecord.ppOpportunitiesPerGame,
                  ),
                  ppTimeOnIcePerGame: asNumber(
                      powerPlayRecord.ppTimeOnIcePerGame,
                  ),
                  shGoalsAgainst: asNumber(powerPlayRecord.shGoalsAgainst),
              } satisfies TeamStatsPowerPlay)
            : null;

    const penaltyKill =
        Object.keys(penaltyKillRecord).length > 0
            ? ({
                  penaltyKillPct: asNumber(
                      penaltyKillRecord.penaltyKillPct,
                  ),
                  penaltyKillNetPct: asNumber(
                      penaltyKillRecord.penaltyKillNetPct,
                  ),
                  pkNetGoals: asNumber(penaltyKillRecord.pkNetGoals),
                  pkTimeOnIcePerGame: asNumber(
                      penaltyKillRecord.pkTimeOnIcePerGame,
                  ),
                  timesShorthanded: asNumber(
                      penaltyKillRecord.timesShorthanded,
                  ),
                  timesShorthandedPerGame: asNumber(
                      penaltyKillRecord.timesShorthandedPerGame,
                  ),
                  ppGoalsAgainst: asNumber(
                      penaltyKillRecord.ppGoalsAgainst,
                  ),
                  shGoalsFor: asNumber(penaltyKillRecord.shGoalsFor),
              } satisfies TeamStatsPenaltyKill)
            : null;

    const season =
        Object.keys(seasonRecord).length > 0
            ? ({
                  id: asNumber(seasonRecord.id),
                  numberOfGames: asNumber(seasonRecord.numberOfGames),
              } satisfies TeamStatsSeason)
            : null;

    return {
        summary,
        savePercentage,
        percentages,
        summaryShooting,
        powerPlay,
        penaltyKill,
        season,
        faceoffPercentages:
            Object.keys(faceoffPercentagesRecord).length > 0
                ? faceoffPercentagesRecord
                : null,
        faceoffWins:
            Object.keys(faceoffWinsRecord).length > 0
                ? faceoffWinsRecord
                : null,
        penalties:
            Object.keys(penaltiesRecord).length > 0
                ? penaltiesRecord
                : null,
        goalsByPeriod:
            Object.keys(goalsByPeriodRecord).length > 0
                ? goalsByPeriodRecord
                : null,
        goalsForByStrength:
            Object.keys(goalsForByStrengthRecord).length > 0
                ? goalsForByStrengthRecord
                : null,
        goalsAgainstByStrength:
            Object.keys(goalsAgainstByStrengthRecord).length > 0
                ? goalsAgainstByStrengthRecord
                : null,
        goalsForByStrengthGoaliePull:
            Object.keys(goalsForByStrengthPullRecord).length > 0
                ? goalsForByStrengthPullRecord
                : null,
        goalsAgainstByStrengthGoaliePull:
            Object.keys(goalsAgainstByStrengthPullRecord).length > 0
                ? goalsAgainstByStrengthPullRecord
                : null,
        leadingTrailing:
            Object.keys(leadingTrailingRecord).length > 0
                ? leadingTrailingRecord
                : null,
        scoreTrailFirst:
            Object.keys(scoreTrailFirstRecord).length > 0
                ? scoreTrailFirstRecord
                : null,
        shootout:
            Object.keys(shootoutRecord).length > 0 ? shootoutRecord : null,
        shotType:
            Object.keys(shotTypeRecord).length > 0 ? shotTypeRecord : null,
        realtime:
            Object.keys(realtimeRecord).length > 0 ? realtimeRecord : null,
        outshootOutshot:
            Object.keys(outshootRecord).length > 0 ? outshootRecord : null,
        goalGames:
            Object.keys(goalGamesRecord).length > 0 ? goalGamesRecord : null,
        powerPlayTime:
            Object.keys(powerPlayTimeRecord).length > 0
                ? powerPlayTimeRecord
                : null,
        penaltyKillTime:
            Object.keys(penaltyKillTimeRecord).length > 0
                ? penaltyKillTimeRecord
                : null,
        ranks: {
            powerPlayPct: asNumber(ranks.powerPlayPct),
            penaltyKillPct: asNumber(ranks.penaltyKillPct),
            pointPct: asNumber(ranks.pointPct),
            goalsForPerGame: asNumber(ranks.goalsForPerGame),
            goalsAgainstPerGame: asNumber(ranks.goalsAgainstPerGame),
            shotsForPerGame: asNumber(ranks.shotsForPerGame),
            shotsAgainstPerGame: asNumber(ranks.shotsAgainstPerGame),
            faceoffWinPct: asNumber(ranks.faceoffWinPct),
            satPct: asNumber(ranks.satPct),
            usatPct: asNumber(ranks.usatPct),
            shootingPct5v5: asNumber(ranks.shootingPct5v5),
            savePct5v5: asNumber(ranks.savePct5v5),
            shootingPlusSavePct5v5: asNumber(
                ranks.shootingPlusSavePct5v5,
            ),
            zoneStartPct5v5: asNumber(ranks.zoneStartPct5v5),
        },
    };
};

export const parseSkaterLanding = (
    payload: Record<string, unknown>,
): PlayerRow[] => {
    const skaters = asArray(payload.skaters).length
        ? asArray(payload.skaters)
        : asArray(payload.data).length
          ? asArray(payload.data)
          : asArray(payload.players).length
            ? asArray(payload.players)
            : asArray(payload.playerStats);

    return skaters
        .map((skater, index) => {
            const record = asRecord(skater);
            const id = String(
                record.playerId ??
                    record.player_id ??
                    record.skaterId ??
                    record.id ??
                    index,
            );
            const name = pickPersonName(record) || 'Unknown';

            return {
                id,
                name,
                team: pickTeamLabel(record),
                position: pickPosition(record),
                gamesPlayed: asNumber(
                    record.gamesPlayed ?? record.gp ?? record.games,
                ),
                goals: asNumber(record.goals ?? record.g),
                assists: asNumber(record.assists ?? record.a),
                points: asNumber(record.points ?? record.p),
                shots: asNumber(record.shots ?? record.sog),
            };
        })
        .filter((player) => player.name);
};

export const parseSkaterDetail = (
    payload: Record<string, unknown>,
    fallback?: PlayerRow,
): SkaterDetail | null => {
    const candidates = [
        payload.player,
        payload.skater,
        payload.playerStats,
        payload.skaterDetail,
        payload.data,
        payload,
    ];
    const record =
        candidates
            .map((candidate) => asRecord(candidate))
            .find((candidate) => Object.keys(candidate).length > 0) || {};
    const name = pickPersonName(record) || fallback?.name;
    const id = String(
        record.playerId ??
            record.player_id ??
            record.skaterId ??
            record.id ??
            fallback?.id ??
            '',
    );

    if (!id) {
        return null;
    }

    const metricOptions: Array<[string, string]> = [
        ['points', 'Points'],
        ['goals', 'Goals'],
        ['assists', 'Assists'],
        ['gamesPlayed', 'Games'],
        ['shots', 'Shots'],
        ['shotAttempts', 'Shot attempts'],
        ['toi', 'TOI'],
        ['timeOnIce', 'TOI'],
        ['avgTimeOnIce', 'Avg TOI'],
        ['topSpeed', 'Top speed'],
        ['speedBurst', 'Speed bursts'],
        ['distanceSkated', 'Distance skated'],
    ];

    const metrics = metricOptions
        .map(([key, label]) => {
            const value =
                record[key] ??
                (record.stats as Record<string, unknown> | undefined)?.[key];
            if (value === undefined || value === null || value === '') {
                return null;
            }
            return { label, value } as { label: string; value: string | number };
        })
        .filter(
            (metric): metric is { label: string; value: string | number } =>
                metric !== null,
        );

    return {
        id,
        name: name || 'Unknown',
        team: pickTeamLabel(record) || fallback?.team,
        position: pickPosition(record) || fallback?.position,
        metrics,
    };
};

const formatHeight = (inches: number | null) => {
    if (inches === null || Number.isNaN(inches)) {
        return '';
    }
    const feet = Math.floor(inches / 12);
    const remainder = inches % 12;
    return `${feet}'${remainder}"`;
};

const pickHometown = (record: Record<string, unknown>) => {
    const city = pickText(
        (record.birthCity as { default?: string })?.default,
        record.birthCity,
    );
    const state = pickText(
        (record.birthStateProvince as { default?: string })?.default,
        record.birthStateProvince,
    );
    const country = pickText(
        (record.birthCountry as { default?: string })?.default,
        record.birthCountry,
    );
    if (city || state || country) {
        const parts = [city, state, country].filter(Boolean);
        return parts.join(', ');
    }
    return '';
};

const parseRosterGroup = (value: unknown): RosterPlayer[] =>
    asArray(value).map((player, index) => {
        const record = asRecord(player);
        const id = String(
            record.id ?? record.playerId ?? record.personId ?? index,
        );
        const heightInches = asNumber(record.heightInInches);
        const height =
            heightInches !== null
                ? formatHeight(heightInches)
                : pickText(
                      record.height,
                      record.heightInCentimeters
                          ? `${record.heightInCentimeters} cm`
                          : '',
                  );
        const headshot = pickText(
            record.headshot,
            record.headshotUrl,
            record.image,
            (record.headshot as { default?: string })?.default,
        );

        return {
            id,
            name: pickPersonName(record) || 'Unknown',
            headshot: headshot || undefined,
            number: pickText(
                record.sweaterNumber,
                record.jerseyNumber,
                record.number,
            ),
            position: pickText(
                record.positionCode,
                record.position,
                (record.position as { abbreviation?: string })?.abbreviation,
                (record.primaryPosition as { abbreviation?: string })
                    ?.abbreviation,
            ),
            shoots: pickText(record.shootsCatches, record.shoots),
            height: height || undefined,
            heightInInches: heightInches,
            weight: asNumber(record.weightInPounds ?? record.weight),
            birthDate: pickText(record.birthDate),
            hometown: pickHometown(record) || undefined,
        };
    });

export const parseRoster = (
    payload: Record<string, unknown>,
): RosterGroups => {
    const forwards = parseRosterGroup(payload.forwards ?? payload.forward);
    const defensemen = parseRosterGroup(
        payload.defensemen ?? payload.defense ?? payload.defencemen,
    );
    const goalies = parseRosterGroup(payload.goalies ?? payload.goalie);

    if (forwards.length || defensemen.length || goalies.length) {
        return { forwards, defensemen, goalies };
    }

    const roster = parseRosterGroup(payload.roster ?? payload.players);
    const grouped = roster.reduce(
        (acc, player) => {
            const position = player.position?.toUpperCase() ?? '';
            if (position.startsWith('G')) {
                acc.goalies.push(player);
            } else if (position.startsWith('D')) {
                acc.defensemen.push(player);
            } else {
                acc.forwards.push(player);
            }
            return acc;
        },
        {
            forwards: [] as RosterPlayer[],
            defensemen: [] as RosterPlayer[],
            goalies: [] as RosterPlayer[],
        },
    );

    return grouped;
};

export const parseClubStats = (
    payload: Record<string, unknown>,
): ClubStats => {
    const skaters = asArray(payload.skaters).map((skater, index) => {
        const record = asRecord(skater);
        const id = String(record.playerId ?? index);
        const name = pickPersonName(record);
        return {
            id,
            name: name || 'Skater',
            position: pickPosition(record),
            gamesPlayed: asNumber(record.gamesPlayed),
            goals: asNumber(record.goals),
            assists: asNumber(record.assists),
            points: asNumber(record.points),
            shots: asNumber(record.shots),
        };
    });
    const goalies = asArray(payload.goalies).map((goalie, index) => {
        const record = asRecord(goalie);
        const id = String(record.playerId ?? index);
        const name = pickPersonName(record);
        return {
            id,
            name: name || 'Goalie',
            gamesPlayed: asNumber(record.gamesPlayed),
            wins: asNumber(record.wins),
            losses: asNumber(record.losses),
            savePercentage: asNumber(record.savePercentage),
            goalsAgainstAverage: asNumber(record.goalsAgainstAverage),
            shutouts: asNumber(record.shutouts),
        };
    });

    return {
        skaters,
        goalies,
    };
};

const parseProspectGroup = (value: unknown): ProspectPlayer[] =>
    asArray(value).map((player, index) => {
        const record = asRecord(player);
        const id = String(record.id ?? index);
        const name = pickPersonName(record);
        const heightInches = asNumber(record.heightInInches);
        const height = heightInches !== null ? `${heightInches}"` : '';
        const league = pickText(
            record.league,
            record.leagueName,
            (record.league as { name?: string })?.name,
            (record.league as { abbrev?: string })?.abbrev,
        );
        const team = pickText(
            record.teamName,
            record.team,
            (record.team as { name?: string })?.name,
            record.club,
            record.clubName,
            record.currentTeam,
            record.currentTeamName,
            record.currentTeamAbbrev,
        );
        const draftYear = asNumber(record.draftYear ?? record.draft_year);
        const draftRound = asNumber(record.draftRound ?? record.draft_round);
        const draftPick = asNumber(
            record.draftPick ??
                record.draft_pick ??
                record.draftOverall ??
                record.draftOverallPick ??
                record.draftOverallSelection,
        );
        const draftTeam = pickText(
            record.draftTeamAbbrev,
            record.draftTeam,
            record.draftTeamName,
            (record.draftTeam as { name?: string })?.name,
            (record.draftTeam as { abbrev?: string })?.abbrev,
        );

        return {
            id,
            name: name || 'Prospect',
            position: pickPosition(record),
            shoots: pickText(record.shootsCatches),
            height,
            weight: asNumber(record.weightInPounds),
            birthDate: pickText(record.birthDate),
            birthCountry: pickText(record.birthCountry),
            hometown: pickHometown(record) || undefined,
            league: league || undefined,
            team: team || undefined,
            status: pickText(record.status, record.playerType) || undefined,
            draftYear,
            draftRound,
            draftPick,
            draftTeam: draftTeam || undefined,
            headshot: pickText(record.headshot),
        };
    });

export const parseProspects = (
    payload: Record<string, unknown>,
): ProspectGroups => {
    return {
        forwards: parseProspectGroup(payload.forwards),
        defensemen: parseProspectGroup(payload.defensemen),
        goalies: parseProspectGroup(payload.goalies),
    };
};

export const parseSeasonList = (payload: unknown): SeasonEntry[] => {
    const list = Array.isArray(payload)
        ? payload
        : asArray((payload as Record<string, unknown>)?.seasons ?? payload);

    return list
        .map((entry) => {
            if (typeof entry === 'number') {
                return { season: entry };
            }
            const record = asRecord(entry);
            const season = asNumber(record.season ?? record.id);
            if (season === null) {
                return null;
            }
            const gameTypes = asArray(record.gameTypes)
                .map((type) => asNumber(type))
                .filter((type): type is number => type !== null);
            return {
                season,
                gameTypes: gameTypes.length ? gameTypes : undefined,
            };
        })
        .filter((entry): entry is SeasonEntry => entry !== null);
};
