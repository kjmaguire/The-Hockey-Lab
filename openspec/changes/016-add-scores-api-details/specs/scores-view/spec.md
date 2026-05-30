## ADDED Requirements
### Requirement: Score cards show series status in Scores
The Scores page SHALL show series status on score cards when the score/now payload provides series information.

#### Scenario: Series status available
- **WHEN** the score/now payload includes series status for a game
- **THEN** the score card shows the series status line.

#### Scenario: Series status missing
- **WHEN** the score/now payload has no series status for a game
- **THEN** the score card omits the series status line.

### Requirement: Score cards show linescore and shots on goal
The Scores page SHALL show period-by-period scoring and shots on goal when provided by the score/now payload.

#### Scenario: Linescore available
- **WHEN** the score/now payload provides period-by-period scores
- **THEN** the score card shows a linescore summary.

#### Scenario: Shots on goal available
- **WHEN** the score/now payload provides shots on goal totals
- **THEN** the score card shows the shot totals.

#### Scenario: Linescore missing
- **WHEN** the score/now payload does not include linescore data
- **THEN** the score card omits the linescore summary.

### Requirement: Score cards show broadcast breakdown
The Scores page SHALL display TV and radio broadcast labels separately when the schedule payload provides them.

#### Scenario: TV and radio broadcasts
- **WHEN** a game includes TV and radio broadcast labels
- **THEN** the score card lists TV and radio networks separately.

#### Scenario: Broadcasts missing
- **WHEN** a game has no broadcast labels
- **THEN** the score card omits broadcast lines.

### Requirement: Score cards show venue detail and status flags
The Scores page SHALL display venue location detail and status flags (postponed or TBD) when the schedule payload provides them.

#### Scenario: Venue detail available
- **WHEN** a game includes venue city or location details
- **THEN** the score card displays the venue detail.

#### Scenario: Status flag available
- **WHEN** a game status indicates postponed or start time TBD
- **THEN** the score card highlights the status flag.

### Requirement: Score cards include game links
The Scores page SHALL display links to gamecenter, recap, or tickets when available in schedule payloads.

#### Scenario: Links available
- **WHEN** a game includes link URLs for gamecenter, recap, or tickets
- **THEN** the score card shows link actions.
