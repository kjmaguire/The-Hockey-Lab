## ADDED Requirements
### Requirement: Score cards show live game context
The Scores page SHALL display live period/clock context when available from the NHL score/now payload.

#### Scenario: Live game clock available
- **WHEN** the score/now payload provides period and clock for a game
- **THEN** the score card shows the period and remaining time.

#### Scenario: Intermission status
- **WHEN** the score/now payload indicates an intermission
- **THEN** the score card shows an intermission label.

#### Scenario: No live context
- **WHEN** the score/now payload has no live context for a game
- **THEN** the score card omits the live context line.

### Requirement: Scores page fetches live scoreboard context
The Scores page SHALL request the NHL score/now endpoint to supplement schedule data with live context.

#### Scenario: Live context fetched
- **WHEN** the Scores page loads
- **THEN** it requests score/now and merges live context by game id.
