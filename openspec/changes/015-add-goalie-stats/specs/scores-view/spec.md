## ADDED Requirements
### Requirement: Game detail shows goalie stats
The game detail page SHALL display goalie stat lines when available.

#### Scenario: Goalie stats available
- **WHEN** the boxscore payload includes goalie stats
- **THEN** the game detail page shows SV%, shots, saves, and goals against.

#### Scenario: Goalie stats missing
- **WHEN** goalie stats are unavailable
- **THEN** the game detail page omits the goalie section.
