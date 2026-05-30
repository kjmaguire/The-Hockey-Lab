<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\NhlApiController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Home', [
        'appName' => 'The Hockey Lab',
    ]);
});

Route::get('/lab', function () {
    return Inertia::render('Lab');
})->name('lab');

Route::get('/lab/scores', function () {
    return Inertia::render('LabScores');
})->name('lab.scores');

Route::get('/lab/scores/{gameId}', function (string $gameId) {
    return Inertia::render('LabScoreDetail', [
        'gameId' => $gameId,
    ]);
})->name('lab.scores.show');

Route::get('/lab/standings', function () {
    return Inertia::render('LabStandings');
})->name('lab.standings');

Route::get('/lab/teams', function () {
    return Inertia::render('LabTeams');
})->name('lab.teams');

Route::get('/lab/teams/{team}', function (string $team) {
    return Inertia::render('LabTeamDetail', [
        'team' => $team,
    ]);
})->name('lab.teams.show');

Route::get('/lab/stats', function () {
    return Inertia::render('LabStats');
})->name('lab.stats');

Route::get('/lab/players', function () {
    return Inertia::render('LabPlayers');
})->name('lab.players');

Route::get('/lab/players/{playerId}', function (string $playerId) {
    return Inertia::render('LabPlayerDetail', [
        'playerId' => $playerId,
    ]);
})->name('lab.players.show');

Route::get('/lab/hockey-iq', function () {
    return Inertia::render('LabHockeyIQ');
})->name('lab.hockey-iq');

Route::prefix('api/nhl')->group(function () {
    Route::get('/schedule', [NhlApiController::class, 'schedule']);
    Route::get('/scoreboard', [NhlApiController::class, 'scoreboard']);
    Route::get('/gamecenter/{gameId}/boxscore', [NhlApiController::class, 'gamecenterBoxscore']);
    Route::get('/gamecenter/{gameId}/play-by-play', [NhlApiController::class, 'gamecenterPlayByPlay']);
    Route::get('/gamecenter/{gameId}/right-rail', [NhlApiController::class, 'gamecenterRightRail']);
    Route::get('/teams', [NhlApiController::class, 'teams']);
    Route::get('/standings', [NhlApiController::class, 'standings']);
    Route::get('/roster/{teamAbbrev}', [NhlApiController::class, 'roster']);
    Route::get('/roster-season/{teamAbbrev}', [NhlApiController::class, 'rosterSeason']);
    Route::get('/club-schedule/{teamAbbrev}', [NhlApiController::class, 'clubSchedule']);
    Route::get('/club-schedule-view/{teamAbbrev}', [NhlApiController::class, 'clubScheduleView']);
    Route::get('/club-stats/{teamAbbrev}', [NhlApiController::class, 'clubStats']);
    Route::get('/club-stats-season/{teamAbbrev}', [NhlApiController::class, 'clubStatsSeason']);
    Route::get('/prospects/{teamAbbrev}', [NhlApiController::class, 'prospects']);
    Route::get('/team-stats/{teamAbbrev}', [NhlApiController::class, 'teamStats']);
    Route::get('/player/{playerId}/landing', [NhlApiController::class, 'playerLanding']);
    Route::get('/player/{playerId}/game-log', [NhlApiController::class, 'playerGameLog']);
    Route::get('/goalie-leaders', [NhlApiController::class, 'goalieLeaders']);
    Route::get('/skater-leaders', [NhlApiController::class, 'skaterLeaders']);
    Route::get('/edge/skater-landing', [NhlApiController::class, 'skaterLanding']);
    Route::get('/edge/skater-detail/{playerId}', [NhlApiController::class, 'skaterDetail']);
    Route::get('/edge/goalie-detail/{playerId}', [NhlApiController::class, 'goalieDetail']);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
