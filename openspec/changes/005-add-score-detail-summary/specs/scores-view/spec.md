## ADDED Requirements
### Requirement: Game detail shows scoring summary
The game detail page SHALL display a scoring summary when the gamecenter boxscore payload provides goal data.

#### Scenario: Scoring summary available
- **WHEN** the boxscore payload includes scoring summary entries
- **THEN** the game detail page lists the goals by period with scorer and time.

#### Scenario: Scoring summary unavailable
- **WHEN** the boxscore payload has no scoring summary
- **THEN** the game detail page omits the scoring summary section.

### Requirement: Game detail shows team leaders
The game detail page SHALL display team leaders (goals, assists, points) when available in the boxscore payload.

#### Scenario: Leader stats available
- **WHEN** the boxscore payload includes team leader stats
- **THEN** the game detail page shows leaders for each team.

#### Scenario: Leader stats unavailable
- **WHEN** the boxscore payload has no leader stats
- **THEN** the game detail page omits the team leaders section.
