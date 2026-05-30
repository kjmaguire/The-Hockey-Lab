export type TeamSnapshot = {
    name: string;
    abbrev?: string;
    score?: number | null;
};

export type BroadcastGroups = {
    tv?: string[];
    radio?: string[];
};

export type BroadcastDetail = {
    label: string;
    kind?: 'tv' | 'radio' | 'stream' | 'other';
    language?: string;
    scope?: string;
    market?: string;
    team?: string;
    feed?: string;
};

export type ScheduleStatusFlags = {
    postponed?: boolean;
    tbd?: boolean;
};

export type ScheduleEventFlags = {
    neutralSite?: boolean;
    specialEvent?: string;
};

export type ScheduleLinks = {
    gamecenter?: string;
    recap?: string;
    tickets?: string;
    condensedGame?: string;
    condensedGameFr?: string;
    threeMinRecap?: string;
    threeMinRecapFr?: string;
};

export type LinescorePeriod = {
    label: string;
    away?: number | null;
    home?: number | null;
    shotsAway?: number | null;
    shotsHome?: number | null;
};

export type LinescoreSnapshot = {
    periods: LinescorePeriod[];
    shots?: {
        away?: number | null;
        home?: number | null;
    };
};

export type ScoreboardLiveDetails = {
    period?: number | null;
    periodType?: string;
    clock?: string;
    inIntermission?: boolean;
    intermissionLabel?: string;
    intermissionTimeRemaining?: string;
};

export type ScheduleGame = {
    id: string;
    home: TeamSnapshot;
    away: TeamSnapshot;
    startTime?: string;
    status?: string;
    venue?: string;
    venueDetail?: string;
    broadcasts?: string[];
    broadcastGroups?: BroadcastGroups;
    broadcastDetails?: BroadcastDetail[];
    statusFlags?: ScheduleStatusFlags;
    eventFlags?: ScheduleEventFlags;
    links?: ScheduleLinks;
    gameTypeId?: number | null;
    liveStatus?: string;
    liveSituations?: {
        home?: string;
        away?: string;
    };
};

export type ScheduleDay = {
    date: string;
    games: ScheduleGame[];
};

export type OddsPartner = {
    id?: number | null;
    name: string;
    country?: string;
    imageUrl?: string;
    siteUrl?: string;
    bgColor?: string;
    textColor?: string;
    accentColor?: string;
};

export type BoxscoreTeam = {
    name: string;
    abbrev?: string;
    score?: number | null;
    logo?: string;
    darkLogo?: string;
    placeName?: string;
};

export type BoxscoreStat = {
    label: string;
    away: string;
    home: string;
};

export type BoxscoreSummaryPenalty = {
    period?: number | null;
    periodType?: string;
    maxRegulationPeriods?: number | null;
    time?: string;
    team?: string;
    player?: string;
    playerId?: string;
    infraction?: string;
    minutes?: number | null;
    description?: string;
};

export type BoxscoreThreeStar = {
    star?: number | null;
    id?: string;
    name: string;
    team?: string;
    position?: string;
    goals?: number | null;
    assists?: number | null;
    points?: number | null;
    headshot?: string;
};

export type BoxscoreShootoutAttempt = {
    sequence?: number | null;
    shooter?: string;
    goalie?: string;
    team?: string;
    result?: string;
};

export type BoxscoreClock = {
    timeRemaining?: string;
    running?: boolean;
    inIntermission?: boolean;
};

export type BoxscorePeriodDescriptor = {
    number?: number | null;
    periodType?: string;
    maxRegulationPeriods?: number | null;
};

export type BoxscoreOutcome = {
    lastPeriodType?: string;
    otPeriods?: number | null;
};

export type GoalieStatLine = {
    id: string;
    name: string;
    shots?: number | null;
    saves?: number | null;
    goalsAgainst?: number | null;
    savePct?: number | null;
    toi?: string;
    decision?: string;
    starter?: boolean;
    evenStrengthShotsAgainst?: string;
    powerPlayShotsAgainst?: string;
    shorthandedShotsAgainst?: string;
    saveShotsAgainst?: string;
    pim?: number | null;
    evenStrengthGoalsAgainst?: number | null;
    powerPlayGoalsAgainst?: number | null;
    shorthandedGoalsAgainst?: number | null;
};

export type GoalieStats = {
    away: GoalieStatLine[];
    home: GoalieStatLine[];
};

export type SkaterStatLine = {
    id: string;
    name: string;
    position?: string;
    sweaterNumber?: number | null;
    goals?: number | null;
    assists?: number | null;
    points?: number | null;
    plusMinus?: number | null;
    pim?: number | null;
    shots?: number | null;
    powerPlayGoals?: number | null;
    faceoffWinPct?: number | null;
    toi?: string;
    hits?: number | null;
    blocks?: number | null;
    giveaways?: number | null;
    takeaways?: number | null;
    shifts?: number | null;
};

export type SkaterStats = {
    away: SkaterStatLine[];
    home: SkaterStatLine[];
};

export type ScoringSummaryPlayer = {
    id?: string;
    name: string;
    goalsToDate?: number | null;
    assistsToDate?: number | null;
    mugshot?: string;
};

export type ScoringSummaryItem = {
    id: string;
    period?: number | null;
    periodType?: string;
    maxRegulationPeriods?: number | null;
    time?: string;
    team?: string;
    strength?: string;
    goalType?: string;
    score?: string;
    description?: string;
    videoUrl?: string;
    videoUrlFr?: string;
    highlightClipId?: number | null;
    highlightClipFrId?: number | null;
    discreteClipId?: number | null;
    discreteClipFrId?: number | null;
    scorer?: ScoringSummaryPlayer;
    assists?: ScoringSummaryPlayer[];
};

export type TeamLeaderEntry = {
    label: string;
    player?: string;
    value?: number | null;
    headshot?: string;
};

export type TeamLeaders = {
    away: TeamLeaderEntry[];
    home: TeamLeaderEntry[];
};

export type BoxscoreSnapshot = {
    id: string;
    status?: string;
    startTime?: string;
    gameDate?: string;
    season?: number | null;
    gameType?: number | null;
    limitedScoring?: boolean;
    gameScheduleState?: string;
    easternUTCOffset?: number | null;
    venueUTCOffset?: number | null;
    venue?: string;
    venueLocation?: string;
    clock?: BoxscoreClock;
    periodDescriptor?: BoxscorePeriodDescriptor;
    gameOutcome?: BoxscoreOutcome;
    tvBroadcasts?: string[];
    home: BoxscoreTeam;
    away: BoxscoreTeam;
    stats: BoxscoreStat[];
    scoringSummary: ScoringSummaryItem[];
    leaders?: TeamLeaders;
    goalies?: GoalieStats;
    skaters?: SkaterStats;
    summaryPenalties?: BoxscoreSummaryPenalty[];
    threeStars?: BoxscoreThreeStar[];
    shootoutSummary?: BoxscoreShootoutAttempt[];
};

export type RightRailTeamInfo = {
    headCoach?: string;
    scratches?: RightRailScratch[];
};

export type RightRailOfficialInfo = {
    referees?: string[];
    linesmen?: string[];
};

export type RightRailSeriesTeam = {
    abbrev?: string;
    score?: number | null;
    logo?: string;
};

export type RightRailScratch = {
    id?: string;
    name: string;
    position?: string;
};

export type RightRailSeriesGame = {
    id: string;
    gameDate?: string;
    startTime?: string;
    gameState?: string;
    gameScheduleState?: string;
    periodDescriptor?: BoxscorePeriodDescriptor;
    gameOutcome?: BoxscoreOutcome;
    away: RightRailSeriesTeam;
    home: RightRailSeriesTeam;
    gameCenterLink?: string;
};

export type RightRailSeasonSeries = {
    awayWins?: number | null;
    homeWins?: number | null;
    games: RightRailSeriesGame[];
};

export type RightRailGameVideo = {
    threeMinRecapId?: number | null;
    threeMinRecapFrId?: number | null;
    condensedGameId?: number | null;
    condensedGameFrId?: number | null;
};

export type RightRailSnapshot = {
    linescore?: LinescoreSnapshot;
    teamStats?: BoxscoreStat[];
    seasonSeries?: RightRailSeasonSeries;
    officials?: RightRailOfficialInfo;
    teams?: {
        away?: RightRailTeamInfo;
        home?: RightRailTeamInfo;
    };
    reports?: { label: string; url: string }[];
    video?: RightRailGameVideo;
};

export type PlayByPlayPlayer = {
    id?: string;
    name: string;
    type?: string;
    team?: string;
    position?: string;
    sweaterNumber?: number | null;
};

export type PlayByPlayGoalTotal = {
    name: string;
    total: number;
    kind: 'G' | 'A';
};

export type PlayByPlayMeta = {
    gameState?: string;
    gameScheduleState?: string;
    venue?: string;
    tvBroadcasts?: string[];
    shootoutInUse?: boolean;
    otInUse?: boolean;
    tiesInUse?: boolean;
    displayPeriod?: number | null;
    maxPeriods?: number | null;
};

export type PlayByPlayEvent = {
    id: string;
    period?: number | null;
    time?: string;
    description?: string;
    type?: string;
    category?: 'Goal' | 'Penalty' | 'Shot' | 'Other';
    team?: string;
    players?: PlayByPlayPlayer[];
    playerSummary?: string;
    score?: string;
    strength?: string;
    onIceStrength?: string;
    goaliePulled?: string;
    situationCode?: string;
    homeDefendingSide?: string;
    awaySog?: number | null;
    homeSog?: number | null;
    goalieInNetId?: string;
    goalieInNetName?: string;
    sortOrder?: number | null;
    shotType?: string;
    infraction?: string;
    penaltyMinutes?: number | null;
    committedBy?: string;
    drawnBy?: string;
    zone?: string;
    coordinates?: { x?: number | null; y?: number | null };
    reason?: string;
    videoUrl?: string;
    pptReplayUrl?: string;
    blockedByTeam?: string;
    goalTotals?: PlayByPlayGoalTotal[];
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
    regulationWins?: number | null;
    row?: number | null;
    overtimeWins?: number | null;
    overtimeLosses?: number | null;
    shootoutWins?: number | null;
    shootoutLosses?: number | null;
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
    hits?: number | null;
    blocks?: number | null;
    toi?: string;
    plusMinus?: number | null;
    powerPlayGoals?: number | null;
    powerPlayPoints?: number | null;
    shortHandedGoals?: number | null;
    gameWinningGoals?: number | null;
    overtimeGoals?: number | null;
    penaltyMinutes?: number | null;
    faceoffWinPct?: number | null;
    takeaways?: number | null;
    giveaways?: number | null;
    shootingPct?: number | null;
    extraStats?: Record<string, number>;
    extraFields?: Record<string, string>;
};

export type GoalieLeader = {
    id: string;
    name: string;
    team?: string;
    gamesPlayed?: number | null;
    wins?: number | null;
    losses?: number | null;
    savePercentage?: number | null;
    goalsAgainstAverage?: number | null;
    shutouts?: number | null;
    extraStats?: Record<string, number>;
    extraFields?: Record<string, string>;
};

export type PlayerFeaturedStats = {
    season?: number | null;
    regularSeason?: Record<string, unknown>;
    playoffs?: Record<string, unknown>;
    career?: Record<string, unknown>;
};

export type PlayerBadge = {
    title?: string;
    titleFr?: string;
    logoUrl?: string;
    logoUrlFr?: string;
};

export type PlayerAwardSeason = {
    seasonId?: number | null;
    gameTypeId?: number | null;
    stats: Record<string, unknown>;
};

export type PlayerAward = {
    trophy?: string;
    trophyFr?: string;
    seasons: PlayerAwardSeason[];
};

export type PlayerLinks = {
    shop?: string;
    watch?: string;
    twitter?: string;
};

export type PlayerTeammate = {
    id: string;
    name: string;
    slug?: string;
    position?: string;
    sweaterNumber?: number | null;
};

export type PlayerGameLog = {
    gameId?: string;
    gameDate?: string;
    opponentAbbrev?: string;
    opponentCommonName?: string;
    teamAbbrev?: string;
    teamCommonName?: string;
    homeRoad?: string;
    goals?: number | null;
    assists?: number | null;
    points?: number | null;
    shots?: number | null;
    pim?: number | null;
    plusMinus?: number | null;
    powerPlayGoals?: number | null;
    powerPlayPoints?: number | null;
    shorthandedGoals?: number | null;
    shorthandedPoints?: number | null;
    gameWinningGoals?: number | null;
    otGoals?: number | null;
    toi?: string;
    shifts?: number | null;
    gameTypeId?: number | null;
    decision?: string;
    gamesStarted?: number | null;
    shotsAgainst?: number | null;
    goalsAgainst?: number | null;
    savePct?: number | null;
    shutouts?: number | null;
};

export type PlayerGameLogSeason = {
    season: number;
    gameTypes: number[];
};

export type PlayerGameLogPayload = {
    seasonId?: number | null;
    gameTypeId?: number | null;
    seasons: PlayerGameLogSeason[];
    games: PlayerGameLog[];
};

export type PlayerDraft = {
    year?: number | null;
    round?: number | null;
    pickInRound?: number | null;
    pick?: number | null;
    overall?: number | null;
    teamId?: number | null;
    teamName?: string;
    teamAbbrev?: string;
    teamLogo?: string;
};

export type PlayerSeasonTotals = {
    season?: number | null;
    gameTypeId?: number | null;
    league?: string;
    teamName?: string;
    teamAbbrev?: string;
    teamLogo?: string;
    stats: Record<string, unknown>;
};

export type PlayerLanding = {
    id: string;
    name: string;
    firstName?: string;
    firstNameFr?: string;
    lastName?: string;
    lastNameFr?: string;
    teamId?: number | null;
    teamName?: string;
    fullTeamName?: string;
    fullTeamNameFr?: string;
    teamCommonName?: string;
    teamCommonNameFr?: string;
    teamPlaceNameWithPreposition?: string;
    teamPlaceNameWithPrepositionFr?: string;
    teamAbbrev?: string;
    teamLogo?: string;
    position?: string;
    shoots?: string;
    sweaterNumber?: number | null;
    headshot?: string;
    heroImage?: string;
    height?: string;
    heightInInches?: number | null;
    heightCm?: number | null;
    weight?: number | null;
    weightKg?: number | null;
    birthDate?: string;
    birthCity?: string;
    birthState?: string;
    birthCountry?: string;
    nationality?: string;
    hometown?: string;
    playerSlug?: string;
    inTop100AllTime?: boolean;
    inHHOF?: boolean;
    draft?: PlayerDraft;
    rosterStatus?: string;
    status?: string;
    isActive?: boolean;
    captain?: boolean;
    alternateCaptain?: boolean;
    injuryStatus?: string;
    suspensionStatus?: string;
    featuredStats?: PlayerFeaturedStats;
    badges?: PlayerBadge[];
    seasonTotals?: PlayerSeasonTotals[];
    careerTotals?: Record<string, unknown>;
    lastFiveGames?: PlayerGameLog[];
    awards?: PlayerAward[];
    links?: PlayerLinks;
    teammates?: PlayerTeammate[];
};

export type EdgeSeasonAvailability = {
    seasonId: number;
    gameTypes: number[];
};

export type EdgeOverlayTeam = {
    abbrev?: string;
    score?: number | null;
};

export type EdgeOverlay = {
    playerName?: string;
    gameDate?: string;
    timeInPeriod?: string;
    period?: number | null;
    periodType?: string;
    maxRegulationPeriods?: number | null;
    gameType?: number | null;
    away?: EdgeOverlayTeam;
    home?: EdgeOverlayTeam;
    outcome?: string;
};

export type EdgeUnitMetric = {
    imperial?: number | null;
    metric?: number | null;
    percentile?: number | null;
    leagueAvgImperial?: number | null;
    leagueAvgMetric?: number | null;
    overlay?: EdgeOverlay;
};

export type EdgeValueMetric = {
    value?: number | null;
    percentile?: number | null;
    leagueAvg?: number | null;
};

export type EdgeSkaterShotSummary = {
    locationCode: string;
    shots?: number | null;
    shotsPercentile?: number | null;
    shotsLeagueAvg?: number | null;
    goals?: number | null;
    goalsPercentile?: number | null;
    goalsLeagueAvg?: number | null;
    shootingPct?: number | null;
    shootingPctPercentile?: number | null;
    shootingPctLeagueAvg?: number | null;
};

export type EdgeSkaterShotDetail = {
    area: string;
    shots?: number | null;
    shotsPercentile?: number | null;
};

export type EdgeZoneTime = {
    offensive?: EdgeValueMetric;
    neutral?: EdgeValueMetric;
    defensive?: EdgeValueMetric;
};

export type EdgeSkaterTracking = {
    topShotSpeed?: EdgeUnitMetric;
    speedMax?: EdgeUnitMetric;
    burstsOver20?: EdgeValueMetric;
    totalDistance?: EdgeUnitMetric;
    distanceMaxGame?: EdgeUnitMetric;
    zoneTime?: EdgeZoneTime;
    shotSummary?: EdgeSkaterShotSummary[];
    shotDetails?: EdgeSkaterShotDetail[];
};

export type EdgeGoalieShotSummary = {
    locationCode: string;
    goalsAgainst?: number | null;
    goalsAgainstPercentile?: number | null;
    goalsAgainstLeagueAvg?: number | null;
    saves?: number | null;
    savesPercentile?: number | null;
    savesLeagueAvg?: number | null;
    savePct?: number | null;
    savePctPercentile?: number | null;
    savePctLeagueAvg?: number | null;
};

export type EdgeGoalieShotDetail = {
    area: string;
    saves?: number | null;
    savesPercentile?: number | null;
    savePct?: number | null;
    savePctPercentile?: number | null;
};

export type EdgeGoalieTracking = {
    stats?: Record<string, EdgeValueMetric>;
    shotSummary?: EdgeGoalieShotSummary[];
    shotDetails?: EdgeGoalieShotDetail[];
};

export type SkaterDetail = {
    id: string;
    name: string;
    team?: string;
    position?: string;
    teamLogoLight?: string;
    teamLogoDark?: string;
    metrics: Array<{ label: string; value: string | number }>;
    edgeSeasons?: EdgeSeasonAvailability[];
    skaterTracking?: EdgeSkaterTracking;
    goalieTracking?: EdgeGoalieTracking;
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
const asBoolean = (value: unknown) => {
    if (typeof value === 'boolean') {
        return value;
    }
    if (typeof value === 'number') {
        return value === 1;
    }
    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        return normalized === 'true' || normalized === '1' || normalized === 'yes';
    }
    return false;
};
const pickNumeric = (...values: unknown[]) => {
    for (const value of values) {
        const numeric = asNumber(value);
        if (numeric !== null) {
            return numeric;
        }
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

const formatMetricLabel = (value: string) =>
    value
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());

const pickPlayerName = (player: Record<string, unknown>) => {
    const nameRecord = asRecord(player.name);
    const fullNameRecord = asRecord(player.fullName);
    const fullName = pickText(
        (fullNameRecord as { default?: string }).default,
        (nameRecord as { default?: string }).default,
        player.fullName,
        player.name,
        (player.player as { fullName?: string })?.fullName,
        (player.player as { name?: string })?.name,
    );
    if (fullName) {
        return fullName;
    }
    const firstNameRecord = asRecord(player.firstName);
    const lastNameRecord = asRecord(player.lastName);
    const firstName = pickText(
        (firstNameRecord as { default?: string }).default,
        player.firstName,
    );
    const lastName = pickText(
        (lastNameRecord as { default?: string }).default,
        player.lastName,
    );
    return [firstName, lastName].filter(Boolean).join(' ');
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

const formatBroadcastLabel = (record: Record<string, unknown>) => {
    const base = pickBroadcastLabel(record);
    if (!base) {
        return '';
    }
    const tags = new Set<string>();
    const language = pickText(
        record.language,
        record.languageCode,
        record.lang,
        record.broadcastLanguage,
        record.feedLanguage,
    );
    if (language) {
        tags.add(language.toUpperCase());
    }
    const scope = pickText(
        record.marketType,
        record.market,
        record.broadcastType,
        record.coverage,
        record.type,
    );
    const normalizedScope = scope.toLowerCase();
    if (normalizedScope.includes('national')) {
        tags.add('National');
    } else if (normalizedScope.includes('regional')) {
        tags.add('Regional');
    } else if (normalizedScope.includes('local')) {
        tags.add('Local');
    }
    if (asBoolean(record.national) || asBoolean(record.isNational)) {
        tags.add('National');
    }
    if (asBoolean(record.regional) || asBoolean(record.isRegional)) {
        tags.add('Regional');
    }
    if (asBoolean(record.local) || asBoolean(record.isLocal)) {
        tags.add('Local');
    }
    const tagList = Array.from(tags);
    return tagList.length ? `${base} (${tagList.join(', ')})` : base;
};

const inferBroadcastKind = (
    record: Record<string, unknown>,
    fallback?: BroadcastDetail['kind'],
) => {
    if (fallback) {
        return fallback;
    }
    const type = pickText(
        record.type,
        record.broadcastType,
        record.medium,
        record.platform,
        record.feedType,
    ).toLowerCase();
    if (type.includes('radio')) {
        return 'radio';
    }
    if (type.includes('tv') || type.includes('television')) {
        return 'tv';
    }
    if (
        type.includes('stream') ||
        type.includes('digital') ||
        type.includes('online')
    ) {
        return 'stream';
    }
    return type ? 'other' : undefined;
};

const buildBroadcastDetail = (
    record: Record<string, unknown>,
    fallback?: BroadcastDetail['kind'],
): BroadcastDetail | null => {
    const label = pickBroadcastLabel(record);
    if (!label) {
        return null;
    }
    const language = pickText(
        record.language,
        record.languageCode,
        record.lang,
        record.broadcastLanguage,
        record.feedLanguage,
    );
    const scope = pickText(
        record.marketType,
        record.market,
        record.broadcastType,
        record.coverage,
        record.type,
    );
    const normalizedScope = scope.toLowerCase();
    const scopeLabel =
        asBoolean(record.national) ||
        asBoolean(record.isNational) ||
        normalizedScope.includes('national')
            ? 'National'
            : asBoolean(record.regional) ||
                asBoolean(record.isRegional) ||
                normalizedScope.includes('regional')
              ? 'Regional'
              : asBoolean(record.local) ||
                  asBoolean(record.isLocal) ||
                  normalizedScope.includes('local')
                ? 'Local'
                : '';
    const team = pickText(
        record.teamAbbrev,
        record.teamAbbreviation,
        record.teamName,
        record.team,
        record.teamCode,
        record.club,
    );
    const market = pickText(
        record.marketName,
        record.market,
        record.marketCode,
        record.marketType,
        record.region,
        record.city,
    );
    const feed = pickText(
        record.feedType,
        record.feed,
        record.feedName,
        record.feedLabel,
        record.feedSide,
    );
    const kind = inferBroadcastKind(record, fallback);

    return {
        label,
        kind,
        language: language || undefined,
        scope: scopeLabel || undefined,
        team: team || undefined,
        market: market || undefined,
        feed: feed || undefined,
    };
};

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
        .map((item) => formatBroadcastLabel(asRecord(item)))
        .filter(Boolean);
    return Array.from(new Set(labels));
};

const uniqueStrings = (values: string[]) => Array.from(new Set(values));

const pickBroadcastsFrom = (items: unknown[]) =>
    uniqueStrings(
        items
            .map((item) => formatBroadcastLabel(asRecord(item)))
            .filter(Boolean),
    );

const pickBroadcastGroups = (gameRecord: Record<string, unknown>) => {
    const broadcastsRecord = asRecord(gameRecord.broadcasts);
    const tvItems = [
        gameRecord.tvBroadcasts,
        broadcastsRecord.tv,
        broadcastsRecord.tvBroadcasts,
        broadcastsRecord.nationalTvBroadcasts,
        broadcastsRecord.regionalTvBroadcasts,
        broadcastsRecord.nationalTv,
    ].flatMap((candidate) => asArray(candidate));
    const radioItems = [
        gameRecord.radioBroadcasts,
        broadcastsRecord.radio,
        broadcastsRecord.radioBroadcasts,
        broadcastsRecord.nationalRadioBroadcasts,
        broadcastsRecord.regionalRadioBroadcasts,
        broadcastsRecord.nationalRadio,
    ].flatMap((candidate) => asArray(candidate));
    const genericItems = [
        gameRecord.broadcasts,
        broadcastsRecord.broadcasts,
        broadcastsRecord.all,
    ].flatMap((candidate) => asArray(candidate));
    genericItems.forEach((item) => {
        const record = asRecord(item);
        const type = pickText(
            record.type,
            record.broadcastType,
            record.medium,
            record.platform,
        ).toLowerCase();
        if (type.includes('radio')) {
            radioItems.push(record);
        } else if (type.includes('tv') || type.includes('television')) {
            tvItems.push(record);
        }
    });

    const tv = pickBroadcastsFrom(tvItems);
    const radio = pickBroadcastsFrom(radioItems);
    if (!tv.length && !radio.length) {
        return undefined;
    }
    return {
        tv: tv.length ? tv : undefined,
        radio: radio.length ? radio : undefined,
    } satisfies BroadcastGroups;
};

const pickBroadcastDetails = (gameRecord: Record<string, unknown>) => {
    const broadcastsRecord = asRecord(gameRecord.broadcasts);
    const tvItems = [
        gameRecord.tvBroadcasts,
        broadcastsRecord.tv,
        broadcastsRecord.tvBroadcasts,
        broadcastsRecord.nationalTvBroadcasts,
        broadcastsRecord.regionalTvBroadcasts,
        broadcastsRecord.nationalTv,
    ].flatMap((candidate) => asArray(candidate));
    const radioItems = [
        gameRecord.radioBroadcasts,
        broadcastsRecord.radio,
        broadcastsRecord.radioBroadcasts,
        broadcastsRecord.nationalRadioBroadcasts,
        broadcastsRecord.regionalRadioBroadcasts,
        broadcastsRecord.nationalRadio,
    ].flatMap((candidate) => asArray(candidate));
    const genericItems = [
        gameRecord.broadcasts,
        broadcastsRecord.broadcasts,
        broadcastsRecord.all,
    ].flatMap((candidate) => asArray(candidate));

    const details = [
        ...tvItems
            .map((item) => buildBroadcastDetail(asRecord(item), 'tv'))
            .filter(Boolean),
        ...radioItems
            .map((item) => buildBroadcastDetail(asRecord(item), 'radio'))
            .filter(Boolean),
        ...genericItems
            .map((item) => buildBroadcastDetail(asRecord(item), undefined))
            .filter(Boolean),
    ] as BroadcastDetail[];

    if (!details.length) {
        return undefined;
    }

    const seen = new Set<string>();
    const unique = details.filter((detail) => {
        const key = [
            detail.kind ?? '',
            detail.label,
            detail.language ?? '',
            detail.scope ?? '',
            detail.market ?? '',
            detail.team ?? '',
            detail.feed ?? '',
        ].join('|');
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });

    return unique.length ? unique : undefined;
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

const normalizeLink = (value: string) => {
    if (!value) {
        return '';
    }
    if (value.startsWith('http://') || value.startsWith('https://')) {
        return value;
    }
    if (value.startsWith('/')) {
        return `https://www.nhl.com${value}`;
    }
    return value;
};

const pickGameLinks = (gameRecord: Record<string, unknown>) => {
    const linksRecord = asRecord(gameRecord.links);
    const gamecenter = normalizeLink(
        pickText(
            linksRecord.gamecenter,
            linksRecord.gameCenter,
            linksRecord.gamecenterLink,
            linksRecord.gameCenterLink,
            linksRecord.gamecenterUrl,
            linksRecord.gameCenterUrl,
            linksRecord.gameCenterURL,
            gameRecord.gameCenterLink,
            gameRecord.gamecenterLink,
            gameRecord.gameCenterUrl,
            gameRecord.gamecenterUrl,
            gameRecord.gamecenter,
        ),
    );
    const recap = normalizeLink(
        pickText(
            linksRecord.recap,
            linksRecord.recapLink,
            linksRecord.gameRecap,
            linksRecord.gameRecapLink,
            linksRecord.recapUrl,
            gameRecord.recapLink,
            gameRecord.gameRecapLink,
            gameRecord.recapUrl,
        ),
    );
    const tickets = normalizeLink(
        pickText(
            linksRecord.tickets,
            linksRecord.ticketLink,
            linksRecord.ticketsLink,
            linksRecord.ticketUrl,
            gameRecord.ticketLink,
            gameRecord.ticketsLink,
            gameRecord.ticketUrl,
        ),
    );
    const condensedGame = normalizeLink(
        pickText(
            linksRecord.condensedGame,
            linksRecord.condensedGameLink,
            linksRecord.condensedGameUrl,
            gameRecord.condensedGame,
            gameRecord.condensedGameLink,
            gameRecord.condensedGameUrl,
        ),
    );
    const condensedGameFr = normalizeLink(
        pickText(
            linksRecord.condensedGameFr,
            linksRecord.condensedGameFrLink,
            linksRecord.condensedGameFrUrl,
            gameRecord.condensedGameFr,
            gameRecord.condensedGameFrLink,
            gameRecord.condensedGameFrUrl,
        ),
    );
    const threeMinRecap = normalizeLink(
        pickText(
            linksRecord.threeMinRecap,
            linksRecord.threeMinRecapLink,
            linksRecord.threeMinRecapUrl,
            gameRecord.threeMinRecap,
            gameRecord.threeMinRecapLink,
            gameRecord.threeMinRecapUrl,
        ),
    );
    const threeMinRecapFr = normalizeLink(
        pickText(
            linksRecord.threeMinRecapFr,
            linksRecord.threeMinRecapFrLink,
            linksRecord.threeMinRecapFrUrl,
            gameRecord.threeMinRecapFr,
            gameRecord.threeMinRecapFrLink,
            gameRecord.threeMinRecapFrUrl,
        ),
    );
    if (
        !gamecenter &&
        !recap &&
        !tickets &&
        !condensedGame &&
        !condensedGameFr &&
        !threeMinRecap &&
        !threeMinRecapFr
    ) {
        return undefined;
    }
    return {
        gamecenter: gamecenter || undefined,
        recap: recap || undefined,
        tickets: tickets || undefined,
        condensedGame: condensedGame || undefined,
        condensedGameFr: condensedGameFr || undefined,
        threeMinRecap: threeMinRecap || undefined,
        threeMinRecapFr: threeMinRecapFr || undefined,
    } satisfies ScheduleLinks;
};

const pickVenueDetail = (gameRecord: Record<string, unknown>) => {
    const venueRecord = asRecord(gameRecord.venue);
    const locationRecord = asRecord(
        gameRecord.venueLocation ??
            venueRecord.location ??
            venueRecord.city ??
            gameRecord.location,
    );
    const city = pickText(
        venueRecord.city,
        venueRecord.cityName,
        locationRecord.default,
        locationRecord.name,
        locationRecord.city,
        gameRecord.city,
        gameRecord.location,
    );
    const state = pickText(
        venueRecord.state,
        venueRecord.stateProvince,
        venueRecord.province,
        locationRecord.state,
        locationRecord.province,
        locationRecord.region,
    );
    if (city && state) {
        return `${city}, ${state}`;
    }
    return city || '';
};

const pickStatusFlags = (gameRecord: Record<string, unknown>) => {
    const statusRecord = asRecord(gameRecord.status);
    const statusText = pickText(
        gameRecord.gameState,
        statusRecord.detailedState,
        statusRecord.statusCode,
        statusRecord.abstractGameState,
        gameRecord.status,
        gameRecord.gameStatus,
    );
    const normalized = statusText.toLowerCase();
    const statusCode = pickText(statusRecord.statusCode).toLowerCase();
    const postponed =
        normalized.includes('postponed') ||
        normalized.includes('ppd') ||
        statusCode === 'ppd' ||
        statusCode === 'p';
    const tbd =
        normalized.includes('tbd') ||
        normalized.includes('time tbd') ||
        statusRecord.startTimeTBD === true ||
        gameRecord.startTimeTBD === true;
    if (!postponed && !tbd) {
        return undefined;
    }
    return {
        postponed: postponed || undefined,
        tbd: tbd || undefined,
    } satisfies ScheduleStatusFlags;
};

const pickEventFlags = (gameRecord: Record<string, unknown>) => {
    const venueRecord = asRecord(gameRecord.venue);
    const neutralSite =
        asBoolean(gameRecord.neutralSite) ||
        asBoolean(gameRecord.isNeutralSite) ||
        asBoolean(gameRecord.neutralSiteGame) ||
        asBoolean(venueRecord.neutralSite) ||
        asBoolean(venueRecord.isNeutralSite);
    const eventRecord = asRecord(gameRecord.event);
    const specialEventLabel = pickText(
        gameRecord.specialEvent,
        gameRecord.specialEventName,
        gameRecord.specialEventType,
        gameRecord.eventName,
        gameRecord.eventTitle,
        gameRecord.eventDescription,
        eventRecord.name,
        eventRecord.title,
        eventRecord.description,
    );
    const specialEventFlag =
        asBoolean(gameRecord.isSpecialEvent) ||
        asBoolean(gameRecord.specialEventFlag) ||
        asBoolean(gameRecord.specialEvent) ||
        asBoolean(eventRecord.isSpecialEvent);
    const normalizedEvent = specialEventLabel.toLowerCase();
    const isGenericEvent =
        normalizedEvent.includes('regular season') ||
        normalizedEvent.includes('preseason') ||
        normalizedEvent.includes('playoffs');
    const eventLabel =
        specialEventLabel && !isGenericEvent
            ? specialEventLabel
            : specialEventFlag
              ? 'Special event'
              : '';

    if (!neutralSite && !eventLabel) {
        return undefined;
    }

    return {
        neutralSite: neutralSite || undefined,
        specialEvent: eventLabel || undefined,
    } satisfies ScheduleEventFlags;
};

const pickLiveSituations = (gameRecord: Record<string, unknown>) => {
    const liveRecord = asRecord(
        gameRecord.liveSituations ??
            gameRecord.situations ??
            gameRecord.situationsByTeam ??
            gameRecord.gameSituations,
    );
    if (!Object.keys(liveRecord).length) {
        return undefined;
    }
    const homeRecord = asRecord(
        liveRecord.home ?? liveRecord.homeTeam ?? liveRecord.h,
    );
    const awayRecord = asRecord(
        liveRecord.away ?? liveRecord.awayTeam ?? liveRecord.a,
    );
    const home = pickText(
        liveRecord.home,
        homeRecord.situation,
        homeRecord.strength,
        homeRecord.onIceStrength,
        homeRecord.situationCode,
    );
    const away = pickText(
        liveRecord.away,
        awayRecord.situation,
        awayRecord.strength,
        awayRecord.onIceStrength,
        awayRecord.situationCode,
    );
    if (!home && !away) {
        return undefined;
    }
    return {
        home: home || undefined,
        away: away || undefined,
    } satisfies ScheduleGame['liveSituations'];
};

const parseLinescore = (
    record: Record<string, unknown>,
    homeTeam: Record<string, unknown>,
    awayTeam: Record<string, unknown>,
) => {
    const linescoreRecord = asRecord(
        record.linescore ??
            record.lineScore ??
            record.linescoreByPeriod ??
            record.linescoreSummary ??
            record.linescoreData,
    );
    const periodItems = asArray(
        linescoreRecord.byPeriod ??
            linescoreRecord.periods ??
            linescoreRecord.linescoreByPeriod ??
            linescoreRecord.linescore ??
            record.linescore ??
            record.periods ??
            record.linescoreByPeriod,
    );
    const shotsByPeriodItems = asArray(
        record.shotsByPeriod ??
            linescoreRecord.shotsByPeriod ??
            linescoreRecord.shotsByPeriodData ??
            linescoreRecord.shotsByPeriodSummary,
    );
    const normalizePeriodType = (value?: string) =>
        value ? value.toLowerCase() : '';
    const buildPeriodKey = (
        number: number | null,
        periodType: string,
        fallbackIndex: number,
    ) => `${number ?? fallbackIndex + 1}-${periodType}`;
    const shotsByPeriodMap = new Map<
        string,
        { away?: number | null; home?: number | null }
    >();
    shotsByPeriodItems.forEach((shotPeriod, index) => {
        const shotRecord = asRecord(shotPeriod);
        const descriptor = asRecord(
            shotRecord.periodDescriptor ?? shotRecord.period,
        );
        const number = pickNumeric(
            shotRecord.period,
            shotRecord.num,
            shotRecord.number,
            shotRecord.periodNumber,
            descriptor.number,
        );
        const periodType = normalizePeriodType(
            pickText(
                shotRecord.periodType,
                descriptor.periodType,
                shotRecord.periodTypeCode,
                descriptor.periodTypeCode,
            ),
        );
        const awayValue = pickNumeric(
            shotRecord.away,
            shotRecord.awayShots,
            shotRecord.awayShotsOnGoal,
            asRecord(shotRecord.away).shotsOnGoal,
            asRecord(shotRecord.away).shots,
        );
        const homeValue = pickNumeric(
            shotRecord.home,
            shotRecord.homeShots,
            shotRecord.homeShotsOnGoal,
            asRecord(shotRecord.home).shotsOnGoal,
            asRecord(shotRecord.home).shots,
        );
        if (awayValue !== null || homeValue !== null) {
            shotsByPeriodMap.set(
                buildPeriodKey(number, periodType, index),
                {
                    away: awayValue,
                    home: homeValue,
                },
            );
        }
    });
    const periods = periodItems
        .map((period, index) => {
            const periodRecord = asRecord(period);
            const periodDescriptor = asRecord(
                periodRecord.periodDescriptor ?? periodRecord.period,
            );
            const number = pickNumeric(
                periodRecord.period,
                periodRecord.num,
                periodRecord.number,
                periodRecord.periodNumber,
                periodDescriptor.number,
            );
            const rawLabel = pickText(
                periodRecord.ordinalNum,
                periodRecord.shortName,
                periodRecord.name,
            );
            const periodType = pickText(
                periodRecord.periodType,
                periodDescriptor.periodType,
                periodRecord.periodTypeCode,
                periodDescriptor.periodTypeCode,
            ).toLowerCase();
            let label = '';
            if (rawLabel) {
                const normalized = rawLabel.toLowerCase();
                if (normalized.includes('ot')) {
                    label = rawLabel.toUpperCase();
                } else if (normalized.includes('so')) {
                    label = rawLabel.toUpperCase();
                }
            }
            if (!label && periodType) {
                if (periodType.includes('shootout') || periodType === 'so') {
                    label = 'SO';
                } else if (
                    periodType.includes('over') ||
                    periodType.includes('ot')
                ) {
                    const otNumber =
                        number !== null && number > 3 ? number - 3 : null;
                    label = otNumber && otNumber > 1 ? `OT${otNumber}` : 'OT';
                }
            }
            if (!label) {
                label = number !== null ? `P${number}` : `P${index + 1}`;
            }
            const homeValue = pickNumeric(
                periodRecord.home,
                periodRecord.homeGoals,
                periodRecord.homeScore,
                periodRecord.homeTeamScore,
                asRecord(periodRecord.home).goals,
                asRecord(periodRecord.home).score,
            );
            const awayValue = pickNumeric(
                periodRecord.away,
                periodRecord.awayGoals,
                periodRecord.awayScore,
                periodRecord.awayTeamScore,
                asRecord(periodRecord.away).goals,
                asRecord(periodRecord.away).score,
            );
            const shotsRecord = asRecord(
                periodRecord.shotsOnGoal ??
                    periodRecord.shots ??
                    periodRecord.sog ??
                    periodRecord.shotsOnNet ??
                    periodRecord.shotsOnGoalByPeriod,
            );
            const shotsHome = pickNumeric(
                shotsRecord.home,
                shotsRecord.homeShots,
                shotsRecord.homeShotsOnGoal,
                periodRecord.homeShotsOnGoal,
                periodRecord.homeShots,
                asRecord(periodRecord.home).shotsOnGoal,
                asRecord(periodRecord.home).shots,
            );
            const shotsAway = pickNumeric(
                shotsRecord.away,
                shotsRecord.awayShots,
                shotsRecord.awayShotsOnGoal,
                periodRecord.awayShotsOnGoal,
                periodRecord.awayShots,
                asRecord(periodRecord.away).shotsOnGoal,
                asRecord(periodRecord.away).shots,
            );
            const periodKey = buildPeriodKey(number, periodType, index);
            const shotEntry = shotsByPeriodMap.get(periodKey);
            const resolvedShotsAway =
                shotsAway !== null
                    ? shotsAway
                    : (shotEntry?.away ?? null);
            const resolvedShotsHome =
                shotsHome !== null
                    ? shotsHome
                    : (shotEntry?.home ?? null);
            return {
                label,
                away: awayValue,
                home: homeValue,
                shotsAway: resolvedShotsAway,
                shotsHome: resolvedShotsHome,
            } satisfies LinescorePeriod;
        })
        .filter(
            (period) =>
                period.away !== null ||
                period.home !== null ||
                period.shotsAway !== null ||
                period.shotsHome !== null,
        );

    const shotsRecord = asRecord(
        linescoreRecord.shotsOnGoal ??
            linescoreRecord.shots ??
            record.shotsOnGoal ??
            record.shots,
    );
    const homeShots = pickNumeric(
        shotsRecord.home,
        shotsRecord.homeShots,
        shotsRecord.homeShotsOnGoal,
        linescoreRecord.homeShotsOnGoal,
        linescoreRecord.homeShots,
        asRecord(homeTeam).shotsOnGoal,
        asRecord(homeTeam).sog,
        asRecord(homeTeam).shots,
    );
    const awayShots = pickNumeric(
        shotsRecord.away,
        shotsRecord.awayShots,
        shotsRecord.awayShotsOnGoal,
        linescoreRecord.awayShotsOnGoal,
        linescoreRecord.awayShots,
        asRecord(awayTeam).shotsOnGoal,
        asRecord(awayTeam).sog,
        asRecord(awayTeam).shots,
    );
    let derivedHomeShots: number | null = null;
    let derivedAwayShots: number | null = null;
    periods.forEach((period) => {
        if (period.shotsHome !== null && period.shotsHome !== undefined) {
            derivedHomeShots =
                (derivedHomeShots ?? 0) + period.shotsHome;
        }
        if (period.shotsAway !== null && period.shotsAway !== undefined) {
            derivedAwayShots =
                (derivedAwayShots ?? 0) + period.shotsAway;
        }
    });
    const resolvedHomeShots =
        homeShots !== null ? homeShots : derivedHomeShots;
    const resolvedAwayShots =
        awayShots !== null ? awayShots : derivedAwayShots;
    const shots =
        resolvedHomeShots !== null || resolvedAwayShots !== null
            ? {
                  home: resolvedHomeShots,
                  away: resolvedAwayShots,
              }
            : undefined;

    if (!periods.length && !shots) {
        return undefined;
    }

    return {
        periods,
        shots,
    } satisfies LinescoreSnapshot;
};

export const parseRightRailLinescore = (
    payload: Record<string, unknown>,
): LinescoreSnapshot | undefined => {
    const record = asRecord(payload);
    const linescoreRecord = asRecord(
        record.linescore ?? record.lineScore ?? record.linescoreData,
    );
    const shotsByPeriod = asArray(record.shotsByPeriod);
    if (!Object.keys(linescoreRecord).length && shotsByPeriod.length === 0) {
        return undefined;
    }
    const gameInfo = asRecord(record.gameInfo);
    const homeTeam = asRecord(gameInfo.homeTeam);
    const awayTeam = asRecord(gameInfo.awayTeam);
    return parseLinescore(
        {
            ...record,
            linescore: linescoreRecord,
            shotsByPeriod,
        },
        homeTeam,
        awayTeam,
    );
};

export const parseRightRail = (
    payload: Record<string, unknown>,
): RightRailSnapshot => {
    const record = asRecord(payload);
    if (!Object.keys(record).length) {
        return {};
    }
    const linescore = parseRightRailLinescore(record);
    const teamStats = (() => {
        const statMap: Record<string, string> = {
            sog: 'Shots',
            faceoffWinningPctg: 'Faceoff Win %',
            faceoffWins: 'Faceoff wins',
            powerPlay: 'Power Play',
            powerPlayPctg: 'Power Play %',
            pim: 'PIM',
            hits: 'Hits',
            blockedShots: 'Blocks',
            giveaways: 'Giveaways',
            takeaways: 'Takeaways',
        };
        const percentCategories = new Set([
            'faceoffWinningPctg',
            'powerPlayPctg',
        ]);
        const formatValue = (value: unknown, isPercent: boolean) => {
            if (typeof value === 'string') {
                return value || '--';
            }
            const numeric = asNumber(value);
            if (numeric === null) {
                return '--';
            }
            if (isPercent) {
                const normalized = numeric > 1 ? numeric : numeric * 100;
                return `${normalized.toFixed(1)}%`;
            }
            return String(numeric);
        };
        const stats = asArray(record.teamGameStats)
            .map((entry) => {
                const statRecord = asRecord(entry);
                const category = asString(statRecord.category);
                const label = statMap[category] ?? category.toUpperCase();
                const isPercent = percentCategories.has(category);
                return {
                    label,
                    away: formatValue(statRecord.awayValue, isPercent),
                    home: formatValue(statRecord.homeValue, isPercent),
                } satisfies BoxscoreStat;
            })
            .filter((stat) => stat.label && stat.label !== '--');
        return stats.length ? stats : undefined;
    })();
    const seasonSeries = (() => {
        const winsRecord = asRecord(record.seasonSeriesWins);
        const awayWins = asNumber(
            winsRecord.awayWins ?? winsRecord.awayTeamWins,
        );
        const homeWins = asNumber(
            winsRecord.homeWins ?? winsRecord.homeTeamWins,
        );
        const games = asArray(record.seasonSeries)
            .map((game, index) => {
                const gameRecord = asRecord(game);
                const awayTeam = asRecord(gameRecord.awayTeam);
                const homeTeam = asRecord(gameRecord.homeTeam);
                const periodDescriptorRecord = asRecord(
                    gameRecord.periodDescriptor,
                );
                const periodNumber = asNumber(
                    periodDescriptorRecord.number ?? gameRecord.period,
                );
                const periodType = pickText(
                    periodDescriptorRecord.periodType,
                    periodDescriptorRecord.periodTypeCode,
                    gameRecord.periodType,
                );
                const maxRegulationPeriods = asNumber(
                    periodDescriptorRecord.maxRegulationPeriods ??
                        gameRecord.regPeriods,
                );
                const periodDescriptor =
                    periodNumber !== null ||
                    periodType ||
                    maxRegulationPeriods !== null
                        ? ({
                              number: periodNumber,
                              periodType: periodType || undefined,
                              maxRegulationPeriods,
                          } satisfies BoxscorePeriodDescriptor)
                        : undefined;
                const gameOutcomeRecord = asRecord(gameRecord.gameOutcome);
                const lastPeriodType = pickText(
                    gameOutcomeRecord.lastPeriodType,
                    gameOutcomeRecord.lastPeriod,
                    gameRecord.lastPeriodType,
                );
                const otPeriods = asNumber(
                    gameOutcomeRecord.otPeriods ??
                        gameOutcomeRecord.overtimePeriods,
                );
                const gameOutcome =
                    lastPeriodType || otPeriods !== null
                        ? ({
                              lastPeriodType: lastPeriodType || undefined,
                              otPeriods,
                          } satisfies BoxscoreOutcome)
                        : undefined;
                return {
                    id: String(
                        gameRecord.id ??
                            gameRecord.gameId ??
                            gameRecord.gamePk ??
                            index,
                    ),
                    gameDate: pickText(
                        gameRecord.gameDate,
                        gameRecord.startDate,
                    ),
                    startTime: pickText(
                        gameRecord.startTimeUTC,
                        gameRecord.gameDate,
                        gameRecord.startTime,
                    ),
                    gameState: pickText(
                        gameRecord.gameState,
                        gameRecord.gameStatus,
                        gameRecord.status,
                    ),
                    gameScheduleState: pickText(
                        gameRecord.gameScheduleState,
                        gameRecord.gameScheduleStatus,
                        gameRecord.scheduleState,
                        gameRecord.gameScheduleStatusCode,
                    ),
                    periodDescriptor,
                    gameOutcome,
                    away: {
                        abbrev: pickTeamAbbrev(awayTeam),
                        score: pickScore(awayTeam),
                        logo: pickText(awayTeam.logo, awayTeam.logoUrl),
                    },
                    home: {
                        abbrev: pickTeamAbbrev(homeTeam),
                        score: pickScore(homeTeam),
                        logo: pickText(homeTeam.logo, homeTeam.logoUrl),
                    },
                    gameCenterLink: normalizeLink(
                        pickText(
                            gameRecord.gameCenterLink,
                            gameRecord.gamecenterLink,
                        ),
                    ),
                } satisfies RightRailSeriesGame;
            })
            .filter((game) => game.id);
        if (!games.length && awayWins === null && homeWins === null) {
            return undefined;
        }
        return {
            awayWins: awayWins ?? undefined,
            homeWins: homeWins ?? undefined,
            games,
        } satisfies RightRailSeasonSeries;
    })();
    const officials = (() => {
        const gameInfo = asRecord(record.gameInfo);
        const referees = asArray(gameInfo.referees)
            .map((ref) => pickText(asRecord(ref).default, asString(ref)))
            .filter(Boolean);
        const linesmen = asArray(gameInfo.linesmen)
            .map((line) => pickText(asRecord(line).default, asString(line)))
            .filter(Boolean);
        if (!referees.length && !linesmen.length) {
            return undefined;
        }
        return {
            referees: referees.length ? referees : undefined,
            linesmen: linesmen.length ? linesmen : undefined,
        } satisfies RightRailOfficialInfo;
    })();
    const teams = (() => {
        const gameInfo = asRecord(record.gameInfo);
        const buildTeamInfo = (team: Record<string, unknown>) => {
            const headCoachRecord = asRecord(team.headCoach);
            const headCoach = pickText(
                headCoachRecord.default,
                headCoachRecord.name,
                headCoachRecord.fullName,
                team.headCoachName,
            );
            const scratches = asArray(team.scratches)
                .map((scratch) => {
                    const scratchRecord = asRecord(scratch);
                    const name = pickPlayerName(scratchRecord);
                    if (!name) {
                        return null;
                    }
                    const id = asNumber(
                        scratchRecord.id ??
                            scratchRecord.playerId ??
                            scratchRecord.personId,
                    );
                    const position = pickPosition(scratchRecord) || undefined;
                    return {
                        id: id !== null ? String(id) : undefined,
                        name,
                        position,
                    } satisfies RightRailScratch;
                })
                .filter(
                    (entry): entry is RightRailScratch => entry !== null,
                );
            if (!headCoach && !scratches.length) {
                return undefined;
            }
            return {
                headCoach: headCoach || undefined,
                scratches: scratches.length ? scratches : undefined,
            } satisfies RightRailTeamInfo;
        };
        const awayInfo = buildTeamInfo(asRecord(gameInfo.awayTeam));
        const homeInfo = buildTeamInfo(asRecord(gameInfo.homeTeam));
        if (!awayInfo && !homeInfo) {
            return undefined;
        }
        return {
            away: awayInfo,
            home: homeInfo,
        };
    })();
    const reports = (() => {
        const reportsRecord = asRecord(record.gameReports);
        const reportLabels: Record<string, string> = {
            gameSummary: 'Game summary',
            eventSummary: 'Event summary',
            playByPlay: 'Play-by-play report',
            faceoffSummary: 'Faceoff summary',
            faceoffComparison: 'Faceoff comparison',
            rosters: 'Rosters',
            shotSummary: 'Shot summary',
            shiftChart: 'Shift chart',
            toiAway: 'TOI (away)',
            toiHome: 'TOI (home)',
        };
        const links = Object.entries(reportLabels)
            .map(([key, label]) => {
                const url = normalizeLink(pickText(reportsRecord[key]));
                return url ? { label, url } : null;
            })
            .filter((item): item is { label: string; url: string } => item !== null);
        return links.length ? links : undefined;
    })();
    const video = (() => {
        const videoRecord = asRecord(record.gameVideo);
        const threeMinRecapId = asNumber(
            videoRecord.threeMinRecap ?? videoRecord.threeMinRecapId,
        );
        const threeMinRecapFrId = asNumber(
            videoRecord.threeMinRecapFr ?? videoRecord.threeMinRecapFrId,
        );
        const condensedGameId = asNumber(
            videoRecord.condensedGame ?? videoRecord.condensedGameId,
        );
        const condensedGameFrId = asNumber(
            videoRecord.condensedGameFr ?? videoRecord.condensedGameFrId,
        );
        if (
            threeMinRecapId === null &&
            threeMinRecapFrId === null &&
            condensedGameId === null &&
            condensedGameFrId === null
        ) {
            return undefined;
        }
        return {
            threeMinRecapId,
            threeMinRecapFrId,
            condensedGameId,
            condensedGameFrId,
        } satisfies RightRailGameVideo;
    })();
    return {
        linescore: linescore ?? undefined,
        teamStats: teamStats ?? undefined,
        seasonSeries: seasonSeries ?? undefined,
        officials: officials ?? undefined,
        teams: teams ?? undefined,
        reports: reports ?? undefined,
        video: video ?? undefined,
    } satisfies RightRailSnapshot;
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
        record.teamAbbrevs,
        record.teamAbbreviation,
        record.team,
        record.teamCode,
        record.teamName,
    ).split(',')[0];

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
                    const broadcastGroups = pickBroadcastGroups(gameRecord);
                    const broadcastDetails = pickBroadcastDetails(gameRecord);
                    const venueDetail = pickVenueDetail(gameRecord);
                    const statusFlags = pickStatusFlags(gameRecord);
                    const eventFlags = pickEventFlags(gameRecord);
                    const liveSituations = pickLiveSituations(gameRecord);
                    const links = pickGameLinks(gameRecord);
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
                        venueDetail: venueDetail || undefined,
                        broadcasts: broadcasts.length ? broadcasts : undefined,
                        broadcastGroups,
                        broadcastDetails,
                        statusFlags,
                        eventFlags,
                        liveSituations,
                        links,
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
            const broadcastGroups = pickBroadcastGroups(gameRecord);
            const broadcastDetails = pickBroadcastDetails(gameRecord);
            const venueDetail = pickVenueDetail(gameRecord);
            const statusFlags = pickStatusFlags(gameRecord);
            const eventFlags = pickEventFlags(gameRecord);
            const liveSituations = pickLiveSituations(gameRecord);
            const links = pickGameLinks(gameRecord);
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
                venueDetail: venueDetail || undefined,
                broadcasts: broadcasts.length ? broadcasts : undefined,
                        broadcastGroups,
                broadcastDetails,
                statusFlags,
                eventFlags,
                liveSituations,
                links,
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
                    const broadcastGroups = pickBroadcastGroups(gameRecord);
                    const venueDetail = pickVenueDetail(gameRecord);
                    const statusFlags = pickStatusFlags(gameRecord);
                    const eventFlags = pickEventFlags(gameRecord);
                    const liveSituations = pickLiveSituations(gameRecord);
                    const links = pickGameLinks(gameRecord);
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
                        venueDetail: venueDetail || undefined,
                        broadcasts: broadcasts.length ? broadcasts : undefined,
                        broadcastGroups,
                        statusFlags,
                        eventFlags,
                        liveSituations,
                        links,
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

export const parseScoreboard = (
    payload: Record<string, unknown>,
): Map<
    string,
    {
        status?: string;
        situations?: { home?: string; away?: string };
        startTime?: string;
        home?: string;
        away?: string;
        series?: string;
        linescore?: LinescoreSnapshot;
        live?: ScoreboardLiveDetails;
        links?: ScheduleLinks;
        tvBroadcasts?: string[];
        neutralSite?: boolean;
        venueTimezone?: string;
    }
> => {
    const gameWeek = asArray(payload.gameWeek);
    const games = gameWeek.length
        ? gameWeek.flatMap((day) =>
              asArray(asRecord(day).games ?? asRecord(day).gamesByDate),
          )
        : asArray(payload.games);

    const map = new Map<
        string,
        {
            status?: string;
            situations?: { home?: string; away?: string };
            startTime?: string;
            home?: string;
            away?: string;
            series?: string;
            linescore?: LinescoreSnapshot;
            live?: ScoreboardLiveDetails;
            links?: ScheduleLinks;
            tvBroadcasts?: string[];
            neutralSite?: boolean;
            venueTimezone?: string;
        }
    >();

    games.forEach((game) => {
        const record = asRecord(game);
        const id = String(
            record.id ??
                record.gameId ??
                record.gamePk ??
                record.gameNumber ??
                record.game ??
                '',
        );
        if (!id) {
            return;
        }
        const status = asRecord(record.status);
        const homeTeam = asRecord(record.homeTeam ?? record.home);
        const awayTeam = asRecord(record.awayTeam ?? record.away);
        const seriesRecord = asRecord(
            record.seriesStatus ??
                record.series ??
                record.seriesSummary ??
                record.seriesInfo,
        );
        const seriesLabel = pickText(
            seriesRecord.seriesSummary,
            seriesRecord.seriesStatus,
            seriesRecord.seriesLabel,
            seriesRecord.seriesLongName,
            seriesRecord.seriesShortName,
        );
        const seriesGame = pickText(
            seriesRecord.gameNumber,
            seriesRecord.game,
            seriesRecord.seriesGameNumber,
        );
        const seriesWinsAway = asNumber(
            seriesRecord.awayWins ?? seriesRecord.awayTeamWins,
        );
        const seriesWinsHome = asNumber(
            seriesRecord.homeWins ?? seriesRecord.homeTeamWins,
        );
        const seriesName = seriesLabel
            ? seriesLabel
            : seriesWinsAway !== null &&
              seriesWinsHome !== null &&
              homeTeam &&
              awayTeam
              ? `${pickTeamAbbrev(awayTeam) ?? 'Away'} ${seriesWinsAway}-${
                    seriesWinsHome
                } ${pickTeamAbbrev(homeTeam) ?? 'Home'}`
              : null;
        const series =
            seriesName && seriesGame
                ? `${seriesName} - Game ${seriesGame}`
                : seriesName;
        const linescore = parseLinescore(record, homeTeam, awayTeam);
        const links = pickGameLinks(record);
        const tvBroadcastsRaw = asArray(record.tvBroadcasts)
            .map((item) => formatBroadcastLabel(asRecord(item)))
            .filter(Boolean);
        const tvBroadcasts = tvBroadcastsRaw.length
            ? Array.from(new Set(tvBroadcastsRaw))
            : undefined;
        const neutralSiteValue = asBoolean(
            record.neutralSite ??
                record.isNeutralSite ??
                record.neutralSiteGame,
        );
        const neutralSite = neutralSiteValue ? true : undefined;
        const venueTimezone = pickText(
            record.venueTimezone,
            record.venueTZ,
            record.venueTimeZone,
            record.timezone,
        );
        const periodDescriptor = asRecord(record.periodDescriptor);
        const clockRecord = asRecord(record.clock);
        const intermissionInfo = asRecord(record.intermissionInfo);
        const period =
            asNumber(
                record.period ??
                    periodDescriptor.number ??
                    record.currentPeriod ??
                    record.currentPeriodOrdinal ??
                    status.period,
            ) ?? null;
        const periodType = pickText(
            periodDescriptor.periodType,
            record.periodType,
            status.periodType,
        );
        const clock = pickText(
            clockRecord.timeRemaining,
            clockRecord.timeRemainingFormatted,
            record.clock,
            record.timeRemaining,
            record.timeRemainingString,
            status.clock,
            status.timeRemaining,
        );
        const inIntermission =
            clockRecord.inIntermission ??
            intermissionInfo.inIntermission ??
            intermissionInfo.intermissionTimeRemaining !== undefined;
        const intermissionLabel = pickText(
            intermissionInfo.intermissionName,
            intermissionInfo.intermissionType,
        );
        const intermissionTimeRemaining = pickText(
            intermissionInfo.intermissionTimeRemaining,
            intermissionInfo.intermissionTimeRemainingFormatted,
            intermissionInfo.timeRemaining,
            intermissionInfo.timeRemainingFormatted,
        );

        let label = '';
        if (inIntermission) {
            label = intermissionLabel
                ? `Intermission (${intermissionLabel})`
                : 'Intermission';
        } else if (period !== null && clock) {
            const periodSuffix =
                periodType && periodType.toLowerCase() !== 'regular'
                    ? ` ${periodType.toUpperCase()}`
                    : '';
            label = `P${period}${periodSuffix} - ${clock}`;
        } else if (period !== null) {
            label = `P${period}`;
        } else if (clock) {
            label = clock;
        }

        const startTime = pickText(
            record.startTimeUTC,
            record.gameDate,
            record.startTime,
        );
        const live =
            period !== null ||
            clock ||
            inIntermission ||
            intermissionLabel ||
            intermissionTimeRemaining
                ? ({
                      period,
                      periodType: periodType || undefined,
                      clock: clock || undefined,
                      inIntermission: inIntermission ? true : undefined,
                      intermissionLabel: intermissionLabel || undefined,
                      intermissionTimeRemaining:
                          intermissionTimeRemaining || undefined,
                  } satisfies ScoreboardLiveDetails)
                : undefined;

        if (
            label ||
            startTime ||
            series ||
            linescore ||
            live ||
            links ||
            tvBroadcasts ||
            neutralSite ||
            venueTimezone
        ) {
            map.set(id, {
                status: label || undefined,
                startTime: startTime ?? undefined,
                home: pickTeamAbbrev(homeTeam) ?? undefined,
                away: pickTeamAbbrev(awayTeam) ?? undefined,
                series: series ?? undefined,
                linescore: linescore ?? undefined,
                live,
                links,
                tvBroadcasts,
                neutralSite,
                venueTimezone: venueTimezone || undefined,
            });
        }
        const situationRecord = asRecord(
            record.situation ??
                record.gameSituation ??
                record.liveSituation ??
                record.situationData,
        );
        const homeSituation = pickText(
            situationRecord.home,
            situationRecord.homeSituation,
            situationRecord.homeStrength,
            situationRecord.homeTeamSituation,
            situationRecord.homeTeamStrength,
        );
        const awaySituation = pickText(
            situationRecord.away,
            situationRecord.awaySituation,
            situationRecord.awayStrength,
            situationRecord.awayTeamSituation,
            situationRecord.awayTeamStrength,
        );
        if (homeSituation || awaySituation) {
            const previous = map.get(id);
            map.set(id, {
                status: previous?.status ?? (label || undefined),
                startTime: previous?.startTime ?? startTime ?? undefined,
                home: previous?.home ?? pickTeamAbbrev(homeTeam) ?? undefined,
                away: previous?.away ?? pickTeamAbbrev(awayTeam) ?? undefined,
                series: previous?.series ?? series ?? undefined,
                linescore: previous?.linescore ?? linescore ?? undefined,
                live: previous?.live ?? live ?? undefined,
                links: previous?.links ?? links ?? undefined,
                tvBroadcasts: previous?.tvBroadcasts ?? tvBroadcasts ?? undefined,
                neutralSite: previous?.neutralSite ?? neutralSite ?? undefined,
                venueTimezone:
                    previous?.venueTimezone ??
                    venueTimezone ??
                    undefined,
                situations: {
                    home: homeSituation ?? undefined,
                    away: awaySituation ?? undefined,
                },
            });
        }
    });

    return map;
};

export const parseOddsPartners = (
    payload: Record<string, unknown>,
): OddsPartner[] => {
    const partners = asArray(
        payload.oddsPartners ?? payload.oddsPartner ?? payload.odds,
    );
    return partners
        .map((partner, index) => {
            const record = asRecord(partner);
            const name = pickText(record.name, record.partnerName);
            if (!name) {
                return null;
            }
            return {
                id: asNumber(record.partnerId ?? record.id ?? index),
                name,
                country: pickText(record.country, record.countryCode),
                imageUrl: pickText(record.imageUrl, record.logo),
                siteUrl: pickText(record.siteUrl, record.url),
                bgColor: pickText(record.bgColor, record.backgroundColor),
                textColor: pickText(record.textColor, record.labelColor),
                accentColor: pickText(record.accentColor),
            } satisfies OddsPartner;
        })
        .filter(
            (partner): partner is OddsPartner => partner !== null,
        );
};

export const parseScoreGoals = (
    payload: Record<string, unknown>,
    gameId: string,
): ScoringSummaryItem[] => {
    if (!gameId) {
        return [];
    }
    const record = asRecord(payload);
    const gameWeek = asArray(record.gameWeek);
    const games = gameWeek.length
        ? gameWeek.flatMap((day) =>
              asArray(asRecord(day).games ?? asRecord(day).gamesByDate),
          )
        : asArray(record.games);
    const match = games.find((game) => {
        const gameRecord = asRecord(game);
        const id = String(
            gameRecord.id ??
                gameRecord.gameId ??
                gameRecord.gamePk ??
                gameRecord.gameNumber ??
                gameRecord.game ??
                '',
        );
        return id && id === gameId;
    });
    if (!match) {
        return [];
    }
    const goals = asArray(asRecord(match).goals);

    return goals
        .map((goal, index) => {
            const goalRecord = asRecord(goal);
            const periodDescriptor = asRecord(goalRecord.periodDescriptor);
            const period =
                asNumber(
                    goalRecord.period ??
                        periodDescriptor.number ??
                        goalRecord.periodNumber,
                ) ?? null;
            const periodType = pickText(
                periodDescriptor.periodType,
                periodDescriptor.periodTypeCode,
                goalRecord.periodType,
                goalRecord.periodTypeCode,
            );
            const maxRegulationPeriods = asNumber(
                periodDescriptor.maxRegulationPeriods ??
                    goalRecord.maxRegulationPeriods ??
                    goalRecord.regPeriods,
            );
            const time = pickText(
                goalRecord.timeInPeriod,
                goalRecord.timeRemaining,
                goalRecord.time,
            );
            const scorerName = pickPlayerName(goalRecord);
            const scorerGoalsToDate = asNumber(goalRecord.goalsToDate);
            const scorerMugshot = pickText(goalRecord.mugshot, goalRecord.headshot);
            const scorerId = asNumber(
                goalRecord.playerId ?? goalRecord.scoringPlayerId,
            );
            const scorer =
                scorerName
                    ? ({
                          id: scorerId !== null ? String(scorerId) : undefined,
                          name: scorerName,
                          goalsToDate: scorerGoalsToDate,
                          mugshot: scorerMugshot || undefined,
                      } satisfies ScoringSummaryPlayer)
                    : undefined;
            const assists = asArray(goalRecord.assists)
                .map((assist) => {
                    if (typeof assist === 'string') {
                        return { name: assist } satisfies ScoringSummaryPlayer;
                    }
                    const assistRecord = asRecord(assist);
                    const name =
                        pickPlayerName(assistRecord) ||
                        pickText(assistRecord.name);
                    if (!name) {
                        return null;
                    }
                    const assistId = asNumber(
                        assistRecord.playerId ??
                            assistRecord.id ??
                            assistRecord.personId,
                    );
                    return {
                        id: assistId !== null ? String(assistId) : undefined,
                        name,
                        assistsToDate: asNumber(assistRecord.assistsToDate),
                    } satisfies ScoringSummaryPlayer;
                })
                .filter(
                    (assist): assist is ScoringSummaryPlayer => assist !== null,
                );
            const strength = pickText(
                goalRecord.strength,
                goalRecord.strengthCode,
            );
            const goalTypeRaw = pickText(
                goalRecord.goalType,
                goalRecord.goalTypeCode,
                goalRecord.goalModifier,
            );
            const goalType =
                goalTypeRaw && goalTypeRaw.toLowerCase() !== 'none'
                    ? goalTypeRaw
                    : '';
            const score =
                goalRecord.awayScore !== undefined &&
                goalRecord.homeScore !== undefined
                    ? `${goalRecord.awayScore}-${goalRecord.homeScore}`
                    : null;
            const description =
                scorerName || assists.length
                    ? `${scorerName ?? 'Goal'}${
                          assists.length
                              ? ` (${assists.map((item) => item.name).join(', ')})`
                              : ''
                      }`
                    : pickText(goalRecord.description, goalRecord.text);
            const videoUrl = pickText(
                goalRecord.highlightClipSharingUrl,
                goalRecord.highlightClipUrl,
                goalRecord.videoUrl,
            );
            const videoUrlFr = pickText(
                goalRecord.highlightClipSharingUrlFr,
                goalRecord.highlightClipUrlFr,
            );
            const highlightClipId = asNumber(
                goalRecord.highlightClip ?? goalRecord.highlightClipId,
            );
            const highlightClipFrId = asNumber(
                goalRecord.highlightClipFr ?? goalRecord.highlightClipFrId,
            );
            const discreteClipId = asNumber(
                goalRecord.discreteClip ?? goalRecord.discreteClipId,
            );
            const discreteClipFrId = asNumber(
                goalRecord.discreteClipFr ?? goalRecord.discreteClipFrId,
            );

            return {
                id: String(
                    goalRecord.goalId ??
                        goalRecord.eventId ??
                        goalRecord.id ??
                        index,
                ),
                period,
                periodType: periodType || undefined,
                maxRegulationPeriods,
                time,
                team: pickText(goalRecord.teamAbbrev, goalRecord.team),
                strength: strength || undefined,
                goalType: goalType || undefined,
                score,
                description,
                videoUrl: videoUrl || undefined,
                videoUrlFr: videoUrlFr || undefined,
                highlightClipId,
                highlightClipFrId,
                discreteClipId,
                discreteClipFrId,
                scorer,
                assists: assists.length ? assists : undefined,
            } satisfies ScoringSummaryItem;
        })
        .filter((item) => item.description);
};

export const parseBoxscore = (
    payload: Record<string, unknown>,
): BoxscoreSnapshot | null => {
    const record = asRecord(payload);
    if (!Object.keys(record).length) {
        return null;
    }
    const homeRecord = asRecord(record.homeTeam ?? record.home);
    const awayRecord = asRecord(record.awayTeam ?? record.away);
    const venueRecord = asRecord(record.venue);
    const venueLocationRecord = asRecord(record.venueLocation);
    const clockRecord = asRecord(record.clock);
    const periodDescriptorRecord = asRecord(record.periodDescriptor);
    const gameOutcomeRecord = asRecord(record.gameOutcome);
    const tvBroadcastsRaw = asArray(record.tvBroadcasts)
        .map((item) => formatBroadcastLabel(asRecord(item)))
        .filter(Boolean);
    const tvBroadcasts = tvBroadcastsRaw.length
        ? Array.from(new Set(tvBroadcastsRaw))
        : undefined;
    const teamStatsRecord = asRecord(
        record.teamStats ?? record.teamStatsInfo ?? record.teamStatsTotals,
    );
    const homeStatsRecord = {
        ...homeRecord,
        ...asRecord(
            teamStatsRecord.home ??
                teamStatsRecord.homeTeam ??
                teamStatsRecord.homeTeamStats,
        ),
    };
    const awayStatsRecord = {
        ...awayRecord,
        ...asRecord(
            teamStatsRecord.away ??
                teamStatsRecord.awayTeam ??
                teamStatsRecord.awayTeamStats,
        ),
    };

    const getStatNumber = (stats: Record<string, unknown>, keys: string[]) => {
        for (const key of keys) {
            const value = asNumber(stats[key]);
            if (value !== null) {
                return value;
            }
        }
        return null;
    };
    const formatStat = (value?: number | null, digits = 0) => {
        if (value === null || value === undefined) {
            return '--';
        }
        return digits > 0 ? value.toFixed(digits) : String(value);
    };
    const readArrayFrom = (...values: unknown[]) => {
        for (const value of values) {
            if (Array.isArray(value)) {
                return value;
            }
        }
        return [];
    };
    const parseScoringSummary = () => {
        const summaryRecord = asRecord(record.summary);
        const scoringBlocks = asArray(
            summaryRecord.scoring ??
                summaryRecord.scoringSummary ??
                summaryRecord.scoringPlays ??
                summaryRecord.goals ??
                record.scoring ??
                record.scoringSummary,
        );
        const hasNestedGoals = scoringBlocks.some(
            (block) => asArray(asRecord(block).goals).length > 0,
        );
        const items = hasNestedGoals
            ? scoringBlocks.flatMap((block) => {
                  const blockRecord = asRecord(block);
                  const periodDescriptor = asRecord(blockRecord.periodDescriptor);
                  const periodNumber =
                      asNumber(
                          blockRecord.period ??
                              periodDescriptor.number ??
                              blockRecord.periodNumber,
                      ) ?? null;
                  return asArray(blockRecord.goals).map((goal) => ({
                      goal,
                      periodNumber,
                  }));
              })
            : scoringBlocks.map((goal) => ({ goal, periodNumber: null }));

        return items
            .map(({ goal, periodNumber }, index) => {
                const goalRecord = asRecord(goal);
                const details = asRecord(goalRecord.details);
                const periodDescriptor = asRecord(goalRecord.periodDescriptor);
                const period =
                    asNumber(
                        goalRecord.period ??
                            periodDescriptor.number ??
                            goalRecord.periodNumber,
                    ) ?? periodNumber;
                const periodType = pickText(
                    periodDescriptor.periodType,
                    periodDescriptor.periodTypeCode,
                    goalRecord.periodType,
                    goalRecord.periodTypeCode,
                );
                const maxRegulationPeriods = asNumber(
                    periodDescriptor.maxRegulationPeriods ??
                        goalRecord.maxRegulationPeriods ??
                        goalRecord.regPeriods,
                );
                const time = pickText(
                    goalRecord.timeInPeriod,
                    goalRecord.timeRemaining,
                    details.timeInPeriod,
                    details.timeRemaining,
                    goalRecord.clock?.timeRemaining,
                );
                const scorerRecord = asRecord(
                    goalRecord.goalScorer ??
                        goalRecord.scorer ??
                        details.scorer,
                );
                const scorer = pickText(
                    details.scorerName,
                    details.playerName,
                    pickPlayerName(scorerRecord),
                    goalRecord.scorerName,
                    goalRecord.goalScorerName,
                    goalRecord.playerName,
                );
                const scorerId = asNumber(
                    goalRecord.playerId ??
                        details.scoringPlayerId ??
                        scorerRecord.playerId ??
                        scorerRecord.id,
                );
                const assistEntries = asArray(
                    goalRecord.assists ?? details.assists,
                )
                    .map((assist) => {
                        if (typeof assist === 'string') {
                            return { name: assist } satisfies ScoringSummaryPlayer;
                        }
                        const assistRecord = asRecord(assist);
                        const name = pickPlayerName(assistRecord);
                        if (!name) {
                            return null;
                        }
                        const assistId = asNumber(
                            assistRecord.playerId ??
                                assistRecord.id ??
                                assistRecord.personId,
                        );
                        return {
                            id: assistId !== null ? String(assistId) : undefined,
                            name,
                        } satisfies ScoringSummaryPlayer;
                    })
                    .filter(
                        (assist): assist is ScoringSummaryPlayer => assist !== null,
                    );
                const assists = assistEntries.map((assist) => assist.name);
                const strength = pickText(
                    goalRecord.strength,
                    details.strength,
                    details.strengthCode,
                );
                const goalType = pickText(
                    goalRecord.goalType,
                    goalRecord.goalTypeCode,
                    details.goalType,
                    details.goalTypeCode,
                    details.eventTypeCode,
                );
                const videoUrl = pickText(
                    details.highlightClipSharingUrl,
                    details.highlightClipUrl,
                    goalRecord.highlightClipSharingUrl,
                    goalRecord.highlightClipUrl,
                );
                const videoUrlFr = pickText(
                    details.highlightClipSharingUrlFr,
                    details.highlightClipUrlFr,
                    goalRecord.highlightClipSharingUrlFr,
                    goalRecord.highlightClipUrlFr,
                );
                const highlightClipId = asNumber(
                    details.highlightClip ??
                        goalRecord.highlightClip ??
                        details.highlightClipId ??
                        goalRecord.highlightClipId,
                );
                const highlightClipFrId = asNumber(
                    details.highlightClipFr ??
                        goalRecord.highlightClipFr ??
                        details.highlightClipFrId ??
                        goalRecord.highlightClipFrId,
                );
                const discreteClipId = asNumber(
                    details.discreteClip ??
                        goalRecord.discreteClip ??
                        details.discreteClipId ??
                        goalRecord.discreteClipId,
                );
                const discreteClipFrId = asNumber(
                    details.discreteClipFr ??
                        goalRecord.discreteClipFr ??
                        details.discreteClipFrId ??
                        goalRecord.discreteClipFrId,
                );
                const score =
                    goalRecord.awayScore !== undefined &&
                    goalRecord.homeScore !== undefined
                        ? `${goalRecord.awayScore}-${goalRecord.homeScore}`
                        : null;
                const description =
                    pickText(
                        goalRecord.description,
                        details.description,
                        details.eventDescription,
                    ) ||
                    (scorer
                        ? `${scorer}${
                              assists.length
                                  ? ` (${assists.join(', ')})`
                                  : ''
                          }`
                        : undefined);
                const scorerEntry = scorer
                    ? ({
                          id: scorerId !== null ? String(scorerId) : undefined,
                          name: scorer,
                      } satisfies ScoringSummaryPlayer)
                    : undefined;
                const assistList = assistEntries.length ? assistEntries : undefined;

                return {
                    id: String(goalRecord.id ?? goalRecord.eventId ?? index),
                    period,
                    periodType: periodType || undefined,
                    maxRegulationPeriods,
                    time,
                    team: pickText(
                        goalRecord.teamAbbrev,
                        details.eventOwnerTeamAbbrev,
                        details.eventOwnerTeam,
                    ),
                    strength,
                    goalType,
                    score,
                    description,
                    videoUrl: videoUrl || undefined,
                    videoUrlFr: videoUrlFr || undefined,
                    highlightClipId,
                    highlightClipFrId,
                    discreteClipId,
                    discreteClipFrId,
                    scorer: scorerEntry,
                    assists: assistList,
                } satisfies ScoringSummaryItem;
            })
            .filter((item) => item.description);
    };
    const parseSummaryPenalties = () => {
        const summaryRecord = asRecord(record.summary);
        const penalties = readArrayFrom(
            summaryRecord.penalties,
            asRecord(summaryRecord.penalties).penalties,
            summaryRecord.penaltySummary,
            asRecord(summaryRecord.penaltySummary).penalties,
            summaryRecord.penaltyPlays,
        );
        return penalties
            .map((penalty) => {
                const penaltyRecord = asRecord(penalty);
                const periodDescriptor = asRecord(
                    penaltyRecord.periodDescriptor ?? penaltyRecord.period,
                );
                const period =
                    asNumber(
                        penaltyRecord.period ??
                            periodDescriptor.number ??
                            penaltyRecord.periodNumber,
                    ) ?? null;
                const periodType = pickText(
                    periodDescriptor.periodType,
                    periodDescriptor.periodTypeCode,
                    penaltyRecord.periodType,
                    penaltyRecord.periodTypeCode,
                );
                const maxRegulationPeriods = asNumber(
                    periodDescriptor.maxRegulationPeriods ??
                        penaltyRecord.maxRegulationPeriods ??
                        penaltyRecord.regPeriods,
                );
                const time = pickText(
                    penaltyRecord.timeInPeriod,
                    penaltyRecord.timeRemaining,
                    penaltyRecord.time,
                    asRecord(penaltyRecord.clock).timeRemaining,
                );
                const team = pickText(
                    penaltyRecord.teamAbbrev,
                    penaltyRecord.team,
                    asRecord(penaltyRecord.team).abbrev,
                    asRecord(penaltyRecord.team).name,
                );
                const player = pickText(
                    pickPlayerName(penaltyRecord),
                    pickPlayerName(asRecord(penaltyRecord.player)),
                    penaltyRecord.playerName,
                );
                const playerId = asNumber(
                    penaltyRecord.playerId ??
                        penaltyRecord.personId ??
                        (penaltyRecord.player as { playerId?: number })?.playerId ??
                        (penaltyRecord.player as { id?: number })?.id ??
                        (penaltyRecord.player as { personId?: number })?.personId,
                );
                const infraction = pickText(
                    penaltyRecord.infraction,
                    penaltyRecord.descKey,
                    penaltyRecord.typeCode,
                    penaltyRecord.reason,
                    penaltyRecord.penaltyType,
                );
                const minutes = asNumber(
                    penaltyRecord.duration ??
                        penaltyRecord.minutes ??
                        penaltyRecord.penaltyMinutes,
                );
                const description = pickText(
                    penaltyRecord.description,
                    penaltyRecord.text,
                );
                if (
                    !player &&
                    !infraction &&
                    minutes === null &&
                    !description &&
                    !team
                ) {
                    return null;
                }
                return {
                    period,
                    periodType: periodType || undefined,
                    maxRegulationPeriods,
                    time: time || undefined,
                    team: team || undefined,
                    player: player || undefined,
                    playerId: playerId !== null ? String(playerId) : undefined,
                    infraction: infraction || undefined,
                    minutes,
                    description: description || undefined,
                } satisfies BoxscoreSummaryPenalty;
            })
            .filter(
                (penalty): penalty is BoxscoreSummaryPenalty =>
                    penalty !== null,
            );
    };
    const parseThreeStars = () => {
        const summaryRecord = asRecord(record.summary);
        const stars = readArrayFrom(
            summaryRecord.threeStars,
            asRecord(summaryRecord.threeStars).stars,
            asRecord(summaryRecord.threeStars).players,
            summaryRecord.threeStar,
            summaryRecord.stars,
        );
        return stars
            .map((star, index) => {
                const starRecord = asRecord(star);
                const name = pickPlayerName(starRecord);
                if (!name) {
                    return null;
                }
                const team = pickText(
                    starRecord.teamAbbrev,
                    starRecord.team,
                    asRecord(starRecord.team).abbrev,
                    asRecord(starRecord.team).name,
                );
                const starNumber = asNumber(
                    starRecord.star ??
                        starRecord.rank ??
                        starRecord.starNumber ??
                        starRecord.starRank ??
                        index + 1,
                );
                const starId = asNumber(
                    starRecord.playerId ??
                        starRecord.id ??
                        starRecord.personId ??
                        (starRecord.player as { playerId?: number })?.playerId ??
                        (starRecord.player as { id?: number })?.id ??
                        (starRecord.player as { personId?: number })?.personId,
                );
                const headshot = pickText(
                    starRecord.headshot,
                    starRecord.headshotUrl,
                    starRecord.mugshot,
                );
                return {
                    star: starNumber,
                    id: starId !== null ? String(starId) : undefined,
                    name,
                    team: team || undefined,
                    position: pickPosition(starRecord) || undefined,
                    goals: asNumber(starRecord.goals),
                    assists: asNumber(starRecord.assists),
                    points: asNumber(starRecord.points),
                    headshot: headshot || undefined,
                } satisfies BoxscoreThreeStar;
            })
            .filter((star): star is BoxscoreThreeStar => star !== null)
            .sort((a, b) => {
                if (a.star === null || a.star === undefined) {
                    return 1;
                }
                if (b.star === null || b.star === undefined) {
                    return -1;
                }
                return a.star - b.star;
            });
    };
    const parseShootoutSummary = () => {
        const summaryRecord = asRecord(record.summary);
        const shootout = readArrayFrom(
            summaryRecord.shootout,
            asRecord(summaryRecord.shootout).attempts,
            asRecord(summaryRecord.shootout).plays,
            summaryRecord.shootoutSummary,
        );
        return shootout
            .map((attempt, index) => {
                const attemptRecord = asRecord(attempt);
                const shooter = pickText(
                    pickPlayerName(attemptRecord),
                    pickPlayerName(asRecord(attemptRecord.shooter)),
                    attemptRecord.shooterName,
                );
                const goalie = pickText(
                    pickPlayerName(asRecord(attemptRecord.goalie)),
                    attemptRecord.goalieName,
                );
                const team = pickText(
                    attemptRecord.teamAbbrev,
                    attemptRecord.team,
                    asRecord(attemptRecord.team).abbrev,
                    asRecord(attemptRecord.team).name,
                );
                const scoredValue = attemptRecord.scored;
                const scored =
                    typeof scoredValue === 'boolean'
                        ? scoredValue
                        : typeof scoredValue === 'number'
                          ? scoredValue === 1
                          : undefined;
                const result = pickText(
                    attemptRecord.result,
                    attemptRecord.outcome,
                    attemptRecord.shotResult,
                    scored !== undefined ? (scored ? 'Goal' : 'No goal') : '',
                );
                if (!shooter && !goalie && !team && !result) {
                    return null;
                }
                return {
                    sequence:
                        asNumber(
                            attemptRecord.sequence ??
                                attemptRecord.order ??
                                attemptRecord.attempt,
                        ) ?? index + 1,
                    shooter: shooter || undefined,
                    goalie: goalie || undefined,
                    team: team || undefined,
                    result: result || undefined,
                } satisfies BoxscoreShootoutAttempt;
            })
            .filter(
                (attempt): attempt is BoxscoreShootoutAttempt =>
                    attempt !== null,
            );
    };
    const parseTeamLeaders = () => {
        const playersRecord = asRecord(
            record.playerByGameStats ??
                record.playerGameStats ??
                record.playerStats,
        );
        const homePlayers = asRecord(
            playersRecord.homeTeam ?? playersRecord.home,
        );
        const awayPlayers = asRecord(
            playersRecord.awayTeam ?? playersRecord.away,
        );
        const collectPlayers = (team: Record<string, unknown>) => {
            const groups = [
                team.forwards,
                team.defensemen,
                team.defense,
                team.skaters,
                team.players,
            ];
            return groups
                .flatMap((group) => asArray(group))
                .map((player) => {
                    const record = asRecord(player);
                    const headshot = pickText(
                        record.headshot,
                        record.headshotUrl,
                        record.photo,
                        record.image,
                        (record.player as { headshot?: string })?.headshot,
                        (record.player as { headshotUrl?: string })?.headshotUrl,
                    );
                    return {
                        name: pickPlayerName(record),
                        goals: asNumber(record.goals),
                        assists: asNumber(record.assists),
                        points: asNumber(record.points),
                        headshot,
                    };
                })
                .filter((player) => player.name);
        };
        const resolveLeader = (
            players: Array<{
                name: string;
                goals: number | null;
                assists: number | null;
                points: number | null;
            }>,
            key: 'goals' | 'assists' | 'points',
        ) => {
            let leader: typeof players[number] | null = null;
            players.forEach((player) => {
                const value = player[key];
                if (value === null || value === undefined) {
                    return;
                }
                if (!leader || (leader[key] ?? -1) < value) {
                    leader = player;
                }
            });
            return leader;
        };
        const buildLeaders = (players: ReturnType<typeof collectPlayers>) => {
            const goalsLeader = resolveLeader(players, 'goals');
            const assistsLeader = resolveLeader(players, 'assists');
            const pointsLeader = resolveLeader(players, 'points');
            const leaders: TeamLeaderEntry[] = [
                {
                    label: 'Goals',
                    player: goalsLeader?.name,
                    value: goalsLeader?.goals ?? null,
                    headshot: goalsLeader?.headshot,
                },
                {
                    label: 'Assists',
                    player: assistsLeader?.name,
                    value: assistsLeader?.assists ?? null,
                    headshot: assistsLeader?.headshot,
                },
                {
                    label: 'Points',
                    player: pointsLeader?.name,
                    value: pointsLeader?.points ?? null,
                    headshot: pointsLeader?.headshot,
                },
            ].filter((entry) => entry.player);
            return leaders;
        };
        const homeList = collectPlayers(homePlayers);
        const awayList = collectPlayers(awayPlayers);
        const homeLeaders = buildLeaders(homeList);
        const awayLeaders = buildLeaders(awayList);
        if (!homeLeaders.length && !awayLeaders.length) {
            return null;
        }
        return {
            away: awayLeaders,
            home: homeLeaders,
        } satisfies TeamLeaders;
    };
    const parseGoalieStats = () => {
        const playersRecord = asRecord(
            record.playerByGameStats ??
                record.playerGameStats ??
                record.playerStats,
        );
        const homePlayers = asRecord(
            playersRecord.homeTeam ?? playersRecord.home,
        );
        const awayPlayers = asRecord(
            playersRecord.awayTeam ?? playersRecord.away,
        );
        const collectGoalies = (team: Record<string, unknown>) => {
            const groups = [
                team.goalies,
                team.goalie,
                team.goaltenders,
            ];
            return groups
                .flatMap((group) => asArray(group))
                .map((goalie, index) => {
                    const record = asRecord(goalie);
                    const name = pickPlayerName(record);
                    const shots = asNumber(record.shotsAgainst ?? record.shots);
                    const saves = asNumber(record.saves);
                    const goalsAgainst = asNumber(
                        record.goalsAgainst ?? record.goals,
                    );
                    const savePct = asNumber(
                        record.savePct ??
                            record.savePercentage ??
                            record.savePctg,
                    );
                    const toi = pickText(
                        record.toi,
                        record.timeOnIce,
                        record.timeOnIceString,
                    );
                    const decision = pickText(record.decision);
                    const starterValue = record.starter;
                    const starter =
                        typeof starterValue === 'boolean'
                            ? starterValue
                            : typeof starterValue === 'number'
                              ? starterValue === 1
                              : undefined;
                    const evenStrengthShotsAgainst = pickText(
                        record.evenStrengthShotsAgainst,
                        record.evenStrengthShots,
                    );
                    const powerPlayShotsAgainst = pickText(
                        record.powerPlayShotsAgainst,
                        record.powerPlayShots,
                    );
                    const shorthandedShotsAgainst = pickText(
                        record.shorthandedShotsAgainst,
                        record.shortHandedShotsAgainst,
                        record.shortHandedShots,
                    );
                    const saveShotsAgainst = pickText(
                        record.saveShotsAgainst,
                        record.saveShots,
                    );
                    const pim = asNumber(record.pim);
                    const evenStrengthGoalsAgainst = asNumber(
                        record.evenStrengthGoalsAgainst,
                    );
                    const powerPlayGoalsAgainst = asNumber(
                        record.powerPlayGoalsAgainst,
                    );
                    const shorthandedGoalsAgainst = asNumber(
                        record.shorthandedGoalsAgainst,
                    );
                    return {
                        id: String(record.playerId ?? record.id ?? index),
                        name,
                        shots,
                        saves,
                        goalsAgainst,
                        savePct,
                        toi: toi || undefined,
                        decision: decision || undefined,
                        starter,
                        evenStrengthShotsAgainst:
                            evenStrengthShotsAgainst || undefined,
                        powerPlayShotsAgainst: powerPlayShotsAgainst || undefined,
                        shorthandedShotsAgainst:
                            shorthandedShotsAgainst || undefined,
                        saveShotsAgainst: saveShotsAgainst || undefined,
                        pim,
                        evenStrengthGoalsAgainst,
                        powerPlayGoalsAgainst,
                        shorthandedGoalsAgainst,
                    } satisfies GoalieStatLine;
                })
                .filter((goalie) => goalie.name);
        };
        const away = collectGoalies(awayPlayers);
        const home = collectGoalies(homePlayers);
        if (!away.length && !home.length) {
            return null;
        }
        return {
            away,
            home,
        } satisfies GoalieStats;
    };
    const parseSkaterStats = () => {
        const playersRecord = asRecord(
            record.playerByGameStats ??
                record.playerGameStats ??
                record.playerStats,
        );
        const homePlayers = asRecord(
            playersRecord.homeTeam ?? playersRecord.home,
        );
        const awayPlayers = asRecord(
            playersRecord.awayTeam ?? playersRecord.away,
        );
        const collectSkaters = (team: Record<string, unknown>) => {
            const groups = [
                team.forwards,
                team.defensemen,
                team.defense,
                team.skaters,
                team.players,
            ];
            return groups
                .flatMap((group) => asArray(group))
                .map((player, index) => {
                    const record = asRecord(player);
                    const name = pickPlayerName(record);
                    if (!name) {
                        return null;
                    }
                    return {
                        id: String(record.playerId ?? record.id ?? index),
                        name,
                        position: pickPosition(record) || undefined,
                        sweaterNumber: asNumber(record.sweaterNumber),
                        goals: asNumber(record.goals),
                        assists: asNumber(record.assists),
                        points: asNumber(record.points),
                        plusMinus: asNumber(record.plusMinus),
                        pim: asNumber(record.pim),
                        shots: asNumber(
                            record.sog ??
                                record.shotsOnGoal ??
                                record.shots,
                        ),
                        powerPlayGoals: asNumber(
                            record.powerPlayGoals ?? record.ppGoals,
                        ),
                        faceoffWinPct: asNumber(
                            record.faceoffWinningPctg ??
                                record.faceoffWinPct ??
                                record.faceoffWinPercentage,
                        ),
                        toi: pickText(record.toi, record.timeOnIce),
                        hits: asNumber(record.hits),
                        blocks: asNumber(
                            record.blockedShots ?? record.blocks,
                        ),
                        giveaways: asNumber(record.giveaways),
                        takeaways: asNumber(record.takeaways),
                        shifts: asNumber(record.shifts),
                    } satisfies SkaterStatLine;
                })
                .filter(
                    (player): player is SkaterStatLine => player !== null,
                );
        };
        const away = collectSkaters(awayPlayers);
        const home = collectSkaters(homePlayers);
        if (!away.length && !home.length) {
            return null;
        }
        return {
            away,
            home,
        } satisfies SkaterStats;
    };
    const buildTeam = (team: Record<string, unknown>) => {
        const placeNameRecord = asRecord(team.placeName);
        return {
            name: pickTeamName(team) || 'Team',
            abbrev: pickTeamAbbrev(team),
            score: pickScore(team),
            logo: pickText(team.logo, team.logoUrl, team.lightLogo),
            darkLogo: pickText(team.darkLogo, team.darkLogoUrl),
            placeName: pickText(
                placeNameRecord.default,
                placeNameRecord.name,
                team.placeName,
            ),
        };
    };

    const awayStats = {
        shots: getStatNumber(awayStatsRecord, ['shots', 'shotsOnGoal', 'sog']),
        hits: getStatNumber(awayStatsRecord, ['hits']),
        blocks: getStatNumber(awayStatsRecord, ['blocks', 'blockedShots']),
        pim: getStatNumber(awayStatsRecord, ['pim', 'penaltyMinutes']),
        faceoff: getStatNumber(awayStatsRecord, [
            'faceoffWinPct',
            'faceoffWinPercentage',
            'faceOffWinPct',
        ]),
        powerPlayGoals: getStatNumber(awayStatsRecord, [
            'powerPlayGoals',
            'ppGoals',
        ]),
        powerPlayOpportunities: getStatNumber(awayStatsRecord, [
            'powerPlayOpportunities',
            'ppOpportunities',
        ]),
    };
    const homeStats = {
        shots: getStatNumber(homeStatsRecord, ['shots', 'shotsOnGoal', 'sog']),
        hits: getStatNumber(homeStatsRecord, ['hits']),
        blocks: getStatNumber(homeStatsRecord, ['blocks', 'blockedShots']),
        pim: getStatNumber(homeStatsRecord, ['pim', 'penaltyMinutes']),
        faceoff: getStatNumber(homeStatsRecord, [
            'faceoffWinPct',
            'faceoffWinPercentage',
            'faceOffWinPct',
        ]),
        powerPlayGoals: getStatNumber(homeStatsRecord, [
            'powerPlayGoals',
            'ppGoals',
        ]),
        powerPlayOpportunities: getStatNumber(homeStatsRecord, [
            'powerPlayOpportunities',
            'ppOpportunities',
        ]),
    };
    const powerPlayAway =
        awayStats.powerPlayGoals !== null &&
        awayStats.powerPlayGoals !== undefined &&
        awayStats.powerPlayOpportunities !== null &&
        awayStats.powerPlayOpportunities !== undefined
            ? `${awayStats.powerPlayGoals}/${awayStats.powerPlayOpportunities}`
            : '--';
    const powerPlayHome =
        homeStats.powerPlayGoals !== null &&
        homeStats.powerPlayGoals !== undefined &&
        homeStats.powerPlayOpportunities !== null &&
        homeStats.powerPlayOpportunities !== undefined
            ? `${homeStats.powerPlayGoals}/${homeStats.powerPlayOpportunities}`
            : '--';

    const stats: BoxscoreStat[] = [
        {
            label: 'Shots',
            away: formatStat(awayStats.shots),
            home: formatStat(homeStats.shots),
        },
        {
            label: 'Hits',
            away: formatStat(awayStats.hits),
            home: formatStat(homeStats.hits),
        },
        {
            label: 'Blocks',
            away: formatStat(awayStats.blocks),
            home: formatStat(homeStats.blocks),
        },
        {
            label: 'PIM',
            away: formatStat(awayStats.pim),
            home: formatStat(homeStats.pim),
        },
        {
            label: 'Faceoff Win %',
            away: formatStat(awayStats.faceoff, 1),
            home: formatStat(homeStats.faceoff, 1),
        },
        {
            label: 'Power Play',
            away: powerPlayAway,
            home: powerPlayHome,
        },
    ].filter((row) => row.away !== '--' || row.home !== '--');
    const scoringSummary = parseScoringSummary();
    const leaders = parseTeamLeaders();
    const goalies = parseGoalieStats();
    const skaters = parseSkaterStats();
    const summaryPenalties = parseSummaryPenalties();
    const threeStars = parseThreeStars();
    const shootoutSummary = parseShootoutSummary();
    const venueLocation = pickText(
        venueLocationRecord.default,
        venueLocationRecord.name,
        venueLocationRecord.city,
        venueLocationRecord.location,
        venueLocationRecord.placeName,
        venueLocationRecord.place,
    );
    const clockTime = pickText(
        clockRecord.timeRemaining,
        clockRecord.time,
        clockRecord.timeRemainingFormatted,
    );
    const runningValue =
        typeof clockRecord.running === 'boolean'
            ? clockRecord.running
            : typeof clockRecord.running === 'number'
              ? clockRecord.running === 1
              : undefined;
    const intermissionValue =
        typeof clockRecord.inIntermission === 'boolean'
            ? clockRecord.inIntermission
            : typeof clockRecord.inIntermission === 'number'
              ? clockRecord.inIntermission === 1
              : undefined;
    const clock =
        clockTime || runningValue !== undefined || intermissionValue !== undefined
            ? ({
                  timeRemaining: clockTime || undefined,
                  running: runningValue,
                  inIntermission: intermissionValue,
              } satisfies BoxscoreClock)
            : undefined;
    const periodNumber = asNumber(
        periodDescriptorRecord.number ??
            record.period ??
            record.currentPeriod,
    );
    const periodType = pickText(
        periodDescriptorRecord.periodType,
        periodDescriptorRecord.periodTypeCode,
        record.periodType,
    );
    const maxRegulationPeriods = asNumber(
        periodDescriptorRecord.maxRegulationPeriods ?? record.regPeriods,
    );
    const periodDescriptor =
        periodNumber !== null ||
        periodType ||
        maxRegulationPeriods !== null
            ? ({
                  number: periodNumber,
                  periodType: periodType || undefined,
                  maxRegulationPeriods,
              } satisfies BoxscorePeriodDescriptor)
            : undefined;
    const lastPeriodType = pickText(
        gameOutcomeRecord.lastPeriodType,
        gameOutcomeRecord.lastPeriod,
        record.lastPeriodType,
    );
    const otPeriods = asNumber(
        gameOutcomeRecord.otPeriods ?? gameOutcomeRecord.overtimePeriods,
    );
    const gameOutcome =
        lastPeriodType || otPeriods !== null
            ? ({
                  lastPeriodType: lastPeriodType || undefined,
                  otPeriods,
              } satisfies BoxscoreOutcome)
            : undefined;

    const season = asNumber(record.season ?? record.seasonId ?? record.seasonYear);
    const gameType = pickGameTypeId(record);
    const limitedScoringRaw =
        record.limitedScoring ??
        record.isLimitedScoring ??
        record.limitedScoringGame ??
        record.isLimitedScoringGame;
    const limitedScoring =
        limitedScoringRaw === null || limitedScoringRaw === undefined
            ? undefined
            : asBoolean(limitedScoringRaw);
    const gameScheduleState = pickText(
        record.gameScheduleState,
        record.gameScheduleStatus,
        record.scheduleState,
        record.gameScheduleStatusCode,
    );
    const easternUTCOffset = asNumber(
        record.easternUTCOffset ?? record.easternUtcOffset,
    );
    const venueUTCOffset = asNumber(
        record.venueUTCOffset ?? record.venueUtcOffset,
    );

    const id = String(
        record.id ??
            record.gameId ??
            record.gamePk ??
            `${pickTeamAbbrev(awayRecord)}-${pickTeamAbbrev(homeRecord)}-${pickText(
                record.startTimeUTC,
                record.gameDate,
                record.startTime,
            )}`,
    );

    return {
        id,
        status: pickText(
            record.gameState,
            record.gameStatus,
            record.gameStatusString,
        ),
        gameDate: pickText(record.gameDate) || undefined,
        startTime: pickText(
            record.startTimeUTC,
            record.gameDate,
            record.startTime,
        ),
        season: season ?? undefined,
        gameType: gameType ?? undefined,
        limitedScoring,
        gameScheduleState: gameScheduleState || undefined,
        easternUTCOffset: easternUTCOffset ?? undefined,
        venueUTCOffset: venueUTCOffset ?? undefined,
        venue: pickText(venueRecord.default, venueRecord.name),
        venueLocation: venueLocation || undefined,
        clock,
        periodDescriptor,
        gameOutcome,
        tvBroadcasts,
        home: buildTeam(homeRecord),
        away: buildTeam(awayRecord),
        stats,
        scoringSummary,
        leaders: leaders ?? undefined,
        goalies: goalies ?? undefined,
        skaters: skaters ?? undefined,
        summaryPenalties: summaryPenalties.length ? summaryPenalties : undefined,
        threeStars: threeStars.length ? threeStars : undefined,
        shootoutSummary: shootoutSummary.length ? shootoutSummary : undefined,
    };
};

export const parsePlayByPlay = (
    payload: Record<string, unknown>,
): PlayByPlayEvent[] => {
    const record = asRecord(payload);
    const rosterSpots = asArray(record.rosterSpots);
    const playerMap = new Map<
        string,
        {
            name: string;
            teamId?: number | null;
        }
    >();
    rosterSpots.forEach((spot) => {
        const spotRecord = asRecord(spot);
        const playerId = asNumber(
            spotRecord.playerId ?? spotRecord.id ?? spotRecord.personId,
        );
        if (playerId === null) {
            return;
        }
        const name = pickPlayerName(spotRecord);
        if (!name) {
            return;
        }
        playerMap.set(String(playerId), {
            name,
            teamId: asNumber(spotRecord.teamId),
        });
    });
    const teamMap = new Map<number, string>();
    [record.homeTeam, record.awayTeam].forEach((team) => {
        const teamRecord = asRecord(team);
        const teamId = asNumber(teamRecord.id);
        const abbrev = pickTeamAbbrev(teamRecord);
        if (teamId !== null && abbrev) {
            teamMap.set(teamId, abbrev);
        }
    });
    const resolvePlayerName = (value: unknown) => {
        const id = asNumber(value);
        if (id === null) {
            return '';
        }
        return playerMap.get(String(id))?.name ?? '';
    };
    const resolvePlayerTeamAbbrev = (value: unknown) => {
        const id = asNumber(value);
        if (id === null) {
            return '';
        }
        const teamId = playerMap.get(String(id))?.teamId;
        if (teamId === null || teamId === undefined) {
            return '';
        }
        return teamMap.get(teamId) ?? '';
    };
    const resolveTeamAbbrev = (value: unknown) => {
        const id = asNumber(value);
        if (id === null) {
            return '';
        }
        return teamMap.get(id) ?? '';
    };
    const formatLabel = (value?: string) => {
        if (!value) {
            return '';
        }
        return value
            .replace(/[_-]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .split(' ')
            .map((part) =>
                part
                    ? `${part[0].toUpperCase()}${part.slice(1)}`
                    : '',
            )
            .join(' ');
    };
    const parseSituationCode = (code?: string) => {
        if (!code) {
            return null;
        }
        const normalized = code.replace(/\D/g, '');
        if (normalized.length !== 4) {
            return null;
        }
        const values = normalized.split('').map((digit) => Number(digit));
        if (values.some((value) => Number.isNaN(value))) {
            return null;
        }
        const [awayGoalie, awaySkaters, homeSkaters, homeGoalie] = values;
        const pulled: string[] = [];
        if (awayGoalie === 0) {
            pulled.push('Away');
        }
        if (homeGoalie === 0) {
            pulled.push('Home');
        }
        return {
            onIceStrength: `${awaySkaters}v${homeSkaters}`,
            goaliePulled: pulled.length ? pulled.join(' & ') : undefined,
        };
    };
    const playsByPeriod = asArray(record.playsByPeriod);
    const plays = playsByPeriod.length
        ? playsByPeriod.flatMap((period) =>
              asArray(asRecord(period).plays ?? asRecord(period).events),
          )
        : asArray(
              record.plays ??
                  record.events ??
                  record.allPlays ??
                  record.playsByGame ??
                  record.playsList,
          );

    const playItems = plays.map((play, index) => ({
        play,
        index,
        sortOrder: asNumber(asRecord(play).sortOrder),
    }));
    const hasSortOrder = playItems.some(
        (item) => item.sortOrder !== null,
    );
    const sortedPlays = hasSortOrder
        ? playItems
              .sort((a, b) => {
                  if (a.sortOrder === null && b.sortOrder === null) {
                      return a.index - b.index;
                  }
                  if (a.sortOrder === null) {
                      return 1;
                  }
                  if (b.sortOrder === null) {
                      return -1;
                  }
                  if (a.sortOrder !== b.sortOrder) {
                      return a.sortOrder - b.sortOrder;
                  }
                  return a.index - b.index;
              })
              .map((item) => item.play)
        : plays;

    return sortedPlays
        .map((play, index) => {
            const item = asRecord(play);
            const details = asRecord(item.details);
            const periodDescriptor = asRecord(item.periodDescriptor);
            const clock = asRecord(item.clock);
            const typeKey = pickText(
                item.typeDescKey,
                item.eventType,
                item.typeCode,
                item.type,
                details.typeCode,
                details.eventTypeCode,
            );
            const id = String(
                item.eventId ?? item.id ?? item.playId ?? index,
            );
            const period =
                asNumber(
                    item.period ??
                        periodDescriptor.number ??
                        item.periodNumber,
                ) ?? null;
            const time = pickText(
                item.timeInPeriod,
                item.timeRemaining,
                clock.timeRemaining,
                item.timeInPeriodFormatted,
            );
            const sortOrder = asNumber(item.sortOrder);
            const situationValue =
                item.situationCode ?? details.situationCode ?? item.situation;
            const situationCode =
                typeof situationValue === 'number'
                    ? String(situationValue)
                    : pickText(situationValue as string);
            const situation = parseSituationCode(situationCode);
            const homeDefendingSide = formatLabel(
                pickText(item.homeTeamDefendingSide, item.homeDefendingSide),
            );
            const eventOwnerTeamId = asNumber(
                details.eventOwnerTeamId ?? details.teamId,
            );
            const descriptionSeed = pickText(
                item.description,
                details.eventDescription,
                details.description,
                item.playDescription,
                item.eventDescription,
            );
            const normalizedType = typeKey ? typeKey.toLowerCase() : '';
            const zoneCode = pickText(
                details.zoneCode,
                details.zone,
                item.zoneCode,
            );
            const zone = zoneCode ? zoneCode.toUpperCase() : undefined;
            const xCoord = asNumber(details.xCoord ?? details.x);
            const yCoord = asNumber(details.yCoord ?? details.y);
            const coordinates =
                xCoord !== null || yCoord !== null
                    ? {
                          x: xCoord,
                          y: yCoord,
                      }
                    : undefined;
            const shotType = formatLabel(
                pickText(details.shotType, details.shotTypeCode),
            );
            const strength = formatLabel(
                pickText(details.strength, details.strengthCode),
            );
            const infraction = formatLabel(
                pickText(details.descKey, details.infraction),
            );
            const reason = formatLabel(pickText(details.reason));
            const penaltyMinutes = asNumber(details.duration);
            const committedBy = resolvePlayerName(
                details.committedByPlayerId ?? details.playerId,
            );
            const drawnBy = resolvePlayerName(details.drawnByPlayerId);
            const awayScore = pickNumeric(details.awayScore, item.awayScore);
            const homeScore = pickNumeric(details.homeScore, item.homeScore);
            const score =
                awayScore !== null && homeScore !== null
                    ? `${awayScore}-${homeScore}`
                    : undefined;
            const videoUrl = pickText(
                details.highlightClipSharingUrl,
                details.highlightClipUrl,
                item.highlightClipSharingUrl,
                item.highlightClipUrl,
            );
            const pptReplayUrl = pickText(
                item.pptReplayUrl,
                item.pptReplayURL,
                details.pptReplayUrl,
                details.pptReplayURL,
            );
            const awaySog = pickNumeric(
                details.awaySOG,
                details.awaySog,
                details.awayShotsOnGoal,
                item.awaySOG,
                item.awaySog,
            );
            const homeSog = pickNumeric(
                details.homeSOG,
                details.homeSog,
                details.homeShotsOnGoal,
                item.homeSOG,
                item.homeSog,
            );
            const goalieInNetId = asNumber(
                details.goalieInNetId ??
                    details.goalieId ??
                    item.goalieInNetId ??
                    item.goalieId,
            );
            const goalieInNetName =
                goalieInNetId !== null
                    ? resolvePlayerName(goalieInNetId)
                    : '';
            const blockedByTeam =
                normalizedType === 'blocked-shot'
                    ? resolvePlayerTeamAbbrev(details.blockingPlayerId)
                    : undefined;
            const scoringPlayerTotal = asNumber(details.scoringPlayerTotal);
            const assist1Total = asNumber(details.assist1PlayerTotal);
            const assist2Total = asNumber(details.assist2PlayerTotal);
            const scorerName = resolvePlayerName(details.scoringPlayerId);
            const assist1Name = resolvePlayerName(details.assist1PlayerId);
            const assist2Name = resolvePlayerName(details.assist2PlayerId);
            const goalTotals: PlayByPlayGoalTotal[] = [];
            if (scorerName && scoringPlayerTotal !== null) {
                goalTotals.push({
                    name: scorerName,
                    total: scoringPlayerTotal,
                    kind: 'G',
                });
            }
            if (assist1Name && assist1Total !== null) {
                goalTotals.push({
                    name: assist1Name,
                    total: assist1Total,
                    kind: 'A',
                });
            }
            if (assist2Name && assist2Total !== null) {
                goalTotals.push({
                    name: assist2Name,
                    total: assist2Total,
                    kind: 'A',
                });
            }
            const goalTotalsEntry = goalTotals.length ? goalTotals : undefined;
            const buildDescription = () => {
                if (normalizedType === 'goal') {
                    const scorer = resolvePlayerName(
                        details.scoringPlayerId,
                    );
                    const assists = [
                        resolvePlayerName(details.assist1PlayerId),
                        resolvePlayerName(details.assist2PlayerId),
                    ].filter(Boolean);
                    const assistLabel = assists.length
                        ? ` (Assists: ${assists.join(', ')})`
                        : '';
                    const shotLabel = shotType ? ` - ${shotType} shot` : '';
                    return `Goal by ${scorer || 'Unknown'}${assistLabel}${shotLabel}`;
                }
                if (normalizedType === 'penalty') {
                    const durationLabel = penaltyMinutes
                        ? ` (${penaltyMinutes} min)`
                        : '';
                    const drawnLabel = drawnBy ? `, drawn by ${drawnBy}` : '';
                    const label = infraction || 'Penalty';
                    const playerLabel = committedBy
                        ? ` - ${committedBy}`
                        : '';
                    return `Penalty: ${label}${playerLabel}${durationLabel}${drawnLabel}`;
                }
                if (normalizedType === 'stoppage') {
                    return reason ? `Stoppage: ${reason}` : 'Stoppage';
                }
                if (normalizedType === 'faceoff') {
                    const winner = resolvePlayerName(
                        details.winningPlayerId,
                    );
                    const loser = resolvePlayerName(
                        details.losingPlayerId,
                    );
                    if (winner && loser) {
                        return `Faceoff: ${winner} over ${loser}`;
                    }
                    return winner ? `Faceoff won by ${winner}` : 'Faceoff';
                }
                if (normalizedType === 'hit') {
                    const hitter = resolvePlayerName(
                        details.hittingPlayerId,
                    );
                    const hittee = resolvePlayerName(
                        details.hitteePlayerId,
                    );
                    if (hitter && hittee) {
                        return `Hit: ${hitter} on ${hittee}`;
                    }
                    return hitter ? `Hit by ${hitter}` : 'Hit';
                }
                if (normalizedType === 'giveaway') {
                    const player = resolvePlayerName(details.playerId);
                    return player ? `Giveaway by ${player}` : 'Giveaway';
                }
                if (normalizedType === 'takeaway') {
                    const player = resolvePlayerName(details.playerId);
                    return player ? `Takeaway by ${player}` : 'Takeaway';
                }
                if (normalizedType === 'blocked-shot') {
                    const blocker = resolvePlayerName(
                        details.blockingPlayerId,
                    );
                    const shooter = resolvePlayerName(
                        details.shootingPlayerId,
                    );
                    if (blocker && shooter) {
                        return `Blocked shot: ${blocker} on ${shooter}`;
                    }
                    return blocker ? `Blocked shot by ${blocker}` : 'Blocked shot';
                }
                if (normalizedType === 'shot-on-goal') {
                    const shooter = resolvePlayerName(
                        details.shootingPlayerId,
                    );
                    const shotLabel = shotType ? ` (${shotType})` : '';
                    return shooter
                        ? `Shot on goal by ${shooter}${shotLabel}`
                        : 'Shot on goal';
                }
                if (normalizedType === 'missed-shot') {
                    const shooter = resolvePlayerName(
                        details.shootingPlayerId,
                    );
                    const parts = [
                        shooter ? `Missed shot by ${shooter}` : 'Missed shot',
                        shotType ? `(${shotType})` : '',
                        reason ? `- ${reason}` : '',
                    ].filter(Boolean);
                    return parts.join(' ');
                }
                if (normalizedType === 'period-start') {
                    const periodNumber =
                        periodDescriptor.number ??
                        item.periodNumber ??
                        item.period;
                    return periodNumber
                        ? `Period ${periodNumber} start`
                        : 'Period start';
                }
                if (normalizedType === 'period-end') {
                    const periodNumber =
                        periodDescriptor.number ??
                        item.periodNumber ??
                        item.period;
                    return periodNumber
                        ? `Period ${periodNumber} end`
                        : 'Period end';
                }
                if (normalizedType === 'game-end') {
                    return 'Game end';
                }
                const label = formatLabel(typeKey);
                return label || 'Event';
            };
            const description = descriptionSeed || buildDescription();
            const type = typeKey;
            let category: PlayByPlayEvent['category'] = 'Other';
            if (
                normalizedType.includes('goal') ||
                normalizedType.includes('shot')
            ) {
                category = normalizedType.includes('goal') ? 'Goal' : 'Shot';
            } else if (
                normalizedType.includes('penalty') ||
                normalizedType.includes('pim')
            ) {
                category = 'Penalty';
            }
            const team = pickText(
                item.teamAbbrev,
                details.eventOwnerTeamAbbrev,
                details.eventOwnerTeam,
                details.eventOwnerTeamName,
                resolveTeamAbbrev(eventOwnerTeamId),
            );
            const playerSources = [
                asArray(item.players),
                asArray(details.players),
                asArray(item.participants),
                asArray(details.participants),
            ];
            const players: PlayByPlayPlayer[] = [];
            const seenPlayers = new Set<string>();
            playerSources.forEach((source) => {
                source.forEach((entry) => {
                    const entryRecord = asRecord(entry);
                    const playerRecord = asRecord(
                        entryRecord.player ?? entryRecord,
                    );
                    const playerId = asNumber(
                        entryRecord.playerId ??
                            entryRecord.id ??
                            entryRecord.personId ??
                            (entryRecord.player as { playerId?: number })?.playerId ??
                            (entryRecord.player as { id?: number })?.id ??
                            (entryRecord.player as { personId?: number })?.personId ??
                            playerRecord.playerId ??
                            playerRecord.id ??
                            playerRecord.personId,
                    );
                    const name = pickPlayerName(playerRecord);
                    if (!name) {
                        return;
                    }
                    const typeLabel = pickText(
                        entryRecord.playerType,
                        entryRecord.type,
                        entryRecord.role,
                    );
                    const teamRecord = asRecord(entryRecord.team);
                    const teamLabel = pickText(
                        entryRecord.teamAbbrev,
                        teamRecord.abbrev,
                        entryRecord.team,
                        entryRecord.teamName,
                        teamRecord.name,
                    );
                    const position = pickPosition(entryRecord) ||
                        pickPosition(playerRecord) ||
                        undefined;
                    const sweaterNumber = asNumber(
                        entryRecord.sweaterNumber ??
                            entryRecord.jerseyNumber ??
                            playerRecord.sweaterNumber ??
                            playerRecord.jerseyNumber,
                    );
                    const key = `${playerId ?? name}-${typeLabel}-${teamLabel}`;
                    if (seenPlayers.has(key)) {
                        return;
                    }
                    seenPlayers.add(key);
                    players.push({
                        id: playerId !== null ? String(playerId) : undefined,
                        name,
                        type: typeLabel || undefined,
                        team: teamLabel || undefined,
                        position,
                        sweaterNumber,
                    });
                });
            });
            const playerSummary = (() => {
                if (!players.length) {
                    return undefined;
                }
                const scorerNames = players
                    .filter((player) =>
                        player.type
                            ? /scorer|goal/i.test(player.type)
                            : false,
                    )
                    .map((player) => player.name);
                const assistNames = players
                    .filter((player) =>
                        player.type
                            ? /assist/i.test(player.type)
                            : false,
                    )
                    .map((player) => player.name);
                const parts: string[] = [];
                if (scorerNames.length) {
                    parts.push(`Scorer: ${scorerNames.join(', ')}`);
                }
                if (assistNames.length) {
                    parts.push(`Assists: ${assistNames.join(', ')}`);
                }
                return parts.length ? parts.join(' | ') : undefined;
            })();

            return {
                id,
                period,
                time,
                description,
                type,
                category,
                team,
                players: players.length ? players : undefined,
                playerSummary,
                score,
                strength: strength || undefined,
                onIceStrength: situation?.onIceStrength,
                goaliePulled: situation?.goaliePulled,
                situationCode: situationCode || undefined,
                homeDefendingSide: homeDefendingSide || undefined,
                awaySog,
                homeSog,
                goalieInNetId:
                    goalieInNetId !== null ? String(goalieInNetId) : undefined,
                goalieInNetName: goalieInNetName || undefined,
                sortOrder,
                shotType: shotType || undefined,
                infraction: infraction || undefined,
                penaltyMinutes,
                committedBy: committedBy || undefined,
                drawnBy: drawnBy || undefined,
                zone,
                coordinates,
                reason: reason || undefined,
                videoUrl: videoUrl || undefined,
                pptReplayUrl: pptReplayUrl || undefined,
                blockedByTeam: blockedByTeam || undefined,
                goalTotals: goalTotalsEntry,
            };
        })
        .filter((event) => event.description || event.type);
};

export const parsePlayByPlayMeta = (
    payload: Record<string, unknown>,
): PlayByPlayMeta => {
    const record = asRecord(payload);
    const periodDescriptor = asRecord(record.periodDescriptor);
    const readBoolean = (value: unknown) =>
        value === null || value === undefined ? undefined : asBoolean(value);
    const displayPeriod = asNumber(
        record.displayPeriod ?? record.currentPeriod ?? record.period,
    );
    const maxPeriods = asNumber(
        record.maxPeriods ??
            record.regPeriods ??
            periodDescriptor.maxRegulationPeriods,
    );
    const tvBroadcastsRaw = asArray(record.tvBroadcasts)
        .map((item) => formatBroadcastLabel(asRecord(item)))
        .filter(Boolean);
    const tvBroadcasts = tvBroadcastsRaw.length
        ? Array.from(new Set(tvBroadcastsRaw))
        : undefined;
    return {
        gameState: pickText(record.gameState, record.status),
        gameScheduleState: pickText(
            record.gameScheduleState,
            record.gameScheduleStatus,
            record.scheduleState,
            record.gameScheduleStatusCode,
        ),
        venue: pickText(
            asRecord(record.venue).default,
            asRecord(record.venue).name,
            record.venue,
        ),
        tvBroadcasts,
        shootoutInUse: readBoolean(record.shootoutInUse),
        otInUse: readBoolean(record.otInUse),
        tiesInUse: readBoolean(record.tiesInUse),
        displayPeriod,
        maxPeriods,
    };
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
            const regulationWins = asNumber(
                record.regulationWins ?? record.regulationWin ?? record.rw,
            );
            const rowWins = asNumber(
                record.row ??
                    record.regulationAndOvertimeWins ??
                    record.regulationAndOtWins ??
                    record.regulationOtWins,
            );
            const overtimeWins = asNumber(
                record.overtimeWins ?? record.otWins ?? record.otw,
            );
            const overtimeLosses = asNumber(
                record.overtimeLosses ?? record.otLosses ?? record.otl,
            );
            const shootoutWins = asNumber(
                record.shootoutWins ?? record.shootoutWin ?? record.sow,
            );
            const shootoutLosses = asNumber(
                record.shootoutLosses ?? record.shootoutLoss ?? record.sol,
            );
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
                regulationWins,
                row: rowWins,
                overtimeWins,
                overtimeLosses,
                shootoutWins,
                shootoutLosses,
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
                const regulationWins = asNumber(
                    record.regulationWins ?? record.regulationWin ?? record.rw,
                );
                const rowWins = asNumber(
                    record.row ??
                        record.regulationAndOvertimeWins ??
                        record.regulationAndOtWins ??
                        record.regulationOtWins,
                );
                const overtimeWins = asNumber(
                    record.overtimeWins ?? record.otWins ?? record.otw,
                );
                const overtimeLosses = asNumber(
                    record.overtimeLosses ?? record.otLosses ?? record.otl,
                );
                const shootoutWins = asNumber(
                    record.shootoutWins ??
                        record.shootoutWin ??
                        record.sow,
                );
                const shootoutLosses = asNumber(
                    record.shootoutLosses ??
                        record.shootoutLoss ??
                        record.sol,
                );
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
                    regulationWins,
                    row: rowWins,
                    overtimeWins,
                    overtimeLosses,
                    shootoutWins,
                    shootoutLosses,
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
    const extraExcludedKeys = new Set(
        [
            'playerid',
            'player_id',
            'skaterid',
            'id',
            'fullname',
            'name',
            'firstname',
            'lastname',
            'team',
            'teamname',
            'teamabbrev',
            'teamid',
            'teamlogo',
            'teamlogolight',
            'teamlogodark',
            'teamlogourl',
            'headshot',
            'sweaternumber',
            'jerseynumber',
            'position',
            'positioncode',
            'positionabbrev',
            'gamesplayed',
            'gp',
            'games',
            'goals',
            'g',
            'assists',
            'a',
            'points',
            'p',
            'shots',
            'sog',
            'shotsongoal',
            'shotsongoals',
            'hits',
            'hit',
            'blocks',
            'blockedshots',
            'blocked',
            'shotsblocked',
            'toi',
            'timeonice',
            'timeonicestring',
            'avgtimeonice',
            'timeonicepergame',
            'plusminus',
            'plus_minus',
            'plusminusonice',
            'plusminustotal',
            'powerplaygoals',
            'ppgoals',
            'ppg',
            'powerplaypoints',
            'pppoints',
            'ppp',
            'shorthandedgoals',
            'shgoals',
            'shg',
            'gamewinninggoals',
            'gwg',
            'overtimegoals',
            'otgoals',
            'otg',
            'penaltyminutes',
            'pim',
            'penaltymins',
            'penaltyminutestotal',
            'faceoffwinpct',
            'faceoffpct',
            'faceoffpctg',
            'faceoffwinpercentage',
            'takeaways',
            'takeaway',
            'takeawaytotal',
            'giveaways',
            'giveaway',
            'giveawaytotal',
            'shootingpct',
            'shootingpctg',
            'shotpct',
            'shotpctg',
        ].map((key) => key.toLowerCase()),
    );

    const skaters = asArray(payload.skaters).length
        ? asArray(payload.skaters)
        : asArray(payload.data).length
          ? asArray(payload.data)
          : asArray(payload.players).length
            ? asArray(payload.players)
            : asArray(payload.playerStats);

    const parsedSkaters = skaters
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
            const extraStats: Record<string, number> = {};
            const extraFields: Record<string, string> = {};
            const collectExtraStats = (source: Record<string, unknown>) => {
                Object.entries(source).forEach(([key, value]) => {
                    const lowerKey = key.toLowerCase();
                    if (
                        extraExcludedKeys.has(lowerKey) ||
                        lowerKey === 'id' ||
                        lowerKey.endsWith('id')
                    ) {
                        return;
                    }
                    const numeric = asNumber(value);
                    if (numeric === null) {
                        return;
                    }
                    extraStats[key] = numeric;
                });
            };
            const collectExtraFields = (source: Record<string, unknown>) => {
                Object.entries(source).forEach(([key, value]) => {
                    const lowerKey = key.toLowerCase();
                    if (
                        extraExcludedKeys.has(lowerKey) ||
                        lowerKey === 'id' ||
                        lowerKey.endsWith('id')
                    ) {
                        return;
                    }
                    if (asNumber(value) !== null) {
                        return;
                    }
                    if (typeof value === 'string') {
                        const trimmed = value.trim();
                        if (!trimmed) {
                            return;
                        }
                        extraFields[key] = trimmed;
                        return;
                    }
                    if (typeof value === 'boolean') {
                        extraFields[key] = value ? 'Yes' : 'No';
                        return;
                    }
                    if (Array.isArray(value)) {
                        const textValues = value.filter(
                            (entry): entry is string =>
                                typeof entry === 'string' && entry.trim().length > 0,
                        );
                        if (textValues.length) {
                            extraFields[key] = textValues.join(', ');
                        }
                        return;
                    }
                    const recordValue = asRecord(value);
                    const defaultText = pickText(
                        (recordValue as { default?: string }).default,
                    );
                    if (defaultText) {
                        extraFields[key] = defaultText;
                    }
                });
            };
            const toiText = pickText(
                record.toi,
                record.timeOnIce,
                record.timeOnIceString,
                record.avgTimeOnIce,
                record.timeOnIcePerGame,
            );
            const toiNumber = asNumber(
                record.toi ??
                    record.timeOnIce ??
                    record.avgTimeOnIce ??
                    record.timeOnIcePerGame,
            );
            const toi =
                toiText || (toiNumber !== null ? String(toiNumber) : undefined);

            collectExtraStats(record);
            const statsRecord = asRecord(record.stats);
            if (Object.keys(statsRecord).length > 0) {
                collectExtraStats(statsRecord);
            }
            collectExtraFields(record);
            if (Object.keys(statsRecord).length > 0) {
                collectExtraFields(statsRecord);
            }

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
                hits: asNumber(record.hits ?? record.hit),
                blocks: asNumber(
                    record.blocks ??
                        record.blockedShots ??
                        record.blocked ??
                        record.shotsBlocked,
                ),
                toi,
                plusMinus: asNumber(
                    record.plusMinus ??
                        record.plus_minus ??
                        record.plusMinusOnIce ??
                        record.plusMinusTotal,
                ),
                powerPlayGoals: asNumber(
                    record.powerPlayGoals ?? record.ppGoals ?? record.ppg,
                ),
                powerPlayPoints: asNumber(
                    record.powerPlayPoints ??
                        record.ppPoints ??
                        record.ppp,
                ),
                shortHandedGoals: asNumber(
                    record.shortHandedGoals ?? record.shGoals ?? record.shg,
                ),
                gameWinningGoals: asNumber(
                    record.gameWinningGoals ?? record.gwg,
                ),
                overtimeGoals: asNumber(
                    record.overtimeGoals ?? record.otGoals ?? record.otg,
                ),
                penaltyMinutes: asNumber(
                    record.penaltyMinutes ??
                        record.pim ??
                        record.penaltyMins ??
                        record.penaltyMinutesTotal,
                ),
                faceoffWinPct: asNumber(
                    record.faceoffWinPct ??
                        record.faceoffPct ??
                        record.faceoffPctg ??
                        record.faceoffWinPercentage,
                ),
                takeaways: asNumber(
                    record.takeaways ?? record.takeaway ?? record.takeAway,
                ),
                giveaways: asNumber(
                    record.giveaways ?? record.giveaway ?? record.giveAway,
                ),
                shootingPct: asNumber(
                    record.shootingPct ??
                        record.shootingPctg ??
                        record.shotPct ??
                        record.shotPctg,
                ),
                extraStats: Object.keys(extraStats).length
                    ? extraStats
                    : undefined,
                extraFields: Object.keys(extraFields).length
                    ? extraFields
                    : undefined,
            };
        })
        .filter((player) => player.name);

    if (parsedSkaters.length) {
        return parsedSkaters;
    }

    const leadersRecord = asRecord(payload.leaders);
    if (!Object.keys(leadersRecord).length) {
        return [];
    }

    const leaderMap = new Map<string, PlayerRow>();
    const leaderIgnoredKeys = new Set(
        ['player'].map((key) => key.toLowerCase()),
    );
    const setLeaderValue = (
        player: PlayerRow,
        key: string,
        value: number | string,
        isNumeric: boolean,
    ) => {
        if (isNumeric) {
            if (!player.extraStats) {
                player.extraStats = {};
            }
            player.extraStats[key] = value as number;
        } else {
            if (!player.extraFields) {
                player.extraFields = {};
            }
            player.extraFields[key] = value as string;
        }
    };
    const collectLeaderValues = (
        player: PlayerRow,
        leaderKey: string,
        value: unknown,
        path: string[] = [],
        depth = 0,
    ) => {
        if (depth > 2 || value === null || value === undefined) {
            return;
        }
        if (typeof value === 'number') {
            setLeaderValue(
                player,
                `${leaderKey}.${path.join('.')}`,
                value,
                true,
            );
            return;
        }
        if (typeof value === 'string') {
            const trimmed = value.trim();
            if (!trimmed) {
                return;
            }
            setLeaderValue(
                player,
                `${leaderKey}.${path.join('.')}`,
                trimmed,
                false,
            );
            return;
        }
        if (typeof value === 'boolean') {
            setLeaderValue(
                player,
                `${leaderKey}.${path.join('.')}`,
                value ? 'Yes' : 'No',
                false,
            );
            return;
        }
        if (Array.isArray(value)) {
            return;
        }
        const recordValue = asRecord(value);
        Object.entries(recordValue).forEach(([childKey, childValue]) => {
            collectLeaderValues(
                player,
                leaderKey,
                childValue,
                [...path, childKey],
                depth + 1,
            );
        });
    };

    Object.entries(leadersRecord).forEach(([leaderKey, leaderValue]) => {
        const leaderRecord = asRecord(leaderValue);
        const playerRecord = asRecord(leaderRecord.player);
        const teamRecord = asRecord(playerRecord.team);
        const id = String(
            playerRecord.id ??
                playerRecord.playerId ??
                playerRecord.player_id ??
                playerRecord.skaterId ??
                playerRecord.goalkeeperId ??
                playerRecord.goalieId ??
                '',
        );
        if (!id) {
            return;
        }
        const name = pickPersonName(playerRecord) || 'Unknown';
    const team = pickText(
        teamRecord.abbrev,
        teamRecord.teamAbbrev,
        teamRecord.teamCode,
        teamRecord.teamName,
        playerRecord.teamAbbrev,
        playerRecord.teamAbbrevs,
    );
        const existing =
            leaderMap.get(id) ??
            ({
                id,
                name,
                team: team || undefined,
                position: pickPosition(playerRecord) || undefined,
                extraStats: {},
                extraFields: {},
            } satisfies PlayerRow);

        Object.entries(leaderRecord).forEach(([key, value]) => {
            if (leaderIgnoredKeys.has(key.toLowerCase())) {
                return;
            }
            collectLeaderValues(existing, leaderKey, value, [key]);
        });

        leaderMap.set(id, existing);
    });

    return Array.from(leaderMap.values()).filter((player) => player.name);
};

export const parseSkaterLeaders = (
    payload: Record<string, unknown>,
): PlayerRow[] => parseSkaterLanding(payload);

export const parseGoalieLeaders = (
    payload: Record<string, unknown>,
): GoalieLeader[] => {
    const extraExcludedKeys = new Set(
        [
            'playerid',
            'player_id',
            'goalieid',
            'id',
            'fullname',
            'name',
            'firstname',
            'lastname',
            'team',
            'teamname',
            'teamabbrev',
            'teamid',
            'teamlogo',
            'teamlogourl',
            'headshot',
            'sweaternumber',
            'jerseynumber',
            'position',
            'positioncode',
            'positionabbrev',
            'gamesplayed',
            'gp',
            'games',
            'wins',
            'win',
            'losses',
            'loss',
            'savepercentage',
            'savepct',
            'savepctg',
            'goalsagainstaverage',
            'goalsagainstavg',
            'gaa',
            'shutouts',
            'sho',
            'stats',
        ].map((key) => key.toLowerCase()),
    );
    const rows = asArray(
        (payload as { data?: unknown }).data ??
            payload.goalies ??
            payload.goalieStats ??
            payload.goalie ??
            payload.items,
    );

    return rows
        .map((goalie, index) => {
            const record = asRecord(goalie);
            const id = String(
                record.playerId ?? record.id ?? record.goalieId ?? index,
            );
            const name =
                pickPersonName(record) ||
                pickText(
                    record.goalieFullName,
                    record.fullName,
                    record.playerName,
                    record.lastName,
                );
            if (!name) {
                return null;
            }
            const extraStats: Record<string, number> = {};
            const extraFields: Record<string, string> = {};
            const collectExtraStats = (source: Record<string, unknown>) => {
                Object.entries(source).forEach(([key, value]) => {
                    const lowerKey = key.toLowerCase();
                    if (
                        extraExcludedKeys.has(lowerKey) ||
                        lowerKey === 'id' ||
                        lowerKey.endsWith('id')
                    ) {
                        return;
                    }
                    const numeric = asNumber(value);
                    if (numeric === null) {
                        return;
                    }
                    extraStats[key] = numeric;
                });
            };
            const collectExtraFields = (source: Record<string, unknown>) => {
                Object.entries(source).forEach(([key, value]) => {
                    const lowerKey = key.toLowerCase();
                    if (
                        extraExcludedKeys.has(lowerKey) ||
                        lowerKey === 'id' ||
                        lowerKey.endsWith('id')
                    ) {
                        return;
                    }
                    if (asNumber(value) !== null) {
                        return;
                    }
                    if (typeof value === 'string') {
                        const trimmed = value.trim();
                        if (!trimmed) {
                            return;
                        }
                        extraFields[key] = trimmed;
                        return;
                    }
                    if (typeof value === 'boolean') {
                        extraFields[key] = value ? 'Yes' : 'No';
                        return;
                    }
                    if (Array.isArray(value)) {
                        const textValues = value.filter(
                            (entry): entry is string =>
                                typeof entry === 'string' && entry.trim().length > 0,
                        );
                        if (textValues.length) {
                            extraFields[key] = textValues.join(', ');
                        }
                        return;
                    }
                    const recordValue = asRecord(value);
                    const defaultText = pickText(
                        (recordValue as { default?: string }).default,
                    );
                    if (defaultText) {
                        extraFields[key] = defaultText;
                    }
                });
            };
            collectExtraStats(record);
            const statsRecord = asRecord(record.stats);
            if (Object.keys(statsRecord).length > 0) {
                collectExtraStats(statsRecord);
            }
            collectExtraFields(record);
            if (Object.keys(statsRecord).length > 0) {
                collectExtraFields(statsRecord);
            }
            return {
                id,
                name,
                team: pickTeamLabel(record),
                gamesPlayed: asNumber(
                    record.gamesPlayed ?? record.games ?? record.gp,
                ),
                wins: asNumber(record.wins ?? record.win),
                losses: asNumber(record.losses ?? record.loss),
                savePercentage: asNumber(
                    record.savePercentage ??
                        record.savePct ??
                        record.savePctg,
                ),
                goalsAgainstAverage: asNumber(
                    record.goalsAgainstAverage ??
                        record.gaa ??
                        record.goalsAgainstAvg,
                ),
                shutouts: asNumber(record.shutouts ?? record.sho),
                extraStats: Object.keys(extraStats).length
                    ? extraStats
                    : undefined,
                extraFields: Object.keys(extraFields).length
                    ? extraFields
                    : undefined,
            } satisfies GoalieLeader;
        })
        .filter((goalie): goalie is GoalieLeader => goalie !== null);
};

export const parsePlayerGameLog = (
    payload: Record<string, unknown>,
): PlayerGameLogPayload | null => {
    const record = asRecord(payload);
    if (!Object.keys(record).length) {
        return null;
    }
    const seasons = asArray(
        record.playerStatsSeasons ??
            record.seasons ??
            record.statsSeasons ??
            record.seasonStats,
    )
        .map((entry) => {
            const entryRecord = asRecord(entry);
            const season = asNumber(entryRecord.season ?? entryRecord.id);
            const gameTypes = asArray(entryRecord.gameTypes)
                .map((value) => asNumber(value))
                .filter((value): value is number => value !== null);
            if (season === null) {
                return null;
            }
            return {
                season,
                gameTypes,
            } satisfies PlayerGameLogSeason;
        })
        .filter(
            (entry): entry is PlayerGameLogSeason => entry !== null,
        );

    const games = asArray(
        record.gameLog ??
            record.games ??
            record.gameLogs ??
            record.logs ??
            record.gameStats,
    )
        .map((entry) => {
            const entryRecord = asRecord(entry);
            const gameIdValue =
                entryRecord.gameId ?? entryRecord.game_id ?? entryRecord.id;
            const gameId = gameIdValue ? String(gameIdValue) : '';
            const gameDate = pickText(
                entryRecord.gameDate,
                entryRecord.date,
            );
            const opponentAbbrev = pickText(
                entryRecord.opponentAbbrev,
                entryRecord.opponentTeamAbbrev,
                entryRecord.opponent,
            );
            const opponentCommonName = pickText(
                (entryRecord.opponentCommonName as { default?: string })
                    ?.default,
                entryRecord.opponentCommonName,
            );
            const teamAbbrev = pickText(
                entryRecord.teamAbbrev,
                entryRecord.team,
                entryRecord.teamCode,
            );
            const teamCommonName = pickText(
                (entryRecord.commonName as { default?: string })?.default,
                entryRecord.commonName,
            );
            const homeRoad = pickText(
                entryRecord.homeRoadFlag,
                entryRecord.homeRoad,
                entryRecord.homeAway,
            );
            const toi = pickText(entryRecord.toi, entryRecord.timeOnIce);

            if (
                !gameId &&
                !gameDate &&
                !opponentAbbrev &&
                !teamAbbrev
            ) {
                return null;
            }

            return {
                gameId: gameId || undefined,
                gameDate: gameDate || undefined,
                opponentAbbrev: opponentAbbrev || undefined,
                opponentCommonName: opponentCommonName || undefined,
                teamAbbrev: teamAbbrev || undefined,
                teamCommonName: teamCommonName || undefined,
                homeRoad: homeRoad || undefined,
                goals: asNumber(entryRecord.goals),
                assists: asNumber(entryRecord.assists),
                points: asNumber(entryRecord.points),
                shots: asNumber(entryRecord.shots),
                pim: asNumber(
                    entryRecord.pim ??
                        entryRecord.penaltyMins ??
                        entryRecord.penaltyMinutes,
                ),
                plusMinus: asNumber(entryRecord.plusMinus),
                powerPlayGoals: asNumber(entryRecord.powerPlayGoals),
                powerPlayPoints: asNumber(entryRecord.powerPlayPoints),
                shorthandedGoals: asNumber(entryRecord.shorthandedGoals),
                shorthandedPoints: asNumber(entryRecord.shorthandedPoints),
                gameWinningGoals: asNumber(entryRecord.gameWinningGoals),
                otGoals: asNumber(entryRecord.otGoals),
                toi: toi || undefined,
                shifts: asNumber(entryRecord.shifts),
                gameTypeId: asNumber(entryRecord.gameTypeId),
                decision: pickText(entryRecord.decision),
                gamesStarted: asNumber(entryRecord.gamesStarted),
                shotsAgainst: asNumber(entryRecord.shotsAgainst),
                goalsAgainst: asNumber(entryRecord.goalsAgainst),
                savePct: asNumber(
                    entryRecord.savePctg ??
                        entryRecord.savePct ??
                        entryRecord.savePercentage,
                ),
                shutouts: asNumber(entryRecord.shutouts),
            } satisfies PlayerGameLog;
        })
        .filter((entry): entry is PlayerGameLog => entry !== null);

    return {
        seasonId: asNumber(record.seasonId),
        gameTypeId: asNumber(record.gameTypeId),
        seasons,
        games,
    } satisfies PlayerGameLogPayload;
};

const parseEdgeSeasons = (
    payload: Record<string, unknown>,
): EdgeSeasonAvailability[] => {
    return asArray(payload.seasonsWithEdgeStats)
        .map((entry) => {
            const entryRecord = asRecord(entry);
            const seasonId = asNumber(entryRecord.id ?? entryRecord.seasonId);
            const gameTypes = asArray(entryRecord.gameTypes)
                .map((value) => asNumber(value))
                .filter((value): value is number => value !== null);
            if (seasonId === null) {
                return null;
            }
            return {
                seasonId,
                gameTypes,
            } satisfies EdgeSeasonAvailability;
        })
        .filter(
            (entry): entry is EdgeSeasonAvailability => entry !== null,
        );
};

const parseEdgeOverlayTeam = (value: unknown): EdgeOverlayTeam | undefined => {
    const record = asRecord(value);
    if (!Object.keys(record).length) {
        return undefined;
    }
    const abbrev = pickText(record.abbrev, record.teamAbbrev);
    const score = asNumber(record.score);
    if (!abbrev && score === null) {
        return undefined;
    }
    return {
        abbrev: abbrev || undefined,
        score: score ?? undefined,
    } satisfies EdgeOverlayTeam;
};

const parseEdgeOverlay = (value: unknown): EdgeOverlay | undefined => {
    const record = asRecord(value);
    if (!Object.keys(record).length) {
        return undefined;
    }
    const periodRecord = asRecord(record.periodDescriptor);
    const outcomeRecord = asRecord(record.gameOutcome);
    const playerRecord = asRecord(record.player);
    const playerName = pickPersonName(playerRecord);
    const overlay = {
        playerName: playerName || undefined,
        gameDate: pickText(record.gameDate),
        timeInPeriod: pickText(record.timeInPeriod),
        period: asNumber(periodRecord.number),
        periodType: pickText(periodRecord.periodType),
        maxRegulationPeriods: asNumber(
            periodRecord.maxRegulationPeriods ??
                periodRecord.maxRegulationPeriod ??
                periodRecord.maxPeriods,
        ),
        gameType: asNumber(record.gameType),
        away: parseEdgeOverlayTeam(record.awayTeam),
        home: parseEdgeOverlayTeam(record.homeTeam),
        outcome: pickText(outcomeRecord.lastPeriodType, record.gameOutcome),
    } satisfies EdgeOverlay;
    if (
        !overlay.playerName &&
        !overlay.gameDate &&
        !overlay.timeInPeriod &&
        overlay.period === null &&
        !overlay.periodType &&
        overlay.gameType === null &&
        !overlay.away &&
        !overlay.home &&
        !overlay.outcome
    ) {
        return undefined;
    }
    return overlay;
};

const parseEdgeUnitMetric = (value: unknown): EdgeUnitMetric | undefined => {
    const record = asRecord(value);
    if (!Object.keys(record).length) {
        return undefined;
    }
    const leagueRecord = asRecord(record.leagueAvg);
    const metric = {
        imperial: asNumber(record.imperial),
        metric: asNumber(record.metric),
        percentile: asNumber(record.percentile),
        leagueAvgImperial: asNumber(leagueRecord.imperial),
        leagueAvgMetric: asNumber(leagueRecord.metric),
        overlay: parseEdgeOverlay(record.overlay),
    } satisfies EdgeUnitMetric;
    if (
        metric.imperial === null &&
        metric.metric === null &&
        metric.percentile === null &&
        metric.leagueAvgImperial === null &&
        metric.leagueAvgMetric === null &&
        !metric.overlay
    ) {
        return undefined;
    }
    return metric;
};

const parseEdgeValueMetric = (value: unknown): EdgeValueMetric | undefined => {
    const record = asRecord(value);
    if (!Object.keys(record).length) {
        const direct = asNumber(value);
        if (direct === null) {
            return undefined;
        }
        return {
            value: direct,
        };
    }
    const metric = {
        value: asNumber(record.value ?? record.val),
        percentile: asNumber(record.percentile),
        leagueAvg: asNumber(record.leagueAvg),
    } satisfies EdgeValueMetric;
    if (
        metric.value === null &&
        metric.percentile === null &&
        metric.leagueAvg === null
    ) {
        return undefined;
    }
    return metric;
};

const parseSkaterTracking = (
    payload: Record<string, unknown>,
): EdgeSkaterTracking | undefined => {
    const topShotSpeed = parseEdgeUnitMetric(payload.topShotSpeed);
    const skatingSpeedRecord = asRecord(payload.skatingSpeed);
    const speedMax = parseEdgeUnitMetric(skatingSpeedRecord.speedMax);
    const burstsOver20 = parseEdgeValueMetric(
        skatingSpeedRecord.burstsOver20 ??
            skatingSpeedRecord.speedBursts ??
            skatingSpeedRecord.bursts,
    );
    const totalDistance = parseEdgeUnitMetric(
        payload.totalDistanceSkated,
    );
    const distanceMaxGame = parseEdgeUnitMetric(
        payload.distanceMaxGame ?? payload.maxGameDistance,
    );
    const zoneRecord = asRecord(payload.zoneTimeDetails);
    const zoneTime: EdgeZoneTime = {};
    const offensive = parseEdgeValueMetric({
        value: zoneRecord.offensiveZonePctg,
        percentile: zoneRecord.offensiveZonePercentile,
        leagueAvg: zoneRecord.offensiveZoneLeagueAvg,
    });
    const neutral = parseEdgeValueMetric({
        value: zoneRecord.neutralZonePctg,
        percentile: zoneRecord.neutralZonePercentile,
        leagueAvg: zoneRecord.neutralZoneLeagueAvg,
    });
    const defensive = parseEdgeValueMetric({
        value: zoneRecord.defensiveZonePctg,
        percentile: zoneRecord.defensiveZonePercentile,
        leagueAvg: zoneRecord.defensiveZoneLeagueAvg,
    });
    if (offensive) {
        zoneTime.offensive = offensive;
    }
    if (neutral) {
        zoneTime.neutral = neutral;
    }
    if (defensive) {
        zoneTime.defensive = defensive;
    }
    const zoneTimeValue =
        Object.keys(zoneTime).length > 0 ? zoneTime : undefined;

    const shotSummary = asArray(payload.sogSummary)
        .map((entry) => {
            const entryRecord = asRecord(entry);
            const locationCode = pickText(entryRecord.locationCode);
            if (!locationCode) {
                return null;
            }
            return {
                locationCode,
                shots: asNumber(entryRecord.shots),
                shotsPercentile: asNumber(entryRecord.shotsPercentile),
                shotsLeagueAvg: asNumber(entryRecord.shotsLeagueAvg),
                goals: asNumber(entryRecord.goals),
                goalsPercentile: asNumber(entryRecord.goalsPercentile),
                goalsLeagueAvg: asNumber(entryRecord.goalsLeagueAvg),
                shootingPct: asNumber(entryRecord.shootingPctg),
                shootingPctPercentile: asNumber(
                    entryRecord.shootingPctgPercentile,
                ),
                shootingPctLeagueAvg: asNumber(
                    entryRecord.shootingPctgLeagueAvg,
                ),
            } satisfies EdgeSkaterShotSummary;
        })
        .filter(
            (entry): entry is EdgeSkaterShotSummary => entry !== null,
        );
    const shotDetails = asArray(payload.sogDetails)
        .map((entry) => {
            const entryRecord = asRecord(entry);
            const area = pickText(entryRecord.area);
            if (!area) {
                return null;
            }
            return {
                area,
                shots: asNumber(entryRecord.shots),
                shotsPercentile: asNumber(entryRecord.shotsPercentile),
            } satisfies EdgeSkaterShotDetail;
        })
        .filter(
            (entry): entry is EdgeSkaterShotDetail => entry !== null,
        );

    const tracking = {
        topShotSpeed: topShotSpeed || undefined,
        speedMax: speedMax || undefined,
        burstsOver20: burstsOver20 || undefined,
        totalDistance: totalDistance || undefined,
        distanceMaxGame: distanceMaxGame || undefined,
        zoneTime: zoneTimeValue,
        shotSummary: shotSummary.length ? shotSummary : undefined,
        shotDetails: shotDetails.length ? shotDetails : undefined,
    } satisfies EdgeSkaterTracking;

    if (
        !tracking.topShotSpeed &&
        !tracking.speedMax &&
        !tracking.burstsOver20 &&
        !tracking.totalDistance &&
        !tracking.distanceMaxGame &&
        !tracking.zoneTime &&
        !tracking.shotSummary &&
        !tracking.shotDetails
    ) {
        return undefined;
    }
    return tracking;
};

const parseGoalieTracking = (
    payload: Record<string, unknown>,
): EdgeGoalieTracking | undefined => {
    const statsRecord = asRecord(payload.stats);
    const statsEntries = Object.entries(statsRecord).reduce<
        Record<string, EdgeValueMetric>
    >((acc, [key, value]) => {
        const metric = parseEdgeValueMetric(value);
        if (!metric) {
            return acc;
        }
        acc[key] = metric;
        return acc;
    }, {});
    const stats = Object.keys(statsEntries).length
        ? statsEntries
        : undefined;

    const shotSummary = asArray(payload.shotLocationSummary)
        .map((entry) => {
            const entryRecord = asRecord(entry);
            const locationCode = pickText(entryRecord.locationCode);
            if (!locationCode) {
                return null;
            }
            return {
                locationCode,
                goalsAgainst: asNumber(entryRecord.goalsAgainst),
                goalsAgainstPercentile: asNumber(
                    entryRecord.goalsAgainstPercentile,
                ),
                goalsAgainstLeagueAvg: asNumber(
                    entryRecord.goalsAgainstLeagueAvg,
                ),
                saves: asNumber(entryRecord.saves),
                savesPercentile: asNumber(entryRecord.savesPercentile),
                savesLeagueAvg: asNumber(entryRecord.savesLeagueAvg),
                savePct: asNumber(
                    entryRecord.savePctg ??
                        entryRecord.savePct ??
                        entryRecord.savePercentage,
                ),
                savePctPercentile: asNumber(
                    entryRecord.savePctgPercentile,
                ),
                savePctLeagueAvg: asNumber(
                    entryRecord.savePctgLeagueAvg,
                ),
            } satisfies EdgeGoalieShotSummary;
        })
        .filter(
            (entry): entry is EdgeGoalieShotSummary => entry !== null,
        );

    const shotDetails = asArray(payload.shotLocationDetails)
        .map((entry) => {
            const entryRecord = asRecord(entry);
            const area = pickText(entryRecord.area);
            if (!area) {
                return null;
            }
            return {
                area,
                saves: asNumber(entryRecord.saves),
                savesPercentile: asNumber(entryRecord.savesPercentile),
                savePct: asNumber(
                    entryRecord.savePctg ??
                        entryRecord.savePct ??
                        entryRecord.savePercentage,
                ),
                savePctPercentile: asNumber(
                    entryRecord.savePctgPercentile,
                ),
            } satisfies EdgeGoalieShotDetail;
        })
        .filter(
            (entry): entry is EdgeGoalieShotDetail => entry !== null,
        );

    if (!stats && shotSummary.length === 0 && shotDetails.length === 0) {
        return undefined;
    }
    return {
        stats,
        shotSummary: shotSummary.length ? shotSummary : undefined,
        shotDetails: shotDetails.length ? shotDetails : undefined,
    } satisfies EdgeGoalieTracking;
};

const parseEdgeDetail = (
    payload: Record<string, unknown>,
    fallback: PlayerRow | undefined,
    metricOptions: Array<[string, string]>,
): SkaterDetail | null => {
    const candidates = [
        payload.player,
        payload.skater,
        payload.goalie,
        payload.playerStats,
        payload.skaterDetail,
        payload.goalieDetail,
        payload.data,
        payload,
    ];
    const record =
        candidates
            .map((candidate) => asRecord(candidate))
            .find((candidate) => Object.keys(candidate).length > 0) || {};
    const name = pickPersonName(record) || fallback?.name;
    const teamRecord = asRecord(record.team);
    const teamLogoRecord = asRecord(teamRecord.teamLogo);
    const teamLogoLight = pickText(
        teamLogoRecord.light,
        teamLogoRecord.default,
        teamLogoRecord.lightUrl,
        teamRecord.logo,
        teamRecord.logoUrl,
    );
    const teamLogoDark = pickText(
        teamLogoRecord.dark,
        teamLogoRecord.darkUrl,
    );
    const id = String(
        record.playerId ??
            record.player_id ??
            record.skaterId ??
            record.goalieId ??
            record.id ??
            fallback?.id ??
            '',
    );

    if (!id) {
        return null;
    }

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

    const metricKeys = new Set(
        metricOptions.map(([key]) => key.toLowerCase()),
    );
    const extraExcluded = new Set(
        [
            'id',
            'playerid',
            'player_id',
            'skaterid',
            'goalieid',
            'name',
            'fullname',
            'firstname',
            'lastname',
            'team',
            'teamid',
            'teamname',
            'teamabbrev',
            'teamlogo',
            'teamlogolight',
            'teamlogodark',
            'teamlogourl',
            'position',
            'positioncode',
            'positionabbrev',
            'sweaternumber',
            'jerseynumber',
            'headshot',
            'badges',
            'awards',
            'links',
            'stats',
        ].map((key) => key.toLowerCase()),
    );
    const extraMetricKeys = new Set<string>();
    const extraMetrics: Array<{ label: string; value: string | number }> = [];
    const arrayLabelKeys = [
        'label',
        'name',
        'type',
        'category',
        'area',
        'location',
        'locationCode',
        'zone',
        'strength',
        'situation',
        'metric',
        'stat',
        'statLabel',
        'code',
        'key',
    ];
    const arrayValueKeys = [
        'value',
        'val',
        'count',
        'total',
        'pct',
        'percent',
        'percentile',
        'rate',
        'score',
        'goals',
        'shots',
        'saves',
        'distance',
        'speed',
        'time',
        'minutes',
    ];
    const maxArrayEntries = 8;
    const maxArrayPrimitiveEntries = 6;
    const addExtraMetric = (
        key: string,
        value: unknown,
        labelOverride?: string,
    ) => {
        const lowerKey = key.toLowerCase();
        if (metricKeys.has(lowerKey) || extraExcluded.has(lowerKey)) {
            return;
        }
        if (lowerKey.endsWith('id')) {
            return;
        }
        if (extraMetricKeys.has(lowerKey)) {
            return;
        }

        let resolved: string | number | null = null;
        if (typeof value === 'number') {
            resolved = value;
        } else if (typeof value === 'string') {
            const trimmed = value.trim();
            if (!trimmed) {
                return;
            }
            const numeric = asNumber(trimmed);
            resolved = numeric === null ? trimmed : numeric;
        } else if (typeof value === 'boolean') {
            resolved = value ? 'Yes' : 'No';
        } else if (value && typeof value === 'object' && !Array.isArray(value)) {
            const valueRecord = asRecord(value);
            const numeric = asNumber(valueRecord.value);
            if (numeric !== null) {
                resolved = numeric;
            } else {
                const text = pickText(
                    (valueRecord as { default?: string }).default,
                );
                if (text) {
                    resolved = text;
                }
            }
        }

        if (resolved === null || resolved === '') {
            return;
        }
        extraMetricKeys.add(lowerKey);
        extraMetrics.push({
            label: labelOverride ?? formatMetricLabel(key),
            value: resolved,
        });
    };

    const pickArrayLabel = (entryRecord: Record<string, unknown>) =>
        pickText(
            entryRecord.label,
            entryRecord.name,
            entryRecord.type,
            entryRecord.category,
            entryRecord.area,
            entryRecord.location,
            entryRecord.locationCode,
            entryRecord.zone,
            entryRecord.strength,
            entryRecord.situation,
            entryRecord.metric,
            entryRecord.stat,
            entryRecord.statLabel,
            entryRecord.code,
            entryRecord.key,
        );

    const pickArrayValueKey = (
        entryRecord: Record<string, unknown>,
    ): string | undefined =>
        arrayValueKeys.find(
            (entryKey) =>
                entryRecord[entryKey] !== undefined &&
                entryRecord[entryKey] !== null &&
                entryRecord[entryKey] !== '',
        );

    const collectArrayMetrics = (prefix: string, values: unknown[]) => {
        if (!values.length) {
            return;
        }

        const primitiveValues = values.filter(
            (value) =>
                typeof value === 'string' ||
                typeof value === 'number' ||
                typeof value === 'boolean',
        );
        if (primitiveValues.length === values.length) {
            if (primitiveValues.length <= maxArrayPrimitiveEntries) {
                const joined = primitiveValues
                    .map((value) =>
                        typeof value === 'boolean'
                            ? value
                                ? 'Yes'
                                : 'No'
                            : String(value).trim(),
                    )
                    .filter((value) => value)
                    .join(', ');
                if (joined) {
                    addExtraMetric(prefix, joined);
                }
            }
            return;
        }

        let added = 0;
        values.forEach((entry, index) => {
            if (added >= maxArrayEntries) {
                return;
            }
            const entryRecord = asRecord(entry);
            if (!Object.keys(entryRecord).length) {
                return;
            }

            const labelValue = pickArrayLabel(entryRecord);
            const label = labelValue
                ? formatMetricLabel(labelValue)
                : `#${index + 1}`;
            const valueKey = pickArrayValueKey(entryRecord);
            if (valueKey) {
                addExtraMetric(
                    `${prefix}.${labelValue ?? valueKey}`,
                    entryRecord[valueKey],
                    `${formatMetricLabel(prefix)} ${label}`,
                );
                added += 1;
                return;
            }

            const fallbackEntry = Object.entries(entryRecord).find(
                ([entryKey, entryValue]) => {
                    if (
                        entryValue === undefined ||
                        entryValue === null ||
                        entryValue === ''
                    ) {
                        return false;
                    }
                    const lowerEntryKey = entryKey.toLowerCase();
                    if (
                        lowerEntryKey.endsWith('id') ||
                        arrayLabelKeys.some(
                            (labelKey) =>
                                labelKey.toLowerCase() === lowerEntryKey,
                        )
                    ) {
                        return false;
                    }
                    return (
                        typeof entryValue === 'number' ||
                        typeof entryValue === 'string' ||
                        typeof entryValue === 'boolean'
                    );
                },
            );

            if (fallbackEntry) {
                const [entryKey, entryValue] = fallbackEntry;
                addExtraMetric(
                    `${prefix}.${labelValue ?? entryKey}`,
                    entryValue,
                    `${formatMetricLabel(prefix)} ${label}`,
                );
                added += 1;
            }
        });
    };

    const collectNestedMetrics = (prefix: string, value: unknown) => {
        if (Array.isArray(value)) {
            collectArrayMetrics(prefix, value);
            return;
        }
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
            return;
        }
        const nestedRecord = asRecord(value);
        Object.entries(nestedRecord).forEach(([nestedKey, nestedValue]) => {
            const label = `${formatMetricLabel(prefix)} ${formatMetricLabel(
                nestedKey,
            )}`;
            addExtraMetric(`${prefix}.${nestedKey}`, nestedValue, label);
        });
    };

    const collectExtraMetrics = (source: Record<string, unknown>) => {
        Object.entries(source).forEach(([key, value]) => {
            addExtraMetric(key, value);
            const lowerKey = key.toLowerCase();
            if (
                extraExcluded.has(lowerKey) ||
                metricKeys.has(lowerKey) ||
                lowerKey.endsWith('id')
            ) {
                return;
            }
            collectNestedMetrics(key, value);
        });
    };

    collectExtraMetrics(record);
    const statsRecord = asRecord(record.stats);
    if (Object.keys(statsRecord).length > 0) {
        collectExtraMetrics(statsRecord);
    }

    extraMetrics.sort((a, b) => a.label.localeCompare(b.label));
    const allMetrics = [...metrics, ...extraMetrics];

    return {
        id,
        name: name || 'Unknown',
        team: pickTeamLabel(record) || fallback?.team,
        position: pickPosition(record) || fallback?.position,
        teamLogoLight: teamLogoLight || undefined,
        teamLogoDark: teamLogoDark || undefined,
        metrics: allMetrics,
    };
};

export const parseSkaterDetail = (
    payload: Record<string, unknown>,
    fallback?: PlayerRow,
): SkaterDetail | null => {
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

    const detail = parseEdgeDetail(payload, fallback, metricOptions);
    if (!detail) {
        return null;
    }
    const edgeSeasons = parseEdgeSeasons(payload);
    const skaterTracking = parseSkaterTracking(payload);
    return {
        ...detail,
        edgeSeasons: edgeSeasons.length ? edgeSeasons : undefined,
        skaterTracking,
    };
};

export const parseGoalieDetail = (
    payload: Record<string, unknown>,
    fallback?: PlayerRow,
): SkaterDetail | null => {
    const metricOptions: Array<[string, string]> = [
        ['gamesPlayed', 'Games'],
        ['gamesStarted', 'Starts'],
        ['wins', 'Wins'],
        ['losses', 'Losses'],
        ['overtimeLosses', 'OT losses'],
        ['shotsAgainst', 'Shots against'],
        ['saves', 'Saves'],
        ['goalsAgainst', 'Goals against'],
        ['savePct', 'Save %'],
        ['savePctg', 'Save %'],
        ['savePercentage', 'Save %'],
        ['goalsAgainstAverage', 'GAA'],
        ['goalsAgainstAvg', 'GAA'],
        ['shutouts', 'Shutouts'],
        ['timeOnIce', 'TOI'],
        ['avgTimeOnIce', 'Avg TOI'],
        ['qualityStarts', 'Quality starts'],
        ['qualityStartPct', 'Quality start %'],
        ['highDangerSavePct', 'HD save %'],
        ['mediumDangerSavePct', 'MD save %'],
        ['lowDangerSavePct', 'LD save %'],
    ];

    const detail = parseEdgeDetail(payload, fallback, metricOptions);
    if (!detail) {
        return null;
    }
    const edgeSeasons = parseEdgeSeasons(payload);
    const goalieTracking = parseGoalieTracking(payload);
    return {
        ...detail,
        edgeSeasons: edgeSeasons.length ? edgeSeasons : undefined,
        goalieTracking,
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

export const parsePlayerLanding = (
    payload: Record<string, unknown>,
    fallback?: RosterPlayer,
): PlayerLanding | null => {
    const record = asRecord(payload);
    if (!Object.keys(record).length) {
        return null;
    }

    const idValue =
        record.playerId ?? record.player_id ?? record.id ?? fallback?.id;
    const id = idValue ? String(idValue) : '';
    if (!id) {
        return null;
    }

    const firstNameRecord = asRecord(record.firstName);
    const lastNameRecord = asRecord(record.lastName);
    const firstName = pickText(
        (firstNameRecord as { default?: string }).default,
        record.firstName,
    );
    const firstNameFr = pickText(
        (firstNameRecord as { fr?: string }).fr,
    );
    const lastName = pickText(
        (lastNameRecord as { default?: string }).default,
        record.lastName,
    );
    const lastNameFr = pickText(
        (lastNameRecord as { fr?: string }).fr,
    );
    const readBoolean = (value: unknown) =>
        value === null || value === undefined ? undefined : asBoolean(value);
    const birthCity = pickText(
        (record.birthCity as { default?: string })?.default,
        record.birthCity,
    );
    const birthState = pickText(
        (record.birthStateProvince as { default?: string })?.default,
        record.birthStateProvince,
    );
    const birthCountry = pickText(
        (record.birthCountry as { default?: string })?.default,
        record.birthCountry,
    );
    const nationality = pickText(
        (record.nationality as { default?: string })?.default,
        record.nationality,
        record.nationalityCode,
    );

    const teamRecord = asRecord(record.currentTeam ?? record.team);
    const teamId = asNumber(
        record.currentTeamId ?? record.teamId ?? teamRecord.id,
    );
    const teamAbbrev = pickText(
        record.currentTeamAbbrev,
        record.teamAbbrev,
        pickTeamAbbrev(teamRecord),
    );
    const fullTeamNameRecord = asRecord(record.fullTeamName);
    const teamCommonNameRecord = asRecord(record.teamCommonName);
    const teamPlaceNameRecord = asRecord(
        record.teamPlaceNameWithPreposition,
    );
    const fullTeamName = pickText(
        (fullTeamNameRecord as { default?: string })?.default,
        record.fullTeamName,
    );
    const fullTeamNameFr = pickText(
        (fullTeamNameRecord as { fr?: string })?.fr,
    );
    const teamCommonName = pickText(
        (teamCommonNameRecord as { default?: string })?.default,
        record.teamCommonName,
    );
    const teamCommonNameFr = pickText(
        (teamCommonNameRecord as { fr?: string })?.fr,
    );
    const teamPlaceNameWithPreposition = pickText(
        (teamPlaceNameRecord as { default?: string })?.default,
        record.teamPlaceNameWithPreposition,
    );
    const teamPlaceNameWithPrepositionFr = pickText(
        (teamPlaceNameRecord as { fr?: string })?.fr,
    );
    const teamName = pickText(
        fullTeamName,
        teamCommonName,
        teamPlaceNameWithPreposition,
        (record.currentTeamName as { default?: string })?.default,
        record.currentTeamName,
        pickTeamName(teamRecord),
    );
    const teamLogo = pickText(
        teamRecord.logo,
        teamRecord.logoUrl,
        record.currentTeamLogo,
        record.currentTeamLogoUrl,
        record.teamLogo,
        record.logo,
    );

    const draftRecord = asRecord(
        record.draft ?? record.draftDetails ?? record.draftInfo,
    );
    const draftTeamRecord = asRecord(
        record.draftTeam ?? draftRecord.team ?? draftRecord.draftTeam,
    );
    const draft = (() => {
        const draftYear = pickNumeric(
            record.draftYear,
            draftRecord.year,
            draftRecord.draftYear,
        );
        const draftRound = pickNumeric(
            record.draftRound,
            draftRecord.round,
            draftRecord.draftRound,
        );
        const draftPickInRound = pickNumeric(
            draftRecord.pickInRound ?? record.draftPickInRound,
        );
        const draftPick = pickNumeric(
            record.draftPick,
            record.draftOverallPick,
            draftRecord.pick,
            draftRecord.draftPick,
            draftRecord.overallPick,
        );
        const draftOverall = pickNumeric(
            record.draftOverall,
            record.draftOverallPick,
            draftRecord.overall,
            draftRecord.overallPick,
        );
        const draftTeamId = asNumber(
            record.draftTeamId ?? draftRecord.teamId ?? draftTeamRecord.id,
        );
        const draftTeamName = pickText(
            (record.draftTeamName as { default?: string })?.default,
            record.draftTeamName,
            (draftRecord.teamName as { default?: string })?.default,
            draftRecord.teamName,
            pickTeamName(draftTeamRecord),
        );
        const draftTeamAbbrev = pickText(
            record.draftTeamAbbrev,
            record.draftTeamCode,
            draftRecord.teamAbbrev,
            draftRecord.teamCode,
            pickTeamAbbrev(draftTeamRecord),
        );
        const draftTeamLogo = pickText(
            record.draftTeamLogo,
            draftRecord.teamLogo,
            draftTeamRecord.logo,
            draftTeamRecord.logoUrl,
        );
        if (
            draftYear === null &&
            draftRound === null &&
            draftPick === null &&
            draftOverall === null &&
            !draftTeamName &&
            !draftTeamAbbrev &&
            !draftTeamLogo &&
            draftTeamId === null
        ) {
            return undefined;
        }
        return {
            year: draftYear ?? undefined,
            round: draftRound ?? undefined,
            pickInRound: draftPickInRound ?? undefined,
            pick: draftPick ?? undefined,
            overall: draftOverall ?? undefined,
            teamId: draftTeamId ?? undefined,
            teamName: draftTeamName || undefined,
            teamAbbrev: draftTeamAbbrev || undefined,
            teamLogo: draftTeamLogo || undefined,
        } satisfies PlayerDraft;
    })();

    const heightInches = asNumber(record.heightInInches);
    const heightCm = asNumber(record.heightInCentimeters);
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
    const heroImage = pickText(
        record.heroImage,
        record.heroImageUrl,
        record.heroImageURL,
        record.hero,
        record.backgroundImage,
    );
    const weightKg = asNumber(record.weightInKilograms);
    const rosterStatus = pickText(
        record.rosterStatus,
        record.rosterStatusCode,
        record.playerStatus,
        record.status,
    );
    const status = pickText(record.status, record.rosterStatus);
    const isActive = readBoolean(
        record.isActive ?? record.active ?? record.rosterActive,
    );
    const captain = readBoolean(
        record.captain ??
            record.isCaptain ??
            record.teamCaptain ??
            record.isTeamCaptain,
    );
    const alternateCaptain = readBoolean(
        record.alternateCaptain ??
            record.isAlternateCaptain ??
            record.assistantCaptain ??
            record.isAssistantCaptain,
    );
    const injuryStatus = pickText(
        record.injuryStatus,
        record.injuryStatusDesc,
        record.injury,
    );
    const suspensionStatusFlag = readBoolean(
        record.suspended ?? record.isSuspended,
    );
    const suspensionStatus =
        pickText(
            record.suspensionStatus,
            record.suspension,
            record.suspensionDesc,
        ) || (suspensionStatusFlag ? 'Suspended' : '');

    const featuredStatsRecord = asRecord(record.featuredStats);
    const extractStats = (value: Record<string, unknown>) => {
        const subSeason = asRecord(
            value.subSeason ??
                value.subseason ??
                value.seasonTotals ??
                value.statTotals ??
                value.stats ??
                value.statLine ??
                value.statSummary,
        );
        return Object.keys(subSeason).length ? subSeason : value;
    };
    const seasonTotalsRaw = asArray(
        record.seasonTotals ??
            record.seasonTotalsBySeason ??
            record.seasonStats ??
            record.statsBySeason ??
            record.seasons,
    );
    const seasonTotals = seasonTotalsRaw
        .map((entry) => {
            const entryRecord = asRecord(entry);
            const team = asRecord(
                entryRecord.team ??
                    entryRecord.teamInfo ??
                    entryRecord.teamData ??
                    entryRecord.currentTeam,
            );
            const statsRecord = extractStats(
                asRecord(
                    entryRecord.stats ??
                        entryRecord.statTotals ??
                        entryRecord.seasonTotals ??
                        entryRecord.totals ??
                        entryRecord.statLine ??
                        entryRecord,
                ),
            );
            if (!Object.keys(statsRecord).length) {
                return null;
            }
            const entryTeamName = pickText(
                (entryRecord.teamName as { default?: string })?.default,
                entryRecord.teamName,
                (entryRecord.fullTeamName as { default?: string })?.default,
                entryRecord.fullTeamName,
                (entryRecord.teamCommonName as { default?: string })?.default,
                entryRecord.teamCommonName,
                (entryRecord.teamPlaceNameWithPreposition as { default?: string })?.default,
                entryRecord.teamPlaceNameWithPreposition,
            );
            return {
                season: asNumber(
                    entryRecord.seasonId ??
                        entryRecord.season ??
                        entryRecord.seasonIdRaw,
                ),
                gameTypeId: asNumber(entryRecord.gameTypeId),
                league: pickText(
                    entryRecord.leagueAbbrev,
                    entryRecord.league,
                    entryRecord.leagueName,
                ),
                teamName: entryTeamName || pickTeamName(team) || undefined,
                teamAbbrev:
                    pickText(entryRecord.teamAbbrev) ||
                    pickTeamAbbrev(team) ||
                    undefined,
                teamLogo: pickText(
                    entryRecord.teamLogo,
                    team.logo,
                    team.logoUrl,
                ),
                stats: statsRecord,
            } satisfies PlayerSeasonTotals;
        })
        .filter(
            (entry): entry is PlayerSeasonTotals => entry !== null,
        );
    const careerTotalsRecord = asRecord(
        record.careerTotals ??
            record.careerTotalsSummary ??
            record.careerStats ??
            record.careerTotalsBySeason ??
            record.careerTotal ??
            record.career,
    );
    const careerTotals = Object.keys(careerTotalsRecord).length
        ? extractStats(careerTotalsRecord)
        : undefined;
    const lastFiveRaw =
        record.lastFiveGames ??
        record.lastFive ??
        record.last5Games ??
        record.recentGames;
    const lastFiveGames = asArray(lastFiveRaw)
        .map((entry) => {
            const entryRecord = asRecord(entry);
            const gameIdValue =
                entryRecord.gameId ?? entryRecord.game_id ?? entryRecord.id;
            const gameId = gameIdValue ? String(gameIdValue) : '';
            const gameDate = pickText(
                entryRecord.gameDate,
                entryRecord.date,
            );
            const opponentAbbrev = pickText(
                entryRecord.opponentAbbrev,
                entryRecord.opponentTeamAbbrev,
                entryRecord.opponent,
            );
            const opponentCommonName = pickText(
                (entryRecord.opponentCommonName as { default?: string })?.default,
                entryRecord.opponentCommonName,
            );
            const teamAbbrev = pickText(
                entryRecord.teamAbbrev,
                entryRecord.team,
                entryRecord.teamCode,
            );
            const teamCommonName = pickText(
                (entryRecord.commonName as { default?: string })?.default,
                entryRecord.commonName,
            );
            const homeRoad = pickText(
                entryRecord.homeRoadFlag,
                entryRecord.homeRoad,
                entryRecord.homeAway,
            );
            const toi = pickText(entryRecord.toi, entryRecord.timeOnIce);
            if (
                !gameId &&
                !gameDate &&
                !opponentAbbrev &&
                !teamAbbrev
            ) {
                return null;
            }
            return {
                gameId: gameId || undefined,
                gameDate: gameDate || undefined,
                opponentAbbrev: opponentAbbrev || undefined,
                opponentCommonName: opponentCommonName || undefined,
                teamAbbrev: teamAbbrev || undefined,
                teamCommonName: teamCommonName || undefined,
                homeRoad: homeRoad || undefined,
                goals: asNumber(entryRecord.goals),
                assists: asNumber(entryRecord.assists),
                points: asNumber(entryRecord.points),
                shots: asNumber(entryRecord.shots),
                pim: asNumber(
                    entryRecord.pim ??
                        entryRecord.penaltyMins ??
                        entryRecord.penaltyMinutes,
                ),
                plusMinus: asNumber(entryRecord.plusMinus),
                powerPlayGoals: asNumber(entryRecord.powerPlayGoals),
                powerPlayPoints: asNumber(entryRecord.powerPlayPoints),
                shorthandedGoals: asNumber(entryRecord.shorthandedGoals),
                shorthandedPoints: asNumber(entryRecord.shorthandedPoints),
                gameWinningGoals: asNumber(entryRecord.gameWinningGoals),
                otGoals: asNumber(entryRecord.otGoals),
                toi: toi || undefined,
                shifts: asNumber(entryRecord.shifts),
                gameTypeId: asNumber(entryRecord.gameTypeId),
                decision: pickText(entryRecord.decision),
                gamesStarted: asNumber(entryRecord.gamesStarted),
                shotsAgainst: asNumber(entryRecord.shotsAgainst),
                goalsAgainst: asNumber(entryRecord.goalsAgainst),
                savePct: asNumber(entryRecord.savePctg),
                shutouts: asNumber(entryRecord.shutouts),
            } satisfies PlayerGameLog;
        })
        .filter((entry): entry is PlayerGameLog => entry !== null);
    const regularSeasonRecord = asRecord(
        featuredStatsRecord.regularSeason ?? featuredStatsRecord.regular,
    );
    const playoffsRecord = asRecord(
        featuredStatsRecord.playoffs ?? featuredStatsRecord.postseason,
    );
    const careerRecord = asRecord(
        featuredStatsRecord.career ??
            featuredStatsRecord.careerTotals ??
            featuredStatsRecord.careerTotalsSummary ??
            featuredStatsRecord.careerStats ??
            featuredStatsRecord.careerTotalsBySeason ??
            featuredStatsRecord.careerTotal ??
            regularSeasonRecord.career ??
            regularSeasonRecord.careerTotals ??
            regularSeasonRecord.careerTotalsSummary ??
            regularSeasonRecord.careerStats ??
            regularSeasonRecord.careerTotalsBySeason ??
            regularSeasonRecord.careerTotal ??
            playoffsRecord.career ??
            playoffsRecord.careerTotals ??
            playoffsRecord.careerTotalsSummary ??
            playoffsRecord.careerStats ??
            playoffsRecord.careerTotalsBySeason ??
            playoffsRecord.careerTotal,
    );
    const seasonId = asNumber(
        featuredStatsRecord.season ??
            featuredStatsRecord.seasonId ??
            record.seasonId,
    );
    const regularSeason = Object.keys(regularSeasonRecord).length
        ? extractStats(regularSeasonRecord)
        : undefined;
    const playoffs = Object.keys(playoffsRecord).length
        ? extractStats(playoffsRecord)
        : undefined;
    const career = Object.keys(careerRecord).length
        ? extractStats(careerRecord)
        : undefined;
    const featuredStats =
        seasonId !== null || regularSeason || playoffs || career
            ? ({
                  season: seasonId ?? undefined,
                  regularSeason,
                  playoffs,
                  career,
              } satisfies PlayerFeaturedStats)
            : undefined;

    const badgesRaw = record.badges;
    const badgesArray = Array.isArray(badgesRaw)
        ? badgesRaw
        : badgesRaw
          ? [badgesRaw]
          : [];
    const badges = badgesArray
        .map((badge) => {
            const badgeRecord = asRecord(badge);
            const titleRecord = asRecord(badgeRecord.title);
            const logoRecord = asRecord(badgeRecord.logoUrl);
            const title = pickText(
                (titleRecord as { default?: string })?.default,
                badgeRecord.title,
            );
            const titleFr = pickText(
                (titleRecord as { fr?: string })?.fr,
            );
            const logoUrl = pickText(
                (logoRecord as { default?: string })?.default,
                badgeRecord.logoUrl,
            );
            const logoUrlFr = pickText(
                (logoRecord as { fr?: string })?.fr,
            );
            if (!title && !logoUrl) {
                return null;
            }
            return {
                title: title || undefined,
                titleFr: titleFr || undefined,
                logoUrl: logoUrl || undefined,
                logoUrlFr: logoUrlFr || undefined,
            } satisfies PlayerBadge;
        })
        .filter((badge): badge is PlayerBadge => badge !== null);

    const awards = asArray(record.awards)
        .map((award) => {
            const awardRecord = asRecord(award);
            const trophyRecord = asRecord(awardRecord.trophy);
            const trophy = pickText(
                (trophyRecord as { default?: string })?.default,
                awardRecord.trophy,
            );
            const trophyFr = pickText(
                (trophyRecord as { fr?: string })?.fr,
            );
            const seasons = asArray(awardRecord.seasons)
                .map((season) => {
                    const seasonRecord = asRecord(season);
                    const stats = extractStats(seasonRecord);
                    if (!Object.keys(stats).length) {
                        return null;
                    }
                    return {
                        seasonId: asNumber(
                            seasonRecord.seasonId ?? seasonRecord.season,
                        ),
                        gameTypeId: asNumber(seasonRecord.gameTypeId),
                        stats,
                    } satisfies PlayerAwardSeason;
                })
                .filter(
                    (season): season is PlayerAwardSeason => season !== null,
                );
            if (!trophy && seasons.length === 0) {
                return null;
            }
            return {
                trophy: trophy || undefined,
                trophyFr: trophyFr || undefined,
                seasons,
            } satisfies PlayerAward;
        })
        .filter((award): award is PlayerAward => award !== null);

    const currentTeamRosterValue =
        record.currentTeamRoster ??
        record.teamRoster ??
        record.roster ??
        record.teammates;
    const currentTeamRosterRecord = asRecord(currentTeamRosterValue);
    const rosterEntries = (() => {
        const direct = asArray(currentTeamRosterValue);
        if (direct.length) {
            return direct;
        }
        return asArray(
            currentTeamRosterRecord.roster ??
                currentTeamRosterRecord.players ??
                currentTeamRosterRecord.items ??
                currentTeamRosterRecord.currentTeamRoster,
        );
    })();
    const teammates = rosterEntries
        .map((entry) => {
            const entryRecord = asRecord(entry);
            const entryId =
                entryRecord.playerId ??
                entryRecord.player_id ??
                entryRecord.id ??
                entryRecord.personId;
            const id = entryId ? String(entryId) : '';
            const name = pickPersonName(entryRecord);
            if (!id || !name) {
                return null;
            }
            const position = pickText(
                entryRecord.positionCode,
                entryRecord.position,
                (entryRecord.position as { abbreviation?: string })?.abbreviation,
                (entryRecord.primaryPosition as { abbreviation?: string })
                    ?.abbreviation,
            );
            const sweaterNumber = pickNumeric(
                entryRecord.sweaterNumber,
                entryRecord.jerseyNumber,
                entryRecord.number,
            );
            const slug = pickText(entryRecord.playerSlug, entryRecord.slug);
            return {
                id,
                name,
                slug: slug || undefined,
                position: position || undefined,
                sweaterNumber: sweaterNumber ?? undefined,
            } satisfies PlayerTeammate;
        })
        .filter((entry): entry is PlayerTeammate => entry !== null);

    const sanitizePlayerLink = (value: string) => {
        const link = normalizeLink(value);
        if (!link || link.startsWith('#')) {
            return '';
        }
        return link;
    };

    const links = {
        shop: sanitizePlayerLink(pickText(record.shopLink)),
        watch: sanitizePlayerLink(pickText(record.watchLink)),
        twitter: sanitizePlayerLink(pickText(record.twitterLink)),
    } satisfies PlayerLinks;

    const playerSlug = pickText(record.playerSlug, record.slug);
    const inTop100AllTime = readBoolean(record.inTop100AllTime);
    const inHHOF = readBoolean(record.inHHOF);

    return {
        id,
        name: pickPersonName(record) || fallback?.name || 'Unknown',
        firstName: firstName || undefined,
        firstNameFr: firstNameFr || undefined,
        lastName: lastName || undefined,
        lastNameFr: lastNameFr || undefined,
        teamId: teamId ?? undefined,
        teamName: teamName || undefined,
        fullTeamName: fullTeamName || undefined,
        fullTeamNameFr: fullTeamNameFr || undefined,
        teamCommonName: teamCommonName || undefined,
        teamCommonNameFr: teamCommonNameFr || undefined,
        teamPlaceNameWithPreposition:
            teamPlaceNameWithPreposition || undefined,
        teamPlaceNameWithPrepositionFr:
            teamPlaceNameWithPrepositionFr || undefined,
        teamAbbrev: teamAbbrev || undefined,
        teamLogo: teamLogo || undefined,
        position: pickPosition(record) || fallback?.position,
        shoots:
            pickText(
                record.shootsCatches,
                record.shoots,
                record.shootsCatch,
            ) || fallback?.shoots,
        sweaterNumber: pickNumeric(
            record.sweaterNumber,
            record.jerseyNumber,
            record.number,
            fallback?.number,
        ),
        headshot: headshot || fallback?.headshot,
        heroImage: heroImage || undefined,
        height: height || fallback?.height,
        heightInInches:
            heightInches !== null
                ? heightInches
                : fallback?.heightInInches ?? undefined,
        heightCm: heightCm ?? undefined,
        weight:
            pickNumeric(
                record.weightInPounds,
                record.weight,
                fallback?.weight,
            ) ?? undefined,
        weightKg: weightKg ?? undefined,
        birthDate: pickText(record.birthDate) || fallback?.birthDate,
        birthCity: birthCity || undefined,
        birthState: birthState || undefined,
        birthCountry: birthCountry || undefined,
        nationality: nationality || undefined,
        hometown: pickHometown(record) || fallback?.hometown,
        draft,
        rosterStatus: rosterStatus || undefined,
        status: status || undefined,
        isActive,
        captain,
        alternateCaptain,
        injuryStatus: injuryStatus || undefined,
        suspensionStatus: suspensionStatus || undefined,
        featuredStats,
        badges: badges.length ? badges : undefined,
        seasonTotals: seasonTotals.length ? seasonTotals : undefined,
        careerTotals,
        lastFiveGames: lastFiveGames.length ? lastFiveGames : undefined,
        awards: awards.length ? awards : undefined,
        links: Object.values(links).some(Boolean) ? links : undefined,
        teammates: teammates.length ? teammates : undefined,
        playerSlug: playerSlug || undefined,
        inTop100AllTime,
        inHHOF,
    };
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
