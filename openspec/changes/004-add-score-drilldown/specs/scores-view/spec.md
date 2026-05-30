## ADDED Requirements
### Requirement: Scores cards link to game details
The Scores page SHALL link each score card to a game detail view when a game id is available.

#### Scenario: Link present
- **WHEN** a score card has a game id
- **THEN** the card provides a link to the game detail page.

#### Scenario: Link absent
- **WHEN** a score card does not have a game id
- **THEN** the card does not show a game detail link.

### Requirement: Game detail shows boxscore and play-by-play context
The game detail page SHALL display boxscore data and key play-by-play context for the selected game.

#### Scenario: Boxscore available
- **WHEN** the gamecenter boxscore payload is available
- **THEN** the page shows team stats and scoring summary.

#### Scenario: Play-by-play available
- **WHEN** the gamecenter play-by-play payload is available
- **THEN** the page shows recent events with period and time.

#### Scenario: Data unavailable
- **WHEN** boxscore or play-by-play is unavailable
- **THEN** the page shows an appropriate empty state.

### Requirement: Game detail uses gamecenter endpoints
The system SHALL request gamecenter boxscore and play-by-play data using the NHL API proxy endpoints.

#### Scenario: Fetching data
- **WHEN** a user loads a game detail page
- **THEN** the client requests gamecenter/{gameId}/boxscore and gamecenter/{gameId}/play-by-play via the proxy.
